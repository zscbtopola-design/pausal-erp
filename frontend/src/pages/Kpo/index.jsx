import { useEffect, useMemo, useState } from "react";

import { getKpo } from "../../api/services/kpo";
import { formatDate, formatMoney } from "../../utils/format";

function getYearStart() {
  const year = new Date().getFullYear();
  return `${year}-01-01`;
}

function getYearEnd() {
  const year = new Date().getFullYear();
  return `${year}-12-31`;
}

function Kpo() {
  const [data, setData] = useState(null);
  const [dateFrom, setDateFrom] = useState(getYearStart());
  const [dateTo, setDateTo] = useState(getYearEnd());
  const [loading, setLoading] = useState(true);

  async function loadKpo() {
    try {
      setLoading(true);

      const result = await getKpo({
        companyId: 1,
        dateFrom,
        dateTo,
      });

      setData(result);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Greška pri učitavanju KPO knjige."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadKpo();
  }, []);

  const progressWidth = useMemo(() => {
    const percentage = Number(
      data?.summary?.limit_percentage || 0
    );

    return `${Math.min(percentage, 100)}%`;
  }, [data]);

  function getWarningText() {
    const level = data?.summary?.warning_level;

    if (level === "limit_exceeded") {
      return "Paušalni limit je prekoračen.";
    }

    if (level === "critical") {
      return "Približavate se paušalnom limitu.";
    }

    if (level === "warning") {
      return "Iskorišćeno je više od 80% paušalnog limita.";
    }

    return "Promet je u okviru paušalnog limita.";
  }

  async function handleFilter(event) {
    event.preventDefault();
    await loadKpo();
  }

  if (loading && !data) {
    return <p>Učitavanje KPO knjige...</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <form className="panel" onSubmit={handleFilter}>
        <h2>KPO – Knjiga prihoda</h2>

        <div className="form-grid">
          <div>
            <label>Datum od</label>

            <input
              type="date"
              value={dateFrom}
              onChange={(event) =>
                setDateFrom(event.target.value)
              }
            />
          </div>

          <div>
            <label>Datum do</label>

            <input
              type="date"
              value={dateTo}
              onChange={(event) =>
                setDateTo(event.target.value)
              }
            />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Učitavanje..." : "Primeni filter"}
        </button>
      </form>

      {data && (
        <>
          <div className="cards">
            <div className="card">
              <span>Broj stavki</span>
              <strong>{data.summary.entry_count}</strong>
            </div>

            <div className="card">
              <span>Ukupan prihod</span>
              <strong>
                {formatMoney(data.summary.total_income)}
              </strong>
            </div>

            <div className="card">
              <span>Paušalni limit</span>
              <strong>
                {formatMoney(data.summary.limit_amount)}
              </strong>
            </div>

            <div className="card">
              <span>Preostalo do limita</span>
              <strong>
                {formatMoney(data.summary.remaining_amount)}
              </strong>
            </div>
          </div>

          <div className="panel">
            <h2>Iskorišćenost paušalnog limita</h2>

            <div
              style={{
                width: "100%",
                height: "24px",
                background: "#e5e7eb",
                borderRadius: "999px",
                overflow: "hidden",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: progressWidth,
                  height: "100%",
                  background: "#2563eb",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            <p>
              <strong>
                {data.summary.limit_percentage}%
              </strong>{" "}
              iskorišćenosti
            </p>

            <p>{getWarningText()}</p>
          </div>

          <div className="panel">
            <h2>Stavke KPO knjige</h2>

            <div className="invoice-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>RB</th>
                    <th>Datum</th>
                    <th>Dokument</th>
                    <th>Kupac</th>
                    <th>Opis</th>
                    <th>Način plaćanja</th>
                    <th>Status</th>
                    <th>Iznos</th>
                    <th>Kumulativno</th>
                  </tr>
                </thead>

                <tbody>
                  {data.entries.length === 0 ? (
                    <tr>
                      <td colSpan="9">
                        Nema prihoda u izabranom periodu.
                      </td>
                    </tr>
                  ) : (
                    data.entries.map((entry) => (
                      <tr key={entry.income_id}>
                        <td>{entry.sequence_number}</td>
                        <td>{formatDate(entry.date)}</td>
                        <td>{entry.document_number}</td>
                        <td>{entry.customer_name}</td>
                        <td>{entry.description}</td>
                        <td>{entry.payment_method}</td>
                        <td>{entry.status}</td>
                        <td>{formatMoney(entry.amount)}</td>
                        <td>
                          {formatMoney(entry.running_total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Kpo;