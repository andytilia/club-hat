import Group from './Group.js';
import Member from './Member.js';

export default class EnrollmentSystem {
  constructor(p5, strategy) {
    this.p5 = p5;
    this.groups = [];
    this.members = [];
    this.draggingMember = null;
    this.preferencesType = 'memberPreferences';
    this.strategy = strategy;
    this.fitnessEvolution = [];
  }

  autoPlaceMembers() {
    let result = this.strategy.autoPlace(this);
    this.fitnessEvolution = result.fitnessEvolution;
    this.applyAssignment(result.bestSolution);
  }

  graphFitnessEvolution() {
    if (this.fitnessEvolution.length < 1) return;

    const values = this.fitnessEvolution;

    let graphX = 450; // X position of the graph
    let graphY = 650; // Y position of the graph

    let minValue = 0; //Math.min(...values);
    let maxValue = 1; //Math.max(...values);

    let pixelWidth = 100 / values.length;

    this.p5.stroke(0);
    for (let i = 0; i < values.length; i++) {
      let scaledY = this.p5.map(
        values[i],
        minValue,
        maxValue,
        100,
        0
      );
      this.p5.point(graphX + i * pixelWidth, graphY + scaledY);
    }

    // Drawing the 100x100 graph outline
    this.p5.noFill();
    this.p5.rect(graphX, graphY, 100, 100);
  }

