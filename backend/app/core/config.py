from pydantic import BaseSettings, AnyUrl
from typing import List


class Settings(BaseSettings):
    app_name: str = "autotradeplug-backend"
    mode: str = "paper"  # default execution mode
    database_url: AnyUrl | None = None
    jwt_secret: str = "CHANGE_ME"
    cors_origins: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
