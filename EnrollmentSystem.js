import Group from "./Group.js";
import Member from "./Member.js";

export default class EnrollmentSystem {
  constructor(p5, cellWidth, cellHeight, cellBuffer) {
    this.p5 = p5;
    this.groups = [];
    this.members = [];
    this.draggingMember = null;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.cellBuffer = cellBuffer;
  }

  createGroups(groups) {
    let initialX = 200;
    let initialY = 50;
    let xOffset = this.cellWidth + this.cellBuffer * 3;

    groups.rows.forEach((row) => {
      let groupName = row.getString("name");
      let groupMaxSize = row.getNum("maxSize");

      let newGroup = new Group(
        this,
        groupName,
        groupMaxSize,
        initialX,
        initialY,
        this.cellHeight,
        this.cellWidth,
        this.cellBuffer
      );
      this.addGroup(newGroup);
      initialX += xOffset;
    });
  }

  addGroup(group) {
    this.groups.push(group);
  }

  getRolloverMember() {
    return this.members.find(
      (member) => member.isMouseOver() || member.isMouseOverOriginal()
    );
  }

  createMembers(newMembers) {
    let x = 50;
    let y = 50;
    let yOffset = this.cellHeight + this.cellBuffer;

    newMembers.rows.forEach((row) => {
      let memberName = row.getString("name");

      let preferencesString = row.getString("preferences").trim();
      let preferencesList =
        preferencesString.length > 0 ? preferencesString.split("|") : [];
      console.log(preferencesList);
      let newMember = new Member(
        this,
        memberName,
        x,
        y,
        this.cellWidth,
        this.cellHeight,
        preferencesList
      );
      this.addMember(newMember);
      y += yOffset;
    });
  }

  addMember(member) {
    this.members.push(member);
  }

  startDraggingMember(member) {
    this.draggingMember = member;
    member.startDragging();

    // unassigned member from its seat
    for (let group of this.groups) {
      for (let seat of group.seats) {
        if (seat.member === member) {
          seat.unassignMember();
          break;
        }
      }
    }

    this.showMemberOnTop(member);
  }

  showMemberOnTop(member) {
    const index = this.members.findIndex((obj) => obj["name"] === member.name);
    if (index > -1) {
      const item = this.members.splice(index, 1)[0];
      this.members.push(item);
    }
  }

  stopDraggingMember() {
    if (this.draggingMember !== null) {
      this.draggingMember.stopDragging();
      this.draggingMember = null;
    }
  }

  moveMember() {
    if (this.draggingMember) {
      this.draggingMember.move();
    }
  }

  onMouseReleased() {
    for (let group of this.groups) {
      for (let seat of group.seats) {
        seat.onMouseReleased(this.draggingMember);
      }
    }
    this.stopDraggingMember();
  }

  getDraggingMember() {
    return this.draggingMember;
  }

  getFocusedMember() {
    const draggingMember = this.getDraggingMember();
    if (draggingMember !== null) {
      return draggingMember;
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
