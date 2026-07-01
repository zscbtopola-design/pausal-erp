import { NavLink } from "react-router-dom";

function Sidebar() {
  const items = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/customers", label: "Kupci", icon: "👥" },
    { path: "/suppliers", label: "Dobavljači", icon: "🏢" },
    { path: "/incomes", label: "Prihodi", icon: "💰" },
    { path: "/expenses", label: "Rashodi", icon: "💸" },
    { path: "/reports", label: "Izveštaji", icon: "📄" },
    { path: "/settings", label: "Podešavanja", icon: "⚙️" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">P</div>
        <div>
          <strong>PAUŠAL ERP</strong>
          <small>Srbija</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => (isActive ? "active" : "")}
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