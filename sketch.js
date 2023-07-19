import EnrollmentSystem from "./EnrollmentSystem.js";

let cellWidth = 100;
let cellHeight = 30;
let cellBuffer = 5;
let groupData;
let memberData;
let system;

const sketch = (p5) => {
  p5.preload = () => {
    groupData = p5.loadTable("groups.csv", "header");
    memberData = p5.loadTable("members.csv", "header");
  };

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    system = new EnrollmentSystem(p5, cellWidth, cellHeight, cellBuffer);
    system.createGroups(groupData);
    system.createMembers(memberData);
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
};

const myp5 = new p5(sketch, "enroll");
