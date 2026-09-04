/** Detects the API base URL based on runtime environment */
export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');

  const hostname = window.location.hostname;
  if (hostname.endsWith('.app.github.dev')) {
    // In Codespaces: replace the frontend port segment with the API port
    const withoutPort = hostname.replace(/-\d+\.app\.github\.dev$/, '');
    return `https://${withoutPort}-5000.app.github.dev`;
  }
  return 'http://localhost:5000';
}

export const API_BASE = getApiBaseUrl();
