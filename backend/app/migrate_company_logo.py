import sqlite3


DATABASE_PATH = "pausal.db"


def migrate():
    connection = sqlite3.connect(DATABASE_PATH)
    cursor = connection.cursor()

    cursor.execute("PRAGMA table_info(companies)")
    existing_columns = {
        column[1] for column in cursor.fetchall()
    }

    if "logo_path" not in existing_columns:
        cursor.execute(
            "ALTER TABLE companies ADD COLUMN logo_path TEXT"
        )
        print("Dodata kolona: logo_path")
    else:
        print("Kolona logo_path već postoji")

    connection.commit()
    connection.close()

    print("Migracija završena.")


if __name__ == "__main__":
    migrate()