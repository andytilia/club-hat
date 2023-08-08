import EnrollmentSystem from './EnrollmentSystem.js';
import RandomAssignmentStrategy from './RandomAssignmentStrategy.js';
import GeneticAlgorithmStrategy from './GeneticAlgorithmStrategy.js';

let cellWidth = 80;
let cellHeight = 20;
let cellBuffer = 4;
let groupData;
let memberData;
let system;

const sketch = (p5) => {
  p5.preload = () => {
    groupData = p5.loadTable('groups2.csv', 'header');
    memberData = p5.loadTable('members2.csv', 'header');
  };

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    const randomStrategy = new RandomAssignmentStrategy();
    system = new EnrollmentSystem(
      p5,
      cellWidth,
      cellHeight,
      cellBuffer,
      // randomStrategy
      new GeneticAlgorithmStrategy()
    );
    system.createGroups(groupData);
    system.createMembers(memberData);
    system.autoPlaceMembers();
  };

  p5.draw = () => {
    p5.background(210);

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
    system.showStats(10, 20);
  };
  p5.mousePressed = () => {
    // If a member was clicked, start dragging it
    for (let member of system.members) {
      if (member.isMouseOver()) {
        system.startDraggingMember(member);
        break;
      }
    }
  };

  p5.mouseReleased = () => {
    system.onMouseReleased();
  };

  p5.keyPressed = () => {
    if (p5.key === 's') {
      saveAssignments();
    } else if (p5.key === 'o') {
      loadAssignments();
    }
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };
};

const myp5 = new p5(sketch, 'enroll');
