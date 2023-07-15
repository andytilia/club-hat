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

    groups.rows.forEach((row) => {
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
    return this.members.find(
      (member) => member.checkMouseOver() || member.checkMouseOverOriginal()
    );
  }

  createMembers(newMembers) {
    let initialX = 50;
    let initialY = 50;
    let yOffset = cellHeight + cellBuffer;

    newMembers.rows.forEach((row) => {
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
