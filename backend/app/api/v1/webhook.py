from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from ..schemas.signal import Signal
from ...services.execution import ExecutionOrchestrator
from typing import Any, Dict
import uuid
import datetime

router = APIRouter()


def _map_tradingview_payload(payload: Dict[str, Any]) -> Signal:
    """Map TradingView webhook payload to internal Signal.

    Expected payloads vary. This mapper attempts to extract common fields:
      - `ticker` or `symbol`
      - `action` or `side` (buy/sell)
      - `quantity` or `size` or `amount`
      - `price` (optional)

    Add additional mappings as needed for your TV strategies.
    """
    symbol = payload.get("ticker") or payload.get("symbol") or payload.get("exchange")
    side = payload.get("side") or payload.get("action") or payload.get("signal")
    amount = payload.get("quantity") or payload.get("size") or payload.get("amount") or 0
    price = payload.get("price")

    # Normalize side
    if isinstance(side, str):
        side = side.lower()
        if side not in ("buy", "sell"):
            # TradingView often encodes 'long'/'short'
            if side in ("long", "buy_long"):
                side = "buy"
            elif side in ("short", "sell_short"):
                side = "sell"

    signal = Signal(
        id=payload.get("id") or str(uuid.uuid4()),
        source="tradingview",
        symbol=symbol,
        side=side,
        amount=float(amount),
        type=payload.get("type", "market"),
        price=float(price) if price is not None else None,
        meta={"raw": payload},
        timestamp=datetime.datetime.utcnow(),
    )
    return signal


@router.post("/webhook/tradingview", tags=["webhook"]) 
async def tradingview_webhook(request: Request):
    """Receive TradingView webhook and route the signal.

    Security: This endpoint currently has NO authentication. Add a
    signature verification, secret, or JWT verification before using in
    production (TODO).
    """
    payload = await request.json()

    # TODO: verify tradingview signature or secret header
    try:
        signal = _map_tradingview_payload(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"invalid payload: {e}")

    # TODO: map incoming webhook to a specific user context (user_id)
    user_id = payload.get("user_id") or None
    if user_id is not None:
        signal.user_id = int(user_id)

    orchestrator = ExecutionOrchestrator(user_id=signal.user_id or 0)
    result = await orchestrator.execute_signal(signal)

    return JSONResponse(status_code=200, content={"result": result})
