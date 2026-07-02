// Formatiranje novca (RSD)
export function formatMoney(value) {
  const number = Number(value || 0);

  return number.toLocaleString("sr-RS", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " RSD";
}

// Formatiranje brojeva
export function formatNumber(value) {
  return Number(value || 0).toLocaleString("sr-RS");
}

// Formatiranje procenata
export function formatPercent(value) {
  return Number(value || 0).toLocaleString("sr-RS", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " %";
}

// Formatiranje datuma iz YYYY-MM-DD u DD.MM.YYYY.
export function formatDate(date) {
  if (!date) return "";

  const d = new Date(date);

  if (isNaN(d)) return date;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}.${month}.${year}.`;
}

// Formatiranje datuma i vremena
export function formatDateTime(date) {
  if (!date) return "";

  const d = new Date(date);

  if (isNaN(d)) return date;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");

  return `${day}.${month}.${year}. ${hour}:${minute}`;
}