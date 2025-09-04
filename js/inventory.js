document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  checkAuth(true);


  document.getElementById("fetch-no-sales").addEventListener("click", () => {
      showLoader();
  authCheck(`${BASE_URL}/items/inventory/search/lowstock?filter_quantity=0`)
  .then(res => {
    if (!res?.ok) throw new Error("Failed to fetch no-sales items");
    return res.json();
  })
  .then(data => {
    const tbody = document.querySelector("#nosales-table tbody");
    tbody.innerHTML = "";
    data.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.item_id}</td>
        <td>${item.item_name}</td>
        <td>${item.item_quantity}</td>
   
      `;
      tbody.appendChild(row);
    });
    document.getElementById("nosales-section").style.display = "block";
  })
  .catch(err => console.error(err));
  hideLoader();

  });



  const ITEMS_PER_PAGE = 10;
  let currentPage = 1;
  let allItems = [];

  const tableBody = document.querySelector("#inventory-table tbody");
  const paginationControls = document.getElementById("pagination-controls");

  function fetchInventory() {
      authCheck(`${BASE_URL}/items/inventory/`)
      .then(res => {
        if (!res?.ok) throw new Error("Failed to fetch inventory");
        return res.json();
      })
      .then(data => {
        allItems = data;
        renderPage(currentPage);
        setupPagination();
      })
      .catch(error => {
        console.error("Error loading inventory:", error);
      })
  }

  function renderPage(page) {
    tableBody.innerHTML = "";
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const items = allItems.slice(start, end);
    let totalres = {};

    authCheck(`${BASE_URL}/items/inventory/total/stock/`)
    .then(res => {
        if (!res?.ok) throw new Error("Failed to fetch inventory");
        return res.json();
    })
    .then(data => {
        const total = document.getElementById("inventory-table-result-box");
        total.innerHTML = `<p>Total stock: ${data.total_stock} items <br> Net worth: ${data.net_worth.toLocaleString()} KSH</p>`;
    })
    .catch(error => {
        console.error("Error loading inventory:", error);
    });
    console.log(totalres)



    items.forEach(item => {
      const row = document.createElement("tr");
      if (item.item_quantity < 1) {
        row.classList.add("low-stock");
      }

      row.innerHTML = `
        <td>${item.item_id}</td>
        <td>${item.item_name}</td>
        <td>${item.item_quantity}</td>
        <td>${item.item_price}</td>
      `;

      tableBody.appendChild(row);
    });
  }

  function setupPagination() {
    const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
    paginationControls.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.classList.add("page-btn");
      if (i === currentPage) btn.classList.add("active");

      btn.addEventListener("click", () => {
        currentPage = i;
        renderPage(i);
        setupPagination();
      });

      paginationControls.appendChild(btn);
    }
  }

  fetchInventory();


});

async function updateItemField(itemId, field, newValue) {
  const token = localStorage.getItem("token");
  let endpoint;

  if (field === "item_name") {
    endpoint = `${BASE_URL}/items/inventory/name/up${itemId}`;
  }else if (field === "item_quantity") {
    endpoint = `${BASE_URL}/items/inventory/quantity/up${itemId}`;
  }else if (field === "item_price") {
    endpoint = `${BASE_URL}/items/inventory/price/up${itemId}`;
  } else {
    console.error("Invalid field");
    return;
  }

  const payload = {};
  payload[field] = newValue;
  console.log("Payload:", payload);            // Should show { item_quantity: 10 }
  console.log("Type of value:", typeof payload[field]); // Should show 'number'

  try {
    const res = await authCheck(endpoint,{
        method: "PUT",
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!res?.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Update failed");
    }

    const updated = await res.json();
    alert(`${field} updated successfully.`);
    return updated;

  } catch (err) {
    console.error("Error updating item:", err);
    alert(`Failed to update ${field}: ${err.message}`);
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  const updateQuantityForm = document.getElementById("update-quantity-form");

  if (updateQuantityForm) {
    updateQuantityForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const itemId = document.getElementById("update-quantity-item-id").value.trim();
      const rawValue = document.getElementById("update-quantity-quantity").value.trim();
      const field = "item_quantity";

      if (!itemId || !rawValue){
        alert("Please fill in all fields");
        return;
      }

      const newValue = parseInt(rawValue, 10);

      if (isNaN(newValue)) {
        alert("Quantity must be a number.");
        return;
      }
      await updateItemField(itemId, field, newValue);

      updateQuantityForm.reset();


      const ITEMS_PER_PAGE = 10;
      const token = localStorage.getItem("token");
      let currentPage = 1;
      let allItems = [];

      const tableBody = document.querySelector("#inventory-table tbody");
      const paginationControls = document.getElementById("pagination-controls");

      function fetchInventory() {
          authCheck(`${BASE_URL}/items/inventory/`)
          .then(res => {
            if (!res?.ok) throw new Error("Failed to fetch inventory");
            return res.json();
          })
          .then(data => {
            allItems = data;
            renderPage(currentPage);
            setupPagination();
          })
          .catch(error => {
            console.error("Error loading inventory:", error);
          });
      }

      function renderPage(page) {
        tableBody.innerHTML = "";
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const items = allItems.slice(start, end);

        authCheck(`${BASE_URL}/items/inventory/total/stock/`)
        .then(res => {
            if (!res?.ok) throw new Error("Failed to fetch inventory");
            return res.json();
        })
        .then(data => {
            const total = document.getElementById("inventory-table-result-box");
            total.innerHTML = `<p>Total stock: ${data.total_stock} items <br> Net worth: ${data.net_worth.toLocaleString()} KSH</p>`;
        })
        .catch(error => {
            console.error("Error loading inventory:", error);
        });
        console.log(totalres)

        items.forEach(item => {
          const row = document.createElement("tr");
          if (item.item_quantity < 1) {
            row.classList.add("low-stock");
          }

          row.innerHTML = `
            <td>${item.item_id}</td>
            <td>${item.item_name}</td>
            <td>${item.item_quantity}</td>
            <td>${item.item_price}</td>
          `;

          tableBody.appendChild(row);
        });
      }

      function setupPagination() {
        const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
        paginationControls.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
          const btn = document.createElement("button");
          btn.textContent = i;
          btn.classList.add("page-btn");
          if (i === currentPage) btn.classList.add("active");

          btn.addEventListener("click", () => {
            currentPage = i;
            renderPage(i);
            setupPagination();
          });

          paginationControls.appendChild(btn);
        }
      }

      fetchInventory();



    });
  }

});

document.addEventListener("DOMContentLoaded", () => {
  const updateForm = document.getElementById("update-form");

  if (updateForm) {
    updateForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const itemId = document.getElementById("update-item-id").value.trim();
      const field = document.getElementById("update-field").value;
      const rawValue = document.getElementById("update-new-value").value.trim();

      if (!itemId || !field || !rawValue) {
        alert("Please fill in all fields.");
        return;
      }

      let newValue = rawValue;

      // Convert to appropriate type if needed
      if (field === "quantity") {
        newValue = parseInt(rawValue);
        if (isNaN(newValue)) return alert("Quantity must be a number.");
      } else if (field === "price") {
        newValue = parseInt(rawValue);
        if (isNaN(newValue)) return alert("Price must be a number.");
      }

      await updateItemField(itemId, field, newValue);

      updateForm.reset();

      const ITEMS_PER_PAGE = 10;
      const token = localStorage.getItem("token");
      let currentPage = 1;
      let allItems = [];

      const tableBody = document.querySelector("#inventory-table tbody");
      const paginationControls = document.getElementById("pagination-controls");

      function fetchInventory() {
          authCheck(`${BASE_URL}/items/inventory/`)
          .then(res => {
            if (!res?.ok) throw new Error("Failed to fetch inventory");
            return res.json();
          })
          .then(data => {
            allItems = data;
            renderPage(currentPage);
            setupPagination();
          })
          .catch(error => {
            console.error("Error loading inventory:", error);
          });
      }

      function renderPage(page) {
        tableBody.innerHTML = "";
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const items = allItems.slice(start, end);

        authCheck(`${BASE_URL}/items/inventory/total/stock/`)
        .then(res => {
            if (!res?.ok) throw new Error("Failed to fetch inventory");
            return res.json();
        })
        .then(data => {
            const total = document.getElementById("inventory-table-result-box");
            total.innerHTML = `<p>Total stock: ${data.total_stock} items <br> Net worth: ${data.net_worth.toLocaleString()} KSH</p>`;
        })
        .catch(error => {
            console.error("Error loading inventory:", error);
        });
             

        items.forEach(item => {
          const row = document.createElement("tr");
          if (item.item_quantity < 1) {
            row.classList.add("low-stock");
          }

          row.innerHTML = `
            <td>${item.item_id}</td>
            <td>${item.item_name}</td>
            <td>${item.item_quantity}</td>
            <td>${item.item_price}</td>
          `;

          tableBody.appendChild(row);
        });
      }

      function setupPagination() {
        const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
        paginationControls.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
          const btn = document.createElement("button");
          btn.textContent = i;
          btn.classList.add("page-btn");
          if (i === currentPage) btn.classList.add("active");

          btn.addEventListener("click", () => {
            currentPage = i;
            renderPage(i);
            setupPagination();
          });

          paginationControls.appendChild(btn);
        }
      }

      fetchInventory();



    });


  }

});

document.addEventListener("click", function (event) {
  const button = document.getElementById("fetch-no-sales");
  const section = document.getElementById("nosales-section");

  // If the click is on the button OR inside the section, do nothing
  if (button.contains(event.target) || section.contains(event.target)) {
    return;
  }

  // Else, hide the section
  section.style.display = "none";
});

