import { NavLink } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";

function Sidebar() {
  const { user } = useAuth();

  const role = user?.role || "operator";

  const items = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "📊",
      roles: ["admin", "operator", "accountant"],
    },
    {
      path: "/customers",
      label: "Kupci",
      icon: "👥",
      roles: ["admin", "operator", "accountant"],
    },
    {
      path: "/suppliers",
      label: "Dobavljači",
      icon: "🏢",
      roles: ["admin", "operator", "accountant"],
    },
    {
      path: "/incomes",
      label: "Prihodi",
      icon: "💰",
      roles: ["admin", "operator", "accountant"],
    },
    {
      path: "/invoices",
      label: "Fakture",
      icon: "📄",
      roles: ["admin", "operator", "accountant"],
    },
    {
      path: "/expenses",
      label: "Rashodi",
      icon: "💸",
      roles: ["admin", "accountant"],
    },
    {
      path: "/reports",
      label: "Izveštaji",
      icon: "📈",
      roles: ["admin", "accountant"],
    },
    {
      path: "/company-settings",
      label: "Podešavanja firme",
      icon: "🏢",
      roles: ["admin"],
    },
    {
      path: "/settings",
      label: "Podešavanja",
      icon: "⚙️",
      roles: ["admin"],
    },
  ];

  const visibleItems = items.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">P</div>

        <div>
          <strong>PAUŠAL ERP</strong>
          <br />
          <small>{user?.full_name || "Korisnik"}</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;