export default class Member {
  constructor(system, name, x, y, w, h, preferences) {
    this.system = system;
    this.name = name;
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.offsetX = 0;
    this.offsetY = 0;
    this.w = w;
    this.h = h;
    this.dragging = false;
    this.rollover = false;
    this.preferences = preferences; // Add this line
  }

  startDragging() {
    this.dragging = true;
    this.offsetX = this.system.p5.mouseX - this.x;
    this.offsetY = this.system.p5.mouseY - this.y;
  }

  stopDragging() {
    this.dragging = false;
  }

  move() {
    if (this.dragging) {
      this.x = this.system.p5.mouseX - this.offsetX;
      this.y = this.system.p5.mouseY - this.offsetY;
    }
  }

  show() {
    const p5 = this.system.p5;
    this.showOriginal();
    p5.strokeWeight(1);
    if (this.dragging) {
      p5.stroke(200, 0, 0);
    } else if (
      this.system.getFocusedMember() !== undefined &&
      this.system.getFocusedMember().name === this.name
    ) {
      p5.stroke(200, 200, 0);
      p5.strokeWeight(3);
    } else {
      p5.stroke(200);
    }

    p5.fill(255);
    p5.rect(this.x, this.y, this.w, this.h);
    p5.fill(0);
    p5.noStroke();
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.text(this.name, this.x + 5, this.y + this.h / 2);
  }

  showOriginal() {
    const p5 = this.system.p5;
    p5.fill(200); // light grey
    p5.noStroke();
    p5.rect(this.originalX, this.originalY, this.w, this.h);
    p5.fill(0); // black text
    p5.noStroke();
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.text(this.name, this.originalX + 5, this.originalY + this.h / 2);
  }

  isMouseOver() {
    const p5 = this.system.p5;
    if (
      p5.mouseX > this.x &&
      p5.mouseX < this.x + this.w &&
      p5.mouseY > this.y &&
      p5.mouseY < this.y + this.h
    ) {
      // Only consider this member as rolled over if no other member is being dragged
      this.rollover = this.system.getDraggingMember() === null;
      return this.rollover;
    } else {
      this.rollover = false;
      return false;
    }
  }

  isMouseOverOriginal() {
    const p5 = this.system.p5;
    return (
      p5.mouseX > this.originalX &&
      p5.mouseX < this.originalX + this.w &&
      p5.mouseY > this.originalY &&
      p5.mouseY < this.originalY + this.h
    );
  }
}
