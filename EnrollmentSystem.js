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
  }

  autoPlaceMembers() {
    const assignment = this.strategy.autoPlace(this);
    // console.log(assignment);
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

      let newGroup = new Group(
        this,
        groupName,
        groupMaxSize,
        initialX,
        initialY,
        cellWidth,
        cellHeight,
        cellBuffer
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
      console.log(newMember);
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
    return happyMembers.length / membersHavingPreference.length;
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

  async saveAssignments() {
    // Create an object to store the assignments, with group names as keys
    let assignments = {};

    // Iterate through the groups and seats
    for (let group of this.groups) {
      // Create an array for each group's members
      assignments[group.name] = [];

      for (let seat of group.seats) {
        // If the seat is occupied, add the member's name to the group's array
        if (seat.isOccupied()) {
          assignments[group.name].push(seat.member.name);
        }
      }
    }

    // Convert the assignments to a CSV format (one column per group)
    let csvAssignments = '';
    let maxGroupSize = Math.max(
      ...Object.values(assignments).map((members) => members.length)
    );
    for (let i = -1; i < maxGroupSize; i++) {
      for (let groupName of Object.keys(assignments)) {
        // New logic: Add member's name for the "Members" column
        if (i === -1) {
          csvAssignments += `"Members",`;
        } else {
          let memberName = this.members[i]
            ? this.members[i].name
            : '';
          csvAssignments += `"${memberName}",`;
        }

        // Add the group name as the header for the first row
        if (i === -1) {
          csvAssignments += `"${groupName}",`;
          continue;
        }

        // Add the member's name or an empty cell if the group is smaller
        let memberName = assignments[groupName][i] || '';
        csvAssignments += `"${memberName}",`;
      }
      csvAssignments += '\n'; // End of row
    }

    // Copy the CSV content to the clipboard
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

    // Save the CSV string to a file (or handle it as needed)
    // You might use a library or custom code to download the file in the browser:
    this.downloadFile(csvAssignments);

    // Return the assignments as a CSV string (optional)
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
}
