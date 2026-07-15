import { useEffect, useMemo, useState } from "react";

import { getSuppliers } from "../../api/services/suppliers";
import { addPurchaseInvoice } from "../../api/services/purchaseInvoices";
import { formatMoney } from "../../utils/format";

function createEmptyItem() {
  return {
    description: "",
    quantity: 1,
    unit_price: 0,
    discount: 0,
  };
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function PurchaseInvoiceForm({ onSaved }) {
  const [suppliers, setSuppliers] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    company_id: 1,
    supplier_id: "",
    invoice_number: "",
    invoice_date: getToday(),
    due_date: "",
    description: "",
    status: "neplacena",
    payment_method: "racun",
  });

  const [items, setItems] = useState([createEmptyItem()]);

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const data = await getSuppliers();
        setSuppliers(data);
      } catch (error) {
        console.error(error);
        alert("Greška pri učitavanju dobavljača.");
      }
    }

    loadSuppliers();
  }, []);

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleItemChange(index, field, value) {
    setItems((previousItems) =>
      previousItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]:
                field === "description"
                  ? value
                  : Number(value),
            }
          : item
      )
    );
  }

  function addItem() {
    setItems((previousItems) => [
      ...previousItems,
      createEmptyItem(),
    ]);
  }

  function removeItem(index) {
    if (items.length === 1) {
      alert("Ulazna faktura mora imati najmanje jednu stavku.");
      return;
    }

    setItems((previousItems) =>
      previousItems.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  function calculateItemTotal(item) {
    const subtotal =
      Number(item.quantity) * Number(item.unit_price);

    const discountAmount =
      subtotal * Number(item.discount) / 100;

    return subtotal - discountAmount;
  }

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + calculateItemTotal(item),
        0
      ),
    [items]
  );

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.supplier_id) {
      alert("Izaberite dobavljača.");
      return;
    }

    if (!form.invoice_number.trim()) {
      alert("Unesite broj ulazne fakture.");
      return;
    }

    const hasInvalidItem = items.some(
      (item) =>
        !item.description.trim() ||
        Number(item.quantity) <= 0 ||
        Number(item.unit_price) < 0 ||
        Number(item.discount) < 0 ||
        Number(item.discount) > 100
    );

    if (hasInvalidItem) {
      alert("Popunite ispravno sve stavke.");
      return;
    }

    const payload = {
      company_id: 1,
      supplier_id: Number(form.supplier_id),
      invoice_number: form.invoice_number.trim(),
      invoice_date: form.invoice_date,
      due_date: form.due_date || null,
      description: form.description || null,
      amount: totalAmount,
      status: form.status,
      payment_method: form.payment_method,
      items: items.map((item) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        discount: Number(item.discount),
      })),
    };

    try {
      setSaving(true);

      await addPurchaseInvoice(payload);

      setForm({
        company_id: 1,
        supplier_id: "",
        invoice_number: "",
        invoice_date: getToday(),
        due_date: "",
        description: "",
        status: "neplacena",
        payment_method: "racun",
      });

      setItems([createEmptyItem()]);

      if (onSaved) {
        await onSaved();
      }

      alert("Ulazna faktura je uspešno sačuvana.");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Ulazna faktura nije sačuvana."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>Nova ulazna faktura</h2>

      <div className="form-grid">
        <div>
          <label>Dobavljač</label>

          <select
            name="supplier_id"
            value={form.supplier_id}
            onChange={handleFormChange}
          >
            <option value="">Izaberite dobavljača</option>

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
          <label>Broj fakture</label>

          <input
            name="invoice_number"
            value={form.invoice_number}
            onChange={handleFormChange}
            placeholder="Na primer: UF-15/2026"
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
          <label>Datum dospeća</label>

          <input
            type="date"
            name="due_date"
            value={form.due_date}
            onChange={handleFormChange}
          />
        </div>

        <div>
          <label>Status</label>

          <select
            name="status"
            value={form.status}
            onChange={handleFormChange}
          >
            <option value="neplacena">Neplaćena</option>
            <option value="placena">Plaćena</option>
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
          <label>Napomena</label>

          <input
            name="description"
            value={form.description}
            onChange={handleFormChange}
            placeholder="Napomena"
          />
        </div>
      </div>

      <h2>Stavke ulazne fakture</h2>

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
                    placeholder="Opis robe ili usluge"
                  />
                </td>

                <td>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(event) =>
                      handleItemChange(
                        index,
                        "quantity",
                        event.target.value
                      )
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
                      handleItemChange(
                        index,
                        "discount",
                        event.target.value
                      )
                    }
                  />
                </td>

                <td>
                  {formatMoney(calculateItemTotal(item))}
                </td>

                <td>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                  >
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
        Ukupno: <strong>{formatMoney(totalAmount)}</strong>
      </div>

      <button type="submit" disabled={saving}>
        {saving
          ? "Čuvanje..."
          : "Sačuvaj ulaznu fakturu"}
      </button>
    </form>
  );
}

export default PurchaseInvoiceForm;