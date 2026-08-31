import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Shopify configuration (all values from env vars)
// ---------------------------------------------------------------------------
export const shopifyConfig = {
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN || '',        // e.g. my-store.myshopify.com
  storefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN || '', // Storefront API public token
  adminToken: process.env.SHOPIFY_ADMIN_TOKEN || '',           // Admin API token (for webhooks/orders)
  webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET || '',     // Webhook HMAC secret
  apiVersion: process.env.SHOPIFY_API_VERSION || '2024-10',
};

// ---------------------------------------------------------------------------
// Competition → Shopify variant mapping
// Each competition must map to a Shopify product variant ID.
// Configure via env var SHOPIFY_VARIANT_MAP as JSON, e.g.:
//   '{"1":"123456789","2":"987654321"}'
// ---------------------------------------------------------------------------
function getVariantMap(): Record<string, string> {
  try {
    return JSON.parse(process.env.SHOPIFY_VARIANT_MAP || '{}');
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Build a Shopify cart/checkout URL (no API call needed)
// Format: https://{shop}/cart/{variantId}:{qty}?attributes[...]=...
// ---------------------------------------------------------------------------
export function buildCartUrl(params: {
  competitionId: number;
  quantity: number;
  prizeOption: string;
  returnUrl?: string;
}): string {
  const { competitionId, quantity, prizeOption, returnUrl } = params;

  if (!shopifyConfig.storeDomain) {
    // Dev fallback – return a local route so the app still works without Shopify
    const qs = new URLSearchParams({
      competition_id: String(competitionId),
      quantity: String(quantity),
      prize_option: prizeOption,
      demo: '1',
    });
    return `/order-confirmed?${qs}`;
  }

  const variantMap = getVariantMap();
  const variantId = variantMap[String(competitionId)];

  if (!variantId) {
    throw new Error(`No Shopify variant configured for competition ${competitionId}. Add it to SHOPIFY_VARIANT_MAP.`);
  }

  const base = `https://${shopifyConfig.storeDomain}/cart/${variantId}:${quantity}`;
  const qs = new URLSearchParams({
    'attributes[competition_id]': String(competitionId),
    'attributes[prize_option]': prizeOption,
  });

  const appReturn = returnUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/order-confirmed`;
  qs.set('return_to', appReturn);

  return `${base}?${qs}`;
}

// ---------------------------------------------------------------------------
// Storefront API: create checkout (richer alternative to cart URL)
// Returns a webUrl the customer should be redirected to.
// ---------------------------------------------------------------------------
export async function createStorefrontCheckout(params: {
  variantId: string;
  quantity: number;
  competitionId: number;
  prizeOption: string;
}): Promise<string> {
  const { variantId, quantity, competitionId, prizeOption } = params;

  const mutation = `
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout { webUrl }
        checkoutUserErrors { field message }
      }
    }
  `;

  const variables = {
    input: {
      lineItems: [{ variantId: `gid://shopify/ProductVariant/${variantId}`, quantity }],
      customAttributes: [
        { key: 'competition_id', value: String(competitionId) },
        { key: 'prize_option', value: prizeOption },
      ],
    },
  };

  const resp = await fetch(
    `https://${shopifyConfig.storeDomain}/api/${shopifyConfig.apiVersion}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': shopifyConfig.storefrontToken,
      },
      body: JSON.stringify({ query: mutation, variables }),
    }
  );

  if (!resp.ok) {
    throw new Error(`Shopify Storefront API error: ${resp.status} ${resp.statusText}`);
  }

  const json = (await resp.json()) as {
    data?: { checkoutCreate?: { checkout?: { webUrl?: string }; checkoutUserErrors?: { message: string }[] } };
    errors?: { message: string }[];
  };

  const errors = json.data?.checkoutCreate?.checkoutUserErrors;
  if (errors && errors.length) {
    throw new Error(`Shopify checkout error: ${errors.map((e) => e.message).join(', ')}`);
  }

  const webUrl = json.data?.checkoutCreate?.checkout?.webUrl;
  if (!webUrl) {
    throw new Error('Shopify did not return a checkout URL');
  }

  return webUrl;
}

// ---------------------------------------------------------------------------
// Webhook verification: HMAC-SHA256
// ---------------------------------------------------------------------------
export function verifyWebhookSignature(rawBody: Buffer, hmacHeader: string): boolean {
  if (!shopifyConfig.webhookSecret) return false;
  const digest = crypto
    .createHmac('sha256', shopifyConfig.webhookSecret)
    .update(rawBody)
    .digest('base64');
  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Map a paid Shopify order to competition entry records
// ---------------------------------------------------------------------------
export interface CompetitionEntry {
  competitionId: number;
  orderId: string;
  orderNumber: number | string;
  quantity: number;
  prizeOption: string;
  totalCost: number;
  currency: string;
  entryNumbers: string[];
  createdAt: string;
}

export function mapOrderToEntries(order: Record<string, unknown>): CompetitionEntry[] {
  const entries: CompetitionEntry[] = [];

  const lineItems = (order.line_items as Record<string, unknown>[] | undefined) || [];
  const attributes: Record<string, string> = {};

  // Top-level order note attributes (set during checkout)
  const noteAttrs = (order.note_attributes as { name: string; value: string }[] | undefined) || [];
  for (const attr of noteAttrs) {
    attributes[attr.name] = attr.value;
  }

  for (const item of lineItems) {
    // Per-line-item attributes override order-level ones
    const lineAttrs: Record<string, string> = { ...attributes };
    const propList = (item.properties as { name: string; value: string }[] | undefined) || [];
    for (const prop of propList) {
      lineAttrs[prop.name] = prop.value;
    }

    const competitionId = parseInt(lineAttrs['competition_id'] || '0');
    const prizeOption = lineAttrs['prize_option'] || 'cash';
    const quantity = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;

    const entryNumbers = Array.from({ length: quantity }, () =>
      `${competitionId}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`
    );

    entries.push({
      competitionId,
      orderId: String(order.id || ''),
      orderNumber: (order.order_number as number | string) || '',
      quantity,
      prizeOption,
      totalCost: parseFloat((price * quantity).toFixed(2)),
      currency: String(order.currency || 'GBP'),
      entryNumbers,
      createdAt: String((order.created_at as string | undefined) || new Date().toISOString()),
    });
  }

  return entries;
}
