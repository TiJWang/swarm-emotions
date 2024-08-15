////////////////////////////////////////////////////////////////////////////////////////////////
// Implementing the thesis project for T in javascript. This has to be intended as a 
// guide to better understand the direction of the project and help directing the discussion
// 
// The code is built taking as starting points the the paper from St-Onge and al. 2019. 
// Unlike the papaer though, we would like the robots to learn the emotional configurations using reinforcement learning. 
// The overall idea for this code is as follows:
//
// ** Step 1: Define the Swarm Characteristics ** 
// Based on the paper, the following parameters could be initialized for the swarm:
// Inter-Robot Distance (P1): The average distance between robots.
// Spatial Synchronicity (P2): The degree to which robots move in unison.
// Temporal Synchronicity (P3): The simultaneity of robot movements.
// Aggregation Tendency (P4): The tendency of robots to stay close together.
// Leadership Tendency (P5): The tendency for robots to follow a leader.
// Figure Formation (P6): The tendency to form recognizable shapes.
//
// ** Step 2: Set Up Unity Environment **
// Create the Swarm: Use Unity to build a simulation environment where multiple agents (robots) can interact. 
//                   Ensure that each robot can detect others and communicate basic information like distance and velocity.
// Define the Parameters: Integrate the parameters (P1 to P6) into the Unity simulation so they can be manipulated and tracked.

// ** Step 3: Implement Reinforcement Learning **
// RL Algorithm: Choose a suitable RL algorithm, In this case we will give it a try with Q-learning.
// State Representation: Define the state of the system as a combination of the parameters (P1 to P6).
// Action Space: Define actions that can adjust the parameters incrementally (e.g., increase/decrease P1, P2, etc.).
// Reward Function: Create a reward function based on the feedback score. For example, if the feedback for "how sad is this representation" is 50/100, 
// the reward could be directly proportional, i.e., 50.
//
// ** Step 4: Provide Feedback Mechanism **
// User Feedback Interface: Develop a UI within Unity or an external interface to allow users to provide feedback on the swarm’s emotional representation.
// Feedback Integration: Ensure that the feedback is fed into the RL algorithm as a reward.
//
// ** Step 5: Training the Model **
// Initialize Parameters: Start with random values for P1 to P6.
// Simulate and Adjust: Run the simulation, collect feedback, and adjust the parameters using the RL algorithm.
// Iterate: Repeat the process to improve the emotional representation of the swarm based on accumulated feedback.
//
// Elia Gatti, UCL, 2024
///////////////////////////////////////////////////////////////////////////////////////////////
let robots = [];
let numRobots = 10;
let params;
let feedbackSlider;
let cycleDisplay;
let stateDisplay;
let cycleCount = 0;
let trainingCycles = 10000;

// Function to initialize swarm parameters with random values
const initialParams = () => ({
  P1: Math.random() * 90 + 10, // Inter-Robot Distance
  P2: Math.random(),           // Spatial Synchronicity
  P3: Math.random(),           // Temporal Synchronicity
  P4: Math.random(),           // Aggregation Tendency
  P5: Math.random(),           // Leadership Tendency
  P6: Math.random()            // Figure Formation
});

function setup() {
  createCanvas(800, 600);

  // Initialize robots with random positions
  params = initialParams();
  initializeSwarm();

  // Create UI elements for feedback
  feedbackSlider = createSlider(0, 100, 50); // Slider to get user feedback on how sad the swarm is
  feedbackSlider.position(10, height + 20);
  feedbackSlider.style('width', '780px');

  let feedbackLabel = createDiv('Feedback: How sad is this representation?'); // Label for the feedback slider
  feedbackLabel.position(10, height - 30);

  // Create a button for submitting feedback
  let submitButton = createButton('Submit Feedback'); // Button to submit feedback
  submitButton.position(10, height + 60);
  submitButton.mousePressed(submitFeedback); // Function to call when the button is pressed

  // Create a div to display the cycle count
  cycleDisplay = createDiv('Training Cycle: 0'); // Display the current training cycle count
  cycleDisplay.position(10, height + 100);

  // Create a div to display the state parameters
  stateDisplay = createDiv('State Parameters: '); // Display the current state parameters
  stateDisplay.position(10, height + 140);

  // Initialize the state with the initial parameters
  state = [params.P1, params.P2, params.P3, params.P4, params.P5, params.P6];

  // Print initial parameters to the console
  console.log('Initial Parameters:', params);
}

