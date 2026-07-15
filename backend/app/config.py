import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"

load_dotenv(ENV_PATH)


class Settings:
    APP_NAME: str = os.getenv(
        "APP_NAME",
        "Pausal ERP API",
    )

    APP_VERSION: str = os.getenv(
        "APP_VERSION",
        "1.0.0",
    )

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./pausal.db",
    )

    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "development-secret-key",
    )

    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv(
            "ACCESS_TOKEN_EXPIRE_MINUTES",
            "480",
        )
    )

    UPLOAD_FOLDER: Path = (
        BASE_DIR
        / os.getenv(
            "UPLOAD_FOLDER",
            "../uploads",
        )
    ).resolve()

    LOGOS_FOLDER: Path = UPLOAD_FOLDER / "logos"
    INVOICES_FOLDER: Path = UPLOAD_FOLDER / "invoices"

    def create_directories(self) -> None:
        self.UPLOAD_FOLDER.mkdir(
            parents=True,
            exist_ok=True,
        )

        self.LOGOS_FOLDER.mkdir(
            parents=True,
            exist_ok=True,
        )

        self.INVOICES_FOLDER.mkdir(
            parents=True,
            exist_ok=True,
        )


settings = Settings()
settings.create_directories()