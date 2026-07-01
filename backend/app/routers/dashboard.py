from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
from database import get_db

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/{company_id}")
def dashboard(company_id: int, db: Session = Depends(get_db)):
    company = db.query(models.Company).filter(models.Company.id == company_id).first()

    total_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.company_id == company_id
    ).scalar() or 0

    total_expense = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.company_id == company_id
    ).scalar() or 0

    limit_amount = company.limit_amount if company else 6000000
    remaining = limit_amount - total_income
    percent = round((total_income / limit_amount) * 100, 2) if limit_amount else 0

    return {
        "company_id": company_id,
        "limit": limit_amount,
        "total_income": total_income,
        "total_expense": total_expense,
        "profit": total_income - total_expense,
        "remaining_limit": remaining,
        "used_percent": percent
    }