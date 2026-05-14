## Goal
Apply the established icon weight standard (size `h-3.5 w-3.5`, `strokeWidth={1.75}`) to the Broker Connection Dashboard and Strategy Marketplace pages, matching the dashboard refinement pass.

## Scope
UI only. No logic, no API, no structural layout changes. Only icon `className` sizing and `strokeWidth` props are updated.

## Files

### 1. `src/components/broker/BrokerConnectionDashboard.tsx`
- Normalize all Lucide icons to `h-3.5 w-3.5` and add `strokeWidth={1.75}`.
- Affected icons: `Wifi`, `TrendingUp`, `Shield`, `Clock`, `AlertTriangle`, `WifiOff`, `Settings`, `Plus`, `CheckCircle`, status icons in broker cards.
- Exception: keep the larger empty-state `Plus` (currently `w-6 h-6`) at its existing size since it serves as an illustrative element, but still apply `strokeWidth={1.75}`.

### 2. `src/components/broker/BrokerCard.tsx` and `src/components/broker/EnhancedBrokerCard.tsx`
- Same standardization for any icons rendered inside broker cards used by the dashboard.

### 3. `src/components/broker/BrokerSummaryStats.tsx`
- Standardize stat icons to `h-3.5 w-3.5` `strokeWidth={1.75}`.

### 4. `src/components/strategy/StrategyMarketplace.tsx`
- Normalize inline action/meta icons (`Plus`, `Search`, `Filter`, category `Icon`) to `h-3.5 w-3.5` `strokeWidth={1.75}`.
- Exception: keep the empty-state `Target` illustration (`h-12 w-12`) at its current size; apply `strokeWidth={1.75}` only.

### 5. `src/components/strategy/StrategyCard.tsx` and `src/components/strategy/SuggestedStrategyCard.tsx`
- Standardize icons used inside marketplace cards for consistency.

## Out of scope
- Other pages (already done or not requested).
- Color, spacing, layout, copy, or behavior changes.
- Empty-state hero illustrations beyond stroke weight.

## Verification
- Visually confirm marketplace and broker dashboard icons render consistently with the main dashboard.
- No TypeScript or runtime regressions.
