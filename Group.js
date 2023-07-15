class Group {
  constructor(name, seatCount, startX, startY) {
    this.name = name;
    this.x = startX;
    this.y = startY;
    this.seats = Array(seatCount)
      .fill()
      .map(
        (_, i) =>
          new Seat(
            startX,
            startY + i * (cellHeight + cellBuffer),
            cellWidth,
            cellHeight
          )
      );
  }

  show() {
    for (let seat of this.seats) {
      seat.show();
      seat.checkMouseOver();
    }
  }

  showTitle() {
    fill(0);
    noStroke();
    textAlign(LEFT, BOTTOM);
    let focusedMember = system.getFocusedMember();
    if (focusedMember && focusedMember.preferences.includes(this.name)) {
      stroke(200, 200, 0);
      strokeWeight(2);
      fill(50, 50, 0);
    }
    text(this.name, this.x, this.y - 5);
  }
}
