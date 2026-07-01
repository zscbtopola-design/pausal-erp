from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pausal App - Faza 1")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Pausal aplikacija radi"}


@app.post("/companies", response_model=schemas.CompanyOut)
def create_company(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    new_company = models.Company(**company.model_dump())
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company


@app.get("/companies", response_model=list[schemas.CompanyOut])
def get_companies(db: Session = Depends(get_db)):
    return db.query(models.Company).all()


@app.post("/customers", response_model=schemas.CustomerOut)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    new_customer = models.Customer(**customer.model_dump())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer


@app.get("/customers", response_model=list[schemas.CustomerOut])
def get_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).all()


@app.post("/suppliers", response_model=schemas.SupplierOut)
def create_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    new_supplier = models.Supplier(**supplier.model_dump())
    db.add(new_supplier)
    db.commit()
    db.refresh(new_supplier)
    return new_supplier


@app.get("/suppliers", response_model=list[schemas.SupplierOut])
def get_suppliers(db: Session = Depends(get_db)):
    return db.query(models.Supplier).all()


@app.post("/incomes", response_model=schemas.IncomeOut)
def create_income(income: schemas.IncomeCreate, db: Session = Depends(get_db)):
    new_income = models.Income(**income.model_dump())
    db.add(new_income)
    db.commit()
    db.refresh(new_income)
    return new_income


@app.get("/incomes", response_model=list[schemas.IncomeOut])
def get_incomes(db: Session = Depends(get_db)):
    return db.query(models.Income).all()


@app.post("/expenses", response_model=schemas.ExpenseOut)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    new_expense = models.Expense(**expense.model_dump())
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense


@app.get("/expenses", response_model=list[schemas.ExpenseOut])
def get_expenses(db: Session = Depends(get_db)):
    return db.query(models.Expense).all()


@app.get("/dashboard/{company_id}")
def dashboard(company_id: int, db: Session = Depends(get_db)):
    company = db.query(models.Company).filter(models.Company.id == company_id).first()

    total_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.company_id == company_id
    ).scalar() or 0

    total_expense = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.company_id == company_id
    ).scalar() or 0

    limit_amount = company.limit_amount if company else 6000000
    remaining = limit_amount - total_income
    percent = round((total_income / limit_amount) * 100, 2) if limit_amount else 0

    return {
        "company_id": company_id,
        "limit": limit_amount,
        "total_income": total_income,
        "total_expense": total_expense,
        "profit": total_income - total_expense,
        "remaining_limit": remaining,
        "used_percent": percent
    }
@app.get("/customers/{customer_id}", response_model=schemas.CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()


@app.put("/customers/{customer_id}", response_model=schemas.CustomerOut)
def update_customer(
    customer_id: int,
    customer: schemas.CustomerCreate,
    db: Session = Depends(get_db)
):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()

    for key, value in customer.model_dump().items():
        setattr(db_customer, key, value)

    db.commit()
    db.refresh(db_customer)
    return db_customer


@app.delete("/customers/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()

    db.delete(db_customer)
    db.commit()

    return {"message": "Kupac je obrisan"}
@app.get("/suppliers/{supplier_id}", response_model=schemas.SupplierOut)
def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    return db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()


@app.put("/suppliers/{supplier_id}", response_model=schemas.SupplierOut)
def update_supplier(
    supplier_id: int,
    supplier: schemas.SupplierCreate,
    db: Session = Depends(get_db)
):
    db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()

    for key, value in supplier.model_dump().items():
        setattr(db_supplier, key, value)

    db.commit()
    db.refresh(db_supplier)
    return db_supplier


@app.delete("/suppliers/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()

    db.delete(db_supplier)
    db.commit()

    return {"message": "Dobavljač je obrisan"}
@app.get("/incomes/{income_id}", response_model=schemas.IncomeOut)
def get_income(income_id: int, db: Session = Depends(get_db)):
    return db.query(models.Income).filter(models.Income.id == income_id).first()


@app.put("/incomes/{income_id}", response_model=schemas.IncomeOut)
def update_income(
    income_id: int,
    income: schemas.IncomeCreate,
    db: Session = Depends(get_db)
):
    db_income = db.query(models.Income).filter(models.Income.id == income_id).first()

    for key, value in income.model_dump().items():
        setattr(db_income, key, value)

    db.commit()
    db.refresh(db_income)
    return db_income


@app.delete("/incomes/{income_id}")
def delete_income(income_id: int, db: Session = Depends(get_db)):
    db_income = db.query(models.Income).filter(models.Income.id == income_id).first()

    db.delete(db_income)
    db.commit()

    return {"message": "Prihod je obrisan"}
@app.get("/expenses/{expense_id}", response_model=schemas.ExpenseOut)
def get_expense(expense_id: int, db: Session = Depends(get_db)):
    return db.query(models.Expense).filter(models.Expense.id == expense_id).first()


@app.put("/expenses/{expense_id}", response_model=schemas.ExpenseOut)
def update_expense(
    expense_id: int,
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db)
):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()

    for key, value in expense.model_dump().items():
        setattr(db_expense, key, value)

    db.commit()
    db.refresh(db_expense)
    return db_expense


@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()

    db.delete(db_expense)
    db.commit()

    return {"message": "Rashod je obrisan"}
