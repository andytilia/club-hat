import Seat from './Seat.js';

export default class Group {
  constructor(
    system,
    name,
    seatCount,
    startX,
    startY,
    cellWidth,
    cellHeight,
    cellBuffer,
    inviteOnly = false
  ) {
    this.system = system;
    this.name = name;
    this.x = startX;
    this.y = startY;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.cellBuffer = cellBuffer;
    this.seats = this.createSeats(seatCount);
    this.inviteOnly = inviteOnly;
  }

  getMembers() {
    return this.seats.map((seat) => seat.member);
  }

  createSeats(count) {
    const seats = Array(count)
      .fill()
      .map(
        (_, i) =>
          new Seat(
            this,
            this.x,
            this.y + i * (this.cellHeight + this.cellBuffer),
            this.cellWidth,
            this.cellHeight
          )
      );
    return seats;
  }

  show() {
    for (let seat of this.seats) {
      seat.show();
      seat.isMouseOver();
    }
  }

  showTitle() {
    const p5 = this.system.p5;
    p5.fill(0);
    p5.noStroke();
    p5.textAlign(p5.LEFT, p5.BOTTOM);
    if (this.system.preferencesType === 'groupPreferences') {
      let focusedMember = this.system.getFocusedMember();
      if (
        focusedMember &&
        focusedMember.preferences.includes(this.name)
      ) {
        p5.stroke(200, 200, 0);
        p5.strokeWeight(2);
        p5.fill(50, 50, 0);
      }
    }
    console.log(`showing ${this.name} at ${this.x}, ${this.y - 5}`);
    p5.text(this.name, this.x, this.y - 5);
  }

  toJSON() {
    return {
      name: this.name,
      x: this.x,
      y: this.y,
      cellWidth: this.cellWidth,
      cellHeight: this.cellHeight,
      cellBuffer: this.cellBuffer,
      seats: this.seats.map((seat) => seat.toJSON()),
      inviteOnly: this.inviteOnly,
      // Skipping 'system' to avoid circular references.
    };
  }

  static fromJSON(data, system) {
    let group = new Group(
      system,
      data.name,
      data.seatCount,
      data.x,
      data.y,
      data.cellWidth,
      data.cellHeight,
      data.cellBuffer,
      data.inviteOnly
    );
    console.log(group);
    group.seats = data.seats.map((seatData) => {
      console.log(seatData);
      return Seat.fromJSON(group, seatData, system.members);
    });
    group.seats.forEach((seat) => (seat.group = group)); // Ensure each seat's group attribute is set
    return group;
  }
}
