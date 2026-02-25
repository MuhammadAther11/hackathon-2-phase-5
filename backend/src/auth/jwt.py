import os
from pathlib import Path
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from dotenv import load_dotenv

# Load .env from the backend root (two levels up from src/auth/)
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=_env_path, override=False)
load_dotenv(override=False)  # fallback: also try CWD

# Use the same fallback logic as in auth.py for consistency
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET") or "fallback_secret_key_for_development"
ALGORITHM = "HS256"

security = HTTPBearer(auto_error=False)

def verify_jwt(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies a JWT token using the symmetric secret BETTER_AUTH_SECRET.
    Returns the decoded payload if valid, None otherwise.
    """
    if not SECRET_KEY:
        return None

    try:
        # Better Auth HS256 symmetric signing
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        print(f"[JWT] Decode failed: {type(e).__name__}: {e}")
        return None

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> str:
    """
    FastAPI dependency that validates the JWT and returns the user ID (sub).
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    payload = verify_jwt(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id
