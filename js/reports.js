


function adjustDateInput() {
  document.getElementById("dateInput").style.display = "none";
  document.getElementById("monthInput").style.display = "none";
  document.getElementById("yearInput").style.display = "none";

  const period = document.getElementById("period").value;
  if (period === "day") document.getElementById("dateInput").style.display = "inline";
  else if (period === "month") document.getElementById("monthInput").style.display = "inline";
  else if (period === "year") document.getElementById("yearInput").style.display = "inline";
}

function getDateValue(period) {
  if (period === "day") return document.getElementById("dateInput").value;
  if (period === "month") return document.getElementById("monthInput").value;
  if (period === "year") return document.getElementById("yearInput").value;
}

document.getElementById("reportForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  await fetchAndDisplay();
});

async function fetchAndDisplay() {
  const type = document.getElementById("reportType").value;
  const period = document.getElementById("period").value;
  const date = getDateValue(period);

  const token = localStorage.getItem("token");
  if (!token) return;

  const endpoint = `${BASE_URL}items/sale/stats/${type}/?range=${period}&date_value=${date}`;

  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const table = document.getElementById("reportTable");
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");
    thead.innerHTML = "";
    tbody.innerHTML = "";

    if (type === "allsales" && Array.isArray(data.items)) {
      thead.innerHTML = "<tr><th>Item ID</th><th>Item Name</th><th>Quantity Sold</th><th>Total Price</th></tr>";
      data.items.forEach(({ item_inventory_id, item_name, total_quantity_sold, total_price }) => {
        const row = `<tr><td>${item_inventory_id}</td><td>${item_name}</td><td>${total_quantity_sold}</td><td>${total_price}</td></tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
      });
    } else if (type === "none" && Array.isArray(data)) {
      thead.innerHTML = "<tr><th>Item ID</th><th>Item Name</th></tr>";
      data.forEach(({ item_id, item_name }) => {
        const row = `<tr><td>${item_id}</td><td>${item_name}</td></tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
      });
    } else {
      throw new Error("Invalid data format from API.");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

function exportTableToCSV() {
  const table = document.getElementById("reportTable");
  const rows = table.querySelectorAll("tr");
  const csv = Array.from(rows).map(row =>
    Array.from(row.children).map(cell => `"${cell.innerText}"`).join(",")
  ).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "report.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
