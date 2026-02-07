

# Real-Time WebSocket Updates for Bot Status and Positions

## Overview

Add live, automatic updates to the Trading Bots dashboard so that bot status changes, portfolio updates, and position changes appear instantly without needing to click "Refresh". This uses the database's built-in real-time subscription system (already enabled on the relevant tables).

## What Changes for Users

- Bot cards will automatically update when their status changes (running/paused/stopped)
- Portfolio balances, equity, and margin will update live
- Position P&L will stream in real-time
- A connection status indicator will show whether live updates are active
- No more manual refresh needed -- everything stays in sync

## Technical Approach

Instead of building a separate WebSocket backend function, we use the database's built-in real-time change feed. The `trading_bots`, `portfolios`, `positions`, and `orders` tables already have real-time enabled from the initial migration.

## Implementation Details

### 1. Create a new hook: `src/hooks/useRealtimeTradingData.ts`

A centralized hook that subscribes to real-time changes on all HFT tables, scoped to the authenticated user:

- **Channel subscriptions** for `trading_bots`, `portfolios`, `positions`, and `orders` tables
- Listens for `INSERT`, `UPDATE`, and `DELETE` events
- Provides callback-based API so consumers can react to changes
- Handles connection status tracking (connected/disconnected)
- Auto-cleanup on unmount

```text
Hook API:
  useRealtimeTradingData({
    onBotChange: (payload) => void,
    onPortfolioChange: (payload) => void,
    onPositionChange: (payload) => void,
    onOrderChange: (payload) => void,
  }) => { isConnected: boolean }
```

### 2. Update `src/hooks/useTradingBot.ts`

- Import and use `useRealtimeTradingData`
- On `INSERT` events: add new bot to local state
- On `UPDATE` events: merge updated fields into matching bot
- On `DELETE` events: remove bot from local state
- Expose `isRealtimeConnected` status

### 3. Update `src/hooks/usePortfolio.ts`

- Same pattern: subscribe to portfolio, position, and order changes
- Automatically update local state when DB rows change
- Portfolio balance/equity changes reflect instantly

### 4. Update `src/components/trading-bot/TradingBotDashboard.tsx`

- Show a real-time connection indicator (green dot = live, red = disconnected)
- Remove the need for manual refresh when realtime is connected
- Stats cards (Active Bots, Total Equity, etc.) update automatically

### 5. Update `src/components/trading-bot/BotCard.tsx`

- Accept bot data as prop (already does) -- updates flow from parent
- Add subtle animation when status changes (e.g., flash border)

### 6. Update `src/components/portfolio/PortfolioManager.tsx`

- Portfolio cards update in real-time
- Position P&L updates stream live

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useRealtimeTradingData.ts` | Central realtime subscription hook |

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useTradingBot.ts` | Add realtime listener, auto-update state |
| `src/hooks/usePortfolio.ts` | Add realtime listener, auto-update state |
| `src/components/trading-bot/TradingBotDashboard.tsx` | Add connection indicator, pass realtime status |
| `src/components/trading-bot/BotCard.tsx` | Add transition animation on status change |
| `src/components/portfolio/PortfolioManager.tsx` | Wire in realtime portfolio updates |

## Realtime Subscription Pattern

```text
supabase
  .channel('trading-realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'trading_bots' }, handler)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolios' }, handler)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'positions' }, handler)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, handler)
  .subscribe()
```

RLS policies already filter data to the authenticated user, so each user only receives changes to their own records.

## No Database or Edge Function Changes Required

The migration that created these tables already included:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE trading_bots, portfolios, positions, orders;
```

So no additional backend work is needed.

