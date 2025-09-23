import Constants from 'expo-constants';

type Extra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  stripePublishableKey?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const ENV = {
  SUPABASE_URL: extra.supabaseUrl ?? '',
  SUPABASE_ANON_KEY: extra.supabaseAnonKey ?? '',
  STRIPE_PUBLISHABLE_KEY: extra.stripePublishableKey ?? '',
};

export function assertEnv(): void {
  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
    console.warn('Supabase env vars are missing. Configure app.json > expo.extra');
  }
  if (!ENV.STRIPE_PUBLISHABLE_KEY) {
    console.warn('Stripe publishable key is missing. Configure app.json > expo.extra');
  }
}

