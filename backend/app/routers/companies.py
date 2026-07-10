from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db


router = APIRouter(
    prefix="/companies",
    tags=["Companies"],
)


@router.get("", response_model=list[schemas.CompanyOut])
def get_companies(db: Session = Depends(get_db)):
    return db.query(models.Company).order_by(models.Company.id).all()


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