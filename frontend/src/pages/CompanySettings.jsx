import { useEffect, useState } from "react";

import {
  getCompanies,
  addCompany,
  updateCompany,
  uploadCompanyLogo,
} from "../api/services/companies";

function CompanySettings() {
  const [companyId, setCompanyId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    pib: "",
    mb: "",
    address: "",
    phone: "",
    email: "",
    bank_name: "",
    bank_account: "",
    logo_path: "",
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
          phone: company.phone || "",
          email: company.email || "",
          bank_name: company.bank_name || "",
          bank_account: company.bank_account || "",
          logo_path: company.logo_path || "",
          limit_amount: company.limit_amount || 6000000,
        });
      }
    } catch (error) {
      console.error(error);
      alert("Greška pri učitavanju podataka firme.");
    }
  }

  useEffect(() => {
    loadCompany();
  }, []);

  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

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

  function handleLogoChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Dozvoljeni formati su PNG, JPG, JPEG i WEBP.");
      event.target.value = "";
      return;
    }

    const maximumSize = 2 * 1024 * 1024;

    if (file.size > maximumSize) {
      alert("Logo ne sme biti veći od 2 MB.");
      event.target.value = "";
      return;
    }

    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Naziv firme je obavezan.");
      return;
    }

    try {
      setSaving(true);

      if (companyId) {
        const updatedCompany = await updateCompany(
          companyId,
          form
        );

        setForm((previous) => ({
          ...previous,
          logo_path: updatedCompany.logo_path || "",
        }));
      } else {
        const company = await addCompany(form);

        setCompanyId(company.id);

        setForm((previous) => ({
          ...previous,
          logo_path: company.logo_path || "",
        }));
      }

      alert("Podaci firme su uspešno sačuvani.");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Greška prilikom čuvanja podataka firme."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload() {
    if (!companyId) {
      alert("Prvo sačuvajte podatke firme.");
      return;
    }

    if (!logoFile) {
      alert("Izaberite sliku logotipa.");
      return;
    }

    try {
      setUploadingLogo(true);

      const updatedCompany = await uploadCompanyLogo(
        companyId,
        logoFile
      );

      setForm((previous) => ({
        ...previous,
        logo_path: updatedCompany.logo_path || "",
      }));

      setLogoFile(null);

      alert("Logotip je uspešno sačuvan.");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Greška pri uploadu logotipa."
      );
    } finally {
      setUploadingLogo(false);
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
              placeholder="Naziv firme"
            />
          </div>

          <div>
            <label>PIB</label>

            <input
              name="pib"
              value={form.pib}
              onChange={handleChange}
              placeholder="PIB"
            />
          </div>

          <div>
            <label>Matični broj</label>

            <input
              name="mb"
              value={form.mb}
              onChange={handleChange}
              placeholder="Matični broj"
            />
          </div>

          <div>
            <label>Adresa</label>

            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Adresa"
            />
          </div>

          <div>
            <label>Telefon</label>

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Telefon"
            />
          </div>

          <div>
            <label>E-mail</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="E-mail"
            />
          </div>

          <div>
            <label>Banka</label>

            <input
              name="bank_name"
              value={form.bank_name}
              onChange={handleChange}
              placeholder="Naziv banke"
            />
          </div>

          <div>
            <label>Broj računa</label>

            <input
              name="bank_account"
              value={form.bank_account}
              onChange={handleChange}
              placeholder="Broj računa"
            />
          </div>

          <div>
            <label>Paušalni limit</label>

            <input
              type="number"
              name="limit_amount"
              value={form.limit_amount}
              onChange={handleChange}
              min="0"
              step="1"
            />
          </div>
        </div>

        <br />

        <button type="submit" disabled={saving}>
          {saving
            ? "Čuvanje..."
            : "Sačuvaj podatke firme"}
        </button>
      </form>

      <hr />

      <div>
        <h3>Logotip firme</h3>

        <input
          type="file"
          accept=".png,.jpg,.jpeg,.webp"
          onChange={handleLogoChange}
        />

        {logoPreview && (
          <div style={{ marginTop: "15px" }}>
            <p>Pregled novog logotipa:</p>

            <img
              src={logoPreview}
              alt="Pregled logotipa"
              style={{
                maxWidth: "220px",
                maxHeight: "120px",
                objectFit: "contain",
                border: "1px solid #ddd",
                padding: "8px",
                borderRadius: "6px",
              }}
            />
          </div>
        )}

        {form.logo_path && !logoPreview && (
          <p style={{ marginTop: "12px" }}>
            Logotip je već sačuvan.
          </p>
        )}

        <br />
        <br />

        <button
          type="button"
          onClick={handleLogoUpload}
          disabled={uploadingLogo || !logoFile}
        >
          {uploadingLogo
            ? "Upload u toku..."
            : "Sačuvaj logotip"}
        </button>
      </div>
    </div>
  );
}

export default CompanySettings;