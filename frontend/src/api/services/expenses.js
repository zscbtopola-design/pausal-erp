import client from "../client";

export async function getExpenses() {
  const { data } = await client.get("/expenses");
  return data;
}

export async function addExpense(expense) {
  const { data } = await client.post("/expenses", expense);
  return data;
}

export async function updateExpense(id, expense) {
  const { data } = await client.put(`/expenses/${id}`, expense);
  return data;
}

export async function deleteExpense(id) {
  const { data } = await client.delete(`/expenses/${id}`);
  return data;
}