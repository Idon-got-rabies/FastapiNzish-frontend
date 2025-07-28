document.addEventListener("DOMContentLoaded", async () => {


  const salesForm = document.getElementById("sales-form");
  const nosalesForm = document.getElementById("nosales-form");

  function adjustDate(period, dateStr) {
    const [year, month, day] = dateStr.split("-");
    if (period === "month") return `${year}-${month}-01`;
    if (period === "year") return `${year}-01-01`;
    return dateStr;
  }

async function fetchAndDisplay(url, tableId) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${url}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();

  // ✅ Check if response is wrapped in `items`
  const items = Array.isArray(data) ? data : data.items;

  if (!Array.isArray(items)) {
    throw new Error("Invalid data format from API.");
  }

  const tableBody = document.querySelector(`#${tableId} tbody`);
  tableBody.innerHTML = "";

  if (items.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "No results found.";
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  for (const item of items) {
    const row = document.createElement("tr");
    Object.values(item).forEach(val => {
      const cell = document.createElement("td");
      cell.textContent = val;
      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  }
}


  salesForm.addEventListener("submit", async e => {
    e.preventDefault();
    const period = document.getElementById("sales-period").value;
    const rawDate = document.getElementById("sales-date").value;
    if (!rawDate) return;

    const date = adjustDate(period, rawDate);
    const url = `${BASE_URL}/items/sale/?range=${period}&date_value=${date}`;
    await fetchAndDisplay(url, "sales-table", "sales-section");
  });

  nosalesForm.addEventListener("submit", async e => {
    e.preventDefault();
    const period = document.getElementById("nosales-period").value;
    const rawDate = document.getElementById("nosales-date").value;
    if (!rawDate) return;

    const date = adjustDate(period, rawDate);
    const url = `${BASE_URL}/items/sale/none/?range=${period}&date_value=${date}`;
    await fetchAndDisplay(url, "nosales-table", "nosales-section");
  });

  // Optional logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    });
  }
});
