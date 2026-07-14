import { createContext, useContext, useState } from "react";

import {
  getStoredUser,
  getToken,
  loginUser,
  logoutUser,
} from "./authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getToken());

  async function login(email, password) {
    const data = await loginUser(email, password);

    setUser(data.user);
    setToken(data.access_token);

    return data;
  }

  function logout() {
    logoutUser();
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth mora biti unutar AuthProvider komponente.");
  }

  return context;
}