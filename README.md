# Spraxe Support (React Native / Expo)

Staff and admin app for the Spraxe storefront, rewritten from the original native Android (Kotlin + Jetpack Compose) app into React Native with Expo (managed workflow) and TypeScript. It talks to the same Supabase backend as the website and customer app, and uses Supabase Realtime to power live customer support chat.

## Features

- Email + password sign-in restricted to `admin`/`moderator` roles
- **Dashboard** — product/order/customer/ticket counts plus recent orders
- **Orders** — search and status filter, order detail with status + payment-status updates (changes here trigger customer push notifications)
- **Live Chat & Support** — ticket list plus a realtime chat thread subscribed to `support_messages` via `postgres_changes`, with inline replies and status/priority changes
- **Products** — full CRUD, toggle active/featured, delete
- **Categories**, **Hero Banners**, **Feature Cards** — CRUD
- **Customers** — search, profile, and order history
- **Discount Codes** — create, toggle active, delete
- **Seller Applications** — approve or reject with a reason
- **Invoices** — read-only list
- **Site Settings** — edit raw JSON values

Currency is Bangladeshi Taka (৳).

## Tech stack

Expo SDK 51 · React Native · TypeScript · React Navigation (native-stack + bottom-tabs + drawer, with `react-native-gesture-handler` and `react-native-reanimated`) · `@supabase/supabase-js` v2 with AsyncStorage session persistence · `@expo/vector-icons` · `expo-image`

## Setup

```bash
npm install
cp .env.example .env   # fill in EXPO_PUBLIC_SUPABASE_ANON_KEY
npx expo start
```

## Related

The original native Android build is at [`spraxesupport-kotlin`](https://github.com/roni2026/spraxesupport-kotlin). The customer-facing counterpart is [`spraxeappnativereact`](https://github.com/roni2026/spraxeappnativereact).
