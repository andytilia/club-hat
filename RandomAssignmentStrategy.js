export default class RandomAssignmentStrategy {
  autoPlace(system) {
    const assignment = [];
    let availableGroups = [...system.groups];

    for (let member of system.members) {
      const randomGroup =
        this.getRandomGroupWithAvailableSeat(availableGroups);
      if (randomGroup) {
        assignment.push({
          memberName: member.name,
          groupName: randomGroup.name,
        });
        this.assignMemberToGroup(randomGroup, member);
      }

      availableGroups = availableGroups.filter((group) =>
        this.hasAvailableSeat(group)
      );
    }

    return assignment;
  }

  getRandomGroupWithAvailableSeat(groups) {
    const groupsWithAvailableSeats = groups.filter((group) =>
      this.hasAvailableSeat(group)
    );
    return groupsWithAvailableSeats[
      Math.floor(Math.random() * groupsWithAvailableSeats.length)
    ];
  }

  hasAvailableSeat(group) {
    return group.seats.some((seat) => !seat.isOccupied());
  }

  assignMemberToGroup(group, member) {
    const availableSeat = group.seats.find(
      (seat) => !seat.isOccupied()
    );
    if (availableSeat) {
      availableSeat.assignMember(member);
    }
  }
}
