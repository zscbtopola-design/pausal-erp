import { useEffect, useState } from "react";

import {
  getPurchaseInvoices,
  deletePurchaseInvoice,
} from "../api/services/purchaseInvoices";

import { getSuppliers } from "../api/services/suppliers";
import { formatDate, formatMoney } from "../utils/format";

import PurchaseInvoiceForm from "./PurchaseInvoices/PurchaseInvoiceForm";

function PurchaseInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [invoiceData, supplierData] = await Promise.all([
        getPurchaseInvoices(),
        getSuppliers(),
      ]);

      setInvoices(invoiceData);
      setSuppliers(supplierData);
    } catch (error) {
      console.error(error);
      alert("Greška pri učitavanju ulaznih faktura.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Da li želite da obrišete ulaznu fakturu?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deletePurchaseInvoice(id);
      await loadData();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Greška pri brisanju ulazne fakture."
      );
    }
  }

  function getSupplierName(supplierId) {
    const supplier = suppliers.find(
      (item) => Number(item.id) === Number(supplierId)
    );

    return supplier?.name || "";
  }

  if (loading) {
    return <p>Učitavanje...</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <PurchaseInvoiceForm onSaved={loadData} />

      <div className="panel">
        <h2>Ulazne fakture</h2>

        <div className="invoice-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Broj</th>
                <th>Datum</th>
                <th>Dobavljač</th>
                <th>Datum dospeća</th>
                <th>Iznos</th>
                <th>Status</th>
                <th>Akcija</th>
              </tr>
            </thead>

            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    Nema ulaznih faktura.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.invoice_number}</td>

                    <td>
                      {formatDate(invoice.invoice_date)}
                    </td>

                    <td>
                      {getSupplierName(invoice.supplier_id)}
                    </td>

                    <td>
                      {invoice.due_date
                        ? formatDate(invoice.due_date)
                        : ""}
                    </td>

                    <td>{formatMoney(invoice.amount)}</td>

                    <td>{invoice.status}</td>

                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(invoice.id)
                        }
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

export default PurchaseInvoices;