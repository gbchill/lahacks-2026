"""Supabase server-side client — auth verification, photo storage."""
import os
from typing import Optional

import jwt
from jwt import PyJWKClient, PyJWTError
from fastapi import HTTPException, status


_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        url = os.getenv("SUPABASE_URL", "")
        if not url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Server misconfiguration: SUPABASE_URL not set.",
            )
        jwks_url = f"{url}/auth/v1/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url, cache_keys=True)
    return _jwks_client


def verify_jwt(token: str) -> dict:
    """Decode and verify a Supabase-issued JWT using the project's JWKS endpoint.

    Returns:
        Decoded claims dict, guaranteed to contain "sub" (user UUID).

    Raises:
        HTTPException 401 if the token is missing, expired, or invalid.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256", "HS256"],
            options={"verify_aud": False},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if "sub" not in claims:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is missing subject claim.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return claims


def get_optional_user(authorization: Optional[str] = None) -> Optional[str]:
    """Extract user_id from an Authorization header without requiring auth.

    Designed as a FastAPI dependency for endpoints that work anonymously
    but attach data to a real user when a valid token is present.

    Args:
        authorization: Value of the ``Authorization`` HTTP header, e.g.
            ``"Bearer <token>"``.

    Returns:
        The user UUID string (``claims["sub"]``) when a valid token is
        supplied, or ``None`` when the header is absent or blank.

    Raises:
        HTTPException 401 if a token is provided but fails verification
        (expired, tampered, wrong secret, etc.).
    """
    if not authorization:
        return None

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None

    claims = verify_jwt(token)
    return claims["sub"]
