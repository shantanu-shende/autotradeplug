
# High-Frequency Trading Bot System with Arbitrage

## Overview

This plan outlines the architecture for a comprehensive automated trading system designed for high-frequency trading (HFT) and arbitrage opportunities. The system will support both **real** and **demo** portfolios and serve as a plugin architecture that can connect to MetaTrader (MT4/MT5) accounts and other forex brokers.

## System Architecture

```text
+--------------------------------------------------+
|                   CLIENT (React)                  |
|  +------------+  +-------------+  +------------+ |
|  |  Trading   |  |  Portfolio  |  |  Bot       | |
|  |  Dashboard |  |  Manager    |  |  Controls  | |
|  +-----+------+  +------+------+  +-----+------+ |
|        |               |               |         |
+--------+---------------+---------------+---------+
         |               |               |
         v               v               v
+--------------------------------------------------+
|           WebSocket Layer (Real-time)            |
|  - Price Feeds    - Order Updates   - Bot Status |
+--------------------------------------------------+
         |               |               |
         v               v               v
+--------------------------------------------------+
|              EDGE FUNCTIONS (Backend)            |
|  +-------------+  +---------------+  +---------+ |
|  | trading-bot |  | portfolio-mgr |  | arb-    | |
|  | engine      |  |               |  | detector| |
|  +-------------+  +---------------+  +---------+ |
+--------------------------------------------------+
         |               |               |
         v               v               v
+--------------------------------------------------+
|                DATABASE (Supabase)               |
|  - trading_bots    - portfolios    - orders      |
|  - bot_configs     - positions     - arb_signals |
+--------------------------------------------------+
         |
         v
+--------------------------------------------------+
|            EXTERNAL INTEGRATIONS                 |
|  +--------+  +--------+  +--------+  +---------+ |
|  | MetaAPI|  | Dhan   |  | Twelve |  | Custom  | |
|  | (MT4/5)|  | HQ     |  | Data   |  | Brokers | |
|  +--------+  +--------+  +--------+  +---------+ |
+--------------------------------------------------+
```

## Core Components

### 1. Database Schema (New Tables)

**trading_bots** - Store bot configurations
- id (uuid, primary key)
- user_id (text, references auth user)
- bot_name (text)
- strategy_type (enum: arbitrage, scalping, grid, trend_following)
- status (enum: running, paused, stopped, error)
- config (jsonb - holds strategy parameters)
- created_at, updated_at (timestamps)

**portfolios** - Unified portfolio management
- id (uuid, primary key)  
- user_id (text)
- portfolio_name (text)
- portfolio_type (enum: real, demo)
- broker_connection_id (uuid, nullable - links to brokers table for real)
- balance (numeric)
- equity (numeric)
- margin_used (numeric)
- margin_available (numeric)
- currency (text, default 'USD')
- created_at, updated_at

**positions** - Track open positions
- id (uuid, primary key)
- portfolio_id (uuid, references portfolios)
- user_id (text)
- symbol (text)
- side (enum: buy, sell)
- volume (numeric)
- entry_price (numeric)
- current_price (numeric)
- stop_loss (numeric, nullable)
- take_profit (numeric, nullable)
- profit_loss (numeric)
- opened_at, updated_at

**orders** - Order history and pending orders
- id (uuid, primary key)
- portfolio_id (uuid)
- user_id (text)
- bot_id (uuid, nullable)
- symbol (text)
- order_type (enum: market, limit, stop, stop_limit)
- side (enum: buy, sell)
- volume (numeric)
- price (numeric, nullable)
- status (enum: pending, filled, partially_filled, cancelled, rejected)
- filled_price (numeric, nullable)
- filled_at (timestamp, nullable)
- created_at

**arbitrage_signals** - Detected arbitrage opportunities
- id (uuid, primary key)
- user_id (text)
- symbol_pair (text)
- source_a (text - broker/exchange name)
- source_b (text)
- price_a (numeric)
- price_b (numeric)
- spread_pips (numeric)
- potential_profit (numeric)
- detected_at (timestamp)
- executed (boolean)
- execution_result (jsonb, nullable)

**bot_execution_logs** - Audit trail for bot actions
- id (uuid, primary key)
- bot_id (uuid)
- user_id (text)
- action (text)
- details (jsonb)
- created_at

### 2. Edge Functions

**trading-bot-engine** - Core WebSocket-based bot engine
- Maintains persistent WebSocket connections for real-time price feeds
- Executes trading strategies based on configured rules
- Supports multiple concurrent bots per user
- Handles order execution through broker APIs

**portfolio-manager** - Portfolio operations
- Create/manage real and demo portfolios
- Track positions, equity, margin in real-time
- Calculate P&L, drawdown, risk metrics
- Sync with external broker accounts

**arbitrage-detector** - Real-time arbitrage detection
- Monitors price feeds from multiple sources
- Calculates spread differentials
- Triggers alerts when profitable opportunities detected
- Can auto-execute trades in < 100ms latency target

**mt-connector** - MetaTrader integration service
- Uses MetaAPI cloud service for MT4/MT5 connectivity
- Handles account synchronization
- Bridges MT accounts to our trading engine
- Supports demo and real MT accounts

