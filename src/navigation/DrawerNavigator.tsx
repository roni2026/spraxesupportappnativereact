import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { DrawerParamList } from './types';
import TabNavigator from './TabNavigator';
import ProductsScreen from '../screens/products/ProductsScreen';
import CategoriesScreen from '../screens/categories/CategoriesScreen';
import CustomersScreen from '../screens/customers/CustomersScreen';
import FeaturedImagesScreen from '../screens/content/FeaturedImagesScreen';
import FeatureCardsScreen from '../screens/content/FeatureCardsScreen';
import DiscountCodesScreen from '../screens/discounts/DiscountCodesScreen';
import SellerApplicationsScreen from '../screens/sellers/SellerApplicationsScreen';
import InvoicesScreen from '../screens/invoices/InvoicesScreen';
import SiteSettingsScreen from '../screens/settings/SiteSettingsScreen';

const Drawer = createDrawerNavigator<DrawerParamList>();

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

// Full admin menu (Destinations.kt drawerItems). Dashboard/Orders/Live Chat jump to the tab shell.
const menu: { key: string; label: string; icon: IconName; tab?: string; screen?: keyof DrawerParamList }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', tab: 'Dashboard' },
  { key: 'orders', label: 'Orders', icon: 'shopping-bag', tab: 'Orders' },
  { key: 'chat', label: 'Live Chat & Support', icon: 'chat-bubble', tab: 'ChatList' },
  { key: 'products', label: 'Products', icon: 'inventory-2', screen: 'Products' },
  { key: 'categories', label: 'Categories', icon: 'category', screen: 'Categories' },
  { key: 'customers', label: 'Customers', icon: 'people', screen: 'Customers' },
  { key: 'banners', label: 'Hero Banners', icon: 'image', screen: 'FeaturedImages' },
  { key: 'cards', label: 'Feature Cards', icon: 'star', screen: 'FeatureCards' },
  { key: 'discounts', label: 'Discount Codes', icon: 'local-offer', screen: 'DiscountCodes' },
  { key: 'sellers', label: 'Seller Applications', icon: 'storefront', screen: 'SellerApplications' },
  { key: 'invoices', label: 'Invoices', icon: 'receipt', screen: 'Invoices' },
  { key: 'settings', label: 'Site Settings', icon: 'settings', screen: 'SiteSettings' },
];

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { profile, signOut } = useAuth();
  const roleLabel = (profile?.role ?? 'staff').replace(/^./, (c) => c.toUpperCase());
  const currentRoute = props.state.routeNames[props.state.index];

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 24 }}>
      <View style={styles.header}>
        <Text style={styles.appName}>Spraxe Support</Text>
        <Text style={styles.role}>{roleLabel}</Text>
      </View>
      {menu.map((item) => {
        const selected =
          (item.screen && currentRoute === item.screen) ||
          (item.tab && currentRoute === 'Home');
        return (
          <Pressable
            key={item.key}
            style={[styles.item, selected ? styles.itemSelected : null]}
            onPress={() => {
              if (item.screen) props.navigation.navigate(item.screen);
              else props.navigation.navigate('Home', { screen: item.tab });
            }}
          >
            <MaterialIcons name={item.icon} size={22} color={theme.colors.onSurface} />
            <Text style={styles.itemLabel}>{item.label}</Text>
          </Pressable>
        );
      })}
      <Pressable style={styles.item} onPress={signOut}>
        <MaterialIcons name="logout" size={22} color={theme.colors.error} />
        <Text style={[styles.itemLabel, { color: theme.colors.error }]}>Sign out</Text>
      </Pressable>
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
        headerTitle: 'Spraxe Support',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Drawer.Screen name="Home" component={TabNavigator} />
      <Drawer.Screen name="Products" component={ProductsScreen} options={{ headerTitle: 'Products' }} />
      <Drawer.Screen name="Categories" component={CategoriesScreen} options={{ headerTitle: 'Categories' }} />
      <Drawer.Screen name="Customers" component={CustomersScreen} options={{ headerTitle: 'Customers' }} />
      <Drawer.Screen name="FeaturedImages" component={FeaturedImagesScreen} options={{ headerTitle: 'Hero Banners' }} />
      <Drawer.Screen name="FeatureCards" component={FeatureCardsScreen} options={{ headerTitle: 'Feature Cards' }} />
      <Drawer.Screen name="DiscountCodes" component={DiscountCodesScreen} options={{ headerTitle: 'Discount Codes' }} />
      <Drawer.Screen name="SellerApplications" component={SellerApplicationsScreen} options={{ headerTitle: 'Seller Applications' }} />
      <Drawer.Screen name="Invoices" component={InvoicesScreen} options={{ headerTitle: 'Invoices' }} />
      <Drawer.Screen name="SiteSettings" component={SiteSettingsScreen} options={{ headerTitle: 'Site Settings' }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, marginBottom: 8 },
  appName: { fontSize: 18, fontWeight: '700', color: theme.colors.primary },
  role: { fontSize: 13, color: theme.colors.onSurfaceMuted, marginTop: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, marginHorizontal: 8 },
  itemSelected: { backgroundColor: theme.colors.surfaceVariant },
  itemLabel: { fontSize: 15, color: theme.colors.onSurface },
});
