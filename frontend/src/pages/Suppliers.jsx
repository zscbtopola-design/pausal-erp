import { useEffect, useState } from "react";
import { getSuppliers, addSupplier, deleteSupplier } from "../api/services/suppliers";
import DataTable from "../components/DataTable/DataTable";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    company_id: 1,
    name: "",
    pib: "",
    address: "",
    email: "",
    phone: "",
  });

  async function loadSuppliers() {
    const data = await getSuppliers();
    setSuppliers(data);
  }

  useEffect(() => {
    loadSuppliers();
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
      alert("Naziv dobavljača je obavezan.");
      return;
    }

    await addSupplier(form);

    setForm({
      company_id: 1,
      name: "",
      pib: "",
      address: "",
      email: "",
      phone: "",
    });

    loadSuppliers();
  }

  async function removeSupplier(id) {
    const ok = confirm("Da li sigurno želiš da obrišeš dobavljača?");
    if (!ok) return;

    await deleteSupplier(id);
    loadSuppliers();
  }

  const filteredSuppliers = suppliers.filter((s) =>
    `${s.name || ""} ${s.pib || ""} ${s.address || ""}`
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
        <h2>Novi dobavljač</h2>

        <form onSubmit={save}>
          <input name="name" placeholder="Naziv" value={form.name} onChange={change} />
          <input name="pib" placeholder="PIB" value={form.pib} onChange={change} />
          <input name="address" placeholder="Adresa" value={form.address} onChange={change} />
          <input name="email" placeholder="Email" value={form.email} onChange={change} />
          <input name="phone" placeholder="Telefon" value={form.phone} onChange={change} />

          <button type="submit">Sačuvaj dobavljača</button>
        </form>
      </div>

      <div className="panel">
        <h2>Spisak dobavljača</h2>

        <input
          placeholder="Pretraga dobavljača..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <DataTable
          columns={columns}
          data={filteredSuppliers}
          actions={(s) => (
            <button onClick={() => removeSupplier(s.id)}>Obriši</button>
          )}
        />
      </div>
    </>
  );
}

export default Suppliers;