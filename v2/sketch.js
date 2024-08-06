let scheme;
let lastTouchX, lastTouchY;

function setup() {
  createCanvas(1000, 650);
  scheme = new Scheme('8th-grade-advisory-2425');
  loadGroupsFromPath('groups.csv');
  loadPeopleFromPath('people.csv');
  loadConnectionsFromPath('connections.csv');
}

function draw() {
  background(220);

  scheme.show();

  if (keyIsDown(SHIFT) || mouseIsPressed) {
    scheme.handleHover(mouseX, mouseY);
  } else {
    scheme.clearHover();
  }

  // showTasks();
}

function showTasks() {
  fill(200, 50, 50);
  textSize(20);
  textAlign(LEFT, BOTTOM);
  text('autoassign creates stacked people in groups', 30, 80);
  text('autoassign makes some grey people in groups', 30, 110);
}

function mousePressed() {
  if (scheme) {
    scheme.handlePress(mouseX, mouseY);
  }
}

function mouseReleased() {
  if (scheme) {
    scheme.handleRelease(mouseX, mouseY);
  }
}

function mouseDragged() {
  if (scheme) {
    scheme.handleMove(mouseX, mouseY);
  }
}

function saveCanvasFiles() {
  saveSchemeAsFile();
  saveCanvasAsJPEG();
}

function saveCanvasAsJPEG() {
  let now = new Date();
  let timestamp = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${now
    .getDate()
    .toString()
    .padStart(2, '0')}_${now
    .getHours()
    .toString()
    .padStart(2, '0')}-${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}-${now
    .getSeconds()
    .toString()
    .padStart(2, '0')}`;
  saveCanvas(`canvas_${timestamp}`, 'jpeg');
}

// Function to save the groups as a JSON file
function saveSchemeAsFile() {
  let jsonString = scheme.serialize();
  let blob = new Blob([jsonString], { type: 'application/json' });
  let now = new Date();
  let timestamp = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${now
    .getDate()
    .toString()
    .padStart(2, '0')}_${now
    .getHours()
    .toString()
    .padStart(2, '0')}-${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}-${now
    .getSeconds()
    .toString()
    .padStart(2, '0')}`;
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;

  a.download = `scheme_${timestamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Function to handle file input and load the groups from a JSON file
function loadSchemeFromFile(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const jsonString = e.target.result;
      scheme = Scheme.deserialize(jsonString);
      console.log('scheme file successfully read.');
    };
    reader.readAsText(file);
  }
}

function loadPeopleFromPath(filePath) {
  loadStrings(filePath, parsePeopleStrings);
}

function loadGroupsFromPath(filePath) {
  loadStrings(filePath, parseGroupsStrings);
}

function loadConnectionsFromPath(filePath) {
  loadStrings(filePath, parseConnectionsStrings);
}

function loadPeopleFromFile(event) {
  let file = event.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = function (e) {
      let content = e.target.result;
      let lines = content.split('\n');
      console.log('people file successfully read.');
      parsePeopleStrings(lines);
    };
    reader.readAsText(file);
  }
}

function loadGroupsFromFile(event) {
  let file = event.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = function (e) {
      let content = e.target.result;
      let lines = content.split('\n');
      parseGroupsStrings(lines);
    };
    reader.readAsText(file);
  }
}

function loadConnectionsFromFile(event) {
  let file = event.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = function (e) {
      let content = e.target.result;
      let lines = content.split('\n');
      parseConnectionsStrings(lines);
    };
    reader.readAsText(file);
  }
}

function parsePeopleStrings(data) {
  let people = [];
  for (let line of data) {
    const parts = line.split(',').map((part) => part.trim());
    let newPerson = new Person(...parts);
    people.push(newPerson);
  }

  // console.log(`${people.length} people added`);
  // people.forEach((p) => console.log(p.toString()));
  scheme.setPeople(people);
  console.log(`${scheme.people.length} people added`);
}

function parseGroupsStrings(data) {
  let groups = [];
  for (let line of data) {
    const parts = line.split(',').map((part) => part.trim());
    let newGroup = new Group(
      parts[0],
      parts[1],
      10 + 100 * groups.length,
      20
    );
    groups.push(newGroup);
  }

  if (!scheme) {
    scheme = new Scheme('bbc24');
  }
  scheme.setGroups(groups);
  console.log(`${scheme.groups.length} groups added`);
}

function parseConnectionsStrings(data) {
  let connections = [];
  for (let line of data) {
    const parts = line.split(',').map((part) => part.trim());
    connections.push(parts);
  }

  // console.log(`${connections.length} connection sets added`);
  // connections.forEach((c) => console.log(c));
  scheme.setConnections(connections);
  scheme.assignConnections();
}

function deepCopy(array) {
  return array.map((item) =>
    Array.isArray(item) ? deepCopy(item) : item
  );
}
