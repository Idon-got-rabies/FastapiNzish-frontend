document.getElementById('sales-form').addEventListener('submit', async e => {
  e.preventDefault();
  const period = document.getElementById('sales-period').value;
  const date = document.getElementById('sales-date').value;

  const data = await fetchData('sale/stats/total/', date, period);
  const items = data.items || [];

  if (items.length > 0) {
    renderTable(Object.keys(items[0]), items);
  } else {
    renderTable([], []);
    alert('No sales data found.');
  }
});

document.getElementById('nosales-form').addEventListener('submit', async e => {
  e.preventDefault();
  const period = document.getElementById('nosales-period').value;
  const date = document.getElementById('nosales-date').value;

  const data = await fetchData('sale/stats/nosales/', date, period);
  const items = data.items || [];

  if (items.length > 0) {
    renderTable(Object.keys(items[0]), items);
  } else {
    renderTable([], []);
    alert('No non-sales data found.');
  }
});

async function fetchData(endpoint, date, period) {
  const token = localStorage.getItem("token");
  const url = `${BASE_URL}/items/${endpoint}${date}?period=${period}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await res.json();
  } catch (err) {
    console.error('Error fetching data:', err);
    return { items: [] };
  }
}

function renderTable(headers, data) {
  const table = document.getElementById('results-table');
  table.innerHTML = '';

  if (headers.length === 0 || data.length === 0) {
    table.innerHTML = '<tr><td colspan="100%">No data to display.</td></tr>';
    return;
  }

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h.replace(/_/g, ' ').toUpperCase();
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(h => {
      const td = document.createElement('td');
      td.textContent = row[h];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  currentTableData = data;
  currentHeaders = headers;
  currentPage = 1;
  renderPagination();
}

document.getElementById('export-btn').addEventListener('click', () => {
  if (!currentTableData.length) return alert("No data to export.");
  const csvContent = [currentHeaders.join(',')];
  currentTableData.forEach(row => {
    csvContent.push(currentHeaders.map(h => row[h]).join(','));
  });

  const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'sales_report.csv';
  link.click();
});

// Pagination
let currentTableData = [];
let currentHeaders = [];
let currentPage = 1;
const rowsPerPage = 10;

function renderPagination() {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  const totalPages = Math.ceil(currentTableData.length / rowsPerPage);
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.style.fontWeight = 'bold';
    btn.addEventListener('click', () => {
      currentPage = i;
      renderPage(currentPage);
      renderPagination();
    });
    paginationContainer.appendChild(btn);
  }
}

function renderPage(page) {
  const table = document.getElementById('results-table');
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const slicedData = currentTableData.slice(start, end);

  const tbody = document.createElement('tbody');
  slicedData.forEach(row => {
    const tr = document.createElement('tr');
    currentHeaders.forEach(h => {
      const td = document.createElement('td');
      td.textContent = row[h];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.querySelector('tbody')?.remove();
  table.appendChild(tbody);
}
