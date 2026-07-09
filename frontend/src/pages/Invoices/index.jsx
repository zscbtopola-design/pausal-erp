import { useEffect, useState } from "react";
import "./Invoice.css";

import { getCustomers } from "../../api/services/customers";
import {
  getInvoices,
  addInvoice,
  deleteInvoice,
} from "../../api/services/invoices";
import { formatDate, formatMoney } from "../../utils/format";

function Invoices() {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [form, setForm] = useState({
    company_id: 1,
    customer_id: "",
    invoice_number: "",
    invoice_date: new Date().toISOString().slice(0, 10),
    description: "",
    status: "draft",
    payment_method: "racun",
  });

  const [items, setItems] = useState([
    {
      description: "",
      quantity: 1,
      unit_price: 0,
      discount: 0,
    },
  ]);

  async function loadData() {
    try {
      setCustomers(await getCustomers());
      setInvoices(await getInvoices());
    } catch (error) {
      console.error(error);
      alert("Greška pri učitavanju podataka.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  function handleItemChange(index, field, value) {
    setItems((previousItems) =>
      previousItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: field === "description" ? value : Number(value),
            }
          : item
      )
    );
  }

  function addItem() {
    setItems((previousItems) => [
      ...previousItems,
      {
        description: "",
        quantity: 1,
        unit_price: 0,
        discount: 0,
      },
    ]);
  }

  function removeItem(index) {
    if (items.length === 1) {
      alert("Faktura mora imati najmanje jednu stavku.");
      return;
    }

    setItems((previousItems) =>
      previousItems.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function calculateItemTotal(item) {
    const subtotal = Number(item.quantity) * Number(item.unit_price);
    const discountAmount = (subtotal * Number(item.discount)) / 100;

    return subtotal - discountAmount;
  }

  const invoiceTotal = items.reduce(
    (sum, item) => sum + calculateItemTotal(item),
    0
  );

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.invoice_number.trim()) {
      alert("Unesite broj fakture.");
      return;
    }

    if (!form.customer_id) {
      alert("Izaberite kupca.");
      return;
    }

    if (
      items.some(
        (item) =>
          !item.description.trim() ||
          Number(item.quantity) <= 0 ||
          Number(item.unit_price) <= 0
      )
    ) {
      alert("Popunite ispravno sve stavke.");
      return;
    }

    const invoiceData = {
      company_id: 1,
      customer_id: Number(form.customer_id),
      invoice_number: form.invoice_number,
      invoice_date: form.invoice_date,
      description: form.description || null,
      amount: invoiceTotal,
      status: form.status,
      payment_method: form.payment_method,
      items: items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        discount: Number(item.discount),
      })),
    };

    try {
      await addInvoice(invoiceData);

      alert("Faktura je uspešno sačuvana.");

      setForm({
        company_id: 1,
        customer_id: "",
        invoice_number: "",
        invoice_date: new Date().toISOString().slice(0, 10),
        description: "",
        status: "draft",
        payment_method: "racun",
      });

      setItems([
        {
          description: "",
          quantity: 1,
          unit_price: 0,
          discount: 0,
        },
      ]);

      await loadData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Faktura nije sačuvana.");
    }
  }

  async function handleDelete(invoiceId) {
    const confirmed = window.confirm("Da li želite da obrišete fakturu?");

    if (!confirmed) return;

    try {
      await deleteInvoice(invoiceId);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Faktura nije obrisana.");
    }
  }

  function getCustomerName(customerId) {
    const customer = customers.find(
      (c) => Number(c.id) === Number(customerId)
    );

    return customer ? customer.name : "";
  }

  return (
    <div className="invoice-page">
      <form className="panel" onSubmit={handleSubmit}>
        <h2>Nova izlazna faktura</h2>

        <div className="form-grid">
          <div>
            <label>Broj fakture</label>
            <input
              name="invoice_number"
              value={form.invoice_number}
              onChange={handleFormChange}
              placeholder="Na primer: 1-2026"
            />
          </div>

          <div>
            <label>Datum fakture</label>
            <input
              type="date"
              name="invoice_date"
              value={form.invoice_date}
              onChange={handleFormChange}
            />
          </div>

          <div>
            <label>Kupac</label>
            <select
              name="customer_id"
              value={form.customer_id}
              onChange={handleFormChange}
            >
              <option value="">Izaberite kupca</option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Način plaćanja</label>
            <select
              name="payment_method"
              value={form.payment_method}
              onChange={handleFormChange}
            >
              <option value="racun">Račun</option>
              <option value="gotovina">Gotovina</option>
              <option value="kartica">Kartica</option>
            </select>
          </div>

          <div>
            <label>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleFormChange}
            >
              <option value="draft">Nacrt</option>
              <option value="izdata">Izdata</option>
              <option value="placena">Plaćena</option>
            </select>
          </div>

          <div>
            <label>Napomena</label>
            <input
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Napomena"
            />
          </div>
        </div>

        <h2>Stavke fakture</h2>

        <div className="invoice-table-wrapper">
          <table className="invoice-items-table">
            <thead>
              <tr>
                <th>Opis</th>
                <th>Količina</th>
                <th>Cena</th>
                <th>Popust %</th>
                <th>Ukupno</th>
                <th>Akcija</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      value={item.description}
                      onChange={(event) =>
                        handleItemChange(
                          index,
                          "description",
                          event.target.value
                        )
                      }
                      placeholder="Opis usluge"
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(event) =>
                        handleItemChange(index, "quantity", event.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(event) =>
                        handleItemChange(
                          index,
                          "unit_price",
                          event.target.value
                        )
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.discount}
                      onChange={(event) =>
                        handleItemChange(index, "discount", event.target.value)
                      }
                    />
                  </td>

                  <td>{formatMoney(calculateItemTotal(item))}</td>

                  <td>
                    <button type="button" onClick={() => removeItem(index)}>
                      Obriši
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="button" onClick={addItem}>
          + Dodaj stavku
        </button>

        <div className="invoice-total">
          Ukupno: <strong>{formatMoney(invoiceTotal)}</strong>
        </div>

        <button type="submit">Sačuvaj fakturu</button>
      </form>

      <div className="panel">
        <h2>Izlazne fakture</h2>

        <div className="invoice-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Broj</th>
                <th>Datum</th>
                <th>Kupac</th>
                <th>Iznos</th>
                <th>Status</th>
                <th>Akcija</th>
              </tr>
            </thead>

            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6">Nema faktura.</td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.invoice_number}</td>
                    <td>{formatDate(invoice.invoice_date)}</td>
                    <td>{getCustomerName(invoice.customer_id)}</td>
                    <td>{formatMoney(invoice.amount)}</td>
                    <td>{invoice.status}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDelete(invoice.id)}
                      >
                        Obriši
                      </button>
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

export default Invoices;