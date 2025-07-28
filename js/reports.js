document.getElementById("report-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const period = document.getElementById("period").value;
  const rawDate = new Date(document.getElementById("date-input").value);
  const token = localStorage.getItem("token");

  if (!token || isNaN(rawDate)) return;

  let queryDate;

  switch (period) {
    case "day":
      queryDate = rawDate.toISOString().split("T")[0];
      break;
    case "week": {
      const day = rawDate.getDay();
      const diff = rawDate.getDate() - day + (day === 0 ? -6 : 1); // get Monday
      const monday = new Date(rawDate.setDate(diff));
      queryDate = monday.toISOString().split("T")[0];
      break;
    }
    case "month":
      queryDate = `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, "0")}-01`;
      break;
    case "year":
      queryDate = `${rawDate.getFullYear()}-01-01`;
      break;
  }

  const url = `${BASE_URL}/items/sale/stats/total/?range=${period}&date_value=${queryDate}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch report");

    const data = await response.json();
    populateTable(data);
  } catch (err) {
    alert("Error fetching data: " + err.message);
  }
});

function populateTable(sales) {
  const tbody = document.querySelector("#sales-table tbody");
  tbody.innerHTML = "";

  if (!sales.length) {
    tbody.innerHTML = '<tr><td colspan="5">No data found.</td></tr>';
    return;
  }

  for (const sale of sales) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${sale.item_inventory_id}</td>
      <td>${sale.item_name}</td>
      <td>${sale.total_quantity_sold}</td>
      <td>${sale.total_price}</td>
      <td>${sale.sale_date}</td>
    `;
    tbody.appendChild(row);
  }
}
