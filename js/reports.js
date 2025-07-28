

function formatDateToPeriodStart(date, period) {
  const d = new Date(date);
  if (period === 'week') {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when Sunday
    d.setDate(diff);
  } else if (period === 'month') {
    d.setDate(1);
  } else if (period === 'year') {
    d.setMonth(0);
    d.setDate(1);
  }
  return d.toISOString().split('T')[0];
}

async function fetchData(endpoint, date, period) {
  const token = localStorage.getItem('token');
  if (!token) return;

  const startDate = formatDateToPeriodStart(date, period);
  const url = `${BASE_URL}/items/${endpoint}?range=${startDate}&date_value=${period}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    alert('Error fetching data.');
    return [];
  }

  return response.json();
}

function renderTable(headers, data) {
  const headerRow = document.getElementById('results-header');
  const body = document.getElementById('results-body');

  headerRow.innerHTML = '';
  body.innerHTML = '';

  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });

  data.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(header => {
      const td = document.createElement('td');
      td.textContent = row[header] ?? '';
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });
}

document.getElementById('sales-form').addEventListener('submit', async e => {
  e.preventDefault();
  const period = document.getElementById('sales-period').value;
  const date = document.getElementById('sales-date').value;
  const data = await fetchData('sale/stats/total/', date, period);

  if (data.length > 0) {
    renderTable(Object.keys(data[0]), data);
  } else {
    renderTable([], []);
    alert('No sales data found.');
  }
});

document.getElementById('nonsales-form').addEventListener('submit', async e => {
  e.preventDefault();
  const period = document.getElementById('nonsales-period').value;
  const date = document.getElementById('nonsales-date').value;
  const data = await fetchData('sale/stats/none/', date, period);

  if (data.length > 0) {
    renderTable(Object.keys(data[0]), data);
  } else {
    renderTable([], []);
    alert('No non-sales data found.');
  }
});
