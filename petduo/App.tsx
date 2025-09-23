import { StatusBar } from 'expo-status-bar';
import React from 'react';
import Navigation from '@providers/Navigation';
import { AuthProvider } from '@providers/AuthProvider';
import { StripeProvider } from '@providers/StripeProvider';
import { assertEnv } from '@lib/env';

export default function App() {
  assertEnv();
  return (
    <StripeProvider>
      <AuthProvider>
        <Navigation />
        <StatusBar style="auto" />
      </AuthProvider>
    </StripeProvider>
  );
}
