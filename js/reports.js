// reports.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("filter-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const periodSelect = document.getElementById("period");
    const dateInput = document.getElementById("date");

    if (!periodSelect || !dateInput) {
      console.error("Missing form inputs.");
      return;
    }

    const period = periodSelect.value;
    const date = dateInput.value;

    if (!date) {
      alert("Please select a date.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Missing token.");
      return;
    }

    await fetchData("sales", date, period, "sales-table");
    await fetchData("total", date, period, "total-table");
  });
});

async function fetchData(type, date, period, tableId) {
  const token = localStorage.getItem("token");
  const url = `${BASE_URL}/items/sale/${type}/${period}?date=${date}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Fetch failed");

    const data = await response.json();
    populateTable(data, tableId);
  } catch (error) {
    console.error(`Error fetching ${type} data:`, error);
  }
}

function populateTable(data, tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 10;
    cell.textContent = "No data found.";
    return;
  }

  data.forEach((item) => {
    const row = tbody.insertRow();
    Object.values(item).forEach((value) => {
      const cell = row.insertCell();
      cell.textContent = value;
    });
  });
}
