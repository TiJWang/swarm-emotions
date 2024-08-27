let robots = [];
let numRobots = 10;
let params;
let state;
let feedbackSlider;
let cycleDisplay;
let stateDisplay;
let cycleCount = 0;
let trainingCycles = 10000;

function initializeSwarm() {
  robots = [];
  for (let i = 0; i < numRobots; i++) {
    let centerX = random(50, width - 50);
    let centerY = random(50, height - 50);

    let radius = random(50, 50);

    robots.push(new Robot(centerX, centerY, radius));
  }
  console.log('Swarm initialized with ' + numRobots + ' robots.');
}

function getUserFeedback() {
  const feedback = feedbackSlider.value();
  console.log('User feedback received:', feedback);
  return feedback;
}

function submitFeedback() {
  if (cycleCount < trainingCycles) {
    let reward = getUserFeedback();
    let action = chooseAction(state);

    let nextState = state.map((value, i) => value + (Math.random() - 0.5) * 10); // Simulate the next state

    const currentQs = model.predict(tf.tensor2d([state])).dataSync();
    replayMemory.push({ state, action, reward, nextState, currentQs });
    if (replayMemory.length > replayMemorySize) replayMemory.shift();

    trainModel();

    state = nextState;
    params = { P1: state[0], P2: state[1], P3: state[2], P4: state[3], P5: state[4], P6: state[5] };
    initializeSwarm();

    cycleCount++;
    cycleDisplay.html(`Training Cycle: ${cycleCount}`);
  }
}