import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { OnboardingNameScreen } from './src/screens/OnboardingNameScreen';
import { OnboardingPreferenceScreen } from './src/screens/OnboardingPreferenceScreen';
import { OnboardingCalendarScreen } from './src/screens/OnboardingCalendarScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MainTabs } from './src/navigation/MainTabs';
import type { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="OnboardingName" component={OnboardingNameScreen} />
          <Stack.Screen
            name="OnboardingPreference"
            component={OnboardingPreferenceScreen}
          />
          <Stack.Screen
            name="OnboardingCalendar"
            component={OnboardingCalendarScreen}
          />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
