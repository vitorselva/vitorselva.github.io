import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export default function AddPetScreen() {
  const [name, setName] = useState('');
  return (
    <View style={{ padding: 16 }}>
      <Text>Nome do animal</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Ex: Luna" style={{ borderWidth: 1, padding: 8, marginVertical: 8 }} />
      <Button title="Criar" onPress={() => { /* TODO: create in Supabase */ }} />
    </View>
  );
}

