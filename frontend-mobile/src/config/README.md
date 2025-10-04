# UI Configuration

This directory contains centralized UI configuration for the entire app.

## Files

### `ui.ts`
Main UI configuration file that controls visual features across the app.

## Available Configurations

### `SHOW_HEADERS`
Controls whether screen headers (title bars) are displayed throughout the app.

**Type:** `boolean`

**Default:** `true`

**Usage:**
```typescript
import { UI_CONFIG } from '@/config/ui';

// In layout files
<Stack screenOptions={{ headerShown: UI_CONFIG.SHOW_HEADERS }}>
```

**Effect:**
- `true` - Headers visible on all screens (shows "Applications", "Dashboard", etc.)
- `false` - Headers hidden for edge-to-edge design

**How to Change:**
1. Open `src/config/ui.ts`
2. Change `SHOW_HEADERS: true` to `SHOW_HEADERS: false` (or vice versa)
3. Save the file
4. The app will hot-reload with the new setting

## Adding New Configuration

To add a new UI configuration option:

1. Add the property to the `UI_CONFIG` object in `ui.ts`:
```typescript
export const UI_CONFIG = {
  SHOW_HEADERS: true,
  YOUR_NEW_CONFIG: 'value',
} as const;
```

2. Import and use it in your components:
```typescript
import { UI_CONFIG } from '@/config/ui';

// Use the config
const myValue = UI_CONFIG.YOUR_NEW_CONFIG;
```

## Benefits

✅ **Single source of truth** - One file controls UI across the entire app  
✅ **Type-safe** - TypeScript ensures correct usage  
✅ **Hot-reload friendly** - Changes take effect immediately in development  
✅ **Easy to maintain** - No need to hunt through multiple files
