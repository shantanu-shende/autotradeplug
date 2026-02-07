import uuid
import datetime
from typing import Any, Dict, List

from ..broker_adapter import BrokerAdapter
from ...core.config import settings


class CCXTPaperAdapter(BrokerAdapter):
    """Paper-only CCXT-backed crypto adapter.

    This adapter simulates order placement and position tracking when in paper
    mode. It intentionally refuses live trading attempts until a secure
    live-mode implementation is added and reviewed.
    """

    def __init__(self, exchange_id: str = "binance", paper: bool = True):
        # Enforce paper-only for now regardless of passed flags
        self.exchange_id = exchange_id
        self.paper = True
        self._connected = False
        self._credentials: Dict[str, Any] = {}
        self._orders: List[Dict[str, Any]] = []

    async def connect(self, credentials: Dict[str, Any]) -> None:
        """Simulate connecting to an exchange with credentials.

        In paper mode we accept credentials but do not use them to place live
        orders. TODO: add optional use of ccxt.async_support for market data only.
        """
        self._credentials = credentials
        self._connected = True

    async def place_order(self, order: Dict[str, Any]) -> Dict[str, Any]:
        """Place a simulated order.

        order must include: symbol, side, amount, type (market/limit), price (opt)
        Returns a broker-like order dict.
        """
        if not self._connected:
            raise RuntimeError("Adapter not connected")

        if not self.paper:
            # Safety: do not allow live execution yet
            raise RuntimeError("Live trading is disabled for CCXT adapter")

        # basic validation
        symbol = order.get("symbol")
        side = order.get("side")
        amount = float(order.get("amount", 0))
        order_type = order.get("type", "market")
        price = order.get("price")

        if not symbol or side not in ("buy", "sell") or amount <= 0:
            raise ValueError("Invalid order payload")

        order_id = str(uuid.uuid4())
        now = datetime.datetime.utcnow().isoformat() + "Z"

        # Simulate immediate fill for market orders; limit orders open
        filled = amount if order_type == "market" else 0.0
        status = "filled" if order_type == "market" else "open"

        simulated = {
            "id": order_id,
            "exchange": self.exchange_id,
            "symbol": symbol,
            "side": side,
            "type": order_type,
            "price": price,
            "amount": amount,
            "filled": filled,
            "status": status,
            "created_at": now,
            "meta": {"paper": True},
        }

        self._orders.append(simulated)
        return simulated

    async def get_positions(self) -> Dict[str, float]:
        """Aggregate filled orders into simple position map {symbol: qty}."""
        positions: Dict[str, float] = {}
        for o in self._orders:
            qty = float(o.get("filled", 0))
            if o.get("side") == "sell":
                qty = -qty
            positions[o.get("symbol")] = positions.get(o.get("symbol"), 0.0) + qty
        return positions

    async def disconnect(self) -> None:
        self._connected = False
        # clear credentials from memory
        self._credentials = {}
