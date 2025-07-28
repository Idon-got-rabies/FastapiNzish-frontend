function formatDateToPeriodStart(date, period) {
  const { DateTime } = luxon;
  let dt = DateTime.fromISO(date, { zone: 'Africa/Nairobi' });

  if (period === 'week') {
    dt = dt.startOf('week'); // Luxon week starts on Monday by default
  } else if (period === 'month') {
    dt = dt.startOf('month');
  } else if (period === 'year') {
    dt = dt.startOf('year');
  }

  return dt.toFormat('yyyy-MM-dd');
}


async function fetchData(endpoint, date, period) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('No token found. Please login again.');
    return [];
  }

  if (!date) {
    alert('Please select a valid date.');
    return [];
  }

  const startDate = formatDateToPeriodStart(date, period);
  const url = `${BASE_URL}/items/${endpoint}?range=${period}&date_value=${startDate}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      alert(`Error: ${response.status} ${response.statusText}\n${errorText}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    alert('Network error occurred while fetching data.');
    console.error(error);
    return [];
  }
}

function renderTable(headers, data) {
  const headerRow = document.getElementById('results-header');
  const body = document.getElementById('results-body');

  headerRow.innerHTML = '';
  body.innerHTML = '';

  if (headers.length === 0 || data.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 100;
    td.style.textAlign = 'center';
    td.textContent = 'No data available for this selection.';
    tr.appendChild(td);
    body.appendChild(tr);
    return;
  }

  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });

  data.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(header => {
      const td = document.createElement('td');
      td.textContent = row[header] ?? '-';
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });
}

async function handleFormSubmit(formId, endpoint) {
  const period = document.getElementById(`${formId}-period`).value;
  const date = document.getElementById(`${formId}-date`).value;
  const submitBtn = document.querySelector(`#${formId}-form button`);
  submitBtn.disabled = true;
  submitBtn.textContent = 'Loading...';

  const data = await fetchData(endpoint, date, period);

  if (data.length > 0) {
    renderTable(Object.keys(data[0]), data);
  } else {
    renderTable([], []);
  }

  submitBtn.disabled = false;
  submitBtn.textContent = 'Generate';
}

// Event listeners for both forms
document.getElementById('sales-form').addEventListener('submit', async e => {
  e.preventDefault();
  await handleFormSubmit('sales', 'sale/stats/total/');
});

document.getElementById('nonsales-form').addEventListener('submit', async e => {
  e.preventDefault();
  await handleFormSubmit('nonsales', 'sale/stats/none/');
});
