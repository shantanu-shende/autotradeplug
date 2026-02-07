from abc import ABC, abstractmethod
from typing import Any, Dict


class BrokerAdapter(ABC):
    """Abstract broker adapter. Concrete adapters (CCXT, IBKR) must implement this.

    Important: Strategies must never call broker adapters directly. Use orchestration
    services that enforce per-user isolation and risk checks.
    """

    @abstractmethod
    async def connect(self, credentials: Dict[str, Any]) -> None:
        raise NotImplementedError()

    @abstractmethod
    async def place_order(self, order: Dict[str, Any]) -> Dict[str, Any]:
        """Place an order. Returns broker order response."""
        raise NotImplementedError()

    @abstractmethod
    async def get_positions(self) -> Dict[str, Any]:
        raise NotImplementedError()

    @abstractmethod
    async def disconnect(self) -> None:
        raise NotImplementedError()
