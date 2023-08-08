import RandomAssignmentStrategy from './RandomAssignmentStrategy.js';

export default class GeneticAlgorithmStrategy {
  constructor(
    populationSize = 1000,
    mutationRate = 0.05,
    elitismRate = 0.2,
    generations = 15
  ) {
    this.populationSize = populationSize;
    this.mutationRate = mutationRate;
    this.generations = generations;
    this.elitismRate = elitismRate;
  }

  autoPlace(system) {
    let population = this.initializePopulation(system);
    for (
      let generation = 0;
      generation < this.generations;
      generation++
    ) {
      const fitness = population.map((solution) =>
        this.evaluateFitness(solution, system)
      );
      const parents = this.selectParents(population, fitness);
      const children = this.crossover(parents);
      this.mutate(children);
      population = this.selectNextGeneration(
        population,
        children,
        fitness
      );
    }
    return this.getBestSolution(population, system);
  }

  initializePopulation(system) {
    const randomStrategy = new RandomAssignmentStrategy();
    const population = Array.from(
      { length: this.populationSize },
      () => randomStrategy.autoPlace(system)
    );
    return population;
  }

  evaluateFitness(solution, system) {
    return system.evaluateSolutionFitness(solution);
  }

  selectParents(population, fitness) {
    let parents = [];
    let totalFitness = fitness.reduce((acc, val) => acc + val, 0);
    for (let i = 0; i < population.length; i++) {
      let randomValue = Math.random() * totalFitness;
      let sum = 0;
      for (let j = 0; j < population.length; j++) {
        sum += fitness[j];
        if (randomValue <= sum) {
          parents.push(population[j]);
          break;
        }
      }
    }
    return parents;
  }

  crossover(parents) {
    let children = [];
    for (let i = 0; i < parents.length - 1; i += 2) {
      let parent1 = parents[i];
      let parent2 = parents[i + 1];
      let crossoverPoint = Math.floor(Math.random() * parent1.length);
      let child1 = parent1
        .slice(0, crossoverPoint)
        .concat(parent2.slice(crossoverPoint));
      let child2 = parent2
        .slice(0, crossoverPoint)
        .concat(parent1.slice(crossoverPoint));
      children.push(child1, child2);
    }
    return children;
  }

  mutate(children) {
    for (let child of children) {
      if (Math.random() < this.mutationRate) {
        let index1 = Math.floor(Math.random() * child.length);
        let index2 = Math.floor(Math.random() * child.length);
        [child[index1].groupName, child[index2].groupName] = [
          child[index2].groupName,
          child[index1].groupName,
        ];
      }
    }
  }

  selectNextGeneration(population, children, fitness) {
    let nextGeneration = [];

    // Select the best individuals from the population
    let eliteSize = Math.floor(this.elitismRate * population.length);
    let eliteIndices = fitness
      .map((fit, idx) => ({ fit, idx }))
      .sort((a, b) => b.fit - a.fit)
      .slice(0, eliteSize)
      .map((elite) => elite.idx);
    nextGeneration = eliteIndices.map((idx) => population[idx]);

    // Fill the rest with the best children
    let remainingSize = population.length - eliteSize;
    nextGeneration = nextGeneration.concat(
      children.slice(0, remainingSize)
    );

    return nextGeneration;
  }

  getBestSolution(population, system) {
    let bestSolution = null;
    let bestFitness = -Infinity;

    for (const solution of population) {
      //   console.log(solution);
      const fitness = this.evaluateFitness(solution, system);
      //   console.log(fitness);
      if (fitness > bestFitness) {
        bestFitness = fitness;
        bestSolution = solution;
      }
    }

    return bestSolution;
  }
}