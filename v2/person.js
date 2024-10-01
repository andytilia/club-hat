class Person {
  constructor(id, lastName, firstName) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.displayName = firstName + ' ' + lastName.slice(0, 1);
    this.x = round(random(width - 400, width - 70));
    this.y = round(random(50, height - 50));
    this.w = 60;
    this.h = 20;
    this.dragging = false;
    this.connections = [];
    this.groupPreferences = [];
    this.happiness = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  isMouseOver() {
    return (
      mouseX > this.x &&
      mouseX < this.x + this.w &&
      mouseY > this.y &&
      mouseY < this.y + this.h
    );
  }

  setConnectionIds(idList) {
    this.connections = idList;
  }

  getConnectionIds() {
    return this.connections;
  }

  setGroupPreferences(preferenceList) {
    this.groupPreferences = preferenceList;
  }

  getGroupPreferences() {
    return this.groupPreferences;
  }

  calculateHappiness(group) {
    if (!group) return 0;

    let happiness = 0;
    if (this.groupPreferences.length > 0) {
      const preferenceIndex = this.groupPreferences.indexOf(
        group.title
      );
      happiness =
        preferenceIndex !== -1
          ? this.groupPreferences.length - preferenceIndex
          : 0;
    } else {
      happiness = group.members.filter(
        (m) => m !== null && this.connections.includes(m.id)
      ).length;
    }

    if (
      happiness === 0 &&
      (this.connections.length > 0 ||
        this.groupPreferences.length > 0)
    ) {
      happiness = -1;
    }

    return happiness;
  }

  updateHappiness(group) {
    this.happiness = this.calculateHappiness(group);
  }

  startDragging(mx, my) {
    this.dragging = true;
    this.offsetX = this.x - mx;
    this.offsetY = this.y - my;
  }

  stopDragging() {
    this.dragging = false;
  }

  updatePosition() {
    if (this.dragging) {
      this.x = mouseX + this.offsetX;
      this.y = mouseY + this.offsetY;
    }
  }

  toString() {
    return `${this.id}: ${this.lastName}, ${this.firstName}`;
  }
}
