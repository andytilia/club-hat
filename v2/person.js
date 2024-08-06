class Person {
  constructor(id, lastName, firstName) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.displayName = firstName + ' ' + lastName.slice(0, 1);
    this.x = round(random(35, width - 70));
    this.y = round(random(height - 150, height - 30));
    this.w = 60;
    this.h = 20;
    this.dragging = false;
    this.connections = [];
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

  updateHappiness(group) {
    if (group) {
      let uniqueConnections = new Set(this.connections);
      this.happiness = Array.from(uniqueConnections).filter(
        (connId) =>
          group.members.some(
            (member) => member && member.id === connId
          )
      ).length;
      if (this.connections.length > 0 && this.happiness === 0) {
        this.happiness = -1;
      }
    } else {
      this.happiness = 0;
    }
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
