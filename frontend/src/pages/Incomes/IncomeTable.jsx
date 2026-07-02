import DataTable from "../../components/DataTable/DataTable";
import SearchBox from "../../components/common/SearchBox";
import { formatDate, formatMoney } from "../../utils/format";

function IncomeTable({ incomes, customers, search, setSearch, onDelete }) {
  const columns = [
    { key: "invoice_number", label: "Broj fakture" },
    { key: "date", label: "Datum" },
    { key: "customer_name", label: "Kupac" },
    { key: "payment_method_label", label: "Plaćanje" },
    { key: "status_label", label: "Status" },
    { key: "description", label: "Opis" },
    { key: "amount", label: "Iznos" },
  ];

  function getCustomerName(customerId) {
    const customer = customers.find((c) => Number(c.id) === Number(customerId));
    return customer ? customer.name : "";
  }

  function paymentLabel(value) {
    if (value === "racun") return "Račun";
    if (value === "gotovina") return "Gotovina";
    if (value === "kartica") return "Kartica";
    if (value === "avans") return "Avans";
    return value || "";
  }

  function statusLabel(value) {
    if (value === "placeno") return "Plaćeno";
    if (value === "neplaceno") return "Neplaćeno";
    if (value === "stornirano") return "Stornirano";
    return value || "";
  }

  const filtered = incomes.filter((i) =>
    `${i.invoice_number || ""} ${i.date || ""} ${i.description || ""} ${
      i.amount || ""
    } ${getCustomerName(i.customer_id)} ${paymentLabel(i.payment_method)} ${statusLabel(i.status)}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const tableData = filtered.map((i) => ({
    ...i,
    date: formatDate(i.date),
    customer_name: getCustomerName(i.customer_id),
    payment_method_label: paymentLabel(i.payment_method),
    status_label: statusLabel(i.status),
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