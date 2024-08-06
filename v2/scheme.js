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
  }

  setGroups(groups) {
    this.groups = groups;
  }

  setConnections(connections) {
    this.connections = connections;
  }

  assignConnections() {
    this.connections.forEach((c) => {
      let primaryId = c.slice(0, 1);
      let primaryPerson = this.getPersonById(primaryId)[0];
      if (!primaryPerson)
        console.log(`no person found for ${primaryId}`);
      let others = c.slice(1);
      console.log(
        `assigning ${others.length} connections to ${primaryPerson}`
      );
      primaryPerson.setConnectionIds(others);
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
      version: '0.3',
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
