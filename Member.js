export default class Member {
  constructor(system, id, name, x, y, w, h, preferences) {
    this.system = system;
    this.id = id;
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
    this.preferences = preferences;
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
      this.system.getFocusedMember().id === this.id
    ) {
      p5.stroke(20, 20, 20);
      p5.strokeWeight(2);
    } else if (
      this.system.getFocusedMember() !== undefined &&
      this.system.getFocusedMember().preferences.includes(this.id)
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

    p5.textAlign(p5.RIGHT, p5.CENTER);
    p5.text(
      this.getHappiness(),
      this.x + this.w - 5,
      this.y + this.h / 2
    );
  }

  showOriginal() {
    const p5 = this.system.p5;
    p5.fill(200); // light grey
    p5.noStroke();
    p5.rect(this.originalX, this.originalY, this.w, this.h);
    p5.fill(0); // black text
    p5.noStroke();
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.text(
      this.name,
      this.originalX + 5,
      this.originalY + this.h / 2
    );

    p5.textAlign(p5.RIGHT, p5.CENTER);
    p5.text(
      this.getHappiness(),
      this.originalX + this.w - 5,
      this.originalY + this.h / 2
    );
  }

  isMouseOver() {
    const p5 = this.system.p5;
    if (
      p5.mouseX > this.x &&
      p5.mouseX < this.x + this.w &&
      p5.mouseY > this.y &&
      p5.mouseY < this.y + this.h
    ) {
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

  getGroup() {
    return (
      this.system.groups.find((group) =>
        group.seats.some((seat) => seat.member === this)
      ) || null
    );
  }

  getGroupmateIds() {
    const group = this.getGroup();
    if (!group) {
      return [];
    }
    const groupMembers = group.getMembers();
    if (groupMembers.length == 0) {
      return [];
    }

    return groupMembers
      .filter((member) => member !== null && member.id !== this.id)
      .map((member) => member.id);
  }

  getHappiness() {
    if (!this.preferences.length) return '';

    let group, groupmates, matchedPrefs;
    switch (this.system.preferencesType) {
      case 'groupPreferences':
        group = this.getGroup();
        if (!group) return '?';

        let index = this.preferences.indexOf(group.name);
        return index >= 0 ? index + 1 : 'X';

      case 'memberPreferences':
        group = this.getGroup();
        groupmates = this.getGroupmateIds();
        if (!group || !groupmates) return '?';

        matchedPrefs = this.preferences.filter((pref) =>
          groupmates.includes(pref)
        );
        return matchedPrefs.length > 0 ? matchedPrefs.length : 'X';

      default:
        return '';
    }
  }

  isHappy() {
    return !Number.isNaN(Number.parseInt(this.getHappiness()));
  }
}
