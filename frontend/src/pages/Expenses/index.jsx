import { useEffect, useState } from "react";

import {
  addExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../../api/services/expenses";

import { getSuppliers } from "../../api/services/suppliers";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import ExpenseForm from "./ExpenseForm";
import ExpenseTable from "./ExpenseTable";

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

  const [form, setForm] = useState(createEmptyForm());
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
      date: expense.date || getToday(),
      description: expense.description || "",
      amount: String(expense.amount ?? ""),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
      } else {
        await addExpense(payload);
      }

      resetForm();
      await loadData();

      alert(
        editingId
          ? "Rashod je uspešno izmenjen."
          : "Rashod je uspešno sačuvan."
      );
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

  async function confirmDelete() {
    try {
      await deleteExpense(deleteId);

      if (editingId === deleteId) {
        resetForm();
      }

      setDeleteId(null);
      await loadData();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Rashod nije obrisan."
      );
    }
  }

  if (loading) {
    return <p>Učitavanje rashoda...</p>;
  }

  return (
    <>
      <ExpenseForm
        form={form}
        suppliers={suppliers}
        editingId={editingId}
        saving={saving}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancelEdit={resetForm}
      />

      <ExpenseTable
        expenses={expenses}
        suppliers={suppliers}
        search={search}
        setSearch={setSearch}
        onEdit={handleEdit}
        onDelete={setDeleteId}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Brisanje rashoda"
        message="Da li sigurno želite da obrišete ovaj rashod?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

export default Expenses;