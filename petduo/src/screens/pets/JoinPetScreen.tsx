import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export default function JoinPetScreen() {
  const [code, setCode] = useState('');
  return (
    <View style={{ padding: 16 }}>
      <Text>Insira o código de 6 caracteres</Text>
      <TextInput value={code} onChangeText={setCode} autoCapitalize="characters" maxLength={6} style={{ borderWidth: 1, padding: 8, marginVertical: 8 }} />
      <Button title="Enviar pedido" onPress={() => { /* TODO: request approval */ }} />
    </View>
  );
}

