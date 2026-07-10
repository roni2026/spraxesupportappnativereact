import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';
import { RootStackParamList } from './types';
import SplashScreen from '../screens/splash/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import DrawerNavigator from './DrawerNavigator';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import ProductEditScreen from '../screens/products/ProductEditScreen';
import CustomerDetailScreen from '../screens/customers/CustomerDetailScreen';
import ChatThreadScreen from '../screens/chat/ChatThreadScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const headerStyle = {
  headerStyle: { backgroundColor: theme.colors.primary },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '600' as const },
};

export default function RootNavigator() {
  const { status } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {status === 'checking' ? (
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        ) : status === 'signedOut' ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={DrawerNavigator} options={{ headerShown: false }} />
            <Stack.Screen
              name="OrderDetail"
              component={OrderDetailScreen}
              options={{ title: 'Order', ...headerStyle }}
            />
            <Stack.Screen
              name="ProductEdit"
              component={ProductEditScreen}
              options={{ title: 'Product', ...headerStyle }}
            />
            <Stack.Screen
              name="CustomerDetail"
              component={CustomerDetailScreen}
              options={{ title: 'Customer', ...headerStyle }}
            />
            <Stack.Screen
              name="ChatThread"
              component={ChatThreadScreen}
              options={{ title: 'Conversation', ...headerStyle }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
