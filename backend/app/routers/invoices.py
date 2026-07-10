from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from services.pdf_service import create_invoice_pdf


router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"],
)


# =====================================================
# KREIRANJE FAKTURE, STAVKI I POVEZANOG PRIHODA
# =====================================================

@router.post("", response_model=schemas.InvoiceOut)
def create_invoice(
    invoice_data: schemas.InvoiceCreate,
    db: Session = Depends(get_db),
):
    existing_invoice = (
        db.query(models.Invoice)
        .filter(
            models.Invoice.company_id == invoice_data.company_id,
            models.Invoice.invoice_number == invoice_data.invoice_number,
        )
        .first()
    )

    if existing_invoice:
        raise HTTPException(
            status_code=400,
            detail="Faktura sa ovim brojem već postoji.",
        )

    if not invoice_data.items:
        raise HTTPException(
            status_code=400,
            detail="Faktura mora imati najmanje jednu stavku.",
        )

    new_invoice = models.Invoice(
        company_id=invoice_data.company_id,
        customer_id=invoice_data.customer_id,
        invoice_number=invoice_data.invoice_number,
        invoice_date=invoice_data.invoice_date,
        description=invoice_data.description,
        amount=0,
        status=invoice_data.status,
        payment_method=invoice_data.payment_method,
    )

    db.add(new_invoice)
    db.flush()

    invoice_total = 0

    for item_data in invoice_data.items:
        if item_data.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Količina mora biti veća od nule.",
            )

        if item_data.unit_price < 0:
            raise HTTPException(
                status_code=400,
                detail="Cena ne može biti negativna.",
            )

        if item_data.discount < 0 or item_data.discount > 100:
            raise HTTPException(
                status_code=400,
                detail="Popust mora biti između 0 i 100 procenata.",
            )

        subtotal = item_data.quantity * item_data.unit_price
        discount_amount = subtotal * item_data.discount / 100
        item_total = subtotal - discount_amount

        new_item = models.InvoiceItem(
            invoice_id=new_invoice.id,
            description=item_data.description,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            discount=item_data.discount,
            total=item_total,
        )

        db.add(new_item)
        invoice_total += item_total

    new_invoice.amount = invoice_total

    new_income = models.Income(
        company_id=new_invoice.company_id,
        customer_id=new_invoice.customer_id,
        date=new_invoice.invoice_date,
        invoice_number=new_invoice.invoice_number,
        payment_method=new_invoice.payment_method,
        status=(
            "placeno"
            if new_invoice.status == "placena"
            else "neplaceno"
        ),
        description=(
            new_invoice.description
            or f"Faktura {new_invoice.invoice_number}"
        ),
        amount=new_invoice.amount,
    )

    db.add(new_income)

    try:
        db.commit()
        db.refresh(new_invoice)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Greška pri čuvanju fakture.",
        )

    return new_invoice


# =====================================================
# PRIKAZ SVIH FAKTURA
# =====================================================

@router.get("", response_model=list[schemas.InvoiceOut])
def get_invoices(db: Session = Depends(get_db)):
    return (
        db.query(models.Invoice)
        .order_by(models.Invoice.id.desc())
        .all()
    )


# =====================================================
# AUTOMATSKI SLEDEĆI BROJ FAKTURE
# Važno: ruta mora biti pre /{invoice_id}
# =====================================================

@router.get("/next-number")
def get_next_invoice_number(
    company_id: int = 1,
    db: Session = Depends(get_db),
):
    current_year = date.today().year
    suffix = f"-{current_year}"

    invoices = (
        db.query(models.Invoice)
        .filter(
            models.Invoice.company_id == company_id,
            models.Invoice.invoice_number.like(f"%{suffix}"),
        )
        .all()
    )

    highest_number = 0

    for invoice in invoices:
        try:
            number_part = invoice.invoice_number.rsplit("-", 1)[0]
            number_value = int(number_part)

            if number_value > highest_number:
                highest_number = number_value
        except (ValueError, AttributeError):
            continue

    return {
        "invoice_number": f"{highest_number + 1}-{current_year}"
    }


# =====================================================
# PDF FAKTURE
# Važno: ruta mora biti pre /{invoice_id}
# =====================================================

@router.get("/{invoice_id}/pdf")
def download_invoice_pdf(
    invoice_id: int,
    db: Session = Depends(get_db),
):
    invoice = (
        db.query(models.Invoice)
        .filter(models.Invoice.id == invoice_id)
        .first()
    )

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Faktura nije pronađena.",
        )

    customer = None

    if invoice.customer_id:
        customer = (
            db.query(models.Customer)
            .filter(models.Customer.id == invoice.customer_id)
            .first()
        )

    try:
        pdf_path = create_invoice_pdf(invoice, customer)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Greška pri generisanju PDF-a: {error}",
        )

    safe_invoice_number = (
        invoice.invoice_number
        .replace("/", "-")
        .replace("\\", "-")
    )

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"faktura-{safe_invoice_number}.pdf",
    )


# =====================================================
# PRIKAZ JEDNE FAKTURE
# =====================================================

@router.get("/{invoice_id}", response_model=schemas.InvoiceOut)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
):
    invoice = (
        db.query(models.Invoice)
        .filter(models.Invoice.id == invoice_id)
        .first()
    )

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Faktura nije pronađena.",
        )

    return invoice


# =====================================================
# BRISANJE FAKTURE, STAVKI I POVEZANOG PRIHODA
# =====================================================

@router.delete("/{invoice_id}")
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
):
    invoice = (
        db.query(models.Invoice)
        .filter(models.Invoice.id == invoice_id)
        .first()
    )

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Faktura nije pronađena.",
        )

    income = (
        db.query(models.Income)
        .filter(
            models.Income.company_id == invoice.company_id,
            models.Income.invoice_number == invoice.invoice_number,
        )
        .first()
    )

    if income:
        db.delete(income)

    db.delete(invoice)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Greška pri brisanju fakture.",
        )

    return {
        "message": "Faktura, stavke i povezani prihod su obrisani."
    }