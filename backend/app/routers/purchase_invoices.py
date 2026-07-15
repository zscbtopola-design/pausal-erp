from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from services.purchase_invoice_service import (
    create_purchase_invoice,
    get_purchase_invoices,
)


router = APIRouter(
    prefix="/purchase-invoices",
    tags=["Purchase Invoices"],
)


@router.post("", response_model=schemas.PurchaseInvoiceOut)
def create_invoice(
    invoice_data: schemas.PurchaseInvoiceCreate,
    db: Session = Depends(get_db),
):
    company = (
        db.query(models.Company)
        .filter(models.Company.id == invoice_data.company_id)
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Firma nije pronađena.",
        )

    supplier = (
        db.query(models.Supplier)
        .filter(models.Supplier.id == invoice_data.supplier_id)
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Dobavljač nije pronađen.",
        )

    existing_invoice = (
        db.query(models.PurchaseInvoice)
        .filter(
            models.PurchaseInvoice.company_id == invoice_data.company_id,
            models.PurchaseInvoice.supplier_id == invoice_data.supplier_id,
            models.PurchaseInvoice.invoice_number
            == invoice_data.invoice_number,
        )
        .first()
    )

    if existing_invoice:
        raise HTTPException(
            status_code=400,
            detail="Ulazna faktura sa ovim brojem već postoji.",
        )

    if not invoice_data.items:
        raise HTTPException(
            status_code=400,
            detail="Ulazna faktura mora imati najmanje jednu stavku.",
        )

    try:
        return create_purchase_invoice(
            db,
            invoice_data,
        )
    except HTTPException:
        raise
    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Greška pri čuvanju ulazne fakture.",
        )


@router.get(
    "",
    response_model=list[schemas.PurchaseInvoiceOut],
)
def list_invoices(
    db: Session = Depends(get_db),
):
    return get_purchase_invoices(db)


@router.get(
    "/{invoice_id}",
    response_model=schemas.PurchaseInvoiceOut,
)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
):
    invoice = (
        db.query(models.PurchaseInvoice)
        .filter(models.PurchaseInvoice.id == invoice_id)
        .first()
    )

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Ulazna faktura nije pronađena.",
        )

    return invoice


@router.delete("/{invoice_id}")
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
):
    invoice = (
        db.query(models.PurchaseInvoice)
        .filter(models.PurchaseInvoice.id == invoice_id)
        .first()
    )

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Ulazna faktura nije pronađena.",
        )

    expense = (
        db.query(models.Expense)
        .filter(
            models.Expense.company_id == invoice.company_id,
            models.Expense.supplier_id == invoice.supplier_id,
            models.Expense.date == invoice.invoice_date,
            models.Expense.amount == invoice.amount,
        )
        .first()
    )

    if expense:
        db.delete(expense)

    db.delete(invoice)

    try:
        db.commit()
    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Greška pri brisanju ulazne fakture.",
        )

    return {
        "message": "Ulazna faktura, njene stavke i povezani rashod su obrisani."
    }