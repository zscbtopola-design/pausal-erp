from sqlalchemy.orm import Session

import models
import schemas


def calculate_item_total(item):
    subtotal = item.quantity * item.unit_price
    discount = subtotal * (item.discount / 100)

    return round(subtotal - discount, 2)


def create_purchase_invoice(
    db: Session,
    data: schemas.PurchaseInvoiceCreate,
):
    invoice = models.PurchaseInvoice(
        company_id=data.company_id,
        supplier_id=data.supplier_id,
        invoice_number=data.invoice_number,
        invoice_date=data.invoice_date,
        due_date=data.due_date,
        description=data.description,
        status=data.status,
        payment_method=data.payment_method,
        amount=0,
    )

    total_amount = 0

    for item in data.items:
        total = calculate_item_total(item)

        invoice.items.append(
            models.PurchaseInvoiceItem(
                description=item.description,
                quantity=item.quantity,
                unit_price=item.unit_price,
                discount=item.discount,
                total=total,
            )
        )

        total_amount += total

    invoice.amount = round(total_amount, 2)

    expense = models.Expense(
        company_id=invoice.company_id,
        supplier_id=invoice.supplier_id,
        date=invoice.invoice_date,
        description=(
            invoice.description
            or f"Ulazna faktura {invoice.invoice_number}"
        ),
        amount=invoice.amount,
    )

    db.add(invoice)
    db.add(expense)

    db.commit()
    db.refresh(invoice)

    return invoice


def get_purchase_invoices(db: Session):
    return (
        db.query(models.PurchaseInvoice)
        .order_by(models.PurchaseInvoice.id.desc())
        .all()
    )