import os
import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db


router = APIRouter(
    prefix="/companies",
    tags=["Companies"],
)


UPLOAD_FOLDER = Path(__file__).resolve().parents[2] / "uploads" / "logos"
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


@router.get("", response_model=list[schemas.CompanyOut])
def get_companies(db: Session = Depends(get_db)):
    return (
        db.query(models.Company)
        .order_by(models.Company.id)
        .all()
    )


@router.get("/{company_id}", response_model=schemas.CompanyOut)
def get_company(
    company_id: int,
    db: Session = Depends(get_db),
):
    company = (
        db.query(models.Company)
        .filter(models.Company.id == company_id)
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Firma nije pronađena.",
        )

    return company


@router.post("", response_model=schemas.CompanyOut)
def create_company(
    company_data: schemas.CompanyCreate,
    db: Session = Depends(get_db),
):
    company = models.Company(**company_data.model_dump())

    db.add(company)
    db.commit()
    db.refresh(company)

    return company


@router.put("/{company_id}", response_model=schemas.CompanyOut)
def update_company(
    company_id: int,
    company_data: schemas.CompanyCreate,
    db: Session = Depends(get_db),
):
    company = (
        db.query(models.Company)
        .filter(models.Company.id == company_id)
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Firma nije pronađena.",
        )

    for field, value in company_data.model_dump().items():
        setattr(company, field, value)

    db.commit()
    db.refresh(company)

    return company


@router.post("/{company_id}/logo", response_model=schemas.CompanyOut)
def upload_company_logo(
    company_id: int,
    logo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    company = (
        db.query(models.Company)
        .filter(models.Company.id == company_id)
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Firma nije pronađena.",
        )

    extension = Path(logo.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Dozvoljeni formati su PNG, JPG, JPEG i WEBP.",
        )

    filename = f"company-{company_id}{extension}"
    file_path = UPLOAD_FOLDER / filename

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(logo.file, buffer)
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Greška pri čuvanju logotipa.",
        )
    finally:
        logo.file.close()

    company.logo_path = str(file_path)

    db.commit()
    db.refresh(company)

    return company