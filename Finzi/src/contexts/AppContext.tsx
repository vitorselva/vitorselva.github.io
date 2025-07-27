import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  Account, 
  Category, 
  Expense, 
  Budget, 
  RecurringBill, 
  Notification, 
  AppSettings 
} from '../types';
import { StorageService } from '../services/storage';

interface AppState {
  accounts: Account[];
  categories: Category[];
  expenses: Expense[];
  budgets: Budget[];
  recurringBills: RecurringBill[];
  notifications: Notification[];
  settings: AppSettings;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_ACCOUNTS'; payload: Account[] }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_BUDGETS'; payload: Budget[] }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'SET_RECURRING_BILLS'; payload: RecurringBill[] }
  | { type: 'ADD_RECURRING_BILL'; payload: RecurringBill }
  | { type: 'UPDATE_RECURRING_BILL'; payload: RecurringBill }
  | { type: 'DELETE_RECURRING_BILL'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: Notification }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'SET_SETTINGS'; payload: AppSettings };

const initialState: AppState = {
  accounts: [],
  categories: [],
  expenses: [],
  budgets: [],
  recurringBills: [],
  notifications: [],
  settings: {
    requireAuthentication: false,
    biometricEnabled: false,
    currency: 'BRL',
    notifications: {
      budgetAlerts: true,
      billReminders: true,
      installmentReminders: true,
    }
  },
  isLoading: true,
  isAuthenticated: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };

    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload };
    
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] };
    
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account.id === action.payload.id ? action.payload : account
        ),
      };
    
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter(account => account.id !== action.payload),
      };

    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? action.payload : category
        ),
      };
    
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
      };

    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        ),
      };
    
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
      };

    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    
    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, action.payload] };
    
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(budget =>
          budget.id === action.payload.id ? action.payload : budget
        ),
      };
    
    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter(budget => budget.id !== action.payload),
      };

    case 'SET_RECURRING_BILLS':
      return { ...state, recurringBills: action.payload };
    
    case 'ADD_RECURRING_BILL':
      return { ...state, recurringBills: [...state.recurringBills, action.payload] };
    
    case 'UPDATE_RECURRING_BILL':
      return {
        ...state,
        recurringBills: state.recurringBills.map(bill =>
          bill.id === action.payload.id ? action.payload : bill
        ),
      };
    
    case 'DELETE_RECURRING_BILL':
      return {
        ...state,
        recurringBills: state.recurringBills.filter(bill => bill.id !== action.payload),
      };

    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id ? action.payload : notification
        ),
      };
    
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
      };

    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Account actions
  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => Promise<void>;
  updateAccount: (account: Account) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
  
  // Category actions
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  
  // Budget actions
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => Promise<void>;
  updateBudget: (budget: Budget) => Promise<void>;
  deleteBudget: (budgetId: string) => Promise<void>;
  
  // Recurring Bill actions
  addRecurringBill: (bill: Omit<RecurringBill, 'id' | 'createdAt'>) => Promise<void>;
  updateRecurringBill: (bill: RecurringBill) => Promise<void>;
  deleteRecurringBill: (billId: string) => Promise<void>;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id'>) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  
  // Settings actions
  updateSettings: (settings: AppSettings) => Promise<void>;
  
  // Authentication
  authenticate: () => Promise<boolean>;
  logout: () => void;
  
  // Data loading
  loadData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Generate unique ID
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Load initial data
  const loadData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await StorageService.initializeDefaultData();
      
      const [accounts, categories, expenses, budgets, recurringBills, notifications, settings] = 
        await Promise.all([
          StorageService.getAccounts(),
          StorageService.getCategories(),
          StorageService.getExpenses(),
          StorageService.getBudgets(),
          StorageService.getRecurringBills(),
          StorageService.getNotifications(),
          StorageService.getSettings(),
        ]);

      dispatch({ type: 'SET_ACCOUNTS', payload: accounts });
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
      dispatch({ type: 'SET_EXPENSES', payload: expenses });
      dispatch({ type: 'SET_BUDGETS', payload: budgets });
      dispatch({ type: 'SET_RECURRING_BILLS', payload: recurringBills });
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      dispatch({ type: 'SET_SETTINGS', payload: settings });
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Account actions
  const addAccount = async (accountData: Omit<Account, 'id' | 'createdAt'>) => {
    const account: Account = {
      ...accountData,
      id: generateId(),
      createdAt: new Date(),
    };
    
    await StorageService.saveAccount(account);
    dispatch({ type: 'ADD_ACCOUNT', payload: account });
  };

  const updateAccount = async (account: Account) => {
    await StorageService.saveAccount(account);
    dispatch({ type: 'UPDATE_ACCOUNT', payload: account });
  };

  const deleteAccount = async (accountId: string) => {
    await StorageService.deleteAccount(accountId);
    dispatch({ type: 'DELETE_ACCOUNT', payload: accountId });
  };

  // Category actions
  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
    const category: Category = {
      ...categoryData,
      id: generateId(),
      createdAt: new Date(),
    };
    
    await StorageService.saveCategory(category);
    dispatch({ type: 'ADD_CATEGORY', payload: category });
  };

  const updateCategory = async (category: Category) => {
    await StorageService.saveCategory(category);
    dispatch({ type: 'UPDATE_CATEGORY', payload: category });
  };

  const deleteCategory = async (categoryId: string) => {
    await StorageService.deleteCategory(categoryId);
    dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
  };

  // Expense actions
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const expense: Expense = {
      ...expenseData,
      id: generateId(),
      createdAt: new Date(),
    };
    
    await StorageService.saveExpense(expense);
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
  };

  const updateExpense = async (expense: Expense) => {
    await StorageService.saveExpense(expense);
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
  };

  const deleteExpense = async (expenseId: string) => {
    await StorageService.deleteExpense(expenseId);
    dispatch({ type: 'DELETE_EXPENSE', payload: expenseId });
  };

  // Budget actions
  const addBudget = async (budgetData: Omit<Budget, 'id' | 'createdAt'>) => {
    const budget: Budget = {
      ...budgetData,
      id: generateId(),
      createdAt: new Date(),
    };
    
    await StorageService.saveBudget(budget);
    dispatch({ type: 'ADD_BUDGET', payload: budget });
  };

  const updateBudget = async (budget: Budget) => {
    await StorageService.saveBudget(budget);
    dispatch({ type: 'UPDATE_BUDGET', payload: budget });
  };

  const deleteBudget = async (budgetId: string) => {
    await StorageService.deleteBudget(budgetId);
    dispatch({ type: 'DELETE_BUDGET', payload: budgetId });
  };

  // Recurring Bill actions
  const addRecurringBill = async (billData: Omit<RecurringBill, 'id' | 'createdAt'>) => {
    const bill: RecurringBill = {
      ...billData,
      id: generateId(),
      createdAt: new Date(),
    };
    
    await StorageService.saveRecurringBill(bill);
    dispatch({ type: 'ADD_RECURRING_BILL', payload: bill });
  };

  const updateRecurringBill = async (bill: RecurringBill) => {
    await StorageService.saveRecurringBill(bill);
    dispatch({ type: 'UPDATE_RECURRING_BILL', payload: bill });
  };

  const deleteRecurringBill = async (billId: string) => {
    await StorageService.deleteRecurringBill(billId);
    dispatch({ type: 'DELETE_RECURRING_BILL', payload: billId });
  };

  // Notification actions
  const addNotification = async (notificationData: Omit<Notification, 'id'>) => {
    const notification: Notification = {
      ...notificationData,
      id: generateId(),
    };
    
    await StorageService.saveNotification(notification);
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const markNotificationAsRead = async (notificationId: string) => {
    await StorageService.markNotificationAsRead(notificationId);
    const updatedNotification = state.notifications.find(n => n.id === notificationId);
    if (updatedNotification) {
      dispatch({ type: 'UPDATE_NOTIFICATION', payload: { ...updatedNotification, isRead: true } });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    await StorageService.deleteNotification(notificationId);
    dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
  };

  // Settings actions
  const updateSettings = async (settings: AppSettings) => {
    await StorageService.saveSettings(settings);
    dispatch({ type: 'SET_SETTINGS', payload: settings });
  };

  // Authentication
  const authenticate = async (): Promise<boolean> => {
    // This would implement biometric/password authentication
    // For now, just return true
    dispatch({ type: 'SET_AUTHENTICATED', payload: true });
    return true;
  };

  const logout = () => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: false });
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const contextValue: AppContextType = {
    state,
    dispatch,
    addAccount,
    updateAccount,
    deleteAccount,
    addCategory,
    updateCategory,
    deleteCategory,
    addExpense,
    updateExpense,
    deleteExpense,
    addBudget,
    updateBudget,
    deleteBudget,
    addRecurringBill,
    updateRecurringBill,
    deleteRecurringBill,
    addNotification,
    markNotificationAsRead,
    deleteNotification,
    updateSettings,
    authenticate,
    logout,
    loadData,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}