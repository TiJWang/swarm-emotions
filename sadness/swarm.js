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