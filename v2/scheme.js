class Scheme {
  constructor(title) {
    this.title = title;
    this.people = [];
    this.groups = [];
    this.connections = [];
    this.currentDragged = null;
    this.currentHover = null;
    this.currentConnectionIds = [];
  }

  setPeople(people) {
    this.people = people;
    this.ensureDataQuality();
  }

  setGroups(groups) {
    this.groups = groups;
    this.ensureDataQuality();
  }

  setConnections(connections) {
    this.connections = connections;
    this.ensureDataQuality();
  }

  autoassign(algorithm) {
    const unassignedPeople = this.people.filter(
      (person) =>
        !this.groups.some((group) => group.members.includes(person))
    );

    switch (algorithm) {
      case 'random':
        this.randomAssignment(unassignedPeople);
        break;
      case 'sequential':
        this.sequentialAssignment(unassignedPeople);
        break;
      case 'balanced':
        this.balancedAssignment(unassignedPeople);
        break;
      default:
        console.error('Unknown algorithm:', algorithm);
    }

    // Recalculate happiness for all groups
    this.groups.forEach((group) => group.recalculateHappiness());

    this.ensureDataQuality();
  }

  randomAssignment(unassignedPeople) {
    for (let person of unassignedPeople) {
      let availableGroups = this.groups.filter((group) =>
        group.hasAvailableSlot()
      );
      if (availableGroups.length > 0) {
        let randomGroup = random(availableGroups);
        randomGroup.addMember(
          person,
          randomGroup.x + 10,
          randomGroup.y + 40
        );
      }
    }
  }

  sequentialAssignment(unassignedPeople) {
    // Implementation will be added in the next step
  }

  balancedAssignment(unassignedPeople) {
    // Sort people by number of connections, descending
    unassignedPeople.sort(
      (a, b) => b.connections.length - a.connections.length
    );
    // Randomize order of people with the same number of connections
    this.randomizeEqualConnections(unassignedPeople);

    for (let person of unassignedPeople) {
      let bestGroup = null;
      let bestScore = -1;

      // Create a randomized copy of the groups array
      let randomizedGroups = this.shuffleArray([...this.groups]);

      for (let group of randomizedGroups) {
        if (this.canAddToGroup(group)) {
          let score = this.calculateGroupScore(person, group);
          if (score > bestScore) {
            bestScore = score;
            bestGroup = group;
          }
        }
      }

      if (bestGroup) {
        bestGroup.addMember(
          person,
          bestGroup.x + 10,
          bestGroup.y + 40
        );
      }
    }
  }

  calculateGroupScore(person, group) {
    return group.members.filter(
      (member) => member && person.connections.includes(member.id)
    ).length;
  }

  randomizeEqualConnections(people) {
    let start = 0;
    for (let i = 1; i <= people.length; i++) {
      if (
        i === people.length ||
        people[i].connections.length !==
          people[start].connections.length
      ) {
        this.shuffleArray(people, start, i);
        start = i;
      }
    }
  }

  shuffleArray(array, start = 0, end = array.length) {
    for (let i = end - 1; i > start; i--) {
      const j = Math.floor(Math.random() * (i - start + 1)) + start;
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  canAddToGroup(group) {
    const currentSize = group.members.filter(
      (m) => m !== null
    ).length;
    const minGroupSize = Math.min(
      ...this.groups.map(
        (g) => g.members.filter((m) => m !== null).length
      )
    );
    return (
      currentSize < group.maxSize && currentSize < minGroupSize + 5
    );
  }

  assignConnections() {
    this.connections.forEach((c) => {
      let primaryId = c.slice(0, 1);
      let primaryPerson = this.getPersonById(primaryId)[0];
      if (!primaryPerson) {
        console.log(`no person found for ${primaryId}`);
      } else {
        let others = c.slice(1);
        console.log(
          `assigning ${others.length} connections to ${primaryPerson}`
        );
        primaryPerson.setConnectionIds(others);
      }
    });
  }

  getPersonById(id) {
    return this.people.filter((p) => p.id == id);
  }

  handlePress(px, py) {
    for (let person of this.people) {
      if (person.isMouseOver(px, py)) {
        this.currentDragged = person;
        person.startDragging(px, py);
        // console.log(`Dragging ${person.toString()}`);
        break;
      }
    }
  }

  handleHover(x, y) {
    for (let person of this.people) {
      if (person.isMouseOver(x, y) && this.currentDragged == null) {
        this.currentHover = person;
        this.currentConnectionIds = person.getConnectionIds();
        // console.log(`Hovering over ${person.toString()}`);
        break;
      }
    }
  }

  clearHover() {
    this.currentHover = null;
    this.currentConnectionIds = [];
  }

  handleRelease(px, py) {
    if (this.currentDragged) {
      console.log(`dragging: ${this.currentDragged}`);
      let draggedPerson = this.currentDragged;

      // Remove dragged person from all groups
      for (let group of this.groups) {
        group.removeMember(draggedPerson);
      }

      // Check if dragged person is dropped inside any group
      let droppedInGroup = false;
      for (let group of this.groups) {
        if (
          group.contains(
            draggedPerson.x + draggedPerson.w / 2,
            draggedPerson.y + draggedPerson.h / 2
          )
        ) {
          group.addMember(draggedPerson, px, py);
          droppedInGroup = true;
          break;
        }
      }

      // Stop dragging the person
      draggedPerson.stopDragging();
      this.currentDragged = null;
    }

    this.ensureDataQuality();
  }

  handleMove(px, py) {
    if (this.currentDragged) {
      this.currentDragged.updatePosition(px, py);
    }
  }

  getUnassignedCount() {
    return this.people.filter(
      (person) =>
        !this.groups.some((group) => group.members.includes(person))
    ).length;
  }

  getUnhappyCount() {
    return this.people.filter((person) => person.happiness === -1)
      .length;
  }

  getPeopleWithConnectionsCount() {
    return this.people.filter(
      (person) => person.connections.length > 1
    ).length;
  }

  updatePersonHappiness(person) {
    let assignedGroup = this.groups.find((group) =>
      group.members.includes(person)
    );
    if (assignedGroup) {
      let connectionCount = assignedGroup.members.filter(
        (m) => m !== null && person.connections.includes(m.id)
      ).length;
      person.happiness =
        connectionCount > 0
          ? connectionCount
          : person.connections.length > 0
          ? -1
          : 0;
    } else {
      person.happiness = 0;
    }
  }

  validateDataQuality() {
    let errors = [];
    let warnings = [];

    // Check for unique person IDs
    let personIds = new Set();
    for (let person of this.people) {
      if (personIds.has(person.id)) {
        errors.push(`Duplicate person ID: ${person.id}`);
      }
      personIds.add(person.id);
    }

    // Check for unique group titles
    let groupTitles = new Set();
    for (let group of this.groups) {
      if (groupTitles.has(group.title)) {
        errors.push(`Duplicate group title: ${group.title}`);
      }
      groupTitles.add(group.title);
    }

    // Check required fields and data types
    for (let person of this.people) {
      if (!person.id || !person.firstName || !person.lastName) {
        errors.push(
          `Missing required field for person: ${person.id}`
        );
      }
      if (typeof person.id !== 'string') {
        errors.push(`Invalid ID type for person: ${person.id}`);
      }
    }

    for (let group of this.groups) {
      if (!group.title || !group.maxSize) {
        errors.push(
          `Missing required field for group: ${group.title}`
        );
      }
      if (!Number.isInteger(group.maxSize) || group.maxSize <= 0) {
        errors.push(
          `Invalid maxSize for group: ${group.title}, ${group.maxSize}`
        );
      }
    }

    // Check connections and remove invalid ones
    for (let person of this.people) {
      let validConnections = [];
      for (let connId of person.connections) {
        if (!personIds.has(connId)) {
          warnings.push(
            `Removed invalid connection ID ${connId} for person ${person.id}`
          );
        } else if (connId === person.id) {
          warnings.push(
            `Removed self-connection for person ${person.id}`
          );
        } else {
          validConnections.push(connId);
        }
      }
      if (validConnections.length !== person.connections.length) {
        person.connections = validConnections;
        this.updatePersonHappiness(person);
      }
    }

    // Check group assignments
    for (let group of this.groups) {
      if (
        group.members.filter((m) => m !== null).length > group.maxSize
      ) {
        errors.push(`Group ${group.title} exceeds maxSize`);
      }
      for (let member of group.members) {
        if (member !== null && !this.people.includes(member)) {
          errors.push(
            `Invalid member in group ${group.title}: ${member.id}`
          );
        }
      }
    }

    // Check happiness consistency
    for (let person of this.people) {
      let assignedGroup = this.groups.find((group) =>
        group.members.includes(person)
      );
      if (assignedGroup) {
        let expectedHappiness = assignedGroup.members.filter(
          (m) => m !== null && person.connections.includes(m.id)
        ).length;
        if (
          expectedHappiness === 0 &&
          person.connections.length > 0
        ) {
          expectedHappiness = -1;
        }
        if (person.happiness !== expectedHappiness) {
          this.updatePersonHappiness(person);
          warnings.push(`Updated happiness for person ${person.id}`);
        }
      }
    }

    // Check for people occupying the same spot in a group
    for (let group of this.groups) {
      let occupiedPositions = new Set();
      for (let i = 0; i < group.members.length; i++) {
        let member = group.members[i];
        if (member !== null) {
          let position = `${member.x},${member.y}`;
          if (occupiedPositions.has(position)) {
            errors.push(
              `Multiple people occupy the same position in group ${group.title} at (${position})`
            );
          }
          occupiedPositions.add(position);
        }
      }
    }

    return { errors, warnings };
  }

  ensureDataQuality() {
    const { errors, warnings } = this.validateDataQuality();

    if (warnings.length > 0) {
      console.warn('Data quality warnings. call Andy.');
      warnings.forEach((warning) => console.warn(warning));
    }

    if (errors.length > 0) {
      alert('Data quality issues detected. call Andy.');
      errors.forEach((error) => console.error(error));
      throw new Error('Data quality check failed');
    }
  }

  show() {
    this.showGroups();
    this.showPeople();
    this.showStatistics();
  }

  showGroups() {
    for (let group of this.groups) {
      fill(255);
      stroke(0);
      strokeWeight(1);
      rect(group.x, group.y, group.w, group.h);

      fill(0);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(16);
      text(group.title, group.x + group.w / 2, group.y + 15);

      // draw slots
      let rows = group.maxSize;
      for (let row = 0; row < rows; row++) {
        let x = group.x + 10;
        let y = group.y + row * 40 + 40;
        fill(230);
        strokeWeight(1);
        stroke(100);
        rect(x, y, 60, 20);
      }
    }
  }

  showPeople() {
    // Draw all people except the currently clicked one
    for (let person of this.people) {
      person.updatePosition();
      if (person !== this.currentDragged) {
        this.showPerson(person);
      }
    }

    // Draw the currently clicked person last to ensure they appear on top
    if (this.currentDragged) {
      this.showPerson(this.currentDragged);
    }
  }

  showPerson(person) {
    if (
      this.currentHover == person ||
      this.currentDragged == person
    ) {
      fill(210, 210, 40, 100);
    } else if (this.currentConnectionIds.includes(person.id)) {
      fill(255, 255, 40, 100);
    } else {
      fill(255, 100);
    }

    // Determine the outline color and weight based on the person's connections and happiness
    let assignedToGroup = this.groups.some((group) =>
      group.members.includes(person)
    );
    if (!assignedToGroup) {
      stroke(200); // Black outline if not assigned to any group
      strokeWeight(1);
    } else if (person.connections.length === 0) {
      stroke(0); // Black outline if no connections
      strokeWeight(1);
    } else if (person.happiness === -1) {
      stroke(200, 0, 0); // Red outline if assigned to a group but happiness is 0
      strokeWeight(1);
    } else {
      stroke(0, 200, 0); // Green outline if assigned to a group and happiness is greater than 0
      strokeWeight(person.happiness);
    }
    rect(person.x, person.y, person.w, person.h);

    fill(0);
    noStroke();
    textSize(12);
    textAlign(CENTER, CENTER);
    text(
      person.displayName,
      person.x + person.w / 2,
      person.y + person.h / 2
    );
  }

  showStatistics() {
    let unassignedCount = this.getUnassignedCount();
    let totalCount = this.people.length;
    let unassignedPercentage =
      totalCount > 0
        ? ((unassignedCount / totalCount) * 100).toFixed(2)
        : 0;

    let unhappyCount = this.getUnhappyCount();
    let peopleWithConnectionsCount =
      this.getPeopleWithConnectionsCount();
    let unhappyPercentage =
      peopleWithConnectionsCount > 0
        ? ((unhappyCount / peopleWithConnectionsCount) * 100).toFixed(
            2
          )
        : 0;

    fill(0);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(24);
    text(`Unassigned: ${unassignedCount}`, 10, height - 60);
    text(`Unhappy: ${unhappyCount}`, 10, height - 30);
  }
  serialize() {
    return JSON.stringify({
      version: '2.5.1',
      title: this.title,
      people: this.people.map((person) => ({
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        connections: person.connections,
        happiness: person.happiness,
        x: person.x,
        y: person.y,
      })),
      groups: this.groups.map((group) => ({
        title: group.title,
        maxSize: group.maxSize,
        x: group.x,
        y: group.y,
        members: group.members.map((member) =>
          member ? member.id : null
        ),
      })),
    });
  }
  static deserialize(data) {
    const obj = JSON.parse(data);
    const scheme = new Scheme(obj.title);

    // Assuming you have a Person class with necessary methods
    const deserializedPeople = obj.people.map((personData) => {
      const person = new Person(
        personData.id,
        personData.lastName,
        personData.firstName
      );
      person.x = personData.x;
      person.y = personData.y;
      person.happiness = personData.happiness;
      person.connections = personData.connections;
      return person;
    });

    scheme.setPeople(deserializedPeople);

    const deserializedGroups = obj.groups.map((groupData) => {
      const group = new Group(
        groupData.title,
        groupData.maxSize,
        groupData.x,
        groupData.y
      );
      group.members = groupData.members.map((memberId) => {
        if (memberId !== null) {
          const member = scheme.getPersonById(memberId)[0];
          return member || null;
        } else {
          return null;
        }
      });
      return group;
    });

    scheme.setGroups(deserializedGroups);
    return scheme;
  }
}
