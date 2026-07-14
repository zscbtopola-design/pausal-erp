import sqlite3


DATABASE_PATH = "pausal.db"

COLUMNS = [
    ("phone", "TEXT"),
    ("email", "TEXT"),
    ("bank_name", "TEXT"),
    ("bank_account", "TEXT"),
]


def migrate():
    connection = sqlite3.connect(DATABASE_PATH)
    cursor = connection.cursor()

    cursor.execute("PRAGMA table_info(companies)")
    existing_columns = {
        column[1] for column in cursor.fetchall()
    }

    for column_name, column_type in COLUMNS:
        if column_name in existing_columns:
            print(f"Kolona već postoji: {column_name}")
            continue

        cursor.execute(
            f"ALTER TABLE companies "
            f"ADD COLUMN {column_name} {column_type}"
        )

        print(f"Dodata kolona: {column_name}")

    connection.commit()
    connection.close()

    print("Migracija završena.")


if __name__ == "__main__":
    migrate()