import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '@react-navigation/native';

export default function AddExpenseScreen() {
  const { state, addExpense } = useApp();
  const navigation = useNavigation();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState('1');
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (value: string) => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d,]/g, '');
    
    // Convert comma to dot for calculation
    const numberValue = parseFloat(numericValue.replace(',', '.')) || 0;
    
    // Format as currency
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numberValue / 100);
  };

  const handleAmountChange = (value: string) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    setAmount(numericValue);
  };

  const getAmountValue = () => {
    return parseFloat(amount) / 100 || 0;
  };

  const validateForm = () => {
    if (!description.trim()) {
      Alert.alert('Erro', 'Descrição é obrigatória');
      return false;
    }
    if (!amount || getAmountValue() <= 0) {
      Alert.alert('Erro', 'Valor deve ser maior que zero');
      return false;
    }
    if (!selectedAccount) {
      Alert.alert('Erro', 'Selecione uma conta');
      return false;
    }
    if (!selectedCategory) {
      Alert.alert('Erro', 'Selecione uma categoria');
      return false;
    }
    if (isInstallment && (!installmentCount || parseInt(installmentCount) < 2)) {
      Alert.alert('Erro', 'Número de parcelas deve ser maior que 1');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const expenseData = {
        description: description.trim(),
        amount: getAmountValue(),
        accountId: selectedAccount,
        categoryId: selectedCategory,
        date,
        isInstallment,
        installments: isInstallment ? {
          total: parseInt(installmentCount),
          current: 1,
        } : undefined,
      };

      if (isInstallment) {
        // Create multiple expenses for installments
        const installmentAmount = getAmountValue() / parseInt(installmentCount);
        const promises = [];
        
        for (let i = 0; i < parseInt(installmentCount); i++) {
          const installmentDate = new Date(date);
          installmentDate.setMonth(installmentDate.getMonth() + i);
          
          promises.push(addExpense({
            ...expenseData,
            description: `${description.trim()} (${i + 1}/${installmentCount})`,
            amount: installmentAmount,
            date: installmentDate,
            installments: {
              total: parseInt(installmentCount),
              current: i + 1,
            },
          }));
        }
        
        await Promise.all(promises);
      } else {
        await addExpense(expenseData);
      }

      Alert.alert('Sucesso', 'Gasto cadastrado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Erro', 'Não foi possível salvar o gasto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateLastExpense = () => {
    if (state.expenses.length === 0) {
      Alert.alert('Aviso', 'Nenhum gasto anterior encontrado');
      return;
    }

    const lastExpense = state.expenses[state.expenses.length - 1];
    setDescription(lastExpense.description);
    setAmount((lastExpense.amount * 100).toString());
    setSelectedAccount(lastExpense.accountId);
    setSelectedCategory(lastExpense.categoryId);
    setIsInstallment(lastExpense.isInstallment);
    if (lastExpense.installments) {
      setInstallmentCount(lastExpense.installments.total.toString());
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Novo Gasto</Text>
        <TouchableOpacity 
          style={styles.duplicateButton}
          onPress={handleDuplicateLastExpense}
        >
          <MaterialIcons name="content-copy" size={24} color="#45B7D1" />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Ex: Almoço no restaurante"
            placeholderTextColor="#999"
          />
        </View>

        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Valor *</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>R$</Text>
            <TextInput
              style={styles.amountInput}
              value={formatCurrency(amount)}
              onChangeText={handleAmountChange}
              placeholder="0,00"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Conta *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedAccount}
              onValueChange={setSelectedAccount}
              style={styles.picker}
            >
              <Picker.Item label="Selecione uma conta" value="" />
              {state.accounts.map(account => (
                <Picker.Item
                  key={account.id}
                  label={`${account.name} - ${account.bank}`}
                  value={account.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Categoria *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={setSelectedCategory}
              style={styles.picker}
            >
              <Picker.Item label="Selecione uma categoria" value="" />
              {state.categories.map(category => (
                <Picker.Item
                  key={category.id}
                  label={category.name}
                  value={category.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data</Text>
          <TouchableOpacity style={styles.dateButton}>
            <MaterialIcons name="calendar-today" size={20} color="#45B7D1" />
            <Text style={styles.dateText}>
              {date.toLocaleDateString('pt-BR')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Installment Toggle */}
        <View style={styles.inputGroup}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Parcelado</Text>
            <Switch
              value={isInstallment}
              onValueChange={setIsInstallment}
              trackColor={{ false: '#767577', true: '#45B7D1' }}
              thumbColor={isInstallment ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Installment Count */}
        {isInstallment && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número de Parcelas</Text>
            <TextInput
              style={styles.textInput}
              value={installmentCount}
              onChangeText={setInstallmentCount}
              placeholder="Ex: 12"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Ações Rápidas</Text>
          <View style={styles.quickButtonsRow}>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => handleAmountChange('1000')}
            >
              <Text style={styles.quickButtonText}>R$ 10</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => handleAmountChange('2000')}
            >
              <Text style={styles.quickButtonText}>R$ 20</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => handleAmountChange('5000')}
            >
              <Text style={styles.quickButtonText}>R$ 50</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => handleAmountChange('10000')}
            >
              <Text style={styles.quickButtonText}>R$ 100</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <MaterialIcons 
            name={isLoading ? "hourglass-empty" : "save"} 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Salvando...' : 'Salvar Gasto'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  duplicateButton: {
    padding: 8,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#45B7D1',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickActions: {
    marginTop: 20,
    marginBottom: 30,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#45B7D1',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#45B7D1',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#45B7D1',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
});