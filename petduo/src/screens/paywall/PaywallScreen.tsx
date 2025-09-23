import React from 'react';
import { View, Text, Button } from 'react-native';
import { useSubscription } from '@providers/SubscriptionProvider';

export default function PaywallScreen({ navigation }: any) {
  const { setSubscribed } = useSubscription();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>PetDuo Premium</Text>
      <Text style={{ textAlign: 'center', marginBottom: 20 }}>
        Assine para criar e gerenciar perfis de animais e lembretes ilimitados.
      </Text>
      <Button title="Assinar (mock)" onPress={() => { setSubscribed(true); navigation.replace('Main'); }} />
    </View>
  );
}

