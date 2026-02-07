from typing import Dict, Any, Optional
import datetime


class RiskEngine:
    """Minimal Risk Engine implementing basic per-user checks.

    Enforced checks:
      - max position size per instrument (absolute)
      - max trades per day
      - max daily loss

    Notes:
      - This implementation keeps per-user/day state in memory. Persist
        this state in a DB or Redis in production (TODO below).
      - Estimation of potential loss is conservative and requires better
        market-aware logic (slippage, leverage) before using for real money.
    """

    # in-memory state: { user_id: { date_iso: {trades_count:int, loss:float, positions:{symbol:qty}}}}
    _state: Dict[int, Dict[str, Dict[str, Any]]] = {}

    def __init__(
        self,
        user_id: int,
        max_position_size: float = 100.0,
        max_trades_per_day: int = 50,
        max_daily_loss: float = 1000.0,
    ) -> None:
        self.user_id = user_id
        self.max_position_size = max_position_size
        self.max_trades_per_day = max_trades_per_day
        self.max_daily_loss = max_daily_loss

    def _today_iso(self) -> str:
        return datetime.date.today().isoformat()

    def _ensure_state(self) -> Dict[str, Any]:
        user_store = self._state.setdefault(self.user_id, {})
        today = self._today_iso()
        day_store = user_store.setdefault(today, {"trades_count": 0, "loss": 0.0, "positions": {}})
        return day_store

    async def evaluate(
        self,
        order_request: Dict[str, Any],
        current_positions: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """Evaluate an order request and return a decision dict.

        order_request should include at least: symbol, side (buy/sell), amount,
        type (market/limit), price (optional). If `current_positions` is
        provided it will be used as the source of truth for open positions.

        Return shape:
          {"allowed": bool, "reason": str, "details": {...}}
        """
        day = self._ensure_state()

        # Basic validation
        symbol = order_request.get("symbol")
        side = order_request.get("side")
        try:
            amount = float(order_request.get("amount", 0))
        except (TypeError, ValueError):
            return {"allowed": False, "reason": "invalid_amount", "details": {}}

        if not symbol or side not in ("buy", "sell") or amount <= 0:
            return {"allowed": False, "reason": "invalid_order_payload", "details": {}}

        # Determine existing position (prefer explicit provider)
        existing_pos = 0.0
        if current_positions and symbol in current_positions:
            existing_pos = float(current_positions[symbol])
        else:
            existing_pos = float(day["positions"].get(symbol, 0.0))

        # compute projected position after this order (signed)
        projected_pos = existing_pos + amount if side == "buy" else existing_pos - amount

        # 1) max position size check (absolute)
        if abs(projected_pos) > float(self.max_position_size):
            return {
                "allowed": False,
                "reason": "max_position_size_exceeded",
                "details": {"symbol": symbol, "projected_position": projected_pos, "limit": self.max_position_size},
            }

        # 2) max trades per day check
        if day["trades_count"] + 1 > self.max_trades_per_day:
            return {"allowed": False, "reason": "max_trades_per_day_exceeded", "details": {"trades_today": day["trades_count"], "limit": self.max_trades_per_day}}

        # 3) max daily loss check
        # Conservative estimate: if price provided, use notional as potential exposure
        price = order_request.get("price")
        estimated_notional = 0.0
        if price is not None:
            try:
                estimated_notional = abs(float(price) * amount)
            except (TypeError, ValueError):
                estimated_notional = 0.0

        # For conservative behaviour, treat the notional as potential loss (TODO: improve with model)
        projected_loss = day["loss"] + estimated_notional
        if projected_loss > float(self.max_daily_loss):
            return {"allowed": False, "reason": "max_daily_loss_exceeded", "details": {"projected_loss": projected_loss, "limit": self.max_daily_loss}}

        # If all checks pass, return approve with details
        return {
            "allowed": True,
            "reason": "ok",
            "details": {
                "projected_position": projected_pos,
                "trades_if_executed": day["trades_count"] + 1,
                "projected_loss": projected_loss,
            },
        }

    async def record_trade(self, symbol: str, side: str, filled_amount: float, realized_pnl: float) -> None:
        """Record a completed trade to update daily counters and positions.

        - `realized_pnl` should be positive for profit, negative for loss.
        - This method MUST be called by the execution orchestration after an order is filled.
        """
        day = self._ensure_state()
        # update trades count
        day["trades_count"] += 1

        # update loss (we only accumulate losses as positive number)
        if realized_pnl < 0:
            day["loss"] += abs(realized_pnl)

        # update positions (filled amounts)
        prev = float(day["positions"].get(symbol, 0.0))
        if side == "buy":
            day["positions"][symbol] = prev + float(filled_amount)
        else:
            day["positions"][symbol] = prev - float(filled_amount)

    # Helper methods for inspection / testing
    def get_today_state(self) -> Dict[str, Any]:
        return self._ensure_state()

    @classmethod
    def reset_state_for_user(cls, user_id: int) -> None:
        # used for tests or admin reset; in prod persist and control via DB/redis
        cls._state.pop(user_id, None)
