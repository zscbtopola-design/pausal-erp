import os

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


def format_money(value):
    number = float(value or 0)

    return (
        f"{number:,.2f}"
        .replace(",", "X")
        .replace(".", ",")
        .replace("X", ".")
    )


def create_invoice_pdf(invoice, customer, company):
    output_folder = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "..",
            "..",
            "uploads",
            "invoices",
        )
    )

    os.makedirs(output_folder, exist_ok=True)

    safe_invoice_number = (
        invoice.invoice_number
        .replace("/", "-")
        .replace("\\", "-")
    )

    pdf_path = os.path.join(
        output_folder,
        f"faktura-{safe_invoice_number}.pdf",
    )

    font_path = "C:/Windows/Fonts/arial.ttf"

    if os.path.exists(font_path):
        try:
            pdfmetrics.registerFont(
                TTFont("ERPFont", font_path)
            )
        except Exception:
            pass

        font_name = "ERPFont"
    else:
        font_name = "Helvetica"

    document = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
    )

    styles = getSampleStyleSheet()

    styles["Title"].fontName = font_name
    styles["Heading2"].fontName = font_name
    styles["Normal"].fontName = font_name

    elements = []

    company_name = company.name if company else "Naziv firme"
    company_pib = company.pib if company and company.pib else ""
    company_mb = company.mb if company and company.mb else ""
    company_address = (
        company.address
        if company and company.address
        else ""
    )

    company_data = [
        [
            Paragraph(
                f"<b>{company_name}</b>",
                styles["Heading2"],
            ),
            Paragraph(
                "<b>IZLAZNA FAKTURA</b>",
                styles["Heading2"],
            ),
        ],
        [
            f"Adresa: {company_address}",
            f"Broj: {invoice.invoice_number}",
        ],
        [
            f"PIB: {company_pib}",
            (
                "Datum: "
                f"{invoice.invoice_date.strftime('%d.%m.%Y.')}"
            ),
        ],
        [
            f"Matični broj: {company_mb}",
            f"Način plaćanja: {invoice.payment_method}",
        ],
        [
            "",
            f"Status: {invoice.status}",
        ],
    ]

    company_table = Table(
        company_data,
        colWidths=[90 * mm, 80 * mm],
    )

    company_table.setStyle(
        TableStyle(
            [
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, -1),
                    font_name,
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP",
                ),
                (
                    "ALIGN",
                    (1, 0),
                    (1, -1),
                    "RIGHT",
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "LINEBELOW",
                    (0, -1),
                    (-1, -1),
                    1,
                    colors.grey,
                ),
            ]
        )
    )

    elements.append(company_table)
    elements.append(Spacer(1, 10 * mm))

    customer_name = customer.name if customer else ""
    customer_pib = (
        customer.pib
        if customer and customer.pib
        else ""
    )
    customer_address = (
        customer.address
        if customer and customer.address
        else ""
    )

    customer_data = [
        ["KUPAC", ""],
        ["Naziv:", customer_name],
        ["PIB:", customer_pib],
        ["Adresa:", customer_address],
    ]

    customer_table = Table(
        customer_data,
        colWidths=[45 * mm, 125 * mm],
    )

    customer_table.setStyle(
        TableStyle(
            [
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, -1),
                    font_name,
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.lightgrey,
                ),
                (
                    "SPAN",
                    (0, 0),
                    (1, 0),
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    elements.append(customer_table)
    elements.append(Spacer(1, 10 * mm))

    items_data = [
        [
            "Opis",
            "Količina",
            "Cena",
            "Popust",
            "Ukupno",
        ]
    ]

    for item in invoice.items:
        items_data.append(
            [
                item.description,
                format_money(item.quantity),
                f"{format_money(item.unit_price)} RSD",
                f"{format_money(item.discount)} %",
                f"{format_money(item.total)} RSD",
            ]
        )

    items_table = Table(
        items_data,
        colWidths=[
            62 * mm,
            22 * mm,
            30 * mm,
            23 * mm,
            33 * mm,
        ],
        repeatRows=1,
    )

    items_table.setStyle(
        TableStyle(
            [
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, -1),
                    font_name,
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.lightgrey,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey,
                ),
                (
                    "ALIGN",
                    (1, 1),
                    (-1, -1),
                    "RIGHT",
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    elements.append(items_table)
    elements.append(Spacer(1, 10 * mm))

    total_table = Table(
        [
            [
                "UKUPNO ZA PLAĆANJE:",
                f"{format_money(invoice.amount)} RSD",
            ]
        ],
        colWidths=[100 * mm, 70 * mm],
    )

    total_table.setStyle(
        TableStyle(
            [
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, -1),
                    font_name,
                ),
                (
                    "ALIGN",
                    (0, 0),
                    (-1, -1),
                    "RIGHT",
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    14,
                ),
                (
                    "LINEABOVE",
                    (0, 0),
                    (-1, 0),
                    1,
                    colors.black,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
            ]
        )
    )

    elements.append(total_table)

    if invoice.description:
        elements.append(Spacer(1, 8 * mm))

        elements.append(
            Paragraph(
                f"<b>Napomena:</b> {invoice.description}",
                styles["Normal"],
            )
        )

    elements.append(Spacer(1, 18 * mm))

    elements.append(
        Paragraph(
            "Faktura je generisana elektronski.",
            styles["Normal"],
        )
    )

    document.build(elements)

    return pdf_path