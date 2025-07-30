import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import AuthScreen from './AuthScreen';
import ChatScreen from './ChatScreen';

const Stack = createStackNavigator();

// Supabase configuration
const supabase = createClient(
  'https://koxnemiudjbditxuojxw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveG5lbWl1ZGpiZGl0eHVvanh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDczMDIsImV4cCI6MjA2ODkyMzMwMn0.OxaHUwgkNjn51PQ8mrw_LR0Em0pBEXiQ6OaeMlt2Qds'
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    // Loading state
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={isAuthenticated ? 'Chat' : 'Auth'}
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}