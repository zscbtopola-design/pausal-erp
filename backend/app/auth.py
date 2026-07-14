import os
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt


SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "pausal-erp-development-secret-key-change-later",
)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")

    hashed_password = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt(),
    )

    return hashed_password.decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except ValueError:
        return False


def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
) -> str:
    token_data = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta
        else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    token_data.update({"exp": expire})

    return jwt.encode(
        token_data,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
    except JWTError:
        return None