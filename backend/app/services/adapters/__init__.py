"""Broker adapter implementations (crypto, forex, equities)."""

from .ccxt_adapter import CCXTPaperAdapter

__all__ = ["CCXTPaperAdapter"]
