import { useEffect, useState } from "react";

import {
  getCompanies,
  addCompany,
  updateCompany,
} from "../api/services/companies";

function CompanySettings() {
  const [companyId, setCompanyId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    pib: "",
    mb: "",
    address: "",
    limit_amount: 6000000,
  });

  async function loadCompany() {
    try {
      const companies = await getCompanies();

      if (companies.length > 0) {
        const company = companies[0];

        setCompanyId(company.id);

        setForm({
          name: company.name || "",
          pib: company.pib || "",
          mb: company.mb || "",
          address: company.address || "",
          limit_amount: company.limit_amount || 6000000,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadCompany();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "limit_amount"
          ? Number(value)
          : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      if (companyId) {
        await updateCompany(companyId, form);
      } else {
        const company = await addCompany(form);
        setCompanyId(company.id);
      }

      alert("Podaci su uspešno sačuvani.");
    } catch (error) {
      console.error(error);
      alert("Greška prilikom čuvanja.");
    }
  }

  return (
    <div className="panel">
      <h2>Podešavanja firme</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">

          <div>
            <label>Naziv firme</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>PIB</label>
            <input
              name="pib"
              value={form.pib}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Matični broj</label>
            <input
              name="mb"
              value={form.mb}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Adresa</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Paušalni limit</label>
            <input
              type="number"
              name="limit_amount"
              value={form.limit_amount}
              onChange={handleChange}
            />
          </div>

        </div>

        <br />

        <button type="submit">
          Sačuvaj
        </button>

      </form>
    </div>
  );
}

export default CompanySettings;