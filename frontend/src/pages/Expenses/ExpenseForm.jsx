function ExpenseForm({
  form,
  suppliers,
  editingId,
  saving,
  onChange,
  onSubmit,
  onCancelEdit,
}) {
  return (
    <div className="panel">
      <h2>{editingId ? "Izmena rashoda" : "Novi rashod"}</h2>

      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <div>
            <label>Datum</label>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              required
            />
          </div>

          <div>
            <label>Dobavljač</label>

            <select
              name="supplier_id"
              value={form.supplier_id}
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
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
              onClick={onCancelEdit}
              disabled={saving}
              style={{ background: "#6b7280" }}
            >
              Otkaži izmenu
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ExpenseForm;