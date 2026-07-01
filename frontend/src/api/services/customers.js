import client from "../client";

export async function getCustomers() {
  const { data } = await client.get("/customers");
  return data;
}

export async function addCustomer(customer) {
  const { data } = await client.post("/customers", customer);
  return data;
}

export async function updateCustomer(id, customer) {
  const { data } = await client.put(`/customers/${id}`, customer);
  return data;
}

export async function deleteCustomer(id) {
  const { data } = await client.delete(`/customers/${id}`);
  return data;
}