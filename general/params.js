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

// agnry
// let parameterSets = [
//   [76.23, 13.03, 23.05, -0.08, -3.87, 13.26],
//   [70.76, 36.66, -15.06, 29.02, 24.29, -4.90],
//   [49.59, 5.29, 32.34, -10.01, 30.06, 13.01],
//   [117.07, -21.58, 10.19, -0.28, 0.34, 21.21],
//   [6.45, -7.39, 11.03, -16.13, -6.48, -11.22],
//   [121.23, 31.73, 14.49, 20.81, 18.43, 19.98],
//   [94.72, 9.19, 1.70, -7.75, -2.97, -5.13]
// ];

// fear
let parameterSets = [
//   [80.92, -11.89, -17.89, -4.63, -13.33, -7.81],
  // [76.98, 44.62, -15.93, 3.11, -7.96, -14.32],
  // [103.69, 9.20, 1.89, 6.65, -0.26, 29.09],
//   [94.13, -2.98, -5.90, -12.17, 23.28, 3.87],
  // [0.06, -21.70, 0.67, -16.78, -10.02, -74.37],
//   [12.23, -21.10, -34.62, 12.23, 2.09, 43.19],
//   [70.30, 0.39, 19.45, -19.54, 0.39, 23.00]
];

// sadness
// let parameterSets = [
//   [10.90, 0.12, 0.63, 0.60, 0.70, 0.77],
//   [57.09, 0.64, -6.19, -11.57, -18.55, -19.39],
//   [63.61, 5.58, -31.16, -20.03, -12.45, -17.43],
//   [89.21, 0.17, -2.39, -6.04, 5.63, -8.14],
//   [83.81, 0.23, 0.75, 0.64, 0.68, 1.00],
//   [41.36, -0.06, -8.80, -0.28, 4.64, 1.44],
//   [92.81, -0.31, -1.83, -6.83, 18.39, 1.98]
// ];

// happiness
// let parameterSets = [
//   [27.82, 6.45, -12.02, 10.27, -0.77, 3.56],
//   [46.50, -4.67, -28.12, -6.47, -20.25, 50.37],
//   [45.81, 4.25, 9.86, -8.48, 16.31, 10.38],
//   [69.75, 3.19, 2.24, -0.65, -9.31, 1.00],
//   [20.90, 3.27, 7.02, 15.18, 4.24, -5.42],
//   [17.87, 4.48, 12.86, 0.87, -11.17, 14.28],
//   [61.42, -1.39, 5.10, -1.24, 2.98, -5.43]
// ];


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
