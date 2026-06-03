import axios from 'axios';

const apiIp =
  import.meta.env.VITE_API_IP ??
  import.meta.env.VITE_API_HOST ??
  'polaris:8089';

function getApiBaseUrl(value: string) {
  const normalizedValue = value.replace(/\/$/, '');

  if (/^https?:\/\//.test(normalizedValue)) {
    return normalizedValue;
  }

  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https' : 'http';

  return `${protocol}://${normalizedValue}`;
}

export const api = axios.create({
  baseURL: `${getApiBaseUrl(apiIp)}/api/v1`,
});
