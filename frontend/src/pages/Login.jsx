import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectPath = location.state?.from || "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Unesite e-mail i lozinku.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await login(
        form.email.trim().toLowerCase(),
        form.password
      );

      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Prijava nije uspela."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f4f6",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "12px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginTop: 0 }}>PAUŠAL ERP</h1>
        <p style={{ color: "#666" }}>
          Prijavite se na svoj nalog.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label>E-mail</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="admin@pausal.rs"
              style={{
                width: "100%",
                marginTop: "6px",
                padding: "12px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label>Lozinka</label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder="Unesite lozinku"
              style={{
                width: "100%",
                marginTop: "6px",
                padding: "12px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Prijavljivanje..." : "Prijavi se"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;