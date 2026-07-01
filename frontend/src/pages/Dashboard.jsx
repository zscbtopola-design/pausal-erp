import { useEffect, useState } from "react";
import { getDashboard, getCustomers } from "../services/api";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    async function load() {
      setDashboard(await getDashboard(1));
      setCustomers(await getCustomers());
    }

    load();
  }, []);

  function money(value) {
    return Number(value || 0).toLocaleString("sr-RS") + " RSD";
  }

  return (
    <>
      <h1>Dashboard</h1>

      <div className="cards">
        <div className="card">
          <span>Ukupni prihodi</span>
          <strong>{money(dashboard?.total_income)}</strong>
        </div>

        <div className="card">
          <span>Ukupni rashodi</span>
          <strong>{money(dashboard?.total_expense)}</strong>
        </div>

        <div className="card">
          <span>Dobit</span>
          <strong>{money(dashboard?.profit)}</strong>
        </div>

        <div className="card">
          <span>Iskorišćen limit</span>
          <strong>{dashboard?.used_percent ?? 0}%</strong>
        </div>
      </div>

      <section className="panel">
        <h2>Kupci</h2>

        <table>
          <thead>
            <tr>
              <th>Naziv</th>
              <th>PIB</th>
              <th>Adresa</th>
              <th>Email</th>
              <th>Telefon</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.pib}</td>
                <td>{c.address}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

export default Dashboard;