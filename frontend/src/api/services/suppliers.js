import client from "../client";

export async function getSuppliers() {
  const { data } = await client.get("/suppliers");
  return data;
}

export async function addSupplier(supplier) {
  const { data } = await client.post("/suppliers", supplier);
  return data;
}

export async function updateSupplier(id, supplier) {
  const { data } = await client.put(`/suppliers/${id}`, supplier);
  return data;
}

export async function deleteSupplier(id) {
  const { data } = await client.delete(`/suppliers/${id}`);
  return data;
}