### 3. Frontend Components

**TradingBotDashboard** - Main bot management interface
- Bot creation wizard
- Live status monitoring
- Performance metrics visualization
- Quick controls (start/stop/pause)

**PortfolioManager** - Unified portfolio view
- Real vs Demo portfolio switcher
- Position management
- Order history
- Risk analytics

**ArbitrageSuite** - Arbitrage trading tools
- Live spread monitor across instruments
- Opportunity scanner with filters
- One-click execution for detected opportunities
- Historical arbitrage analysis

**BotConfigEditor** - Strategy configuration
- Visual strategy builder
- Parameter tuning with backtesting
- Risk management settings
- Notification preferences

### 4. Real-Time Architecture

The system uses a WebSocket-based architecture for minimal latency:

1. **Price Feed WebSocket** (trading-bot-engine)
   - Aggregates feeds from multiple sources
   - Broadcasts to connected clients and bot instances
   - Target latency: < 50ms

2. **Order Execution WebSocket**
   - Direct connection to broker APIs
   - Immediate order confirmation/rejection
   - Target latency: < 100ms for execution

3. **Bot Status WebSocket**
   - Real-time bot health monitoring
   - Position updates
   - P&L streaming

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Database schema creation with RLS policies
- Portfolio management edge function
- Basic bot engine structure
- Demo portfolio implementation

### Phase 2: Trading Engine (Week 3-4)
- WebSocket-based price aggregation
- Order management system
- Position tracking
- Basic strategy execution (trend following)

### Phase 3: Arbitrage System (Week 5-6)
- Multi-source price monitoring
- Spread calculation engine
- Arbitrage signal detection
- Alert system

### Phase 4: MetaTrader Integration (Week 7-8)
- MetaAPI integration
- MT4/MT5 account connection
- Order bridging
- Account synchronization

### Phase 5: Advanced Features (Week 9-10)
- Advanced strategies (grid, scalping)
- Backtesting engine
- Performance analytics
- Mobile optimization

## Technical Specifications

### Strategy Types Supported

1. **Arbitrage** - Cross-broker/instrument price difference exploitation
2. **Scalping** - High-frequency small profit trades
3. **Grid Trading** - Buy/sell at predetermined intervals
4. **Trend Following** - EMA/RSI-based directional trades

### Risk Management Built-in

- Max drawdown limits (% of equity)
- Position size limits
- Daily loss limits
- Max open positions per bot
- Stop loss/Take profit automation

### Security Considerations

- All API keys stored as Supabase secrets
- RLS policies ensure user data isolation
- JWT authentication for all WebSocket connections
- Rate limiting on order execution
- Audit logging for all bot actions

## Files to Create/Modify

### New Files
1. `supabase/functions/trading-bot-engine/index.ts` - Core bot engine
2. `supabase/functions/portfolio-manager/index.ts` - Portfolio operations
3. `supabase/functions/arbitrage-detector/index.ts` - Arbitrage monitoring
4. `supabase/functions/mt-connector/index.ts` - MetaTrader bridge
5. `src/components/trading-bot/TradingBotDashboard.tsx`
6. `src/components/trading-bot/BotCard.tsx`
7. `src/components/trading-bot/BotConfigEditor.tsx`
8. `src/components/trading-bot/CreateBotModal.tsx`
9. `src/components/portfolio/PortfolioManager.tsx`
10. `src/components/portfolio/PositionsTable.tsx`
11. `src/components/portfolio/OrderHistory.tsx`
12. `src/components/arbitrage/ArbitrageDashboard.tsx`
13. `src/components/arbitrage/SpreadMonitor.tsx`
14. `src/components/arbitrage/OpportunityScanner.tsx`
15. `src/contexts/TradingBotContext.tsx` - Bot state management
16. `src/hooks/useTradingBot.ts` - Bot interaction hooks
17. `src/hooks/usePortfolio.ts` - Portfolio data hooks
18. `src/pages/TradingBots.tsx` - Dedicated bots page
19. `src/pages/Portfolios.tsx` - Portfolio management page

### Files to Modify
1. `src/App.tsx` - Add new routes
2. `src/data/instrumentRegistry.ts` - Add arbitrage pair mappings
3. `supabase/config.toml` - Add new function configurations

## API Requirements

For full functionality, the following external API integrations are needed:

1. **MetaAPI** (for MT4/MT5 connectivity)
   - Required secret: `METAAPI_TOKEN`
   - Provides: Account connection, order execution, position sync

2. **TwelveData** (already configured)
   - Used for: Real-time forex price feeds

3. **DhanHQ** (already configured)
   - Used for: Indian market data

## Summary

This system will provide a comprehensive automated trading solution with:
- **Real + Demo portfolios** for safe testing
- **High-frequency trading** capability via WebSockets
- **Arbitrage detection** across multiple price sources
- **MetaTrader integration** as a plugin architecture
- **Extensible strategy framework** for custom algorithms

The modular design allows for incremental development and easy addition of new brokers, strategies, and data sources.
