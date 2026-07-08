import { formatMoney } from "../../utils/format";

function InvoiceItems({ items, onItemChange, onAddItem, onRemoveItem }) {
  function itemTotal(item) {
    const quantity = Number(item.quantity || 0);
    const price = Number(item.unit_price || 0);
    const discount = Number(item.discount || 0);

    return quantity * price - discount;
  }

  return (
    <div className="invoice-items">
      <h2>Stavke fakture</h2>

      <table>
        <thead>
          <tr>
            <th>Opis</th>
            <th>Količina</th>
            <th>Cena</th>
            <th>Popust</th>
            <th>Ukupno</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>
                <input
                  placeholder="Opis usluge"
                  value={item.description}
                  onChange={(e) =>
                    onItemChange(index, "description", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    onItemChange(index, "quantity", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) =>
                    onItemChange(index, "unit_price", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  value={item.discount}
                  onChange={(e) =>
                    onItemChange(index, "discount", e.target.value)
                  }
                />
              </td>

              <td>{formatMoney(itemTotal(item))}</td>

              <td>
                <button type="button" onClick={() => onRemoveItem(index)}>
                  Obriši
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button type="button" onClick={onAddItem}>
        ➕ Dodaj stavku
      </button>
    </div>
  );
}

export default InvoiceItems;