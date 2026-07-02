import { useEffect, useState } from "react";

import { getCustomers } from "../../api/services/customers";
import { getIncomes, addIncome, deleteIncome } from "../../api/services/incomes";

import IncomeForm from "./IncomeForm";
import IncomeTable from "./IncomeTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";

function Incomes() {
  const [customers, setCustomers] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    company_id: 1,
    customer_id: "",
    date: "",
    description: "",
    amount: "",
  });

  async function loadData() {
    setCustomers(await getCustomers());
    setIncomes(await getIncomes());
  }

  useEffect(() => {
    loadData();
  }, []);

  function change(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function save(e) {
    e.preventDefault();

    if (!form.date || !form.description || !form.amount) {
      alert("Datum, opis i iznos su obavezni.");
      return;
    }

    await addIncome({
      company_id: 1,
      customer_id: form.customer_id ? Number(form.customer_id) : null,
      date: form.date,
      description: form.description,
      amount: Number(form.amount),
    });

    setForm({
      company_id: 1,
      customer_id: "",
      date: "",
      description: "",
      amount: "",
    });

    loadData();
  }

  async function confirmDelete() {
    await deleteIncome(deleteId);
    setDeleteId(null);
    loadData();
  }

  return (
    <>
      <IncomeForm
        form={form}
        customers={customers}
        onChange={change}
        onSubmit={save}
      />

      <IncomeTable
        incomes={incomes}
        customers={customers}
        search={search}
        setSearch={setSearch}
        onDelete={setDeleteId}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Brisanje prihoda"
        message="Da li sigurno želiš da obrišeš ovaj prihod?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

export default Incomes;