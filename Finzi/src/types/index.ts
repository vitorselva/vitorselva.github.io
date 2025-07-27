export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'pix';
  bank: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: Date;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: Date;
  accountId: string;
  categoryId: string;
  isInstallment: boolean;
  installments?: {
    total: number;
    current: number;
  };
  createdAt: Date;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  month: number;
  year: number;
  createdAt: Date;
}

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  dueDate: number; // day of month
  categoryId: string;
  accountId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'budget_alert' | 'bill_reminder' | 'installment_reminder';
  date: Date;
  isRead: boolean;
  relatedId?: string;
}

export type FilterPeriod = 'day' | 'month' | 'year';

export interface ExpenseFilter {
  period: FilterPeriod;
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  accountId?: string;
  minAmount?: number;
  maxAmount?: number;
  searchText?: string;
}

export interface DashboardData {
  totalExpenses: number;
  expensesByCategory: Array<{
    category: Category;
    amount: number;
    percentage: number;
  }>;
  expensesByAccount: Array<{
    account: Account;
    amount: number;
    percentage: number;
  }>;
  monthlyExpenses: Array<{
    month: string;
    amount: number;
  }>;
  budgetAlerts: Array<{
    category: Category;
    budget: Budget;
    spent: number;
    percentage: number;
  }>;
}

export interface AppSettings {
  requireAuthentication: boolean;
  biometricEnabled: boolean;
  currency: string;
  notifications: {
    budgetAlerts: boolean;
    billReminders: boolean;
    installmentReminders: boolean;
  };
}