import DataTable from "../../components/DataTable/DataTable";
import SearchBox from "../../components/common/SearchBox";
import { formatDate, formatMoney } from "../../utils/format";

function IncomeTable({ incomes, customers, search, setSearch, onDelete }) {
  const columns = [
    { key: "date", label: "Datum" },
    { key: "customer_name", label: "Kupac" },
    { key: "description", label: "Opis" },
    { key: "amount", label: "Iznos" },
  ];

  function getCustomerName(customerId) {
    const customer = customers.find((c) => Number(c.id) === Number(customerId));
    return customer ? customer.name : "";
  }

  const filtered = incomes.filter((i) =>
    `${i.date || ""} ${i.description || ""} ${i.amount || ""} ${getCustomerName(i.customer_id)}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const tableData = filtered.map((i) => ({
    ...i,
    date: formatDate(i.date),
    customer_name: getCustomerName(i.customer_id),
    amount: formatMoney(i.amount),
  }));

  return (
    <div className="panel">
      <h2>Spisak prihoda</h2>

      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Pretraga prihoda..."
      />

      <DataTable
        columns={columns}
        data={tableData}
        actions={(income) => (
          <button onClick={() => onDelete(income.id)}>Obriši</button>
        )}
      />
    </div>
  );
}

export default IncomeTable;