// scripts/params.js

// Function to initialize swarm parameters with random values
// const initialParams = () => ({
//   P1: Math.random() * 90 + 10, // Inter-Robot Distance
//   P2: Math.random(),           // Spatial Synchronicity
//   P3: Math.random(),           // Temporal Synchronicity
//   P4: Math.random(),           // Aggregation Tendency
//   P5: Math.random(),           // Leadership Tendency
//   P6: Math.random()            // Figure Formation
// });

let parameterSets = [
  [71.49, -5.60, 16.75, -5.37, -6.60, -12.52],
  [24.05, 10.24, 1.61, 1.24, 14.68, -3.22],
  [72.82, -8.51, -13.96, -2.30, -10.26, 18.79],
  [105.61, -3.61, 1.35, 1.42, -7.48, 4.76],
  [99.65, 10.84, 3.25, 1.02, 21.79, 15.02]
];


function calculateAverageParams(parameterSets) {
  let numberOfSets = parameterSets.length;
  let sumParams = Array(parameterSets[0].length).fill(0);

  parameterSets.forEach(params => {
    params.forEach((value, index) => {
      sumParams[index] += value;
    });
  });

  let averageParams = sumParams.map(sum => sum / numberOfSets);
  return averageParams;
}

let averageParams = calculateAverageParams(parameterSets);

const initialParams = () => ({
  P1: averageParams[0], // Inter-Robot Distance
  P2: averageParams[1], // Spatial Synchronicity
  P3: averageParams[2], // Temporal Synchronicity
  P4: averageParams[3], // Aggregation Tendency
  P5: averageParams[4], // Leadership Tendency
  P6: averageParams[5]  // Figure Formation
});
