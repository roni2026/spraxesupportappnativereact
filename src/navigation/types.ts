import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  ChatList: undefined;
  Profile: undefined;
};

export type DrawerParamList = {
  Home: NavigatorScreenParams<TabParamList> | undefined;
  Products: undefined;
  Categories: undefined;
  Customers: undefined;
  FeaturedImages: undefined;
  FeatureCards: undefined;
  DiscountCodes: undefined;
  SellerApplications: undefined;
  Invoices: undefined;
  SiteSettings: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: NavigatorScreenParams<DrawerParamList> | undefined;
  OrderDetail: { orderId: string };
  ProductEdit: { productId?: string };
  CustomerDetail: { customerId: string };
  ChatThread: { ticketId: string };
};
