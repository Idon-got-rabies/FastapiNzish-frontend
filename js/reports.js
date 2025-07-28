// reports.js
const BASE_URL = window.BASE_URL;
const DateTime = luxon.DateTime;

function getStandardDate(dateStr, period) {
  const date = DateTime.fromISO(dateStr);
  if (!date.isValid) return null;

  switch (period) {
    case "week":
      return date.startOf("week").toISODate();
    case "month":
      return date.startOf("month").toISODate();
    case "year":
      return date.startOf("year").toISODate();
    default:
      return date.toISODate();
  }
}

function fetchData(endpoint, tableId, rowMapper, hideSectionIfEmpty = false) {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
      return res.json();
    })
    .then((data) => {
      const tableBody = document.querySelector(`#${tableId} tbody`);
      tableBody.innerHTML = "";

      if (data.length === 0 || (Object.keys(data).length === 0 && data.constructor === Object)) {
        if (hideSectionIfEmpty) {
          document.getElementById("nosales-section").style.display = "none";
        }
        return;
      }

      if (hideSectionIfEmpty) {
        document.getElementById("nosales-section").style.display = "block";
      }

      const rows = Array.isArray(data) ? data.map(rowMapper) : [rowMapper(data)];
      tableBody.innerHTML = rows.join("");
    })
    .catch((error) => console.error(error));
}

document.getElementById("report-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const dateInput = document.getElementById("date_value").value;
  const period = document.getElementById("range").value;
  const standardizedDate = getStandardDate(dateInput, period);

  if (!standardizedDate) return;

  fetchData(
    `/items/sale/stats/total/?range=${period}&date_value=${standardizedDate}`,
    "total-sales-table",
    (item) => `<tr><td>${item.total_quantity}</td><td>KES ${item.total_revenue}</td></tr>`
  );

  fetchData(
    `/items/sale/stats/nosales/?range=${period}&date_value=${standardizedDate}`,
    "nosales-table",
    (item) => `<tr><td>${item.id}</td><td>${item.name}</td><td>${item.quantity}</td></tr>`,
    true
  );
});
