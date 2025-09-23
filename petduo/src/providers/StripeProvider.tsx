import React from 'react';
import { StripeProvider as RNStripeProvider } from '@stripe/stripe-react-native';
import { ENV } from '@lib/env';

export function StripeProvider({ children }: { children: React.ReactElement | React.ReactElement[] }) {
  return (
    <RNStripeProvider publishableKey={ENV.STRIPE_PUBLISHABLE_KEY}>
      {children}
    </RNStripeProvider>
  );
}

