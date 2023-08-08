function handleFileUpload(fileInputId, headerRowId, dataRowsId) {
  const fileInput = document.getElementById(fileInputId);
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select a CSV file first, Noble Sovereign.');
    return;
  }

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: transformHeader,
    transform: transformValue,
    complete: function (results) {
      const header = Object.keys(results.data[0]);
      renderHeader(header, headerRowId);
      renderRows(results.data, dataRowsId);
    },
  });
}

function transformHeader(header) {
  const lowerHeader = header.toLowerCase();
  if (lowerHeader.includes('email')) return 'id';
  if (lowerHeader.includes('last')) return 'last';
  if (lowerHeader.includes('first')) return 'first';
  if (lowerHeader.includes('grade level')) return 'grade';
  return header;
}

function transformValue(value, header) {
  if (header === 'id') return value.split('@')[0];
  if (header === 'grade') return value.match(/\d+/)[0];
  return value;
}

function renderHeader(header, headerRowId) {
  const headerRow = document.getElementById(headerRowId);
  headerRow.innerHTML = header
    .map((col) => `<th>${col}</th>`)
    .join('');
}

function renderRows(rows, dataRowsId) {
  const dataRows = document.getElementById(dataRowsId);
  dataRows.innerHTML = '';
  rows.forEach((cells) => {
    const rowHtml = Object.values(cells)
      .map((cell) => `<td>${cell}</td>`)
      .join('');
    dataRows.innerHTML += `<tr>${rowHtml}</tr>`;
  });
}
