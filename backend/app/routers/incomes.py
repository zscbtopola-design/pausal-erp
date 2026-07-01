from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/incomes",
    tags=["Incomes"]
)


@router.post("", response_model=schemas.IncomeOut)
def create_income(income: schemas.IncomeCreate, db: Session = Depends(get_db)):
    new_income = models.Income(**income.model_dump())
    db.add(new_income)
    db.commit()
    db.refresh(new_income)
    return new_income


@router.get("", response_model=list[schemas.IncomeOut])
def get_incomes(db: Session = Depends(get_db)):
    return db.query(models.Income).all()


@router.get("/{income_id}", response_model=schemas.IncomeOut)
def get_income(income_id: int, db: Session = Depends(get_db)):
    return db.query(models.Income).filter(models.Income.id == income_id).first()


@router.put("/{income_id}", response_model=schemas.IncomeOut)
def update_income(
    income_id: int,
    income: schemas.IncomeCreate,
    db: Session = Depends(get_db)
):
    db_income = db.query(models.Income).filter(models.Income.id == income_id).first()

    for key, value in income.model_dump().items():
        setattr(db_income, key, value)

    db.commit()
    db.refresh(db_income)
    return db_income


@router.delete("/{income_id}")
def delete_income(income_id: int, db: Session = Depends(get_db)):
    db_income = db.query(models.Income).filter(models.Income.id == income_id).first()

    db.delete(db_income)
    db.commit()

    return {"message": "Prihod je obrisan"}