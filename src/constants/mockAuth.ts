export const MOCK_AUTH_STORAGE_KEY = 'polaris:mock-auth';
export const MOCK_AUTH_EMAIL = 'admin@polaris.local';
export const MOCK_AUTH_PASSWORD = 'admin';

export type MockAuthSession = {
  email: string;
  authenticatedAt: string;
};
