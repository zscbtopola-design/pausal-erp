from database import SessionLocal
import models


def seed():
    db = SessionLocal()

    try:
        company = db.query(models.Company).filter(models.Company.id == 1).first()

        if not company:
            company = models.Company(
                id=1,
                name="Test firma",
                pib="123456789",
                mb="12345678",
                address="Test adresa",
                limit_amount=6000000,
            )
            db.add(company)
            db.commit()
            print("✅ Firma dodata")
        else:
            print("ℹ️ Firma već postoji")

        customer = db.query(models.Customer).filter(models.Customer.id == 1).first()

        if not customer:
            customer = models.Customer(
                id=1,
                company_id=1,
                name="Test kupac",
                pib="111111111",
                address="Adresa kupca",
                email="kupac@test.rs",
                phone="060111111",
            )
            db.add(customer)
            db.commit()
            print("✅ Kupac dodat")
        else:
            print("ℹ️ Kupac već postoji")

        supplier = db.query(models.Supplier).filter(models.Supplier.id == 1).first()

        if not supplier:
            supplier = models.Supplier(
                id=1,
                company_id=1,
                name="Test dobavljač",
                pib="222222222",
                address="Adresa dobavljača",
                email="dobavljac@test.rs",
                phone="060222222",
            )
            db.add(supplier)
            db.commit()
            print("✅ Dobavljač dodat")
        else:
            print("ℹ️ Dobavljač već postoji")

    finally:
        db.close()


if __name__ == "__main__":
    seed()