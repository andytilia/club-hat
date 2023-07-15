let cellWidth = 100;
let cellHeight = 30;
let cellBuffer = 5;
let groupData;
let memberData;

function preload() {
  groupData = loadTable("groups.csv", "header");
  memberData = loadTable("members.csv", "header");
}
function setup() {
  createCanvas(windowWidth, windowHeight);
  system = new EnrollmentSystem();
  system.createGroups(groupData);
  system.createMembers(memberData);
}

function draw() {
  background(255);

  // Show each group and check for mouse over
  system.groups.forEach((group) => {
    group.show();
    group.showTitle();
  });

  // Show each member and check for mouse over or move if it's being dragged
  system.members.forEach((member) => {
    member.show();
    if (member.dragging) {
      member.move(mouseX, mouseY);
    }
  });
}

function mousePressed() {
  // If a member was clicked, start dragging it
  for (let member of system.members) {
    if (member.checkMouseOver()) {
      system.startDraggingMember(member);
      break;
    }
  }
}

function mouseReleased() {
  system.releaseMembers();
  system.stopDraggingMember();
}
