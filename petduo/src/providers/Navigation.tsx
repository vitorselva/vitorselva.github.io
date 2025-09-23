import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen, AddPetScreen, JoinPetScreen, PetDetailScreen, RemindersScreen, ApprovalsScreen } from '@screens/index';
import PaywallScreen from '@screens/paywall/PaywallScreen';
import { SubscriptionProvider, useSubscription } from '@providers/SubscriptionProvider';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Aprovações" component={ApprovalsScreen} />
    </Tabs.Navigator>
  );
}

function RootNavigator() {
  const { isSubscribed } = useSubscription();
  return (
    <Stack.Navigator>
      {isSubscribed ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="AddPet" component={AddPetScreen} options={{ title: 'Novo Pet' }} />
          <Stack.Screen name="JoinPet" component={JoinPetScreen} options={{ title: 'Entrar no Pet' }} />
          <Stack.Screen name="PetDetail" component={PetDetailScreen} options={{ title: 'Pet' }} />
          <Stack.Screen name="Reminders" component={RemindersScreen} options={{ title: 'Lembretes' }} />
        </>
      ) : (
        <Stack.Screen name="Paywall" component={PaywallScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

export default function Navigation() {
  return (
    <SubscriptionProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SubscriptionProvider>
  );
}

