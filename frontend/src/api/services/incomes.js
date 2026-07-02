import client from "../client";

export async function getIncomes() {
  const { data } = await client.get("/incomes");
  return data;
}

export async function getIncome(id) {
  const { data } = await client.get(`/incomes/${id}`);
  return data;
}

export async function addIncome(income) {
  const { data } = await client.post("/incomes", income);
  return data;
}

export async function updateIncome(id, income) {
  const { data } = await client.put(`/incomes/${id}`, income);
  return data;
}

export async function deleteIncome(id) {
  const { data } = await client.delete(`/incomes/${id}`);
  return data;
}