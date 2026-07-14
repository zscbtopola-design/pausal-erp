import client from "../api/client";

const TOKEN_KEY = "pausal_erp_token";
const USER_KEY = "pausal_erp_user";

export async function loginUser(email, password) {
  const { data } = await client.post("/users/login", {
    email,
    password,
  });

  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  return data;
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken());
}