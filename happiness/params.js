// scripts/params.js

// Function to initialize swarm parameters with random values
const initialParams = () => ({
  P1: Math.random() * 90 + 10, // Inter-Robot Distance
  P2: Math.random(),           // Spatial Synchronicity
  P3: Math.random(),           // Temporal Synchronicity
  P4: Math.random(),           // Aggregation Tendency
  P5: Math.random(),           // Leadership Tendency
  P6: Math.random()            // Figure Formation
});
