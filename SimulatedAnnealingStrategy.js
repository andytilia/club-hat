import RandomAssignmentStrategy from './RandomAssignmentStrategy.js';

export default class SimulatedAnnealingStrategy {
  constructor(
    initialTemperature = 200,
    coolingRate = 0.999,
    maxIterations = 1000
  ) {
    this.initialTemperature = initialTemperature;
    this.coolingRate = coolingRate;
    this.maxIterations = maxIterations;
  }

  // Function to evaluate the quality or cost of a solution
  evaluate(solution, system) {
    // Call the original fitness evaluation method
    let fitness = system.evaluateSolutionFitness(solution);

    // // Create a map to store the group sizes
    // let groupSizes = {};

    // // Iterate through the solution to calculate the group sizes
    // for (let assign of solution) {
    //   let groupName = assign.groupName;
    //   groupSizes[groupName] = (groupSizes[groupName] || 0) + 1;
    // }
    // // Calculate the minimum and maximum group sizes
    // let minSize = Math.min(...Object.values(groupSizes));
    // let maxSize = Math.max(...Object.values(groupSizes));

    // // Calculate the percentage difference between the largest and smallest groups
    // let sizeDifference =
    //   ((maxSize - minSize) / ((maxSize + minSize) / 2)) * 100;

    // // Apply a penalty to the fitness score if the difference exceeds 15%
    // if (sizeDifference > 15) {
    //   // You can adjust the penalty factor as needed
    //   let penaltyFactor = 0.1;
    //   fitness *= penaltyFactor;
    // }

    // console.log(fitness);
    return fitness;
  }

  neighbor(currentSolution) {
    let newSolution = [...currentSolution]; // Clone the current solution to avoid modifying it directly

    // Randomly pick two distinct indices
    let idx1 = Math.floor(Math.random() * newSolution.length);
    let idx2 = Math.floor(Math.random() * newSolution.length);
    while (idx1 === idx2) {
      idx2 = Math.floor(Math.random() * newSolution.length);
    }

    // console.log(
    //   `swapping groups for ${currentSolution[idx1].memberName} and ${currentSolution[idx2].memberName}`
    // );

    // Swap the groupNames of the two chosen objects
    let temp = newSolution[idx1].groupName;
    newSolution[idx1].groupName = newSolution[idx2].groupName;
    newSolution[idx2].groupName = temp;

    return newSolution;
  }

  randomMember(solution) {
    // Randomly select an index
    let randomIndex = Math.floor(Math.random() * solution.length);

    // Get the member and its group assignment
    let member = solution[randomIndex];

    return member;
  }

  autoPlace(system) {
    let fitnessEvolution = [];
    let currentSolution = this.initializeSolution(system);
    let bestSolution = currentSolution;

    let currentTemperature = this.initialTemperature;
    console.log(currentSolution);
    for (let i = 0; i < this.maxIterations; i++) {
      let neighboringSolution = this.neighbor(currentSolution);

      let delta =
        this.evaluate(neighboringSolution, system) -
        this.evaluate(currentSolution, system);

      if (
        delta > 0 ||
        Math.random() < Math.exp(-delta / currentTemperature)
      ) {
        currentSolution = neighboringSolution;
      }

      if (
        this.evaluate(currentSolution, system) <
        this.evaluate(bestSolution, system)
      ) {
        bestSolution = currentSolution;
      }
      fitnessEvolution.push(this.evaluate(bestSolution, system));

      currentTemperature *= this.coolingRate;
    }

    return {
      bestSolution: bestSolution,
      fitnessEvolution: fitnessEvolution,
    };
  }

  initializeSolution(system) {
    const randomStrategy = new RandomAssignmentStrategy();
    const solution = randomStrategy.autoPlace(system);
    return solution;
  }
}
