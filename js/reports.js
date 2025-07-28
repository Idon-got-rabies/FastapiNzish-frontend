document.addEventListener("DOMContentLoaded", () => {


  const salesForm = document.getElementById("sales-form");
  const nosalesForm = document.getElementById("nosales-form");

  function adjustDate(period, dateStr) {
    const [year, month, day] = dateStr.split("-");
    if (period === "month") return `${year}-${month}-01`;
    if (period === "year") return `${year}-01-01`;
    return dateStr;
  }

  async function fetchAndDisplay(endpoint, tableId, sectionId) {
    const token = localStorage.getItem("token");
    if (!token) return alert("Not authenticated");

    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }

      const data = await res.json();
      const table = document.getElementById(tableId).querySelector("tbody");
      const section = document.getElementById(sectionId);

      table.innerHTML = "";

      if (data.items.length === 0) {
        section.style.display = "none";
        return;
      }

      data.items.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.item_id}</td>
          <td>${item.item_inventory_id}</td>
          <td>${item.item_name}</td>
          <td>${item.total_quantity_sold}</td>
          <td>${item.total_price}</td>
        `;
        table.appendChild(row);
      });

      section.style.display = "block";
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to load data.");
    }
  }

  salesForm.addEventListener("submit", e => {
    e.preventDefault();
    const period = document.getElementById("sales-period").value;
    const rawDate = document.getElementById("sales-date").value;
    if (!rawDate) return;

    const date = adjustDate(period, rawDate);
    const url = `${BASE_URL}/items/sale/stats/total/?range=${period}&date_value=${date}`;
    fetchAndDisplay(url, "sales-table", "sales-section");
  });

  nosalesForm.addEventListener("submit", e => {
    e.preventDefault();
    const period = document.getElementById("nosales-period").value;
    const rawDate = document.getElementById("nosales-date").value;
    if (!rawDate) return;

    const date = adjustDate(period, rawDate);
    const url = `${BASE_URL}/items/sale/stats/none/?range=${period}&date_value=${date}`;
    fetchAndDisplay(url, "nosales-table", "nosales-section");
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
