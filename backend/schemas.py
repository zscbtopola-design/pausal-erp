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