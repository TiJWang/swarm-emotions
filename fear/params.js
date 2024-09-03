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
  [42.33, -3.68, 0.01, -4.91, 1.15, -1.66],
  [54.17, 15.80, 20.19, -17.18, 32.61, -22.99],
  [62.86, -18.72, -15.09, 17.31, 3.55, 3.84],
  [73.41, -2.77, 24.93, 1.21, -31.19, 10.61],
  [128.25, 25.16, -3.25, -32.54, -9.46, 18.98]
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
