let cellWidth = 100;
let cellHeight = 30;
let cellBuffer = 5;
let groupData;
let memberData;

function preload() {
  groupData = loadTable("groups.csv", "header");
  memberData = loadTable("members.csv", "header");
}
class Member {
  constructor(name, x, y, w, h, preferences) {
    this.name = name;
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.dragging = false;
    this.rollover = false;
    this.preferences = preferences; // Add this line
  }

  startDragging() {
    this.dragging = true;
  }

  stopDragging() {
    this.dragging = false;
  }

  move(x, y) {
    if (this.dragging) {
      this.x = x - this.w / 2; // adjusting so that mouse is at the center of the member rectangle
      this.y = y - this.h / 2; // adjusting so that mouse is at the center of the member rectangle
    }
  }

  show() {
    this.showOriginal();
    strokeWeight(1);
    if (this.dragging) {
      stroke(200, 0, 0);
    } else if (system.getFocusedMember() !== undefined && system.getFocusedMember().name === this.name) {
      stroke(200, 200, 0);
      strokeWeight(3);
    } else {
      stroke(200);
    }

    fill(255);
    rect(this.x, this.y, this.w, this.h);
    fill(0);
    noStroke();
    textAlign(LEFT, CENTER);
    text(this.name, this.x + 5, this.y + this.h / 2);
  }

  showOriginal() {
    fill(200); // light grey
    noStroke();
    rect(this.originalX, this.originalY, this.w, this.h);
    fill(0); // black text
    noStroke();
    textAlign(LEFT, CENTER);
    text(this.name, this.originalX + 5, this.originalY + this.h / 2);
  }

  checkMouseOver() {
    if (
      mouseX > this.x &&
      mouseX < this.x + this.w &&
      mouseY > this.y &&
      mouseY < this.y + this.h
    ) {
      // Only consider this member as rolled over if no other member is being dragged
      this.rollover = system.getDraggingMember() === null;
      return this.rollover;
    } else {
      this.rollover = false;
      return false;
    }
  }

  checkMouseOverOriginal() {
    return (
      mouseX > this.originalX &&
      mouseX < this.originalX + this.w &&
      mouseY > this.originalY &&
      mouseY < this.originalY + this.h
    );
  }
}

class Seat {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.member = null;
    this.rollover = false;
  }

  assignMember(member) {
    if (member != null) {
      member.x = this.x;
      member.y = this.y;
    }
    this.member = member;
  }

  unassignMember() {
    this.member = null;
  }

  isOccupied() {
    return this.member != null;
  }

  show() {
    if (this.member) {
      stroke(0, 200, 0);
    } else if (this.rollover) {
      stroke(200, 200, 0);
    } else {
      stroke(100, 0, 0);
    }
    strokeWeight(3);
    fill(255);
    rect(this.x, this.y, this.w, this.h);
  }

  checkMouseOver() {
    if (
      mouseX > this.x &&
      mouseX < this.x + this.w &&
      mouseY > this.y &&
      mouseY < this.y + this.h
    ) {
      if (system.getDraggingMember() !== null) {
        this.rollover = true;
      }
      return true;
    } else {
      this.rollover = false;
      return false;
    }
  }

  released() {
    if (
      this.rollover &&
      this.member === null &&
      system.getDraggingMember() !== null
    ) {
      this.member = system.getDraggingMember();
      this.member.x = this.x;
      this.member.y = this.y;
      system.stopDraggingMember();
    }
  }
}

class Group {
  constructor(name, seatCount, startX, startY) {
    this.name = name;
    this.x = startX;
    this.y = startY;
    this.seats = Array(seatCount)
      .fill()
      .map(
        (_, i) =>
          new Seat(
            startX,
            startY + i * (cellHeight + cellBuffer),
            cellWidth,
            cellHeight
          )
      );
  }

