class Person {
  constructor(id, last, first, grade) {
    this.id = id;
    this.first = first;
    this.last = last;
    this.grade = grade;
    this.preferences = [];
  }

  getName() {
    return `${this.first} ${this.last}`;
  }

  getAsCsvRow() {
    const preferencesList = this.preferences.join('|');
    return `${this.grade},${
      this.id
    },${this.getName()},${preferencesList}`;
  }

  addPreferenceByName(name) {
    if (!name) return true;
    const person = people.find(
      (p) => p.getName().toLowerCase() === name.toLowerCase().trim()
    );
    if (person) {
      this.addPreferenceById(person.id);
      logToPage(
        `😊 ${this.getName()} matched with ${name} = ${person.id}`
      );
      return true; // Continue processing
    } else {
      logToPage(
        `❓ ${this.getName()} asks for ${name}. Who is that?`
      );
      const similarNames = findSimilarNames(name);
      showNameSelection(name, similarNames);
      return false; // Pause processing
    }
  }

  addPreferenceById(id) {
    this.preferences.push(id);
    console.log(`Preference added by ID: ${id}`);
  }
}

let people = [];

function loadStudents() {
  const fileInput = document.getElementById('csv-students');
  const file = fileInput.files[0];

  if (file) {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      transformHeader: transformHeader,
      transform: transformValue,
      complete: function (results) {
        people = results.data.map(
          (row) => new Person(row.id, row.last, row.first, row.grade)
        );

        people.forEach((person) =>
          console.log(`loaded ${person.id} (${person.getName()})`)
        );
        console.log(`found ${people.length} students`);
      },
    });
  } else {
    console.log('No file selected!');
  }
}

function transformHeader(header) {
  const lowerHeader = header.toLowerCase();
  if (lowerHeader.includes('email')) return 'id';
  if (lowerHeader.includes('last')) return 'last';
  if (lowerHeader.includes('first')) return 'first';
  if (lowerHeader.includes('grade')) return 'grade';
  return header;
}

function transformValue(value, header) {
  if (header === 'id') return value.split('@')[0];
  if (header === 'grade') return value.match(/\d+/)[0];
  return value;
}

let currentRow = null;
let currentPerson = null;
let currentPreferenceColumn = null;
let currentIndex = 0;
let rows = [];
let currentPreferenceIndex = 0; // Add this line at the beginning of your script

function logToPage(message) {
  document.getElementById('log').innerHTML += message + '<br>';
  setTimeout(() => {
    window.scrollTo(0, document.documentElement.scrollHeight + 50);
  }, 100);
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[a.length][b.length];
}

function findSimilarNames(name) {
  if (!name) return []; // Return an empty array if name is null or undefined

  name = name.toLowerCase();

  const similarNames = people
    .map((person) => person.getName())
    .filter((personName) => {
      // Check for Levenshtein distance
      const L = 3;
      const isLevenshteinMatch =
        levenshtein(name, personName.toLowerCase()) <= L;

      // Check for any N-letter sequence from the given name
      const N = 4;
      const isLetterSequenceMatch = [...name].some((_, i) => {
        const sequence = name.substring(i, i + N);
        return (
          sequence.length === N &&
          personName.toLowerCase().includes(sequence)
        );
      });

      // Check for any N-letter sequence from the given name
      const S = 2;
      const isStartMatch = [...name].some((_) => {
        const start = name.substring(0, S);
        return personName.substring(0, S).toLowerCase() === start;
      });

      return (
        isLevenshteinMatch || isLetterSequenceMatch || isStartMatch
      );
    });

  return similarNames;
}

function showNameSelection(name, similarNames) {
  const selectBox = document.getElementById('similar-names');
  selectBox.focus();
  selectBox.innerHTML = '';
  similarNames.forEach((similarName) => {
    const option = document.createElement('option');
    option.value = similarName;
    option.text = similarName;
    selectBox.appendChild(option);
  });
  const skipOption = document.createElement('option');
  skipOption.value = '-- skip --';
  skipOption.text = '-- skip --';
  selectBox.appendChild(skipOption);
  document.getElementById('name-selection').style.display = 'block';
}

function processPreferences(index) {
  if (index >= rows.length) {
    logToPage('<hr>No more people!');
    downloadCSV();
    return;
  }
  const row = rows[index];
  const person = people.find((p) => p.id === row.id);

  if (person) {
    const preferences = ['pref1', 'pref2', 'pref3', 'pref4', 'pref5'];
    for (
      let i = currentPreferenceIndex;
      i < preferences.length;
      i++
    ) {
      const prefColumn = preferences[i];
      const prefName = row[prefColumn];
      currentRow = row;
      currentPerson = person;
      currentPreferenceColumn = prefColumn;
      if (!person.addPreferenceByName(prefName)) {
        // Pause processing this row if the preference was not found
        currentIndex = index; // Save the current index
        currentPreferenceIndex = i; // Save the current preference index
        return;
      }
    }
    currentPreferenceIndex = 0; // Reset preference index for the next person
    logToPage(
      `✅ ${person.getName()} stored as ${person.getAsCsvRow()}<br>`
    );
  } else {
    logToPage(`Person not found for ID: ${row.id}<br>`);
  }

  // Move on to the next person
  currentIndex++;
  processPreferences(currentIndex); // Process the next person
}

function useSelectedName() {
  const selectedName = document.getElementById('similar-names').value;
  if (selectedName !== '-- skip --') {
    currentPerson.addPreferenceByName(selectedName);
  }
  document.getElementById('name-selection').style.display = 'none';
  // Continue processing from the saved preference index
  currentPreferenceIndex++;
  processPreferences(currentIndex);
}

function continueProcessing() {
  currentIndex++; // Increment the current index
  processPreferences(currentIndex); // Process the next person
}

function loadPreferences() {
  const fileInput = document.getElementById('csv-preferences');
  const file = fileInput.files[0];

  if (file) {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: transformHeader, // If needed
      transform: transformValue, // If needed
      complete: function (results) {
        rows = results.data;
        currentIndex = 0;
        processPreferences(currentIndex);
      },
    });
  } else {
    console.log('No file selected!');
  }
}

function downloadCSV() {
  const headers = ['grade', 'id', 'name', 'preferences'];
  const rows = people.map((person) => {
    return person.getAsCsvRow();
  });
  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  // Get the current timestamp in the required format
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}-${String(now.getDate()).padStart(
    2,
    '0'
  )}-${String(now.getHours()).padStart(2, '0')}-${String(
    now.getMinutes()
  ).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;

  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `data-${timestamp}.csv`);
  link.style.visibility = 'hidden';

  // Create a download button
  const button = document.createElement('button');
  button.textContent = 'Download CSV';
  button.onclick = () => {
    link.click();
    URL.revokeObjectURL(url);
  };

  // Append the button to the document
  document.body.appendChild(button);
}
