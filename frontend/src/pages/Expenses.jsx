import { useEffect, useMemo, useState } from "react";

import {
  addExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../api/services/expenses";

import { getSuppliers } from "../api/services/suppliers";
import { formatDate, formatMoney } from "../utils/format";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyForm() {
  return {
    company_id: 1,
    supplier_id: "",
    date: getToday(),
    description: "",
    amount: "",
  };
}

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(createEmptyForm());

  async function loadData() {
    try {
      const [expensesData, suppliersData] = await Promise.all([
        getExpenses(),
        getSuppliers(),
      ]);

      setExpenses(expensesData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Greška pri učitavanju rashoda."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(createEmptyForm());
    setEditingId(null);
  }

  function handleEdit(expense) {
    setEditingId(expense.id);

    setForm({
      company_id: expense.company_id || 1,
      supplier_id: expense.supplier_id
        ? String(expense.supplier_id)
        : "",
      date: expense.date,
      description: expense.description || "",
      amount: String(expense.amount ?? ""),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleCancelEdit() {
    resetForm();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.date) {
      alert("Izaberite datum rashoda.");
      return;
    }

    if (!form.description.trim()) {
      alert("Unesite opis rashoda.");
      return;
    }

    if (Number(form.amount) <= 0) {
      alert("Iznos mora biti veći od nule.");
      return;
    }

    const payload = {
      company_id: 1,
      supplier_id: form.supplier_id
        ? Number(form.supplier_id)
        : null,
      date: form.date,
      description: form.description.trim(),
      amount: Number(form.amount),
    };

    try {
      setSaving(true);

      if (editingId) {
        await updateExpense(editingId, payload);
        alert("Rashod je uspešno izmenjen.");
      } else {
        await addExpense(payload);
        alert("Rashod je uspešno sačuvan.");
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          (editingId
            ? "Rashod nije izmenjen."
            : "Rashod nije sačuvan.")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(expenseId) {
    const confirmed = window.confirm(
      "Da li želite da obrišete rashod?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteExpense(expenseId);

      if (editingId === expenseId) {
        resetForm();
      }

      await loadData();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Rashod nije obrisan."
      );
    }
  }

  function getSupplierName(supplierId) {
    if (!supplierId) {
      return "Bez dobavljača";
    }

    const supplier = suppliers.find(
      (item) => Number(item.id) === Number(supplierId)
    );

    return supplier?.name || "Nepoznat dobavljač";
  }

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return expenses;
    }

    return expenses.filter((expense) => {
      const supplierName = getSupplierName(
        expense.supplier_id
      ).toLowerCase();

      const description = (
        expense.description || ""
      ).toLowerCase();

      return (
        supplierName.includes(query) ||
        description.includes(query)
      );
    });
  }, [expenses, suppliers, search]);

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  if (loading) {
    return <p>Učitavanje rashoda...</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <form className="panel" onSubmit={handleSubmit}>
        <h2>
          {editingId ? "Izmena rashoda" : "Novi rashod"}
        </h2>

        <div className="form-grid">
          <div>
            <label>Datum</label>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Dobavljač</label>

            <select
              name="supplier_id"
              value={form.supplier_id}
              onChange={handleChange}
            >
              <option value="">Bez dobavljača</option>

              {suppliers.map((supplier) => (
                <option
                  key={supplier.id}
                  value={supplier.id}
                >
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Opis</label>

            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Opis rashoda"
              required
            />
          </div>

          <div>
            <label>Iznos</label>

            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="0,00"
              required
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button type="submit" disabled={saving}>
            {saving
              ? "Čuvanje..."
              : editingId
                ? "Sačuvaj izmene"
                : "Sačuvaj rashod"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={saving}
              style={{
                background: "#6b7280",
              }}
            >
              Otkaži izmenu
            </button>
          )}
        </div>
      </form>

      <div className="panel">
        <h2>Spisak rashoda</h2>

        <input
          className="search-input"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Pretraga po opisu ili dobavljaču..."
        />

        <div className="invoice-total">
          Ukupno rashodi:{" "}
          <strong>{formatMoney(totalExpenses)}</strong>
        </div>

        <div className="invoice-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Dobavljač</th>
                <th>Opis</th>
                <th>Iznos</th>
                <th>Akcije</th>
              </tr>
            </thead>

            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    Nema rashoda za prikaz.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{formatDate(expense.date)}</td>

                    <td>
                      {getSupplierName(
                        expense.supplier_id
                      )}
                    </td>

                    <td>{expense.description}</td>

                    <td>{formatMoney(expense.amount)}</td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "8px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleEdit(expense)}
                          style={{
                            background: "#2563eb",
                          }}
                        >
                          Izmeni
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(expense.id)
                          }
                        >
                          Obriši
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Expenses;