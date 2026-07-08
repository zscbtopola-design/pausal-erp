import { formatDate, formatMoney } from "../../utils/format";

function InvoiceTable({ invoices, customers, onDelete }) {
  function customerName(id) {
    const customer = customers.find((c) => c.id === id);
    return customer ? customer.name : "-";
  }

  function statusLabel(status) {
    switch (status) {
      case "draft":
        return "Nacrt";
      case "issued":
        return "Izdata";
      case "cancelled":
        return "Stornirana";
      default:
        return status;
    }
  }

  return (
    <div className="panel">
      <h2>Fakture</h2>

      <table>
        <thead>
          <tr>
            <th>Broj</th>
            <th>Datum</th>
            <th>Kupac</th>
            <th>Iznos</th>
            <th>Status</th>
            <th>Akcije</th>
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

                <td>{customerName(invoice.customer_id)}</td>

                <td>{formatMoney(invoice.amount)}</td>

                <td>{statusLabel(invoice.status)}</td>

                <td>
                  <button
                    type="button"
                    onClick={() => onDelete(invoice.id)}
                  >
                    🗑 Obriši
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default InvoiceTable;