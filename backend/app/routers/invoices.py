from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"]
)


def calculate_item_total(quantity: float, unit_price: float, discount: float) -> float:
    subtotal = quantity * unit_price
    return subtotal - discount


@router.post("", response_model=schemas.InvoiceOut)
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    total_amount = 0

    new_invoice = models.Invoice(
        company_id=invoice.company_id,
        customer_id=invoice.customer_id,
        invoice_number=invoice.invoice_number,
        invoice_date=invoice.invoice_date,
        description=invoice.description,
        status=invoice.status,
        payment_method=invoice.payment_method,
        amount=0,
    )

    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)

    for item in invoice.items:
        item_total = calculate_item_total(
            item.quantity,
            item.unit_price,
            item.discount
        )

        total_amount += item_total

        new_item = models.InvoiceItem(
            invoice_id=new_invoice.id,
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            discount=item.discount,
            total=item_total,
        )

        db.add(new_item)

    new_invoice.amount = total_amount

    if invoice.status == "issued":
        income = models.Income(
            company_id=invoice.company_id,
            customer_id=invoice.customer_id,
            date=invoice.invoice_date,
            invoice_number=invoice.invoice_number,
            payment_method=invoice.payment_method,
            status="placeno",
            description=invoice.description or "Izlazna faktura",
            amount=total_amount,
        )
        db.add(income)

    db.commit()
    db.refresh(new_invoice)

    return new_invoice


@router.get("", response_model=list[schemas.InvoiceOut])
def get_invoices(db: Session = Depends(get_db)):
    return db.query(models.Invoice).all()


@router.get("/{invoice_id}", response_model=schemas.InvoiceOut)
def get_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()

    if not invoice:
        raise HTTPException(status_code=404, detail="Faktura nije pronađena")

    return invoice


@router.delete("/{invoice_id}")
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()

    if not invoice:
        raise HTTPException(status_code=404, detail="Faktura nije pronađena")

    db.delete(invoice)
    db.commit()

    return {"message": "Faktura je obrisana"}