  applyAssignment(assignment) {
    // Clear current seat assignments
    for (let group of this.groups) {
      for (let seat of group.seats) {
        seat.unassignMember();
      }
    }

    // console.log(assignment);
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

  createGroups(
    groups,
    membersPerColumn,
    numMembers,
    initialY,
    xOffset,
    cellWidth,
    cellHeight,
    cellBuffer
  ) {
    let initialX =
      10 + Math.ceil(numMembers / membersPerColumn) * xOffset + 50;

    groups.rows.forEach((row) => {
      let groupName = row.getString('name');
      let groupMaxSize = row.getNum('maxSize');
      let groupInviteOnly = row.getString('inviteOnly') === 'true';

      let newGroup = new Group(
        this,
        groupName,
        groupMaxSize,
        initialX,
        initialY,
        cellWidth,
        cellHeight,
        cellBuffer,
        groupInviteOnly
      );
      this.addGroup(newGroup);
      initialX += xOffset;
    });

    return groups.rows.length;
  }

  addGroup(group) {
    this.groups.push(group);
  }

  getRolloverMember() {
    return this.members.find(
      (member) => member.isMouseOver() || member.isMouseOverOriginal()
    );
  }

  createMembers(
    members,
    membersPerColumn,
    initialX,
    initialY,
    xOffset,
    yOffset,
    cellWidth,
    cellHeight
  ) {
    members.rows.forEach((row, index) => {
      let memberId = row.getString('id');
      let memberName = row.getString('name');
      let preferencesString = row.getString('preferences').trim();
      let preferencesList =
        preferencesString.length > 0
          ? preferencesString.split('|')
          : [];
      let col = Math.floor(index / membersPerColumn); // Determine the column based on the index
      let rowInCol = index % membersPerColumn; // Determine the row within the column

      let x = initialX + col * xOffset;
      let y = initialY + rowInCol * yOffset;

      let newMember = new Member(
        this,
        memberId,
        memberName,
        x,
        y,
        cellWidth,
        cellHeight,
        preferencesList
      );
      // console.log(newMember);
      this.addMember(newMember);
    });

    return members.rows.length;
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
      } (${pctPlacedWithPreference.toFixed(0)}%) placed are happy`,
      x,
      y + 13
    );
    this.p5.text(
      `${(this.getSystemHappiness() * 100).toFixed(
        0
      )}% system happiness`,
      x,
      y + 26
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
    const happyMembers = this.members.filter((member) =>
      member.isHappy()
    );
    const membersHavingPreference = this.members.filter(
      (member) => member.preferences.length > 0
    );
    const happiness =
      happyMembers.length / membersHavingPreference.length;
    return happiness;
  }

  getAverageHappiness() {
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

  evaluateSolutionFitness(solution) {
    // Create a temporary copy of the system's state
    const tempSystem = _.cloneDeep(this);

    // Check if the solution is an array or another iterable object
    if (!Array.isArray(solution)) {
      console.error('Solution is not an array:', solution);
      return 0; // Return a default fitness value (or handle the error as needed)
    }

    // Apply the solution to the temporary copy
    try {
      tempSystem.applyAssignment(solution);
    } catch (error) {
      console.error('Error applying solution:', error);
      return 0; // Return a default fitness value (or handle the error as needed)
    }

    // Get the fitness value from the temporary copy
    const fitness = tempSystem.getSystemHappiness();
    return fitness;
  }

  async copyAssignments(membersPerColumn) {
    // Create an object to store the assignments, with group names as keys
    let assignments = {};

    // Existing logic: Fill the assignments object with group assignments...
    for (let group of this.groups) {
      assignments[group.name] = [];
      for (let seat of group.seats) {
        if (seat.isOccupied()) {
          assignments[group.name].push(seat.member.name);
        }
      }
    }

    // Calculate the number of columns required for members based on UI
    const numMemberColumns = Math.ceil(
      this.members.length / membersPerColumn
    );

    // Convert the assignments to a CSV format
    let csvAssignments = '';
    let maxGroupSize = Math.max(
      ...Object.values(assignments).map((members) => members.length)
      // this.members.length // Consider the total number of members for the rows
    );

    for (let i = -1; i < maxGroupSize; i++) {
      // New logic: Add member's name for the "Members" columns
      for (let col = 0; col < numMemberColumns; col++) {
        let memberIndex = i + col * membersPerColumn;
        if (i === -1) {
          csvAssignments += col === 0 ? `"Members",` : `"" ,`;
        } else if (this.members[memberIndex]) {
          csvAssignments += `"${this.members[memberIndex].name}",`;
        } else {
          csvAssignments += '"",';
        }
      }

      csvAssignments += '"",'; // Blank column between members and groups

      // Existing logic: Continue with group assignments...
      for (let groupName of Object.keys(assignments)) {
        if (i === -1) {
          csvAssignments += `"${groupName}",`;
          continue;
        }
        let groupNameMember = assignments[groupName][i] || '';
        csvAssignments += `"${groupNameMember}",`;
      }
      csvAssignments += '\n'; // End of row
    }

    // Existing logic: Copy CSV to clipboard, download, etc...
    try {
      await navigator.clipboard.writeText(csvAssignments);
      alert(
        'Assignments copied to clipboard! You can paste them into Google Sheets.'
      );
    } catch (err) {
      console.error('Failed to copy assignments to clipboard:', err);
      alert(
        'Failed to copy assignments to clipboard. You can still download the CSV file.'
      );
    }
    // this.downloadFile(csvAssignments);
    return csvAssignments;
  }

  downloadFile(content, filename) {
    // Create a Blob object with the content
    const blob = new Blob([content], {
      type: 'text/csv;charset=utf-8;',
    });

    // Create a temporary anchor element
    const link = document.createElement('a');

    // Set the href to the Blob object
    link.href = URL.createObjectURL(blob);

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

    // Set the download attribute with the filename
    link.download = `assignments-${timestamp}.csv`;

    // Append the link to the document, click it, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  toJSON() {
    return JSON.stringify({
      members: this.members.map((member) => member.toJSON()),
      groups: this.groups.map((group) => group.toJSON()),
    });
  }

  fromJSON(jsonString) {
    const data = JSON.parse(jsonString);
    this.members = data.members.map(Member.fromJSON);
    this.groups = data.groups.map((groupData) =>
      Group.fromJSON(groupData, this)
    );
    console.log(this.groups);
    // Re-establish the connections that were severed during serialization
    this.members.forEach((member) => (member.system = this));
    this.groups.forEach((group) => {
      group.system = this;
      group.seats.forEach((seat) => {
        seat.system = this;
        seat.group = group;
      });
    });
  }
}
