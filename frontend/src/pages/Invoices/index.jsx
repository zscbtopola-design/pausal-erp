import { useEffect, useState } from "react";
import "./Invoice.css";

import { getCustomers } from "../../api/services/customers";
import { getInvoices, addInvoice, deleteInvoice } from "../../api/services/invoices";

import InvoiceForm from "./InvoiceForm";
import InvoiceTable from "./InvoiceTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";

function Invoices() {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    company_id: 1,
    customer_id: "",
    invoice_number: "",
    invoice_date: "",
    description: "",
    status: "draft",
    payment_method: "racun",
    items: [
      {
        description: "",
        quantity: 1,
        unit_price: 0,
        discount: 0,
      },
    ],
  });

  async function loadData() {
    setCustomers(await getCustomers());
    setInvoices(await getInvoices());
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

  function changeItem(index, field, value) {
    const newItems = [...form.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    setForm({
      ...form,
      items: newItems,
    });
  }

  function addItem() {
    setForm({
      ...form,
      items: [
        ...form.items,
        {
          description: "",
          quantity: 1,
          unit_price: 0,
          discount: 0,
        },
      ],
    });
  }

  function removeItem(index) {
    const newItems = form.items.filter((_, i) => i !== index);

    setForm({
      ...form,
      items: newItems.length ? newItems : [
        {
          description: "",
          quantity: 1,
          unit_price: 0,
          discount: 0,
        },
      ],
    });
  }

  function totalAmount() {
    return form.items.reduce((sum, item) => {
      const quantity = Number(item.quantity || 0);
      const price = Number(item.unit_price || 0);
      const discount = Number(item.discount || 0);
      return sum + quantity * price - discount;
    }, 0);
  }

  async function save(e) {
    e.preventDefault();

    if (!form.invoice_number || !form.invoice_date) {
      alert("Broj fakture i datum su obavezni.");
      return;
    }

    const cleanItems = form.items.filter((i) => i.description.trim());

    if (cleanItems.length === 0) {
      alert("Faktura mora imati bar jednu stavku.");
      return;
    }

    await addInvoice({
      ...form,
      customer_id: form.customer_id ? Number(form.customer_id) : null,
      items: cleanItems.map((i) => ({
        description: i.description,
        quantity: Number(i.quantity || 0),
        unit_price: Number(i.unit_price || 0),
        discount: Number(i.discount || 0),
      })),
    });

    setForm({
      company_id: 1,
      customer_id: "",
      invoice_number: "",
      invoice_date: "",
      description: "",
      status: "draft",
      payment_method: "racun",
      items: [
        {
          description: "",
          quantity: 1,
          unit_price: 0,
          discount: 0,
        },
      ],
    });

    loadData();
  }

  async function confirmDelete() {
    await deleteInvoice(deleteId);
    setDeleteId(null);
    loadData();
  }

  return (
    <>
      <InvoiceForm
        form={form}
        customers={customers}
        onChange={change}
        onItemChange={changeItem}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onSubmit={save}
        totalAmount={totalAmount()}
      />

      <InvoiceTable
        invoices={invoices}
        customers={customers}
        onDelete={setDeleteId}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Brisanje fakture"
        message="Da li sigurno želiš da obrišeš fakturu?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

export default Invoices;