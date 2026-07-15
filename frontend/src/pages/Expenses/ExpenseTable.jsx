import DataTable from "../../components/DataTable/DataTable";
import SearchBox from "../../components/common/SearchBox";
import { formatDate, formatMoney } from "../../utils/format";

function ExpenseTable({
  expenses,
  suppliers,
  search,
  setSearch,
  onEdit,
  onDelete,
}) {
  const columns = [
    { key: "date", label: "Datum" },
    { key: "supplier_name", label: "Dobavljač" },
    { key: "description", label: "Opis" },
    { key: "amount", label: "Iznos" },
  ];

  function getSupplierName(supplierId) {
    if (!supplierId) {
      return "Bez dobavljača";
    }

    const supplier = suppliers.find(
      (item) => Number(item.id) === Number(supplierId)
    );

    return supplier?.name || "Nepoznat dobavljač";
  }

  const filteredExpenses = expenses.filter((expense) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const searchableText = `
      ${expense.date || ""}
      ${expense.description || ""}
      ${expense.amount || ""}
      ${getSupplierName(expense.supplier_id)}
    `.toLowerCase();

    return searchableText.includes(query);
  });

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const tableData = filteredExpenses.map((expense) => ({
    ...expense,
    date: formatDate(expense.date),
    supplier_name: getSupplierName(expense.supplier_id),
    amount: formatMoney(expense.amount),
  }));

  return (
    <div className="panel">
      <h2>Spisak rashoda</h2>

      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Pretraga rashoda..."
      />

      <div className="invoice-total">
        Ukupno rashodi:{" "}
        <strong>{formatMoney(totalExpenses)}</strong>
      </div>

      <DataTable
        columns={columns}
        data={tableData}
        actions={(expense) => (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
            }}
          >
            <button
              type="button"
              onClick={() => onEdit(expense)}
              style={{ background: "#2563eb" }}
            >
              Izmeni
            </button>

            <button
              type="button"
              onClick={() => onDelete(expense.id)}
            >
              Obriši
            </button>
          </div>
        )}
      />
    </div>
  );
}

export default ExpenseTable;