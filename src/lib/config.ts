// Application configuration
export const config = {
  api: {
    baseUrl:
      import.meta.env.VITE_API_BASE_URL ||
      'https://hacktiv8-laravel-final-be-production.up.railway.app/api',
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'E-Commerce Frontend',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    isDev: import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV,
  },
} as const

export default config
