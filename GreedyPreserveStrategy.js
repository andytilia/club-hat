export default class GreedyPreserveStrategy {
  autoPlace(system) {
    let bestSolution = [];
    let bestFitness = -Infinity; // Start with a very low initial fitness
    const fitnessEvolution = [];
    const potentialBestSolutions = [];

    for (let i = 0; i < 1000; i++) {
      const currentSolution = this.generateSolution(system);
      const currentFitness =
        system.evaluateSolutionFitness(currentSolution);

      fitnessEvolution.push(currentFitness);

      // Update best solution if the current solution is more fit
      if (currentFitness > bestFitness) {
        bestFitness = currentFitness;
        bestSolution = currentSolution;
        potentialBestSolutions.length = 0; // Clear the array
        potentialBestSolutions.push(currentSolution);
      } else if (currentFitness === bestFitness) {
        potentialBestSolutions.push(currentSolution);
      }
    }

    // If multiple solutions are tied for most fit, randomly select one
    if (potentialBestSolutions.length > 1) {
      bestSolution =
        potentialBestSolutions[
          Math.floor(Math.random() * potentialBestSolutions.length)
        ];
    }

    return {
      bestSolution: bestSolution,
      fitnessEvolution: fitnessEvolution,
    };
  }

  generateSolution(system) {
    const sizeBalance = 0.5;
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

    // console.log(`----- shuffling members`);
    // Shuffle members, groups, and preferences to introduce randomness
    const shuffledMembers = [...system.members].sort(
      () => Math.random() - 0.5
    );

    // Step 2: Assign members not enrolled in any group based on preferences
    for (let member of shuffledMembers) {
      //   console.log(`checking ${member.name}`);
      if (!assignment.some((a) => a.memberName === member.name)) {
        let assigned = false;
        // console.log(` not already assigned`);
        // Try to assign based on preferences if available
        if (member.preferences && member.preferences.length > 0) {
          const shuffledPreferences = [...member.preferences].sort(
            () => Math.random() - 0.5
          );
          //   console.log(` has ${member.preferences.length} prefs`);

          for (let preference of shuffledPreferences) {
            const preferredMember = system.members.find(
              (m) => m.id === preference
            );
            // console.log(`  checking pref ${preferredMember.name}`);
            if (
              preferredMember &&
              !assignment.some(
                (a) => a.memberName === preferredMember.name
              )
            ) {
              //   console.log(`  pref is not already assigned`);
              // Shuffle groups before checking for available seats
              const leastOccupiedGroup = this.getLeastAssignedGroup(
                assignment,
                system.groups
                  .filter((group) => !group.inviteOnly)
                  .map((group) => group.name)
              );

              //   console.log(`   assigning to ${leastOccupiedGroup}`);
              assignment.push({
                memberName: member.name,
                groupName: leastOccupiedGroup,
              });
              assignment.push({
                memberName: preferredMember.name,
                groupName: leastOccupiedGroup,
              });
              assigned = true;
              break;
            }
            if (assigned) {
              break;
            }
          }
        }

        // If not assigned based on preference, assign to any available group
        if (!assigned) {
          //   console.log(` not assigned based on prefs`);
          const leastOccupiedGroup = this.getLeastAssignedGroup(
            assignment,
            system.groups
              .filter((group) => !group.inviteOnly)
              .map((group) => group.name)
          );

          //   console.log(`  assigning to ${leastOccupiedGroup}`);
          assignment.push({
            memberName: member.name,
            groupName: leastOccupiedGroup,
          });
        }
      }
    }

    return assignment;
  }
  getLeastAssignedGroup(assignments, allGroupNames) {
    const groupCounts = {};

    // Initialize all group counts to 0
    for (let groupName of allGroupNames) {
      groupCounts[groupName] = 0;
    }

    // Count the occurrences of each group in assignments
    for (let assignment of assignments) {
      const groupName = assignment.groupName;
      groupCounts[groupName]++;
    }

    // Find the group with the smallest count
    let leastAssignedGroup = null;
    let minCount = Infinity;
    for (let groupName in groupCounts) {
      if (groupCounts[groupName] < minCount) {
        minCount = groupCounts[groupName];
        leastAssignedGroup = groupName;
      }
    }

    return leastAssignedGroup;
  }
}
