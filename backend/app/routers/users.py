from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from auth import create_access_token, hash_password, verify_password
from database import get_db


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post("", response_model=schemas.UserOut)
def create_user(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(models.User)
        .filter(models.User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Korisnik sa ovim e-mailom već postoji.",
        )

    company = (
        db.query(models.Company)
        .filter(models.Company.id == user_data.company_id)
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Firma nije pronađena.",
        )

    user = models.User(
        company_id=user_data.company_id,
        full_name=user_data.full_name,
        email=user_data.email.strip().lower(),
        hashed_password=hash_password(user_data.password),
        role=user_data.role,
        is_active=user_data.is_active,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.get("", response_model=list[schemas.UserOut])
def get_users(db: Session = Depends(get_db)):
    return (
        db.query(models.User)
        .order_by(models.User.id)
        .all()
    )


@router.post("/login", response_model=schemas.LoginResponse)
def login(
    login_data: schemas.LoginRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(models.User)
        .filter(models.User.email == login_data.email.strip().lower())
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Pogrešan e-mail ili lozinka.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Korisnički nalog nije aktivan.",
        )

    if not verify_password(
        login_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Pogrešan e-mail ili lozinka.",
        )

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "company_id": user.company_id,
            "role": user.role,
            "email": user.email,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }