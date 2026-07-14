import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";

function Header({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="top-header">
      <div>
        <h1>{title}</h1>
        <p>Pregled poslovanja i osnovnih podataka</p>
      </div>

      <div
        className="header-user"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <div style={{ textAlign: "right" }}>
          <strong>
            {user?.full_name || "Nepoznat korisnik"}
          </strong>

          <br />

          <small>
            {user?.role || ""}
          </small>

          <br />

          <small>
            {user?.email || ""}
          </small>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px",
            cursor: "pointer",
          }}
        >
          Odjava
        </button>
      </div>
    </header>
  );
}

export default Header;