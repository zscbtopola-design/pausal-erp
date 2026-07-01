const API_URL = "http://127.0.0.1:8000";

// Dashboard
export async function getDashboard(companyId = 1) {
  const res = await fetch(`${API_URL}/dashboard/${companyId}`);
  return res.json();
}

// Kupci
export async function getCustomers() {
  const res = await fetch(`${API_URL}/customers`);
  return res.json();
}

export async function addCustomer(customer) {
  const res = await fetch(`${API_URL}/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  });

  return res.json();
}
export async function deleteCustomer(id) {
  const res = await fetch(`${API_URL}/customers/${id}`, {
    method: "DELETE",
  });

  return res.json();
}