import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '@react-navigation/native';
import { Expense, ExpenseFilter } from '../types';

export default function ExpensesScreen() {
  const { state, deleteExpense } = useApp();
  const navigation = useNavigation();

  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilter>({
    period: 'month',
    categoryId: '',
    accountId: '',
    minAmount: undefined,
    maxAmount: undefined,
    searchText: '',
  });

  const filteredExpenses = useMemo(() => {
    let filtered = [...state.expenses];

    // Apply search text
    if (searchText.trim()) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.categoryId) {
      filtered = filtered.filter(expense => expense.categoryId === filters.categoryId);
    }

    // Apply account filter
    if (filters.accountId) {
      filtered = filtered.filter(expense => expense.accountId === filters.accountId);
    }

    // Apply amount filters
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(expense => expense.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(expense => expense.amount <= filters.maxAmount!);
    }

    // Apply period filter
    const now = new Date();
    if (filters.period === 'day') {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getDate() === now.getDate() &&
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      });
    } else if (filters.period === 'month') {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      });
    } else if (filters.period === 'year') {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === now.getFullYear();
      });
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.expenses, searchText, filters]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleDeleteExpense = (expense: Expense) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir o gasto "${expense.description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteExpense(expense.id),
        },
      ]
    );
  };

  const handleDuplicateExpense = (expense: Expense) => {
    // Navigate to add expense screen with pre-filled data
    navigation.navigate('AddExpense' as never, { duplicateExpense: expense } as never);
  };

  const clearFilters = () => {
    setFilters({
      period: 'month',
      categoryId: '',
      accountId: '',
      minAmount: undefined,
      maxAmount: undefined,
      searchText: '',
    });
    setSearchText('');
  };

  const getExpenseCategory = (categoryId: string) => {
    return state.categories.find(c => c.id === categoryId);
  };

  const getExpenseAccount = (accountId: string) => {
    return state.accounts.find(a => a.id === accountId);
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const category = getExpenseCategory(item.categoryId);
    const account = getExpenseAccount(item.accountId);

    return (
      <View style={styles.expenseItem}>
        <View style={styles.expenseHeader}>
          <View style={styles.expenseInfo}>
            <View style={styles.expenseMainInfo}>
              <View style={[styles.categoryIndicator, { backgroundColor: category?.color || '#999' }]} />
              <View style={styles.expenseDetails}>
                <Text style={styles.expenseDescription}>{item.description}</Text>
                <View style={styles.expenseMetadata}>
                  <Text style={styles.expenseCategory}>{category?.name || 'Sem categoria'}</Text>
                  <Text style={styles.expenseSeparator}>•</Text>
                  <Text style={styles.expenseAccount}>{account?.name || 'Conta desconhecida'}</Text>
                </View>
                <Text style={styles.expenseDate}>
                  {new Date(item.date).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            </View>
            <View style={styles.expenseAmountContainer}>
              <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
              {item.isInstallment && item.installments && (
                <Text style={styles.installmentInfo}>
                  {item.installments.current}/{item.installments.total}
                </Text>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.expenseActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDuplicateExpense(item)}
          >
            <MaterialIcons name="content-copy" size={20} color="#45B7D1" />
            <Text style={styles.actionButtonText}>Duplicar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteExpense(item)}
          >
            <MaterialIcons name="delete" size={20} color="#FF6B6B" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gastos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddExpense' as never)}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar gastos..."
            placeholderTextColor="#999"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <MaterialIcons name="clear" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialIcons name="filter-list" size={20} color="#45B7D1" />
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Período</Text>
              <View style={styles.periodButtons}>
                {(['day', 'month', 'year'] as const).map(period => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      filters.period === period && styles.periodButtonActive
                    ]}
                    onPress={() => setFilters({ ...filters, period })}
                  >
                    <Text style={[
                      styles.periodButtonText,
                      filters.period === period && styles.periodButtonTextActive
                    ]}>
                      {period === 'day' ? 'Hoje' : period === 'month' ? 'Mês' : 'Ano'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Categoria</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.categoryId}
                  onValueChange={(value) => setFilters({ ...filters, categoryId: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Todas as categorias" value="" />
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
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Conta</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.accountId}
                  onValueChange={(value) => setFilters({ ...filters, accountId: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Todas as contas" value="" />
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
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Limpar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {filteredExpenses.length} gasto{filteredExpenses.length !== 1 ? 's' : ''} • Total: {formatCurrency(totalAmount)}
        </Text>
      </View>

      {/* Expenses List */}
      <FlatList
        data={filteredExpenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.expensesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt-long" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>Nenhum gasto encontrado</Text>
            <Text style={styles.emptyStateText}>
              {searchText || Object.values(filters).some(v => v)
                ? 'Tente ajustar os filtros de busca'
                : 'Adicione seu primeiro gasto para começar'
              }
            </Text>
          </View>
        }
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    padding: 8,
  },
  filtersPanel: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterRow: {
    marginBottom: 16,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  periodButtons: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#45B7D1',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
  },
  filterActions: {
    alignItems: 'center',
    marginTop: 8,
  },
  clearFiltersButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#45B7D1',
    fontWeight: '600',
  },
  summary: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  expensesList: {
    padding: 20,
  },
  expenseItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseHeader: {
    padding: 16,
  },
  expenseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseMainInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  categoryIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  expenseMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#666',
  },
  expenseSeparator: {
    fontSize: 14,
    color: '#ccc',
    marginHorizontal: 8,
  },
  expenseAccount: {
    fontSize: 14,
    color: '#666',
  },
  expenseDate: {
    fontSize: 12,
    color: '#999',
  },
  expenseAmountContainer: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  installmentInfo: {
    fontSize: 12,
    color: '#45B7D1',
    marginTop: 2,
  },
  expenseActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#45B7D1',
    marginLeft: 4,
    fontWeight: '500',
  },
  deleteButton: {
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
  deleteButtonText: {
    color: '#FF6B6B',
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
});