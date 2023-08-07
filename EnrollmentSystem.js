import Group from './Group.js';
import Member from './Member.js';

export default class EnrollmentSystem {
  constructor(p5, cellWidth, cellHeight, cellBuffer, strategy) {
    this.p5 = p5;
    this.groups = [];
    this.members = [];
    this.draggingMember = null;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.cellBuffer = cellBuffer;
    this.preferencesType = '';
    this.strategy = strategy;
  }

  autoPlaceMembers() {
    const assignment = this.strategy.autoPlace(this);
    this.applyAssignment(assignment);
  }

  applyAssignment(assignment) {
    // Clear current seat assignments
    for (let group of this.groups) {
      for (let seat of group.seats) {
        seat.unassignMember();
      }
    }

    // Apply new seat assignments
    for (let assign of assignment) {
      let member = this.members.find(
        (member) => member.name === assign.memberName
      );
      let group = this.groups.find(
        (group) => group.name === assign.groupName
      );
      if (member && group) {
        let availableSeat = group.seats.find(
          (seat) => !seat.isOccupied()
        );
        if (availableSeat) {
          availableSeat.assignMember(member);
        }
      }
    }
  }

  createGroups(groups) {
    let initialX = 200;
    let initialY = 50;
    let xOffset = this.cellWidth + this.cellBuffer * 3;

    groups.rows.forEach((row) => {
      let groupName = row.getString('name');
      let groupMaxSize = row.getNum('maxSize');

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
    this.preferencesType = newMembers.columns[2];

    let x = 50;
    let y = 50;
    let yOffset = this.cellHeight + this.cellBuffer;

    newMembers.rows.forEach((row) => {
      let memberId = row.getString('id');
      let memberName = row.getString('name');
      let preferencesString = row
        .getString(this.preferencesType)
        .trim();
      let preferencesList =
        preferencesString.length > 0
          ? preferencesString.split('|')
          : [];
      let newMember = new Member(
        this,
        memberId,
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
    const index = this.members.findIndex(
      (obj) => obj['name'] === member.name
    );
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
        let memberName = seat.isOccupied()
          ? seat.member.name
          : 'Empty';
        text(`  Seat ${index + 1}: ${memberName}`, x, y + yOffset);
        yOffset += 20;
      }
      yOffset += 20; // Add extra space between groups
    }
  }

  showStats(x, y) {
    let placedMembers = this.getPlacedMembers();
    let placedHasPreference = this.getPlacedMembersHavingPreference();
    let placedWithPreference = this.getPlacedMembersWithPreference();

    const pctPlaced =
      (100 * placedMembers.length) / this.members.length;
    const pctPlacedWithPreference =
      (100 * placedWithPreference.length) /
      placedHasPreference.length;
    const averageHappiness = this.getSystemHappiness();

    this.p5.textAlign(this.p5.LEFT, this.p5.BOTTOM);
    this.p5.text(
      `${placedMembers.length}/${
        this.members.length
      } (${pctPlaced.toFixed(0)}%) placed`,
      x,
      y
    );
    this.p5.text(
      `${placedWithPreference.length}/${
        placedHasPreference.length
      } (${pctPlacedWithPreference.toFixed(0)}%) happy`,
      x,
      y + 15
    );
    this.p5.text(
      `${averageHappiness.toFixed(1)} happiness`,
      x,
      y + 30
    );
  }

  getPlacedMembers() {
    return this.members.filter(
      (member) => member.getGroup() !== null
    );
  }

  getPlacedMembersHavingPreference() {
    return this.members.filter(
      (member) =>
        member.preferences.length && member.getGroup() !== null
    );
  }

  getPlacedMembersWithPreference() {
    return this.members.filter((member) => {
      let group = member.getGroup();
      return group !== null && member.isHappy();
    });
  }

  getSystemHappiness() {
    const numericHappinessValues = this.members
      .map((member) => member.getHappiness())
      .filter((value) => typeof value === 'number');

    const sum = numericHappinessValues.reduce(
      (acc, value) => acc + value,
      0
    );

    const average =
      numericHappinessValues.length > 0
        ? sum / numericHappinessValues.length
        : 0;
    return average;
  }
}
