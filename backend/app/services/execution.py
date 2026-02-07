from typing import Dict, Any
from ..services.adapters.ccxt_adapter import CCXTPaperAdapter
from ..services.risk_engine import RiskEngine
from ..schemas.signal import Signal


class ExecutionOrchestrator:
    """Orchestrates evaluating signals through RiskEngine and executing via adapter.

    This is intentionally minimal. In production:
      - Cache per-user adapters/connections
      - Securely store and retrieve broker credentials
      - Persist trade events and audit logs
      - Handle partial fills, retries, and error backoff
    """

    def __init__(self, user_id: int):
        self.user_id = user_id
        # TODO: load per-user limits from DB rather than defaults

    async def execute_signal(self, signal: Signal) -> Dict[str, Any]:
        # Create paper adapter (TODO: inject a factory or use DI)
        adapter = CCXTPaperAdapter(exchange_id=signal.meta.get("exchange") if signal.meta else "binance")
        # TODO: fetch and pass stored user credentials
        await adapter.connect(credentials={})

        # Fetch current positions from adapter (paper simulation)
        current_positions = await adapter.get_positions()

        # Instantiate risk engine with user-specific limits (defaults for now)
        risk = RiskEngine(self.user_id)

        # Evaluate
        decision = await risk.evaluate(signal.dict(), current_positions=current_positions)
        if not decision.get("allowed"):
            await adapter.disconnect()
            return {"status": "rejected", "reason": decision.get("reason"), "details": decision.get("details")}

        # Execute
        order_payload = {
            "symbol": signal.symbol,
            "side": signal.side,
            "amount": signal.amount,
            "type": signal.type,
            "price": signal.price,
        }

        order_result = await adapter.place_order(order_payload)

        # For paper mode we assume immediate fills for market orders; realized pnl unknown -> 0.0
        filled = float(order_result.get("filled", 0.0))
        realized_pnl = 0.0

        # Record trade in risk engine
        await risk.record_trade(signal.symbol, signal.side, filled, realized_pnl)

        await adapter.disconnect()

        return {"status": "executed", "order": order_result, "risk": decision.get("details")}
