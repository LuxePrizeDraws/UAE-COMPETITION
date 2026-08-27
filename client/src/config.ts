// Detect environment and set API base URL accordingly
function getApiBaseUrl(): string {
  // Check for Codespaces environment
  const hostname = window.location.hostname;

  // Codespaces hostnames look like: <name>-<port>.app.github.dev
  // Replace the frontend port with 5000 for the API
  if (hostname.endsWith('.app.github.dev')) {
    // Extract the codespace name prefix (everything before the last -<port> segment)
    const parts = hostname.split('-');
    const prefix = parts.slice(0, parts.length - 1).join('-');
    return `https://${prefix}-5000.app.github.dev`;
  }

  // Local development fallback
  return 'http://localhost:5000';
}

export const API_BASE_URL = getApiBaseUrl();
