export type AppMode = 'production' | 'demo';

const configuredMode = String(import.meta.env.VITE_APP_MODE || '').trim().toLowerCase();

/**
 * Demo data is opt-in. A deployed build must never silently switch to the
 * browser mock store when Supabase is unavailable.
 */
export const appConfig = {
  mode: (configuredMode === 'demo' ? 'demo' : 'production') as AppMode,
  isDemoMode: configuredMode === 'demo',
  isProduction: configuredMode !== 'demo',
} as const;

export const isDemoMode = () => appConfig.isDemoMode;

export class AppConfigurationError extends Error {
  constructor(message = 'The portal is not configured for production yet.') {
    super(message);
    this.name = 'AppConfigurationError';
  }
}

export const productionConfigurationMessage =
  'The portal is temporarily unavailable because its production database is not configured. Please contact the Registrar Office.';

export const requireProductionBackend = (isConfigured: boolean) => {
  if (appConfig.isProduction && !isConfigured) {
    throw new AppConfigurationError(productionConfigurationMessage);
  }
};
