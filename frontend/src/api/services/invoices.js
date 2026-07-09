import client from "../client";

export async function getInvoices() {
  const { data } = await client.get("/invoices");
  return data;
}

export async function getInvoice(id) {
  const { data } = await client.get(`/invoices/${id}`);
  return data;
}

export async function addInvoice(invoice) {
  const { data } = await client.post("/invoices", invoice);
  return data;
}

export async function deleteInvoice(id) {
  const { data } = await client.delete(`/invoices/${id}`);
  return data;
}