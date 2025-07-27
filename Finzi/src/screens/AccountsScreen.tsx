import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useApp } from '../contexts/AppContext';
import { Account } from '../types';

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Conta Corrente' },
  { value: 'savings', label: 'Poupança' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'pix', label: 'PIX' },
];

const BANKS = [
  'Banco do Brasil', 'Itaú', 'Bradesco', 'Santander', 'Caixa',
  'Nubank', 'Inter', 'BTG Pactual', 'Original', 'Safra',
  'C6 Bank', 'PicPay', 'Mercado Pago', 'Outro'
];

export default function AccountsScreen() {
  const { state, addAccount, updateAccount, deleteAccount } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking' as Account['type'],
    bank: '',
  });

  const handleAddAccount = () => {
    setEditingAccount(null);
    setFormData({
      name: '',
      type: 'checking',
      bank: '',
    });
    setShowModal(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      bank: account.bank,
    });
    setShowModal(true);
  };

  const handleSaveAccount = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Nome da conta é obrigatório');
      return;
    }
    if (!formData.bank.trim()) {
      Alert.alert('Erro', 'Banco é obrigatório');
      return;
    }

    try {
      if (editingAccount) {
        await updateAccount({
          ...editingAccount,
          ...formData,
          name: formData.name.trim(),
          bank: formData.bank.trim(),
        });
      } else {
        await addAccount({
          ...formData,
          name: formData.name.trim(),
          bank: formData.bank.trim(),
        });
      }
      setShowModal(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a conta');
    }
  };

  const handleDeleteAccount = (account: Account) => {
    const isUsed = state.expenses.some(expense => expense.accountId === account.id);
    
    if (isUsed) {
      Alert.alert(
        'Conta em Uso',
        'Esta conta não pode ser excluída pois está sendo usada em gastos existentes.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir a conta "${account.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteAccount(account.id),
        },
      ]
    );
  };

  const getAccountIcon = (type: Account['type']) => {
    switch (type) {
      case 'credit_card': return 'credit-card';
      case 'savings': return 'savings';
      case 'pix': return 'qr-code';
      default: return 'account-balance';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const renderAccountItem = ({ item }: { item: Account }) => {
    const expenseCount = state.expenses.filter(expense => expense.accountId === item.id).length;
    const totalAmount = state.expenses
      .filter(expense => expense.accountId === item.id)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return (
      <View style={styles.accountItem}>
        <View style={styles.accountInfo}>
          <View style={styles.accountIcon}>
            <MaterialIcons name={getAccountIcon(item.type) as any} size={24} color="#45B7D1" />
          </View>
          <View style={styles.accountDetails}>
            <Text style={styles.accountName}>{item.name}</Text>
            <Text style={styles.accountBank}>{item.bank}</Text>
            <Text style={styles.accountType}>
              {ACCOUNT_TYPES.find(t => t.value === item.type)?.label}
            </Text>
          </View>
        </View>
        
        <View style={styles.accountStats}>
          <Text style={styles.accountAmount}>{formatCurrency(totalAmount)}</Text>
          <Text style={styles.accountUsage}>
            {expenseCount} gasto{expenseCount !== 1 ? 's' : ''}
          </Text>
          <View style={styles.accountActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditAccount(item)}
            >
              <MaterialIcons name="edit" size={16} color="#45B7D1" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteAccount(item)}
            >
              <MaterialIcons name="delete" size={16} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Contas</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Accounts List */}
      <FlatList
        data={state.accounts}
        renderItem={renderAccountItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.accountsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="account-balance" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>Nenhuma conta encontrada</Text>
            <Text style={styles.emptyStateText}>
              Adicione sua primeira conta para começar a registrar gastos
            </Text>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingAccount ? 'Editar Conta' : 'Nova Conta'}
            </Text>
            <TouchableOpacity onPress={handleSaveAccount}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Conta</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Ex: Conta Corrente Principal"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Conta</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  style={styles.picker}
                >
                  {ACCOUNT_TYPES.map(type => (
                    <Picker.Item
                      key={type.value}
                      label={type.label}
                      value={type.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Banco</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.bank}
                  onValueChange={(value) => setFormData({ ...formData, bank: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione um banco" value="" />
                  {BANKS.map(bank => (
                    <Picker.Item
                      key={bank}
                      label={bank}
                      value={bank}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#45B7D1',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountsList: {
    padding: 20,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  accountBank: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  accountType: {
    fontSize: 12,
    color: '#999',
  },
  accountStats: {
    alignItems: 'flex-end',
  },
  accountAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  accountUsage: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  accountActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#45B7D1',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
});