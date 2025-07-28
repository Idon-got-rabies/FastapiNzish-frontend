// reports.js
const { DateTime } = luxon;

document.getElementById("report-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) return alert("Not authenticated");

  const period = document.getElementById("period").value;
  const inputDate = document.getElementById("date").value;
  if (!inputDate) return alert("Please select a valid date");

  const date = DateTime.fromISO(inputDate);
  let queryDate;

  switch (period) {
    case "day":
      queryDate = date.toISODate();
      break;
    case "week":
      queryDate = date.startOf("week").toISODate();
      break;
    case "month":
      queryDate = date.startOf("month").toISODate();
      break;
    case "year":
      queryDate = date.startOf("year").toISODate();
      break;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  try {
    const totalRes = await fetch(`${BASE_URL}/items/sale/total?range=${period}&date_value=${queryDate}`, {
      headers,
    });
    const totalData = await totalRes.json();

    const totalTable = document.querySelector("#totals-table tbody");
    totalTable.innerHTML = "";
    for (const [key, value] of Object.entries(totalData)) {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${key}</td><td>${value}</td>`;
      totalTable.appendChild(row);
    }

    const nosalesRes = await fetch(`${BASE_URL}/items/sale/none?range=${period}&date_value=${queryDate}`, {
      headers,
    });
    const nosalesData = await nosalesRes.json();

    const nosalesSection = document.getElementById("nosales-section");
    const nosalesTable = document.querySelector("#nosales-table tbody");
    nosalesTable.innerHTML = "";

    if (nosalesData.length === 0) {
      nosalesSection.style.display = "none";
    } else {
      nosalesSection.style.display = "block";
      nosalesData.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${item.id}</td><td>${item.name}</td><td>${item.quantity}</td>`;
        nosalesTable.appendChild(row);
      });
    }
  } catch (err) {
    console.error("Failed to fetch report data:", err);
    alert("An error occurred while fetching data.");
  }
});
