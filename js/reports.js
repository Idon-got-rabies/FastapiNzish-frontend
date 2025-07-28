const token = localStorage.getItem("token");
const BASE_ENDPOINT = `${BASE_URL}/items`;

let salesData = [], nonsalesData = [];
let salesHeaders = [], nonsalesHeaders = [];
let currentSalesPage = 1, currentNonSalesPage = 1;
const rowsPerPage = 10;

document.getElementById('sales-form').addEventListener('submit', async e => {
  e.preventDefault();
  const period = document.getElementById('sales-period').value;
  const date = document.getElementById('sales-date').value;

  const data = await fetchData('sale/stats/total/', date, period);
  const items = data.items || [];

  salesData = items;
  salesHeaders = items.length ? Object.keys(items[0]) : [];
  renderTable(salesHeaders, salesData, 'results-table');
  renderPagination('sales-pagination', salesData, salesHeaders, 'results-table', 'sales');
});

document.getElementById('nonsales-form').addEventListener('submit', async e => {
  e.preventDefault();
  const period = document.getElementById('nonsales-period').value;
  const date = document.getElementById('nonsales-date').value;

  const data = await fetchData('sale/stats/nosales/', date, period);
  const items = data.items || [];

  nonsalesData = items;
  nonsalesHeaders = items.length ? Object.keys(items[0]) : [];
  renderTable(nonsalesHeaders, nonsalesData, 'results-table');
  renderPagination('nonsales-pagination', nonsalesData, nonsalesHeaders, 'results-table', 'nonsales');
});

document.getElementById('export-sales-btn').addEventListener('click', () => {
  exportToCSV(salesHeaders, salesData, 'sales_report.csv');
});

document.getElementById('export-nonsales-btn').addEventListener('click', () => {
  exportToCSV(nonsalesHeaders, nonsalesData, 'nonsales_report.csv');
});

async function fetchData(endpoint, date, period) {
  try {
    const res = await fetch(`${BASE_ENDPOINT}/${endpoint}?range=${date}&date_value=${period}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  } catch (err) {
    console.error("Fetch failed:", err);
    return { items: [] };
  }
}

function renderTable(headers, data, tableId) {
  const table = document.getElementById(tableId);
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  thead.innerHTML = '';
  tbody.innerHTML = '';

  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="100%">No data to display.</td></tr>';
    return;
  }

  const headRow = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h.replace(/_/g, ' ').toUpperCase();
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);

  const page = tableId.includes('sales') ? currentSalesPage : currentNonSalesPage;
  const pageData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  pageData.forEach(item => {
    const row = document.createElement('tr');
    headers.forEach(h => {
      const td = document.createElement('td');
      td.textContent = item[h];
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
}

function renderPagination(containerId, data, headers, tableId, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  const totalPages = Math.ceil(data.length / rowsPerPage);
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if ((type === 'sales' && i === currentSalesPage) || (type === 'nonsales' && i === currentNonSalesPage)) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      if (type === 'sales') currentSalesPage = i;
      else currentNonSalesPage = i;

      renderTable(headers, data, tableId);
      renderPagination(containerId, data, headers, tableId, type);
    });
    container.appendChild(btn);
  }
}

function exportToCSV(headers, data, filename) {
  if (!headers.length || !data.length) return alert("Nothing to export.");
  const csvContent = [headers.join(',')];
  data.forEach(row => {
    csvContent.push(headers.map(h => row[h]).join(','));
  });
  const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

