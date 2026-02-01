

# Fix Build Errors and Transition to Forex-Only Focus

## Overview

This plan addresses three main areas:
1. Fix the TypeScript build errors preventing the app from running
2. Navigate and test the Trading Bots dashboard functionality
3. Remove all Indian stock market references and focus purely on forex trading

---

## Part 1: Fix Build Errors

### Error 1: PostgrestFilterBuilder `.catch()` not available
**File:** `supabase/functions/trading-bot-engine/index.ts` (line 356)
**Problem:** The Supabase Postgrest builder doesn't have `.catch()` method - it returns a query builder, not a Promise.
**Solution:** Use async/await pattern with try-catch, or use `.then()` to handle the promise properly.

```typescript
// BEFORE (broken)
supabase.from('bot_execution_logs').insert({...}).catch(err => console.error(...));

// AFTER (fixed) - Fire and forget with proper promise handling
supabase.from('bot_execution_logs').insert({...}).then(
  ({ error }) => { if (error) console.error('Failed to log execution:', error); }
);
```

### Error 2: Implicit `any` type
**File:** Same location
**Solution:** Properly type the error handling or use the fixed pattern above.

### Error 3: `size` property on array
**File:** `src/utils/concurrency.ts` (line 113)
**Problem:** Arrays don't have a `.size` property - that's for Set/Map.
**Solution:** Use `.length` consistently for arrays.

```typescript
// BEFORE (broken)
return this.batch.size || this.batch.length;

// AFTER (fixed)
return this.batch.length;
```

---

## Part 2: Test Trading Bots Dashboard

After fixing the build errors, we can navigate to `/trading-bots` and test:
- Creating a demo portfolio
- Creating a trading bot
- Verifying the bot/portfolio dashboard displays correctly

---

## Part 3: Remove Indian Stock Market References

### Files to Modify

| File | Changes |
|------|---------|
| `src/data/instrumentRegistry.ts` | Remove NIFTY, BANKNIFTY, SENSEX, INDIAVIX entries |
| `src/services/simulatedMarketData.ts` | Replace Indian stocks with forex pairs |
| `src/pages/Market.tsx` | Update to forex-focused display |
| `src/hooks/useRealtimeMarketData.ts` | Remove NIFTY/BANKNIFTY references |
| `src/components/market/LiveOptionChain.tsx` | Remove (forex-focused) |
| `src/components/market/LiveOptionChainSimulated.tsx` | Remove or repurpose |
| `src/components/market/MarketChart.tsx` | Default to forex symbol |

### Files to Delete
| File | Reason |
|------|--------|
| `src/services/dhanAPI.ts` | Dhan is for Indian markets |
| `src/services/dhanMarketData.ts` | Dhan is for Indian markets |
| `src/hooks/useDhanMarketData.ts` | No longer needed |
| `src/hooks/useDhanOptionChain.ts` | No longer needed |
| `supabase/functions/dhan-optionchain/index.ts` | Remove Dhan edge function |

### Key Changes in Detail

**1. Update Instrument Registry (instrumentRegistry.ts)**
- Keep forex instruments: EURUSD, GBPUSD, USDJPY, etc.
- Keep commodities: Gold (XAUUSD), Silver (XAGUSD), Oil
- Keep global indices: SPX, NASDAQ, DJI, DAX
- Remove: NIFTY, BANKNIFTY, SENSEX, INDIAVIX

**2. Update Simulated Market Data (simulatedMarketData.ts)**
- Replace Indian indices (NIFTY, BANKNIFTY, SENSEX) with forex majors
- Replace Indian stocks with forex crosses
- Update simulated option chain to forex-style or remove entirely

**3. Update Market Page (Market.tsx)**
- Display forex pairs as primary instruments
- Change currency symbols from ₹ to $ or appropriate currency
- Remove F&O (Futures & Options) Indian-specific metrics
- Remove Indian sector data

**4. Update MarketChart default symbol**
- Change from `NSE:NIFTY` to `OANDA:EURUSD`

---

## Technical Summary

| Category | Changes |
|----------|---------|
| **Build Fixes** | 2 files, 3 errors fixed |
| **Files Modified** | ~8 files for forex focus |
| **Files Deleted** | 5 files (Dhan-related) |
| **Edge Functions** | Delete `dhan-optionchain` |
| **Config Updates** | Remove Dhan function from config.toml |

---

## Implementation Order

1. Fix the 3 build errors (immediate priority)
2. Deploy and verify app loads
3. Test Trading Bots dashboard at `/trading-bots`
4. Remove Dhan-related files and services
5. Update instrument registry (remove Indian indices)
6. Update simulated market data for forex
7. Update Market page UI for forex focus
8. Test the complete forex-focused flow

