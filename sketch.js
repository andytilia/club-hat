import EnrollmentSystem from './EnrollmentSystem.js';
import RandomAssignmentStrategy from './RandomAssignmentStrategy.js';
import GeneticAlgorithmStrategy from './GeneticAlgorithmStrategy.js';
import SimulatedAnnealingStrategy from './SimulatedAnnealingStrategy.js';
import GreedyPreserveStrategy from './GreedyPreserveStrategy.js';

let cellWidth = 130;
let cellHeight = 20;
let cellBuffer = 4;
let initialX = 10; // Starting X position
let initialY = 50; // Starting Y position
let yOffset = cellHeight + cellBuffer; // Space between members vertically
let xOffset = cellWidth + cellBuffer; // Space between columns
let groupData;
let memberData;
let numGroups;
let numMembers;
let membersPerColumn;
let system;

const sketch = (p5) => {
  p5.preload = () => {};

  p5.setup = () => {
    p5.createCanvas(2000, 2000);
    // system = new EnrollmentSystem(p5, new GeneticAlgorithmStrategy());
    system = new EnrollmentSystem(p5, new GreedyPreserveStrategy());
  };

  p5.resizeCanvas(
    (numGroups + Math.ceil(numMembers / membersPerColumn)) *
      (cellWidth + cellBuffer) +
      300,
    numMembers * (cellHeight + cellBuffer) + 300
  );
  p5.draw = () => {
    p5.background(255);

    if (system) {
      system.groups.forEach((group) => {
        group.show();
        group.showTitle();
      });
      system.members.forEach((member) => {
        member.show();
        if (member.dragging) {
          member.move();
        }
      });
      if (system.members.length > 0) {
        system.showStats(10, 20);
        system.graphFitnessEvolution();
      }
    }
  };
  p5.mousePressed = () => {
    if (system) {
      for (let member of system.members) {
        if (member.isMouseOver()) {
          system.startDraggingMember(member);
          break;
        }
      }
    }
  };

  p5.mouseReleased = () => {
    if (system) {
      system.onMouseReleased();
    }
  };

  p5.keyPressed = () => {
    if (p5.key === 'c') {
      system.copyAssignments(membersPerColumn);
    }
    if (p5.key === 'a') {
      document.getElementById('startSystem').style.display = 'inline';
      document.getElementById('sortSystem').style.display = 'inline';
      document.getElementById('saveSystem').style.display = 'inline';
    }
  };

  p5.initSystem = () => {
    const groupDataInput = document.getElementById('groupDataInput');
    const memberDataInput =
      document.getElementById('memberDataInput');

    if (!groupDataInput.files[0] || !memberDataInput.files[0]) {
      console.error('Please upload both files before proceeding.');
      return;
    }
    function parseCSV(data) {
      const rows = data.trim().split('\n');
      const headers = rows[0].split(',');
      const table = rows.slice(1).map((row) => {
        const values = row.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});
      });
      return table;
    }

    const readFile = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target.result);
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
    };

    const loadGroupData = readFile(groupDataInput.files[0]).then(
      (data) => parseCSV(data)
    );

    const loadMemberData = readFile(memberDataInput.files[0]).then(
      (data) => parseCSV(data)
    );

    Promise.all([loadGroupData, loadMemberData])
      .then(([groupData, memberData]) => {
        console.log(memberData);
        membersPerColumn =
          Math.floor((p5.windowHeight - initialY) / yOffset) - 3;

        numMembers = system.createMembers(
          memberData,
          membersPerColumn,
          initialX,
          initialY,
          xOffset,
          yOffset,
          cellWidth,
          cellHeight
        );
        console.log(`${numMembers} members created`);

        numGroups = system.createGroups(
          groupData,
          membersPerColumn,
          numMembers,
          initialY,
          xOffset,
          cellWidth,
          cellHeight,
          cellBuffer
        );
        console.log(`${numGroups} groups created`);
        sortButton.disabled = false;
        startButton.disabled = true;
        loadButton.disabled = true;
        document.getElementById(
          'starterFilesControls'
        ).style.display = 'none';
      })
      .catch((error) => {
        console.error('Failed to load data:', error);
      });
  };
};

const myp5 = new p5(sketch, 'enroll');

let saveButton = document.getElementById('saveSystem');
let sortButton = document.getElementById('sortSystem');
let loadButton = document.getElementById('loadSystem');
let startButton = document.getElementById('startSystem');
let fileInput = document.getElementById('loadFile');
let loadStarterFilesButton = document.getElementById(
  'loadStarterFiles'
);

loadStarterFilesButton.addEventListener('click', () => {
  myp5.initSystem();
});

saveButton.addEventListener('click', () => {
  let dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(system.toJSON());
  let downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', 'systemState.json');
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
});

loadButton.addEventListener('click', () => {
  fileInput.click();
});

startButton.addEventListener('click', () => {
  console.log('start');
  document.getElementById('starterFilesControls').style.display =
    'block';
});

sortButton.addEventListener('click', () => {
  system.placeInvites();
  system.autoPlaceMembers();
  sortButton.disabled = true;
  saveButton.disabled = false;
});

fileInput.addEventListener('change', (event) => {
  let file = event.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = function (e) {
      system.fromJSON(e.target.result);
      startButton.disabled = true;
      // sortButton.disabled = false;
      saveButton.disabled = false;
      loadButton.disabled = true;
    };
    reader.readAsText(file);
  }
});
