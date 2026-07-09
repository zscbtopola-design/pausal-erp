from fastapi.responses import FileResponse
from services.pdf_service import create_invoice_pdf
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db


router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"]
)


# =====================================
# KREIRANJE FAKTURE I PRIHODA
# =====================================

@router.post("", response_model=schemas.InvoiceOut)
def create_invoice(
    invoice_data: schemas.InvoiceCreate,
    db: Session = Depends(get_db)
):
    # Provera da li već postoji isti broj fakture
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
            detail="Faktura sa ovim brojem već postoji."
        )

    # Kreiranje zaglavlja fakture
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

    # Dobijamo ID nove fakture pre čuvanja
    db.flush()

    invoice_total = 0

    # Kreiranje svih stavki fakture
    for item_data in invoice_data.items:
        subtotal = (
            item_data.quantity
            * item_data.unit_price
        )

        discount_amount = (
            subtotal
            * item_data.discount
            / 100
        )

        item_total = (
            subtotal
            - discount_amount
        )

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

    # Backend automatski računa ukupan iznos
    new_invoice.amount = invoice_total

    # Automatsko kreiranje prihoda
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

    # Čuvanje fakture, stavki i prihoda
    db.commit()

    db.refresh(new_invoice)

    return new_invoice


# =====================================
# PRIKAZ SVIH FAKTURA
# =====================================

@router.get(
    "",
    response_model=list[schemas.InvoiceOut]
)
def get_invoices(
    db: Session = Depends(get_db)
):
    return (
        db.query(models.Invoice)
        .order_by(
            models.Invoice.id.desc()
        )
        .all()
    )


# =====================================
# PRIKAZ JEDNE FAKTURE
# =====================================

@router.get(
    "/{invoice_id}",
    response_model=schemas.InvoiceOut
)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    invoice = (
        db.query(models.Invoice)
        .filter(
            models.Invoice.id
            == invoice_id
        )
        .first()
    )

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Faktura nije pronađena."
        )

    return invoice
@router.get("/{invoice_id}/pdf")
def download_invoice_pdf(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    invoice = (
        db.query(models.Invoice)
        .filter(models.Invoice.id == invoice_id)
        .first()
    )

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Faktura nije pronađena."
        )

    customer = None

    if invoice.customer_id:
        customer = (
            db.query(models.Customer)
            .filter(models.Customer.id == invoice.customer_id)
            .first()
        )

    pdf_path = create_invoice_pdf(invoice, customer)

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"faktura-{invoice.invoice_number}.pdf"
    )


# =====================================
# BRISANJE FAKTURE I PRIHODA
# =====================================

@router.delete("/{invoice_id}")
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    # Pronalaženje fakture
    invoice = (
        db.query(models.Invoice)
        .filter(
            models.Invoice.id
            == invoice_id
        )
        .first()
    )

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Faktura nije pronađena."
        )

    # Pronalaženje prihoda koji je
    # automatski napravljen iz fakture
    income = (
        db.query(models.Income)
        .filter(
            models.Income.company_id
            == invoice.company_id,

            models.Income.invoice_number
            == invoice.invoice_number,
        )
        .first()
    )

    # Brisanje povezanog prihoda
    if income:
        db.delete(income)

    # Brisanje fakture
    # Stavke se brišu automatski zbog:
    # cascade="all, delete-orphan"
    db.delete(invoice)

    # Čuvanje svih promena
    db.commit()

    return {
        "message":
        "Faktura, stavke i povezani prihod su obrisani."
    }