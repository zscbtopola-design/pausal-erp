from datetime import date
from pydantic import BaseModel


class CompanyCreate(BaseModel):
    name: str
    pib: str | None = None
    mb: str | None = None
    address: str | None = None
    limit_amount: float = 6000000


class CompanyOut(CompanyCreate):
    id: int

    class Config:
        from_attributes = True


class CustomerCreate(BaseModel):
    company_id: int
    name: str
    pib: str | None = None
    address: str | None = None
    email: str | None = None
    phone: str | None = None


class CustomerOut(CustomerCreate):
    id: int

    class Config:
        from_attributes = True


class SupplierCreate(CustomerCreate):
    pass


class SupplierOut(SupplierCreate):
    id: int

    class Config:
        from_attributes = True


class IncomeCreate(BaseModel):
    company_id: int
    customer_id: int | None = None
    date: date
    invoice_number: str | None = None
    payment_method: str = "racun"
    status: str = "placeno"
    description: str
    amount: float


class IncomeOut(IncomeCreate):
    id: int

    class Config:
        from_attributes = True


class ExpenseCreate(BaseModel):
    company_id: int
    supplier_id: int | None = None
    date: date
    description: str
    amount: float


class ExpenseOut(ExpenseCreate):
    id: int

    class Config:
        from_attributes = True


class InvoiceItemCreate(BaseModel):
    description: str
    quantity: float = 1
    unit_price: float = 0
    discount: float = 0


class InvoiceItemOut(InvoiceItemCreate):
    id: int
    invoice_id: int
    total: float

    class Config:
        from_attributes = True


class InvoiceCreate(BaseModel):
    company_id: int
    customer_id: int | None = None
    invoice_number: str
    invoice_date: date
    description: str | None = None
    status: str = "draft"
    payment_method: str = "racun"
    items: list[InvoiceItemCreate] = []


class InvoiceOut(BaseModel):
    id: int
    company_id: int
    customer_id: int | None = None
    invoice_number: str
    invoice_date: date
    description: str | None = None
    amount: float
    status: str
    payment_method: str
    items: list[InvoiceItemOut] = []

    class Config:
        from_attributes = True