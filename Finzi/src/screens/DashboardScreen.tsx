import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { DashboardData, FilterPeriod } from '../types';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const { state } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const dashboardData = useMemo((): DashboardData => {
    const now = new Date();
    let filteredExpenses = state.expenses;

    // Filter expenses based on selected period
    if (selectedPeriod === 'day') {
      const today = new Date();
      filteredExpenses = state.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getDate() === today.getDate() &&
          expenseDate.getMonth() === today.getMonth() &&
          expenseDate.getFullYear() === today.getFullYear()
        );
      });
    } else if (selectedPeriod === 'month') {
      filteredExpenses = state.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === selectedMonth - 1 &&
          expenseDate.getFullYear() === selectedYear
        );
      });
    } else if (selectedPeriod === 'year') {
      filteredExpenses = state.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === selectedYear;
      });
    }

    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Expenses by category
    const categoryMap = new Map<string, number>();
    filteredExpenses.forEach(expense => {
      const current = categoryMap.get(expense.categoryId) || 0;
      categoryMap.set(expense.categoryId, current + expense.amount);
    });

    const expensesByCategory = Array.from(categoryMap.entries()).map(([categoryId, amount]) => {
      const category = state.categories.find(c => c.id === categoryId);
      return {
        category: category || { id: categoryId, name: 'Desconhecida', color: '#999', icon: 'help', createdAt: new Date() },
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      };
    }).sort((a, b) => b.amount - a.amount);

    // Expenses by account
    const accountMap = new Map<string, number>();
    filteredExpenses.forEach(expense => {
      const current = accountMap.get(expense.accountId) || 0;
      accountMap.set(expense.accountId, current + expense.amount);
    });

    const expensesByAccount = Array.from(accountMap.entries()).map(([accountId, amount]) => {
      const account = state.accounts.find(a => a.id === accountId);
      return {
        account: account || { id: accountId, name: 'Desconhecida', type: 'checking' as const, bank: 'Desconhecido', createdAt: new Date() },
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      };
    }).sort((a, b) => b.amount - a.amount);

    // Monthly expenses for the year
    const monthlyExpenses = [];
    for (let month = 1; month <= 12; month++) {
      const monthExpenses = state.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === month - 1 &&
          expenseDate.getFullYear() === selectedYear
        );
      });
      const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      monthlyExpenses.push({
        month: new Date(selectedYear, month - 1).toLocaleDateString('pt-BR', { month: 'short' }),
        amount: monthTotal,
      });
    }

    // Budget alerts
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const budgetAlerts = state.budgets
      .filter(budget => budget.month === currentMonth && budget.year === currentYear)
      .map(budget => {
        const category = state.categories.find(c => c.id === budget.categoryId);
        const spent = state.expenses
          .filter(expense => {
            const expenseDate = new Date(expense.date);
            return (
              expense.categoryId === budget.categoryId &&
              expenseDate.getMonth() === currentMonth - 1 &&
              expenseDate.getFullYear() === currentYear
            );
          })
          .reduce((sum, expense) => sum + expense.amount, 0);

        const percentage = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;

        return {
          category: category || { id: budget.categoryId, name: 'Desconhecida', color: '#999', icon: 'help', createdAt: new Date() },
          budget,
          spent,
          percentage,
        };
      })
      .filter(alert => alert.percentage >= 80)
      .sort((a, b) => b.percentage - a.percentage);

    return {
      totalExpenses,
      expensesByCategory,
      expensesByAccount,
      monthlyExpenses,
      budgetAlerts,
    };
  }, [state.expenses, state.categories, state.accounts, state.budgets, selectedPeriod, selectedYear, selectedMonth]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.periodSelector}>
          {(['day', 'month', 'year'] as FilterPeriod[]).map(period => (
            <TouchableOpacity
              key={period}
              style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === period && styles.periodButtonTextActive]}>
                {period === 'day' ? 'Hoje' : period === 'month' ? 'Mês' : 'Ano'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Total Expenses Card */}
      <View style={styles.totalCard}>
        <MaterialIcons name="account-balance-wallet" size={32} color="#45B7D1" />
        <View style={styles.totalCardContent}>
          <Text style={styles.totalLabel}>
            Total {selectedPeriod === 'day' ? 'Hoje' : selectedPeriod === 'month' ? 'do Mês' : 'do Ano'}
          </Text>
          <Text style={styles.totalAmount}>{formatCurrency(dashboardData.totalExpenses)}</Text>
        </View>
      </View>

      {/* Budget Alerts */}
      {dashboardData.budgetAlerts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Alertas de Orçamento</Text>
          {dashboardData.budgetAlerts.map(alert => (
            <View key={alert.budget.id} style={styles.budgetAlert}>
              <View style={styles.budgetAlertHeader}>
                <Text style={styles.budgetAlertCategory}>{alert.category.name}</Text>
                <Text style={styles.budgetAlertPercentage}>{alert.percentage.toFixed(0)}%</Text>
              </View>
              <View style={styles.budgetAlertBar}>
                <View 
                  style={[
                    styles.budgetAlertProgress, 
                    { 
                      width: `${Math.min(alert.percentage, 100)}%`,
                      backgroundColor: alert.percentage >= 100 ? '#FF6B6B' : alert.percentage >= 90 ? '#FFA500' : '#FFD700'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.budgetAlertText}>
                {formatCurrency(alert.spent)} de {formatCurrency(alert.budget.monthlyLimit)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Expenses by Account */}
      {dashboardData.expensesByAccount.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gastos por Conta</Text>
          {dashboardData.expensesByAccount.map(item => (
            <View key={item.account.id} style={styles.accountItem}>
              <View style={styles.accountInfo}>
                <MaterialIcons 
                  name={item.account.type === 'credit_card' ? 'credit-card' : 'account-balance'} 
                  size={24} 
                  color="#45B7D1" 
                />
                <View style={styles.accountDetails}>
                  <Text style={styles.accountName}>{item.account.name}</Text>
                  <Text style={styles.accountBank}>{item.account.bank}</Text>
                </View>
              </View>
              <View style={styles.accountAmount}>
                <Text style={styles.accountAmountText}>{formatCurrency(item.amount)}</Text>
                <Text style={styles.accountPercentage}>{item.percentage.toFixed(1)}%</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Categories Summary */}
      {dashboardData.expensesByCategory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo por Categoria</Text>
          {dashboardData.expensesByCategory.map(item => (
            <View key={item.category.id} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryColor, { backgroundColor: item.category.color }]} />
                <Text style={styles.categoryName}>{item.category.name}</Text>
              </View>
              <View style={styles.categoryAmount}>
                <Text style={styles.categoryAmountText}>{formatCurrency(item.amount)}</Text>
                <Text style={styles.categoryPercentage}>{item.percentage.toFixed(1)}%</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Welcome Message for New Users */}
      {state.expenses.length === 0 && (
        <View style={styles.section}>
          <View style={styles.welcomeContainer}>
            <MaterialIcons name="emoji-emotions" size={48} color="#45B7D1" />
            <Text style={styles.welcomeTitle}>Bem-vindo ao Finzi!</Text>
            <Text style={styles.welcomeText}>
              Comece adicionando suas primeiras categorias e contas, depois registre seus gastos para ter uma visão completa das suas finanças.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  periodSelector: {
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
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalCardContent: {
    marginLeft: 16,
    flex: 1,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  budgetAlert: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  budgetAlertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetAlertCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  budgetAlertPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  budgetAlertBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 8,
  },
  budgetAlertProgress: {
    height: '100%',
    borderRadius: 3,
  },
  budgetAlertText: {
    fontSize: 14,
    color: '#666',
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountDetails: {
    marginLeft: 12,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  accountBank: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  accountAmount: {
    alignItems: 'flex-end',
  },
  accountAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  accountPercentage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryAmount: {
    alignItems: 'flex-end',
  },
  categoryAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  welcomeContainer: {
    alignItems: 'center',
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});