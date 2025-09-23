import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';

type ReminderItem = { id: string; title: string; done: boolean };

export default function RemindersScreen() {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<ReminderItem[]>([]);

  const addItem = () => {
    if (!title.trim()) return;
    setItems((prev) => [{ id: Math.random().toString(36).slice(2, 9), title, done: false }, ...prev]);
    setTitle('');
  };

  const toggleDone = (id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Novo lembrete</Text>
      <TextInput placeholder="Ex: Ração às 08:00" value={title} onChangeText={setTitle} style={{ borderWidth: 1, padding: 8, marginVertical: 8 }} />
      <Button title="Adicionar" onPress={addItem} />
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggleDone(item.id)} style={{ paddingVertical: 12 }}>
            <Text style={{ textDecorationLine: item.done ? 'line-through' : 'none' }}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

