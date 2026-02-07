from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1 import routes
from .core.config import settings
import logging

logger = logging.getLogger("autotradeplug.backend")

def create_app() -> FastAPI:
    app = FastAPI(title="autotradeplug-backend", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(routes.router, prefix="/api/v1")

    @app.on_event("startup")
    async def on_startup():
        logger.info("Backend startup - settings mode=%s", settings.mode)
        # TODO: initialize DB, scheduler, connectors

    @app.on_event("shutdown")
    async def on_shutdown():
        logger.info("Backend shutdown")

    return app


app = create_app()
