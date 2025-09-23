import React from 'react';
import { View, Text, Button } from 'react-native';

export default function PetDetailScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Detalhes do Pet</Text>
      <Button title="Lembretes" onPress={() => navigation.navigate('Reminders')} />
    </View>
  );
}

