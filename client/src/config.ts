// Detect environment and set API base URL accordingly
function getApiBaseUrl(): string {
  const hostname = window.location.hostname;

  if (hostname.endsWith('.app.github.dev')) {
    const parts = hostname.split('-');
    const prefix = parts.slice(0, parts.length - 1).join('-');
    return `https://${prefix}-5000.app.github.dev`;
  }

  return 'http://localhost:5000';
}

export const API_BASE_URL = getApiBaseUrl();
