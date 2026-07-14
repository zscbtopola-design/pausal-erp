from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import engine

from routers import (
    companies,
    customers,
    suppliers,
    dashboard,
    incomes,
    expenses,
    invoices,
    users,
)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pausal ERP API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(companies.router)
app.include_router(customers.router)
app.include_router(suppliers.router)
app.include_router(dashboard.router)
app.include_router(incomes.router)
app.include_router(expenses.router)
app.include_router(invoices.router)
app.include_router(users.router)


@app.get("/")
def home():
    return {
        "message": "Pausal ERP API radi"
    }