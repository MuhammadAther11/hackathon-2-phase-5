from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone

# Pakistan Standard Time (UTC+5)
PKT = timezone(timedelta(hours=5))
from jose import jwt

from src.database import get_session
from src.models.user import UserCreate, UserPublic
from src.services.user_service import create_user, authenticate_user, EmailAlreadyExistsError, PasswordTooLongError
from src.auth.jwt import SECRET_KEY, ALGORITHM

router = APIRouter(tags=["auth"])

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


class SignupRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    user: UserPublic
    access_token: str
    token_type: str


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(PKT) + (
        expires_delta if expires_delta else timedelta(minutes=15)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/signup", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def signup(
    signup_data: SignupRequest,
    session: Session = Depends(get_session)
):
    if len(signup_data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters"
        )

    user_create = UserCreate(
        email=signup_data.email,
        password=signup_data.password
    )

    try:
        user = create_user(session=session, user_create=user_create)
    except EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    except PasswordTooLongError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password is too long (max 72 bytes)"
        )

    return UserPublic.from_orm(user)


@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    session: Session = Depends(get_session)
):
    user = authenticate_user(
        session=session,
        email=login_data.email,
        password=login_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )

    return {
        "user": UserPublic.from_orm(user),
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout():
    return {"message": "Successfully logged out"}
