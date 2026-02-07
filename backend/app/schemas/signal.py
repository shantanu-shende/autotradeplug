from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Signal(BaseModel):
    """Internal representation of a trading signal."""
    id: Optional[str] = Field(None, description="Optional signal id from source")
    source: str = Field("tradingview", description="Source system")
    user_id: Optional[int] = Field(None, description="User that owns the broker credentials")
    symbol: str
    side: str  # buy / sell
    amount: float
    type: str = Field("market", description="market or limit")
    price: Optional[float] = None
    meta: Optional[dict] = None
    timestamp: Optional[datetime] = None

    class Config:
        schema_extra = {
            "example": {
                "source": "tradingview",
                "symbol": "BTC/USDT",
                "side": "buy",
                "amount": 0.001,
                "type": "market",
            }
        }
