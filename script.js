let cellWidth = 100;
let cellHeight = 30;
let cellBuffer = 5;

class Member {
  constructor(name, x, y, w, h) {
    this.name = name;
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.dragging = false;
    this.rollover = false;
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
    } else if (this.rollover || this.checkMouseOverOriginal()) {
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
    this.showTitle();
    for (let seat of this.seats) {
      seat.show();
      seat.checkMouseOver();
    }
  }

  showTitle() {
    fill(0);
    noStroke();
    textAlign(LEFT, BOTTOM);
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

    for (let group of groups) {
      let newGroup = new Group(group.name, group.maxSize, initialX, initialY);
      this.addGroup(newGroup);
      initialX += xOffset;
    }
  }

  addGroup(group) {
    this.groups.push(group);
  }

  createMembers(persons) {
    let initialX = 50;
    let initialY = 50;
    let yOffset = cellHeight + cellBuffer;

    for (let person of persons) {
      let newMember = new Member(
        person.name,
        initialX,
        initialY,
        cellWidth,
        cellHeight
      );
      this.addMember(newMember);
      initialY += yOffset;
    }
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

  let groups = [
    { name: "Basketball", maxSize: 16 },
    { name: "Chess", maxSize: 10 },
  ];
  system.createGroups(groups);

  let people = [{ name: "Alice" }, { name: "Bert" }];
  system.createMembers(people);
}

function draw() {
  background(255);

  for (let group of system.groups) {
    group.show();
  }

  for (let member of system.members) {
    member.show();
    member.checkMouseOver();
    if (member.dragging) {
      member.move(mouseX, mouseY);
    }
  }
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
