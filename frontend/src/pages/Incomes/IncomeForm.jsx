function IncomeForm({ form, customers, onChange, onSubmit }) {
  return (
    <div className="panel">
      <h2>Novi prihod</h2>

      <form onSubmit={onSubmit}>
        <input
          name="invoice_number"
          placeholder="Broj fakture"
          value={form.invoice_number}
          onChange={onChange}
        />

        <input type="date" name="date" value={form.date} onChange={onChange} />

        <select name="customer_id" value={form.customer_id} onChange={onChange}>
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
          <option value="placeno">Plaćeno</option>
          <option value="neplaceno">Neplaćeno</option>
          <option value="stornirano">Stornirano</option>
        </select>

        <input
          name="description"
          placeholder="Opis"
          value={form.description}
          onChange={onChange}
        />

        <input
          type="number"
          name="amount"
          placeholder="Iznos"
          value={form.amount}
          onChange={onChange}
        />

        <button type="submit">💾 Sačuvaj prihod</button>
      </form>
    </div>
  );
}

export default IncomeForm;