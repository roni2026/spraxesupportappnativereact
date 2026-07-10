# Spraxe Support (React Native / Expo)

Staff & admin app for the Spraxe storefront. **This is now a native React Native app built with
Expo (managed workflow) + TypeScript**, rewritten faithfully from the original native Android
(Kotlin + Jetpack Compose) app. It talks to the same Supabase backend as the Spraxe website and
customer app, and uses **Supabase Realtime** to power live customer support chat.

## Features

- Email + password sign-in restricted to `admin` / `moderator` roles
- **Dashboard** — product / order / customer / ticket counts + recent orders
- **Orders** — search & status filter, order detail with status + payment-status updates
  (order status changes here trigger customer push notifications)
- **Live Chat & Support** — ticket list + realtime chat thread (subscribe to `postgres_changes`
  on `support_messages`), send replies, change ticket status / priority
- **Products** — full CRUD, toggle active / featured, delete
- **Categories**, **Hero Banners** (featured_images), **Feature Cards** — CRUD
- **Customers** — search, profile + order history
- **Discount Codes** — create, toggle active, delete
- **Seller Applications** — approve / reject with reason
- **Invoices** — read-only list
- **Site Settings** — edit raw JSON values

Currency is Bangladeshi Taka (\u09f3).

## Tech stack

- Expo SDK 51, React Native, TypeScript
- `@react-navigation/native` + native-stack + bottom-tabs + drawer
  (with `react-native-gesture-handler` + `react-native-reanimated`)
- `@supabase/supabase-js` v2 + `@react-native-async-storage/async-storage` (session persistence)
  + `react-native-url-polyfill/auto`
- `@expo/vector-icons` (MaterialIcons), `expo-image`

## Setup

```bash
npm install
cp .env.example .env   # then fill in EXPO_PUBLIC_SUPABASE_ANON_KEY
npx expo start
```

Environment variables:

| Variable | Default |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://kybgrsqqvejbvjediowo.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | _(required, none in source)_ |

## Project structure

```
App.tsx
src/
  lib/supabase.ts          Supabase client (AsyncStorage session, realtime)
  theme/                   colors + theme tokens (navy/orange brand)
  types/models.ts          Data models ported from Models.kt
  data/                    One repository per source repository (exact queries)
  context/AuthContext.tsx  Session + staff-role gate
  components/CommonComponents.tsx
  navigation/              Root stack, drawer, bottom tabs
  screens/                 Every screen from the source app
```
