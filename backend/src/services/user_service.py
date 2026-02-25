from sqlmodel import Session, select
from typing import Optional
from src.models.user import User, UserCreate
from src.auth.passwords import get_password_hash, verify_password

MAX_PASSWORD_BYTES = 72  # bcrypt limit


class EmailAlreadyExistsError(Exception):
    pass


class PasswordTooLongError(Exception):
    pass


def create_user(*, session: Session, user_create: UserCreate) -> User:
    existing_user = session.exec(
        select(User).where(User.email == user_create.email)
    ).first()

    if existing_user:
        raise EmailAlreadyExistsError("Email already registered")

    password_bytes = user_create.password.encode("utf-8")
    if len(password_bytes) > MAX_PASSWORD_BYTES:
        raise PasswordTooLongError("Password exceeds maximum length of 72 bytes")

    hashed_password = get_password_hash(user_create.password)

    user = User(
        email=user_create.email,
        password_hash=hashed_password
    )

    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def authenticate_user(*, session: Session, email: str, password: str) -> Optional[User]:
    try:
        user = session.exec(
            select(User).where(User.email == email)
        ).first()

        if not user:
            return None

        if not verify_password(password, user.password_hash):
            return None

        return user

    except Exception as e:
        print("Auth error:", e)
        return None
