import InvoiceItems from "./InvoiceItems";
import { formatMoney } from "../../utils/format";

function InvoiceForm({
  form,
  customers,
  onChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onSubmit,
  totalAmount,
}) {
  return (
    <div className="panel">
      <h2>Nova izlazna faktura</h2>

      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <input
            name="invoice_number"
            placeholder="Broj fakture"
            value={form.invoice_number}
            onChange={onChange}
          />

          <input
            type="date"
            name="invoice_date"
            value={form.invoice_date}
            onChange={onChange}
          />

          <select
            name="customer_id"
            value={form.customer_id}
            onChange={onChange}
          >
            <option value="">Izaberi kupca</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            name="payment_method"
            value={form.payment_method}
            onChange={onChange}
          >
            <option value="racun">Račun</option>
            <option value="gotovina">Gotovina</option>
            <option value="kartica">Kartica</option>
            <option value="avans">Avans</option>
          </select>

          <select name="status" value={form.status} onChange={onChange}>
            <option value="draft">Nacrt</option>
            <option value="issued">Izdata</option>
            <option value="cancelled">Stornirana</option>
          </select>

          <input
            name="description"
            placeholder="Opis / napomena"
            value={form.description}
            onChange={onChange}
          />
        </div>

        <InvoiceItems
          items={form.items}
          onItemChange={onItemChange}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
        />

        <div className="invoice-total">
          <span>Ukupno:</span>
          <strong>{formatMoney(totalAmount)}</strong>
        </div>

        <button type="submit">💾 Sačuvaj fakturu</button>
      </form>
    </div>
  );
}

export default InvoiceForm;