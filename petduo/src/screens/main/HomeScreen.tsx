import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>PetDuo</Text>
      <Button title="Criar perfil do pet" onPress={() => navigation.navigate('AddPet')} />
      <Button title="Entrar com código" onPress={() => navigation.navigate('JoinPet')} />
    </View>
  );
}

