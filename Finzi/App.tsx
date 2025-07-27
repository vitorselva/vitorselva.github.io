import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { AppProvider } from './src/contexts/AppContext';

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import AccountsScreen from './src/screens/AccountsScreen';
import BudgetsScreen from './src/screens/BudgetsScreen';
import RecurringBillsScreen from './src/screens/RecurringBillsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ExpensesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExpensesList" component={ExpensesScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
    </Stack.Navigator>
  );
}

function ManagementStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="Accounts" component={AccountsScreen} />
      <Stack.Screen name="Budgets" component={BudgetsScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Expenses') {
            iconName = 'receipt-long';
          } else if (route.name === 'Management') {
            iconName = 'settings';
          } else if (route.name === 'Bills') {
            iconName = 'event-repeat';
          } else {
            iconName = 'help';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#45B7D1',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Expenses" 
        component={ExpensesStack} 
        options={{ title: 'Gastos' }}
      />
      <Tab.Screen 
        name="Management" 
        component={ManagementStack} 
        options={{ title: 'Gerenciar' }}
      />
      <Tab.Screen 
        name="Bills" 
        component={RecurringBillsScreen} 
        options={{ title: 'Contas' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor="#fff" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
