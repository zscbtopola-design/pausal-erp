from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


@router.post("", response_model=schemas.ExpenseOut)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    new_expense = models.Expense(**expense.model_dump())
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense


@router.get("", response_model=list[schemas.ExpenseOut])
def get_expenses(db: Session = Depends(get_db)):
    return db.query(models.Expense).all()


@router.get("/{expense_id}", response_model=schemas.ExpenseOut)
def get_expense(expense_id: int, db: Session = Depends(get_db)):
    return db.query(models.Expense).filter(models.Expense.id == expense_id).first()


@router.put("/{expense_id}", response_model=schemas.ExpenseOut)
def update_expense(
    expense_id: int,
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db)
):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()

    for key, value in expense.model_dump().items():
        setattr(db_expense, key, value)

    db.commit()
    db.refresh(db_expense)
    return db_expense


@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()

    db.delete(db_expense)
    db.commit()

    return {"message": "Rashod je obrisan"}