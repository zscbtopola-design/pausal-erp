function DataTable({ columns, data, actions }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-table">
        Nema podataka za prikaz.
      </div>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}

          {actions && <th>Akcije</th>}
        </tr>
      </thead>

      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            {columns.map((col) => (
              <td key={col.key}>
                {row[col.key] || ""}
              </td>
            ))}

            {actions && (
              <td>
                {actions(row)}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DataTable;