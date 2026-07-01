from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


@router.post("", response_model=schemas.CustomerOut)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    new_customer = models.Customer(**customer.model_dump())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer


@router.get("", response_model=list[schemas.CustomerOut])
def get_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).all()


@router.get("/{customer_id}", response_model=schemas.CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()


@router.put("/{customer_id}", response_model=schemas.CustomerOut)
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


@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()

    db.delete(db_customer)
    db.commit()

    return {"message": "Kupac je obrisan"}