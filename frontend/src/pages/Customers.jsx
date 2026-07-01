import { useEffect, useState } from "react";
import { getCustomers, addCustomer, deleteCustomer } from "../services/api";
import DataTable from "../components/DataTable/DataTable";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    company_id: 1,
    name: "",
    pib: "",
    address: "",
    email: "",
    phone: "",
  });

  async function loadCustomers() {
    const data = await getCustomers();
    setCustomers(data);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function change(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function save(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Naziv kupca je obavezan.");
      return;
    }

    await addCustomer(form);

    setForm({
      company_id: 1,
      name: "",
      pib: "",
      address: "",
      email: "",
      phone: "",
    });

    loadCustomers();
  }

  async function removeCustomer(id) {
    const ok = confirm("Da li sigurno želiš da obrišeš kupca?");

    if (!ok) return;

    await deleteCustomer(id);
    loadCustomers();
  }

  const filteredCustomers = customers.filter((c) =>
    `${c.name || ""} ${c.pib || ""} ${c.address || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const columns = [
    { key: "name", label: "Naziv" },
    { key: "pib", label: "PIB" },
    { key: "address", label: "Adresa" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Telefon" },
  ];

  return (
    <>
      <div className="panel">
        <h2>Novi kupac</h2>

        <form onSubmit={save}>
          <input
            name="name"
            placeholder="Naziv"
            value={form.name}
            onChange={change}
          />

          <input
            name="pib"
            placeholder="PIB"
            value={form.pib}
            onChange={change}
          />

          <input
            name="address"
            placeholder="Adresa"
            value={form.address}
            onChange={change}
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={change}
          />

          <input
            name="phone"
            placeholder="Telefon"
            value={form.phone}
            onChange={change}
          />

          <button type="submit">Sačuvaj kupca</button>
        </form>
      </div>

      <div className="panel">
        <h2>Spisak kupaca</h2>

        <input
          placeholder="Pretraga kupaca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <DataTable
          columns={columns}
          data={filteredCustomers}
          actions={(c) => (
            <button onClick={() => removeCustomer(c.id)}>Obriši</button>
          )}
        />
      </div>
    </>
  );
}

export default Customers;