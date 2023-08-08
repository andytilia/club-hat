function getSampleData() {
  return `Timestamp,Email Address,YourName,pref1 ,pref2 ,pref3 ,pref4,pref5 
  6/5/2023 9:56:56,26kandmi@wcsu.net,Mimi Kanda-Olmstead,Maya Sluka,Anna Fink,Mia Zillian,Aleksandra Cirovic,Sadie Boulbol
  6/5/2023 9:58:44,24shorcl@wcsu.net,Clara Shortle ,Charlotte Nunan ,Remy Malik,Leah Kuhnert,Phoebe Anderson ,Heikke Tans
  6/5/2023 10:00:10,25jillka@wcsu.net,Kamryn jillson ,Ben Runstein ,Alice Cayer,Vince petrone ,,
  6/5/2023 10:01:01,24yuenka@wcsu.net,Kamron Yuengling ,William Obbard ,Delia Morgan,Char Nunan ,Tori McNamara,Seamus Powers
  6/5/2023 10:01:27,25johnsh@wcsu.net,Shay Johnson,Cora Hewitt,Maggie pierce,Alice cayer,Lucia Rullo,Bridget Howe
  6/5/2023 10:03:06,24shoecl@wcsu.net,Claudia shoemaker ,Hannah gubbins ,Mikayla Myers ,Quinn Stickney ,Chloe masilo ,Skye cully
  6/5/2023 10:04:44,25courow@wcsu.net,Owen Courcey ,Graham Fox ,Averill Stevens ,James Underwood ,Myra McNaughton,Elizabeth Tindall
  6/5/2023 10:05:07,24gubbha@wcsu.net,Hannah,maggie mello,chloe ,quinn,claudia ,gracie
  6/5/2023 10:05:32,24mellma@wcsu.net,Maggie Mello,Hannah Gubbins,Quinn Stickney,Zach Martsolf-Tan,Chloe Masillo,Claudia Shoemaker`;
}

const useSample = true;
function handleFileUpload(fileInputId, headerRowId, dataRowsId) {
  const data = useSample
    ? getSampleData()
    : document.getElementById(fileInputId).files[0];

  if (!data) {
    alert('Please select a CSV file first, Noble Sovereign.');
    return;
  }

  parseCSV(data, headerRowId, dataRowsId);
}

function parseCSV(file, headerRowId, dataRowsId) {
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,

    transformHeader: (header) =>
      header.toLowerCase().includes('email') ? 'id' : header,
    transform: (value, header) =>
      header === 'id' ? value.split('@')[0] : value,
    complete: (results) => {
      renderHeader(Object.keys(results.data[0]), headerRowId);
      renderRows(results.data, dataRowsId);
    },
  });
}

function renderHeader(header, headerRowId) {
  document.getElementById(headerRowId).innerHTML = header
    .map((col) => `<th>${col}</th>`)
    .join('');
}

function renderRows(rows, dataRowsId) {
  const dataRows = document.getElementById(dataRowsId);
  dataRows.innerHTML = rows
    .map(
      (cells) =>
        `<tr>${Object.values(cells)
          .map((cell) => `<td>${cell}</td>`)
          .join('')}</tr>`
    )
    .join('');
}
