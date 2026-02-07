from fastapi import APIRouter
from . import webhook

router = APIRouter()


@router.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}


# include webhook routes
router.include_router(webhook.router)
