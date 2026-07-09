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
    return f"{value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def create_invoice_pdf(invoice, customer):
    # Folder u koji se čuvaju PDF fakture
    output_folder = os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "uploads",
        "invoices",
    )

    output_folder = os.path.abspath(output_folder)

    os.makedirs(
        output_folder,
        exist_ok=True,
    )

    # Bezbedno ime PDF fajla
    safe_invoice_number = (
        invoice.invoice_number
        .replace("/", "-")
        .replace("\\", "-")
    )

    pdf_path = os.path.join(
        output_folder,
        f"faktura-{safe_invoice_number}.pdf",
    )

    # Font koji podržava č, ć, š, ž i đ
    font_path = "C:/Windows/Fonts/arial.ttf"

    if os.path.exists(font_path):
        pdfmetrics.registerFont(
            TTFont(
                "ERPFont",
                font_path,
            )
        )

        font_name = "ERPFont"

    else:
        font_name = "Helvetica"

    document = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()

    styles["Title"].fontName = font_name
    styles["Heading2"].fontName = font_name
    styles["Normal"].fontName = font_name

    elements = []

    elements.append(
        Paragraph(
            "IZLAZNA FAKTURA",
            styles["Title"],
        )
    )

    elements.append(
        Spacer(
            1,
            10 * mm,
        )
    )

    invoice_information = [
        [
            "Broj fakture:",
            invoice.invoice_number,
        ],
        [
            "Datum:",
            invoice.invoice_date.strftime(
                "%d.%m.%Y."
            ),
        ],
        [
            "Način plaćanja:",
            invoice.payment_method,
        ],
        [
            "Status:",
            invoice.status,
        ],
    ]

    invoice_table = Table(
        invoice_information,
        colWidths=[
            50 * mm,
            100 * mm,
        ],
    )

    invoice_table.setStyle(
        TableStyle(
            [
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, -1),
                    font_name,
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

    elements.append(invoice_table)

    elements.append(
        Spacer(
            1,
            8 * mm,
        )
    )

    customer_name = (
        customer.name
        if customer
        else ""
    )

    customer_pib = (
        customer.pib
        if customer
        and customer.pib
        else ""
    )

    customer_address = (
        customer.address
        if customer
        and customer.address
        else ""
    )

    customer_information = [
        [
            "KUPAC",
            "",
        ],
        [
            "Naziv:",
            customer_name,
        ],
        [
            "PIB:",
            customer_pib,
        ],
        [
            "Adresa:",
            customer_address,
        ],
    ]

    customer_table = Table(
        customer_information,
        colWidths=[
            50 * mm,
            100 * mm,
        ],
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
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
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
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6,
                ),
            ]
        )
    )

    elements.append(customer_table)

    elements.append(
        Spacer(
            1,
            10 * mm,
        )
    )

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
                format_money(
                    item.quantity
                ),
                format_money(
                    item.unit_price
                ),
                f"{format_money(item.discount)} %",
                format_money(
                    item.total
                ),
            ]
        )

    items_table = Table(
        items_data,
        colWidths=[
            65 * mm,
            22 * mm,
            28 * mm,
            22 * mm,
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

    elements.append(
        Spacer(
            1,
            10 * mm,
        )
    )

    total_table = Table(
        [
            [
                "UKUPNO:",
                (
                    f"{format_money(invoice.amount)} "
                    "RSD"
                ),
            ]
        ],
        colWidths=[
            100 * mm,
            70 * mm,
        ],
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
        elements.append(
            Spacer(
                1,
                10 * mm,
            )
        )

        elements.append(
            Paragraph(
                (
                    "<b>Napomena:</b> "
                    f"{invoice.description}"
                ),
                styles["Normal"],
            )
        )

    document.build(elements)

    return pdf_path