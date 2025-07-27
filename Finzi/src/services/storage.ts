import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Account, 
  Category, 
  Expense, 
  Budget, 
  RecurringBill, 
  Notification, 
  AppSettings 
} from '../types';

const STORAGE_KEYS = {
  ACCOUNTS: '@finzi/accounts',
  CATEGORIES: '@finzi/categories',
  EXPENSES: '@finzi/expenses',
  BUDGETS: '@finzi/budgets',
  RECURRING_BILLS: '@finzi/recurring_bills',
  NOTIFICATIONS: '@finzi/notifications',
  SETTINGS: '@finzi/settings',
};

export class StorageService {
  // Generic methods
  private static async getItem<T>(key: string): Promise<T[]> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return [];
    }
  }

  private static async setItem<T>(key: string, data: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw error;
    }
  }

  // Accounts
  static async getAccounts(): Promise<Account[]> {
    const accounts = await this.getItem<Account>(STORAGE_KEYS.ACCOUNTS);
    return accounts.map(account => ({
      ...account,
      createdAt: new Date(account.createdAt)
    }));
  }

  static async saveAccount(account: Account): Promise<void> {
    const accounts = await this.getAccounts();
    const existingIndex = accounts.findIndex(a => a.id === account.id);
    
    if (existingIndex >= 0) {
      accounts[existingIndex] = account;
    } else {
      accounts.push(account);
    }
    
    await this.setItem(STORAGE_KEYS.ACCOUNTS, accounts);
  }

  static async deleteAccount(accountId: string): Promise<void> {
    const accounts = await this.getAccounts();
    const filteredAccounts = accounts.filter(a => a.id !== accountId);
    await this.setItem(STORAGE_KEYS.ACCOUNTS, filteredAccounts);
  }

  // Categories
  static async getCategories(): Promise<Category[]> {
    const categories = await this.getItem<Category>(STORAGE_KEYS.CATEGORIES);
    return categories.map(category => ({
      ...category,
      createdAt: new Date(category.createdAt)
    }));
  }

  static async saveCategory(category: Category): Promise<void> {
    const categories = await this.getCategories();
    const existingIndex = categories.findIndex(c => c.id === category.id);
    
    if (existingIndex >= 0) {
      categories[existingIndex] = category;
    } else {
      categories.push(category);
    }
    
    await this.setItem(STORAGE_KEYS.CATEGORIES, categories);
  }

  static async deleteCategory(categoryId: string): Promise<void> {
    const categories = await this.getCategories();
    const filteredCategories = categories.filter(c => c.id !== categoryId);
    await this.setItem(STORAGE_KEYS.CATEGORIES, filteredCategories);
  }

  // Expenses
  static async getExpenses(): Promise<Expense[]> {
    const expenses = await this.getItem<Expense>(STORAGE_KEYS.EXPENSES);
    return expenses.map(expense => ({
      ...expense,
      date: new Date(expense.date),
      createdAt: new Date(expense.createdAt)
    }));
  }

  static async saveExpense(expense: Expense): Promise<void> {
    const expenses = await this.getExpenses();
    const existingIndex = expenses.findIndex(e => e.id === expense.id);
    
    if (existingIndex >= 0) {
      expenses[existingIndex] = expense;
    } else {
      expenses.push(expense);
    }
    
    await this.setItem(STORAGE_KEYS.EXPENSES, expenses);
  }

  static async deleteExpense(expenseId: string): Promise<void> {
    const expenses = await this.getExpenses();
    const filteredExpenses = expenses.filter(e => e.id !== expenseId);
    await this.setItem(STORAGE_KEYS.EXPENSES, filteredExpenses);
  }

  // Budgets
  static async getBudgets(): Promise<Budget[]> {
    const budgets = await this.getItem<Budget>(STORAGE_KEYS.BUDGETS);
    return budgets.map(budget => ({
      ...budget,
      createdAt: new Date(budget.createdAt)
    }));
  }

  static async saveBudget(budget: Budget): Promise<void> {
    const budgets = await this.getBudgets();
    const existingIndex = budgets.findIndex(b => 
      b.categoryId === budget.categoryId && 
      b.month === budget.month && 
      b.year === budget.year
    );
    
    if (existingIndex >= 0) {
      budgets[existingIndex] = budget;
    } else {
      budgets.push(budget);
    }
    
    await this.setItem(STORAGE_KEYS.BUDGETS, budgets);
  }

  static async deleteBudget(budgetId: string): Promise<void> {
    const budgets = await this.getBudgets();
    const filteredBudgets = budgets.filter(b => b.id !== budgetId);
    await this.setItem(STORAGE_KEYS.BUDGETS, filteredBudgets);
  }

  // Recurring Bills
  static async getRecurringBills(): Promise<RecurringBill[]> {
    const bills = await this.getItem<RecurringBill>(STORAGE_KEYS.RECURRING_BILLS);
    return bills.map(bill => ({
      ...bill,
      createdAt: new Date(bill.createdAt)
    }));
  }

  static async saveRecurringBill(bill: RecurringBill): Promise<void> {
    const bills = await this.getRecurringBills();
    const existingIndex = bills.findIndex(b => b.id === bill.id);
    
    if (existingIndex >= 0) {
      bills[existingIndex] = bill;
    } else {
      bills.push(bill);
    }
    
    await this.setItem(STORAGE_KEYS.RECURRING_BILLS, bills);
  }

  static async deleteRecurringBill(billId: string): Promise<void> {
    const bills = await this.getRecurringBills();
    const filteredBills = bills.filter(b => b.id !== billId);
    await this.setItem(STORAGE_KEYS.RECURRING_BILLS, filteredBills);
  }

  // Notifications
  static async getNotifications(): Promise<Notification[]> {
    const notifications = await this.getItem<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    return notifications.map(notification => ({
      ...notification,
      date: new Date(notification.date)
    }));
  }

  static async saveNotification(notification: Notification): Promise<void> {
    const notifications = await this.getNotifications();
    const existingIndex = notifications.findIndex(n => n.id === notification.id);
    
    if (existingIndex >= 0) {
      notifications[existingIndex] = notification;
    } else {
      notifications.push(notification);
    }
    
    await this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const notifications = await this.getNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.isRead = true;
      await this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    const notifications = await this.getNotifications();
    const filteredNotifications = notifications.filter(n => n.id !== notificationId);
    await this.setItem(STORAGE_KEYS.NOTIFICATIONS, filteredNotifications);
  }

  // Settings
  static async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        requireAuthentication: false,
        biometricEnabled: false,
        currency: 'BRL',
        notifications: {
          budgetAlerts: true,
          billReminders: true,
          installmentReminders: true,
        }
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        requireAuthentication: false,
        biometricEnabled: false,
        currency: 'BRL',
        notifications: {
          budgetAlerts: true,
          billReminders: true,
          installmentReminders: true,
        }
      };
    }
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  // Utility methods
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  static async initializeDefaultData(): Promise<void> {
    const categories = await this.getCategories();
    const accounts = await this.getAccounts();

    // Initialize default categories if none exist
    if (categories.length === 0) {
      const defaultCategories: Category[] = [
        {
          id: '1',
          name: 'Alimentação',
          color: '#FF6B6B',
          icon: 'restaurant',
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'Transporte',
          color: '#4ECDC4',
          icon: 'car',
          createdAt: new Date(),
        },
        {
          id: '3',
          name: 'Lazer',
          color: '#45B7D1',
          icon: 'gamepad-variant',
          createdAt: new Date(),
        },
        {
          id: '4',
          name: 'Educação',
          color: '#96CEB4',
          icon: 'school',
          createdAt: new Date(),
        },
        {
          id: '5',
          name: 'Saúde',
          color: '#FFEAA7',
          icon: 'medical-bag',
          createdAt: new Date(),
        },
        {
          id: '6',
          name: 'Casa',
          color: '#DDA0DD',
          icon: 'home',
          createdAt: new Date(),
        },
      ];

      await this.setItem(STORAGE_KEYS.CATEGORIES, defaultCategories);
    }
  }
}