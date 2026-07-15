from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

import models
from database import get_db


router = APIRouter(
    prefix="/kpo",
    tags=["KPO"],
)


@router.get("")
def get_kpo(
    company_id: int = Query(default=1, ge=1),
    date_from: date | None = None,
    date_to: date | None = None,
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

    if date_from and date_to and date_from > date_to:
        raise HTTPException(
            status_code=400,
            detail="Početni datum ne može biti posle krajnjeg datuma.",
        )

    query = (
        db.query(models.Income)
        .filter(models.Income.company_id == company_id)
    )

    if date_from:
        query = query.filter(models.Income.date >= date_from)

    if date_to:
        query = query.filter(models.Income.date <= date_to)

    incomes = (
        query
        .order_by(
            models.Income.date.asc(),
            models.Income.id.asc(),
        )
        .all()
    )

    entries = []
    running_total = 0.0

    for index, income in enumerate(incomes, start=1):
        amount = float(income.amount or 0)
        running_total += amount

        customer_name = ""

        if income.customer_id:
            customer = (
                db.query(models.Customer)
                .filter(models.Customer.id == income.customer_id)
                .first()
            )

            if customer:
                customer_name = customer.name

        entries.append(
            {
                "sequence_number": index,
                "income_id": income.id,
                "date": income.date,
                "document_number": income.invoice_number or "",
                "customer_id": income.customer_id,
                "customer_name": customer_name,
                "description": income.description,
                "payment_method": income.payment_method,
                "status": income.status,
                "amount": amount,
                "running_total": round(running_total, 2),
            }
        )

    limit_amount = float(company.limit_amount or 6000000)

    limit_percentage = (
        running_total / limit_amount * 100
        if limit_amount > 0
        else 0
    )

    remaining_amount = max(
        limit_amount - running_total,
        0,
    )

    warning_level = "normal"

    if limit_percentage >= 100:
        warning_level = "limit_exceeded"
    elif limit_percentage >= 90:
        warning_level = "critical"
    elif limit_percentage >= 80:
        warning_level = "warning"

    return {
        "company": {
            "id": company.id,
            "name": company.name,
            "pib": company.pib,
            "mb": company.mb,
        },
        "period": {
            "date_from": date_from,
            "date_to": date_to,
        },
        "summary": {
            "entry_count": len(entries),
            "total_income": round(running_total, 2),
            "limit_amount": round(limit_amount, 2),
            "remaining_amount": round(remaining_amount, 2),
            "limit_percentage": round(limit_percentage, 2),
            "warning_level": warning_level,
        },
        "entries": entries,
    }