function draw() {
  background(220);

  // Update and display robots
  for (let robot of robots) {
    robot.update();
    robot.display();
  }

  // Display the current cycle count
  cycleDisplay.html(`Training Cycle: ${cycleCount}`);
  // Display the current state parameters
  stateDisplay.html(`State Parameters: P1=${params.P1.toFixed(2)}, P2=${params.P2.toFixed(2)}, P3=${params.P3.toFixed(2)}, P4=${params.P4.toFixed(2)}, P5=${params.P5.toFixed(2)}, P6=${params.P6.toFixed(2)}`);
}

// Function to initialize the swarm with robots
function initializeSwarm() {
  robots = [];
  for (let i = 0; i < numRobots; i++) {
    robots.push(new Robot(random(width), random(height)));
  }
  console.log('Swarm initialized with parameters:', params);
}

// Class representing a single robot
class Robot {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
  }

  // Update the position of the robot
  update() {
    // Update position based on parameters (add custom logic here)
    this.position.add(this.velocity);

    // Keep robots within canvas bounds
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;
  }

  // Display the robot on the canvas
  display() {
    ellipse(this.position.x, this.position.y, 10, 10);
  }
}

// Set up the neural network model using TensorFlow.js
const model = tf.sequential();
model.add(tf.layers.dense({ units: 24, inputShape: [6], activation: 'relu' })); // First hidden layer with 24 units
model.add(tf.layers.dense({ units: 24, activation: 'relu' })); // Second hidden layer with 24 units
model.add(tf.layers.dense({ units: 6, activation: 'linear' })); // Output layer with 6 units, one for each parameter
model.compile({ optimizer: 'adam', loss: 'meanSquaredError' }); // Compile the model with Adam optimizer and mean squared error loss

// Initialize the state with the initial parameters
let state;

// Function to choose the best action based on the current state
function chooseAction(state) {
  return tf.tidy(() => {
    const input = tf.tensor2d([state]); // Convert the state to a 2D tensor
    const prediction = model.predict(input); // Predict the Q-values for the given state
    const action = prediction.dataSync(); // Return the predicted values as a JavaScript array
    console.log('Chosen action based on current state:', action);
    return action;
  });
}

// Function to train the model with the new data
function trainModel(state, action, reward, nextState) {
  // Calculate the target value for the chosen action. The reward is used in the Q-learning update rule during the training of the model. 
  //The model uses this reward to adjust its understanding of how good the current state is, and to influence the selection of actions in future iterations.
  const target = reward + 0.95 * Math.max(...chooseAction(nextState)); // Q-learning update rule
  const targetVector = chooseAction(state); // Predict the current Q-values
  targetVector[targetVector.indexOf(Math.max(...targetVector))] = target; // Update the Q-value for the chosen action with the target value

  // Convert the state and target vectors to tensors
  const input = tf.tensor2d([state]);
  const targetTensor = tf.tensor2d([targetVector]);

  // Train the model with one epoch
  model.fit(input, targetTensor, { epochs: 1 }).then(() => {
    input.dispose(); // Dispose of the input tensor to free memory
    targetTensor.dispose(); // Dispose of the target tensor to free memory
    console.log('Model trained with state:', state, 'action:', action, 'reward:', reward, 'next state:', nextState);
  });
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
    // Get user feedback and update reward: The feedback value is then used as the reward in the reinforcement learning process
    //  when the user submits their feedback by pressing the "Submit Feedback" button.
    let reward = getUserFeedback();

    // Define the next state based on the updated parameters
    let action = chooseAction(state); // Choose the best action based on the current state
    let nextState = action.map((value, index) => {
      // Apply minimal change if reward is high
      if (reward >= 90) {
        return state[index] + 0.1 * (value - state[index]);
      }
      // Apply larger change if reward is not high
      return value;
    });

    // Ensure nextState is valid and always updates
    if (nextState.some(isNaN)) {
      nextState = [params.P1, params.P2, params.P3, params.P4, params.P5, params.P6];
    }

    // Train the model with the current state, action, reward, and next state
    trainModel(state, action, reward, nextState);

    // Update state and reinitialize swarm
    state = nextState;
    params = {
      P1: state[0],
      P2: state[1],
      P3: state[2],
      P4: state[3],
      P5: state[4],
      P6: state[5]
    };
    initializeSwarm(); // Reinitialize the swarm with the updated parameters

    // Increment cycle count
    cycleCount++;
    cycleDisplay.html(`Training Cycle: ${cycleCount}`); // Update the displayed cycle count
    console.log('Cycle count incremented to:', cycleCount);
  }
}
