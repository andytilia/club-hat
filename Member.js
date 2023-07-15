class Member {
  constructor(name, x, y, w, h, preferences) {
    this.name = name;
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.dragging = false;
    this.rollover = false;
    this.preferences = preferences; // Add this line
  }

  startDragging() {
    this.dragging = true;
  }

  stopDragging() {
    this.dragging = false;
  }

  move(x, y) {
    if (this.dragging) {
      this.x = x - this.w / 2; // adjusting so that mouse is at the center of the member rectangle
      this.y = y - this.h / 2; // adjusting so that mouse is at the center of the member rectangle
    }
  }

  show() {
    this.showOriginal();
    strokeWeight(1);
    if (this.dragging) {
      stroke(200, 0, 0);
    } else if (
      system.getFocusedMember() !== undefined &&
      system.getFocusedMember().name === this.name
    ) {
      stroke(200, 200, 0);
      strokeWeight(3);
    } else {
      stroke(200);
    }

    fill(255);
    rect(this.x, this.y, this.w, this.h);
    fill(0);
    noStroke();
    textAlign(LEFT, CENTER);
    text(this.name, this.x + 5, this.y + this.h / 2);
  }

  showOriginal() {
    fill(200); // light grey
    noStroke();
    rect(this.originalX, this.originalY, this.w, this.h);
    fill(0); // black text
    noStroke();
    textAlign(LEFT, CENTER);
    text(this.name, this.originalX + 5, this.originalY + this.h / 2);
  }

  checkMouseOver() {
    if (
      mouseX > this.x &&
      mouseX < this.x + this.w &&
      mouseY > this.y &&
      mouseY < this.y + this.h
    ) {
      // Only consider this member as rolled over if no other member is being dragged
      this.rollover = system.getDraggingMember() === null;
      return this.rollover;
    } else {
      this.rollover = false;
      return false;
    }
  }

  checkMouseOverOriginal() {
    return (
      mouseX > this.originalX &&
      mouseX < this.originalX + this.w &&
      mouseY > this.originalY &&
      mouseY < this.originalY + this.h
    );
  }
}
