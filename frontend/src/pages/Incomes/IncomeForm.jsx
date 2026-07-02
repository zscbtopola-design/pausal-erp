function IncomeForm({ form, customers, onChange, onSubmit }) {
  return (
    <div className="panel">
      <h2>Novi prihod</h2>

      <form onSubmit={onSubmit}>
        <input type="date" name="date" value={form.date} onChange={onChange} />

        <select name="customer_id" value={form.customer_id} onChange={onChange}>
          <option value="">Izaberi kupca</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
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