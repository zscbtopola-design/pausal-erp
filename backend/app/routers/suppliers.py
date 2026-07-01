from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"]
)


@router.post("", response_model=schemas.SupplierOut)
def create_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    new_supplier = models.Supplier(**supplier.model_dump())
    db.add(new_supplier)
    db.commit()
    db.refresh(new_supplier)
    return new_supplier


@router.get("", response_model=list[schemas.SupplierOut])
def get_suppliers(db: Session = Depends(get_db)):
    return db.query(models.Supplier).all()


@router.get("/{supplier_id}", response_model=schemas.SupplierOut)
def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    return db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()


@router.put("/{supplier_id}", response_model=schemas.SupplierOut)
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


@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()

    db.delete(db_supplier)
    db.commit()

    return {"message": "Dobavljač je obrisan"}