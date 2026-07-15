import client from "../client";

export async function getPurchaseInvoices() {
  const { data } = await client.get("/purchase-invoices");
  return data;
}

export async function getPurchaseInvoice(id) {
  const { data } = await client.get(`/purchase-invoices/${id}`);
  return data;
}

export async function addPurchaseInvoice(invoice) {
  const { data } = await client.post("/purchase-invoices", invoice);
  return data;
}

export async function deletePurchaseInvoice(id) {
  const { data } = await client.delete(`/purchase-invoices/${id}`);
  return data;
}