  show() {
    for (let seat of this.seats) {
      seat.show();
      seat.checkMouseOver();
    }
  }
  
showTitle() {
  fill(0);
  noStroke();
  textAlign(LEFT, BOTTOM);
  let focusedMember = system.getFocusedMember();
  if (
    focusedMember &&
    focusedMember.preferences.includes(this.name)
  ) {
    stroke(200, 200, 0);
    strokeWeight(2);
    fill(50, 50, 0);
  }
  text(this.name, this.x, this.y - 5);
}

}

class EnrollmentSystem {
  constructor() {
    this.groups = [];
    this.members = [];
    this.draggingMember = null;
  }

  createGroups(groups) {
    let initialX = 200;
    let initialY = 50;
    let xOffset = cellWidth + cellBuffer * 3;

  groups.rows.forEach(row => {
    let groupName = row.getString("name");
    let groupMaxSize = row.getNum("maxSize");

    let newGroup = new Group(groupName, groupMaxSize, initialX, initialY);
    this.addGroup(newGroup);
    initialX += xOffset;
  });
  }

  addGroup(group) {
    this.groups.push(group);
  }

  getRolloverMember() {
  return this.members.find(member => member.checkMouseOver() || member.checkMouseOverOriginal());
}
  
createMembers(newMembers) {
  let initialX = 50;
  let initialY = 50;
  let yOffset = cellHeight + cellBuffer;

newMembers.rows.forEach(row => {
  let memberName = row.getString("name");
  let memberPreferences = row.getString("preferences").split("|");

  let newMember = new Member(
    memberName,
    initialX,
    initialY,
    cellWidth,
    cellHeight,
    memberPreferences
  );
  this.addMember(newMember);
  initialY += yOffset;
});

}

  addMember(member) {
    this.members.push(member);
  }

  startDraggingMember(member) {
    this.draggingMember = member;
    member.startDragging();
    for (let group of this.groups) {
      for (let seat of group.seats) {
        if (seat.member === member) {
          seat.unassignMember();
          break;
        }
      }
    }
  }

  stopDraggingMember() {
    if (this.draggingMember !== null) {
      this.draggingMember.stopDragging();
      this.draggingMember = null;
    }
  }

  moveMember(x, y) {
    if (this.draggingMember) {
      this.draggingMember.move(x, y);
    }
  }

  releaseMembers() {
    for (let group of this.groups) {
      for (let seat of group.seats) {
        seat.released(this.draggingMember);
      }
    }
  }
  getDraggingMember() {
    return this.draggingMember;
  }
  
  getFocusedMember() {
    const draggingMember = this.getDraggingMember();
    if (draggingMember !== null) {
      return draggingMember
    } else {
      return this.getRolloverMember();
    }
  }
  displayEnrollments(x, y) {
    let yOffset = 0;
    textSize(14);
    fill(0);
    for (let group of this.groups) {
      text(`Group: ${group.name}`, x, y + yOffset);
      yOffset += 20;
      for (let [index, seat] of group.seats.entries()) {
        let memberName = seat.isOccupied() ? seat.member.name : "Empty";
        text(`  Seat ${index + 1}: ${memberName}`, x, y + yOffset);
        yOffset += 20;
      }
      yOffset += 20; // Add extra space between groups
    }
  }
}
function setup() {
  createCanvas(windowWidth, windowHeight);

  system = new EnrollmentSystem();
  system.createGroups(groupData);
  system.createMembers(memberData);
}

function draw() {
  background(255);

  // Show each group and check for mouse over
  system.groups.forEach((group) => {
    group.show();
    group.showTitle();
  });

  // Show each member and check for mouse over or move if it's being dragged
  system.members.forEach((member) => {
    member.show();
    if (member.dragging) {
      member.move(mouseX, mouseY);
    }
  });
}

function mousePressed() {
  // If a member was clicked, start dragging it
  for (let member of system.members) {
    if (member.checkMouseOver()) {
      system.startDraggingMember(member);
      break;
    }
  }
}

function mouseReleased() {
  system.releaseMembers();
  system.stopDraggingMember();
}
