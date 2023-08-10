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
    cellBuffer
  ) {
    this.system = system;
    this.name = name;
    this.x = startX;
    this.y = startY;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.cellBuffer = cellBuffer;
    this.seats = this.createSeats(seatCount);
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
    p5.text(this.name, this.x, this.y - 5);
  }
}
