document.addEventListener("DOMContentLoaded", () => {

    checkAuth(false)
    const isAdmin = localStorage.getItem("is_admin") === "true";
    const token = localStorage.getItem("token");




    if (isAdmin) {
        document.getElementById("create-item-section").style.display = "block";
        document.getElementById("view-item-sold-section").style.display = "block";
        document.getElementById("inventory-dash-button").addEventListener("click", (event) => {
            window.location.href = "../inventory.html";
        })

    }

    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "../login.html";
    });
    document.getElementById("Dashboard-dash-button").addEventListener("click", (event) => {
       window.location.href = "../dashboard.html";
    });
    document.getElementById("reports-dash-button").addEventListener("click", (event) => {
        window.location.href = "../reports.html";
    })

    const form = document.getElementById("sale-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const itemId = document.getElementById("sale-item-id").value;
        const quantity = document.getElementById("sale-quantity").value;

        try {
            showLoader(`loader-view-sales`)
            const res = await authCheck(`${BASE_URL}/items/sale/`, {
                method: "POST",
                headers: {
                    "content-Type": "application/json"
                },
                body: JSON.stringify({ item_id: itemId, item_quantity: Number(quantity) })
            });
            const data = await res.json();

            if (!res?.ok) throw new Error(data.detail || "Sale failed");

            alert("Sale successful!");
        } catch (err) {
            alert(`Error: ${err.message}`);
        }finally {
            hideLoader(`loader-view-sales`);
        }
        form.reset();
    });

    document.getElementById("search-btn").addEventListener("click", async () => {
        const query = document.getElementById("search-query").value;

        const url = `${BASE_URL}/items/inventory/search?query=${encodeURIComponent(query)}`;

        try {
            showLoader();
            const res = await authCheck(url)
            const data = await res.json();
            console.log("Search result:", data);

            if (!res?.ok) throw new Error(data.detail || "Search failed");

            const results = document.getElementById("inventory-results");



            if (Array.isArray(data)){
                if (data.length === 0){
                    results.innerHtml = "<p>No items found</p>"
                }else{
                    results.innerHTML = data.map(item =>
                     `<p>${item.item_name} — Qty: ${item.item_quantity} Price: ${item.item_price} Item id: ${item.item_id}</p>`
                    ).join("");
                }

            }else {
                results.innerHTML =  `<p>${data.item_name} — Qty: ${data.item_quantity} Price: ${data.item_price} Item id: ${data.item_id}</p>`;

            }





        } catch (err) {
            alert(`Error: ${err.message}`);
        }finally {
            hideLoader();
        }

    });

    if (isAdmin) {
        const form = document.getElementById("create-item-form")
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("new-name").value;
            const quantity = document.getElementById("new-quantity").value;
            const price = document.getElementById("new-price").value;

            try {
                showLoader();
                const res = await authCheck(`${BASE_URL}/items/inventory/`, {
                    method: "POST",
                    headers: {
                        "content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        item_name: String(name),
                        item_quantity: Number(quantity),
                        item_price: Number(price)
                    })
                });

                const data = await res.json();
                if (!res?.ok) throw new Error(data.detail || "Create failed");

                alert(`Item created! Item id: ${data.item_id}`);
            } catch (err) {
                alert(`Error: ${err.message}`);
            }finally {
                hideLoader();
            }
            form.reset();
        });

        document.getElementById("view-sales-btn").addEventListener("click", async () => {
            try {

                const res = await authCheck(`${BASE_URL}/items/sale/`)
                const data = await res.json();

                if (!res?.ok) throw new Error(data.detail || "Could not fetch sales");

                const sales = data.items;

                if (!Array.isArray(sales)) throw new Error("sales data is not an array");

                const output = sales.map(sale=>
                `<tr>
                    <td>${sale.item_inventory_id}</td>
                    <td>${sale.item_name}</td>
                    <td>${sale.total_quantity_sold}</td>            
                    <td>${sale.total_price}</td>        
                </tr>`
                ).join("");

                document.getElementById("sales-data").innerHTML = output;
            } catch (err) {
                alert(`Error: ${err.message}`);
            }finally {

            }
        });
    }
});

async function showSales(period) {
    const token = localStorage.getItem("token");
    if (!token) return;

    const today = new Date();
    const offset_date = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
    const now = offset_date.toISOString().split("T")[0]; // YYYY-MM-DD
    const url = `${BASE_URL}/items/sale/stats/allsales/?range=${period}&date_value=${now}`;
    const url2 = `${BASE_URL}/items/sale/stats/total/?range=${period}&date_value=${now}`;

    try {
        showLoader();
        const res = await authCheck(url)
        const result = await authCheck(url2)
        const totalSales = await result.json();
        if (!result.ok) throw new Error(totalSales.detail || "Failed to load total sales");

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to load sales data");

        // Hide all subsections
        document.querySelectorAll('.sales-subsection').forEach(div => div.classList.add('hidden'));

        // Show the correct one
        const tableId = `sales-${period}`;
        const bodyId = `sales-${period}-body`;
        const earningsId = `${period}-total-sales`
        document.getElementById(tableId).classList.remove("hidden");

        const showTotalearnings = document.getElementById(earningsId);
        showTotalearnings.innerHTML = `<p>Gross sales: ${totalSales.total_sales}</p>`;
        const tbody = document.getElementById(bodyId);
        tbody.innerHTML = data.items.map(sale => `
            <tr>
                <td>${sale.item_inventory_id}</td>
                <td>${sale.item_name}</td>
                <td>${sale.total_quantity_sold}</td>
                <td>${sale.total_price}</td>
            </tr>
        `).join("");

    } catch (err) {
        alert(`Error: ${err.message}`);
    }finally {
        hideLoader();
    }
}



