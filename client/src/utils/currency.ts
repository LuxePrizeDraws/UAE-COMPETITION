export type CurrencyCode = 'AED' | 'GBP' | 'USD' | 'EUR';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
};

/**
 * Static conversion rates from AED (base currency used by the platform).
 * Approximate rates for display only.
 */
const AED_RATES: Record<CurrencyCode, number> = {
  AED: 1,
  GBP: 0.21,
  USD: 0.27,
  EUR: 0.25,
};

export function convertFromAED(amountAED: number, targetCurrency: CurrencyCode): number {
  const rate = AED_RATES[targetCurrency];
  return Math.round(amountAED * rate * 100) / 100;
}

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const info = CURRENCIES[currency];
  const formatted = amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `${info.symbol}${formatted}`;
}

const STORAGE_KEY = 'preferred_currency';

export function getStoredCurrency(): CurrencyCode | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in CURRENCIES) return stored as CurrencyCode;
  } catch {
    // localStorage unavailable
  }
  return null;
}

export function storeCurrency(currency: CurrencyCode): void {
  try {
    localStorage.setItem(STORAGE_KEY, currency);
  } catch {
    // localStorage unavailable
  }
}

/** Country-to-currency mapping based on ISO 3166-1 alpha-2 codes */
const COUNTRY_CURRENCY: Record<string, CurrencyCode> = {
  GB: 'GBP',
  AE: 'AED',
  US: 'USD',
  AT: 'EUR',
  BE: 'EUR',
  DE: 'EUR',
  ES: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
};

/**
 * Detects the user's currency via IP geolocation (ipapi.co).
 * Falls back to stored preference → AED if detection fails.
 */
export async function detectCurrency(): Promise<CurrencyCode> {
  const stored = getStoredCurrency();
  if (stored) return stored;

  try {
    const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const data = await response.json();
      const countryCode: string = data.country_code ?? '';
      const currency = COUNTRY_CURRENCY[countryCode] ?? 'AED';
      storeCurrency(currency);
      return currency;
    }
  } catch {
    // Geolocation failed — fall through to default
  }

  return 'AED';
}
