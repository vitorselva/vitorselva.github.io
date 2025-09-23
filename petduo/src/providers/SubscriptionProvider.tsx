import React, { createContext, useContext, useMemo, useState } from 'react';

type SubscriptionContextValue = {
  isSubscribed: boolean;
  setSubscribed: (v: boolean) => void;
};

const SubscriptionContext = createContext<SubscriptionContextValue>({ isSubscribed: true, setSubscribed: () => {} });

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isSubscribed, setSubscribed] = useState<boolean>(true);
  const value = useMemo(() => ({ isSubscribed, setSubscribed }), [isSubscribed]);
  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}

