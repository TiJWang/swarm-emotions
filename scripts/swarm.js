// scripts/swarm.js

let robots = [];
let numRobots = 10;
let params;
let state;
let feedbackSlider;
let cycleDisplay;
let stateDisplay;
let cycleCount = 0;
let trainingCycles = 10000;

// Function to initialize the swarm with robots
function initializeSwarm() {
  robots = [];
  for (let i = 0; i < numRobots; i++) {
    robots.push(new Robot(random(width), random(height)));
  }
  console.log('Swarm initialized with parameters:', params);
}

// Function to get user feedback from the slider
function getUserFeedback() {
  const feedback = feedbackSlider.value();
  console.log('User feedback received:', feedback);
  return feedback;
}

// Function to handle the feedback submission
function submitFeedback() {
  if (cycleCount < trainingCycles) {
    let reward = getUserFeedback();
    let action = chooseAction(state); // Choose the best action based on the current state
    let nextState = action.map((value, index) => {
      if (reward >= 90) {
        return state[index] + 0.1 * (value - state[index]);
      }
      return value;
    });

    if (nextState.some(isNaN)) {
      nextState = [params.P1, params.P2, params.P3, params.P4, params.P5, params.P6];
    }

    trainModel(state, action, reward, nextState);

    state = nextState;
    params = {
      P1: state[0],
      P2: state[1],
      P3: state[2],
      P4: state[3],
      P5: state[4],
      P6: state[5]
    };
    initializeSwarm();

    cycleCount++;
    cycleDisplay.html(`Training Cycle: ${cycleCount}`);
    console.log('Cycle count incremented to:', cycleCount);
  }
}
