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
