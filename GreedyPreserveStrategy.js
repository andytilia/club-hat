export default class GreedyPreserveStrategy {
  autoPlace(system) {
    const assignment = [];

    // Step 1: Preserve existing enrollments
    for (let group of system.groups) {
      for (let seat of group.seats) {
        if (seat.isOccupied()) {
          assignment.push({
            memberName: seat.member.name,
            groupName: group.name,
          });
        }
      }
    }

    // Shuffle members, groups, and preferences to introduce randomness
    const shuffledMembers = [...system.members].sort(
      () => Math.random() - 0.5
    );

    // Step 2: Assign members not enrolled in any group based on preferences
    for (let member of shuffledMembers) {
      if (!assignment.some((a) => a.memberName === member.name)) {
        let assigned = false;

        // Try to assign based on preferences if available
        if (member.preferences && member.preferences.length > 0) {
          const shuffledPreferences = [...member.preferences].sort(
            () => Math.random() - 0.5
          );
          for (let preference of shuffledPreferences) {
            const preferredMember = system.members.find(
              (m) => m.id === preference
            );
            if (
              preferredMember &&
              !assignment.some(
                (a) => a.memberName === preferredMember.name
              )
            ) {
              // Shuffle the not invite-only groups before checking for available seats
              const shuffledOpenGroups = [...system.groups]
                .filter((g) => !g.inviteOnly)
                .sort(() => Math.random() - 0.5);
              // Check for a group where both members can be placed
              for (let group of shuffledOpenGroups) {
                const availableSeats = group.seats.filter(
                  (s) => !s.isOccupied()
                );
                if (availableSeats.length >= 2) {
                  assignment.push({
                    memberName: member.name,
                    groupName: group.name,
                  });
                  assignment.push({
                    memberName: preferredMember.name,
                    groupName: group.name,
                  });
                  assigned = true;
                  break;
                }
              }
            }
            if (assigned) {
              break;
            }
          }
        }

        // If not assigned based on preference, assign to any available group
        if (!assigned) {
          // Shuffle groups before checking for a seat for the member
          const shuffledGroups = [...system.groups].sort(
            () => Math.random() - 0.5
          );
          for (let group of shuffledGroups) {
            const availableSeat = group.seats.find(
              (s) => !s.isOccupied()
            );
            if (availableSeat) {
              assignment.push({
                memberName: member.name,
                groupName: group.name,
              });
              break;
            }
          }
        }
      }
    }
    const bestSolution = assignment;
    return {
      bestSolution: bestSolution,
      fitnessEvolution: [],
    };
  }
}
