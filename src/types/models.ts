// Ported from data/model/Models.kt. Field names match the shared Supabase column names
// (snake_case) since supabase-js returns raw rows.

export interface Profile {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  company_name?: string | null;
  role?: string | null;
  created_at?: string | null;
}
export const isStaff = (p?: Profile | null): boolean =>
  p?.role === 'admin' || p?.role === 'moderator';
export const displayName = (p?: Profile | null): string => {
  if (!p) return '';
  if (p.full_name && p.full_name.trim().length > 0) return p.full_name;
  return p.email ?? p.phone ?? p.id;
};

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
  sort_order?: number | null;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  price?: number | null;
  base_price?: number | null;
  images?: string[] | null;
  category_id?: string | null;
  stock_quantity?: number | null;
  is_active: boolean;
  is_featured: boolean;
  total_sales?: number | null;
  created_at?: string | null;
}
export const displayPrice = (p: Product): number => p.price ?? p.base_price ?? 0;
export const thumbnailUrl = (p: Product): string | null =>
  p.images && p.images.length > 0 ? p.images[0] : null;

export interface OrderRow {
  id: string;
  order_number?: string | null;
  user_id?: string | null;
  total: number;
  subtotal?: number | null;
  status: string;
  payment_status?: string | null;
  payment_method?: string | null;
  payment_transaction_id?: string | null;
  shipping_address?: string | null;
  delivery_location?: string | null;
  shipping_cost?: number | null;
  contact_number?: string | null;
  created_at?: string | null;
  profiles?: Profile | null;
}

export interface OrderItemRow {
  id?: string | null;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  product_sku?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface FeaturedImage {
  id?: number | null;
  title?: string | null;
  description?: string | null;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

export interface FeatureCard {
  id?: number | null;
  title: string;
  description: string;
  icon: string;
  image_url?: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface SupportTicket {
  id: string;
  ticket_number?: string | null;
  user_id?: string | null;
  type: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  order_id?: string | null;
  assigned_to?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  profiles?: Profile | null;
}

export interface SupportMessage {
  id?: string | null;
  ticket_id: string;
  sender_id?: string | null;
  sender_role: string;
  message: string;
  is_read: boolean;
  created_at?: string | null;
}

export interface DiscountCode {
  id?: string | null;
  code: string;
  discount_type: string;
  discount_value: number;
  min_purchase?: number | null;
  max_uses?: number | null;
  current_uses?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active: boolean;
}

export interface SellerApplication {
  id: string;
  user_id?: string | null;
  shop_name: string;
  shop_description?: string | null;
  business_address: string;
  phone: string;
  email: string;
  status: string;
  rejection_reason?: string | null;
  created_at?: string | null;
}

export interface SiteSetting {
  id?: string | null;
  key: string;
  value: any;
  updated_at?: string | null;
}

export interface Invoice {
  id: string;
  order_id?: string | null;
  invoice_number?: string | null;
  total?: number | null;
  status?: string | null;
  created_at?: string | null;
}

export interface DashboardStats {
  products: number;
  orders: number;
  customers: number;
  pendingOrders: number;
  openTickets: number;
  inProgressTickets: number;
  pendingSellerApps: number;
}
