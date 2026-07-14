from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    pib = Column(String, nullable=True)
    mb = Column(String, nullable=True)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    bank_name = Column(String, nullable=True)
    bank_account = Column(String, nullable=True)
    logo_path = Column(String, nullable=True)
    limit_amount = Column(Float, default=6000000)

    customers = relationship("Customer", back_populates="company")
    suppliers = relationship("Supplier", back_populates="company")
    incomes = relationship("Income", back_populates="company")
    expenses = relationship("Expense", back_populates="company")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    name = Column(String, nullable=False)
    pib = Column(String, nullable=True)
    address = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    company = relationship("Company", back_populates="customers")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    name = Column(String, nullable=False)
    pib = Column(String, nullable=True)
    address = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    company = relationship("Company", back_populates="suppliers")


class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)

    date = Column(Date, nullable=False)
    invoice_number = Column(String, nullable=True)
    payment_method = Column(String, default="racun")
    status = Column(String, default="placeno")
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)

    company = relationship("Company", back_populates="incomes")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)

    date = Column(Date, nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)

    company = relationship("Company", back_populates="expenses")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)

    invoice_number = Column(String, nullable=False)
    invoice_date = Column(Date, nullable=False)
    description = Column(String, nullable=True)

    amount = Column(Float, nullable=False)
    status = Column(String, default="draft")
    payment_method = Column(String, default="racun")

    items = relationship(
        "InvoiceItem",
        back_populates="invoice",
        cascade="all, delete-orphan"
    )


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)

    invoice_id = Column(
        Integer,
        ForeignKey("invoices.id"),
        nullable=False
    )

    description = Column(String, nullable=False)
    quantity = Column(Float, nullable=False, default=1)
    unit_price = Column(Float, nullable=False, default=0)
    discount = Column(Float, nullable=False, default=0)
    total = Column(Float, nullable=False, default=0)

    invoice = relationship(
        "Invoice",
        back_populates="items"
    )