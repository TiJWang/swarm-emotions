let robots = [];
let numRobots = 100; // Number of boids
let params;
let feedbackSlider;
let cycleDisplay;
let stateDisplay;
let cycleCount = 0;
let perceptionRadius = 50; // Radius within which boids perceive their neighbors
let trainingCycles = 1000; // Number of training cycles for Q-learning

// Function to initialize boid parameters with preset values
const initialParams = () => ({
  separationWeight: 1.5, // Preset weight for the separation rule
  alignmentWeight: 1.0,  // Preset weight for the alignment rule
  cohesionWeight: 1.0,   // Preset weight for the cohesion rule
  flockVelocity: 2.0     // Preset velocity for the flock
});

// Set up the neural network model using TensorFlow.js
const model = tf.sequential();
model.add(tf.layers.dense({ units: 24, inputShape: [4], activation: 'relu' })); // First hidden layer with 24 units
model.add(tf.layers.dense({ units: 24, activation: 'relu' })); // Second hidden layer with 24 units
model.add(tf.layers.dense({ units: 4, activation: 'linear' })); // Output layer with 4 units, one for each parameter
model.compile({ optimizer: 'adam', loss: 'meanSquaredError' }); // Compile the model with Adam optimizer and mean squared error loss

function setup() {
  createCanvas(800, 600);

  // Initialize boids with preset positions and behavior parameters
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

  // Print initial parameters to the console
  console.log('Initial Parameters:', params);
}

function draw() {
  background(220);

  // Update and display boids
  for (let robot of robots) {
    robot.flock(robots); // Calculate the flocking forces
    robot.update();      // Update the boid's position based on forces
    robot.display();     // Draw the boid on the canvas
  }

  // Display the current cycle count
  cycleDisplay.html(`Training Cycle: ${cycleCount}`);
  // Display the current state parameters
  stateDisplay.html(`State Parameters: Separation=${params.separationWeight.toFixed(2)}, Alignment=${params.alignmentWeight.toFixed(2)}, Cohesion=${params.cohesionWeight.toFixed(2)}, Velocity=${params.flockVelocity.toFixed(2)}`);
}

// Function to initialize the swarm with boids
function initializeSwarm() {
  robots = [];
  for (let i = 0; i < numRobots; i++) {
    robots.push(new Robot(random(width), random(height)));
  }
  console.log('Swarm initialized with parameters:', params);
}

// Class representing a single boid (robot)
class Robot {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-2, 2), random(-2, 2));
    this.acceleration = createVector(0, 0);
  }

  // Apply a force to the boid
  applyForce(force) {
    this.acceleration.add(force);
  }

  // Calculate behaviors based on nearby boids
  flock(boids) {
    let separation = this.separate(boids).mult(params.separationWeight);
    let alignment = this.align(boids).mult(params.alignmentWeight);
    let cohesion = this.cohere(boids).mult(params.cohesionWeight);

    this.applyForce(separation);
    this.applyForce(alignment);
    this.applyForce(cohesion);
  }

  // Separation: Steer to avoid crowding local flockmates
  separate(boids) {
    let desiredSeparation = 25;
    let steer = createVector(0, 0);
    let count = 0;

    for (let other of boids) {
      let d = p5.Vector.dist(this.position, other.position);
      if (d > 0 && d < desiredSeparation) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer.div(count);
    }

    if (steer.mag() > 0) {
      steer.setMag(params.flockVelocity); // Use flock velocity to ensure movement
      steer.sub(this.velocity);
      steer.limit(0.1);
    }

    return steer;
  }

  // Alignment: Steer towards the average heading of local flockmates
  align(boids) {
    let neighborDist = perceptionRadius;
    let sum = createVector(0, 0);
    let count = 0;

    for (let other of boids) {
      let d = p5.Vector.dist(this.position, other.position);
      if (d > 0 && d < neighborDist) {
        sum.add(other.velocity);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      sum.setMag(params.flockVelocity); // Keep boids moving at a reasonable speed
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(0.1);
      return steer;
    } else {
      return createVector(0, 0);
    }
  }

  // Cohesion: Steer to move towards the average position of local flockmates
  cohere(boids) {
    let neighborDist = perceptionRadius;
    let sum = createVector(0, 0);
    let count = 0;

    for (let other of boids) {
      let d = p5.Vector.dist(this.position, other.position);
      if (d > 0 && d < neighborDist) {
        sum.add(other.position);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      return this.seek(sum);
    } else {
      return createVector(0, 0);
    }
  }

  // A method that calculates a steering force towards a target
  seek(target) {
    let desired = p5.Vector.sub(target, this.position);
    desired.setMag(params.flockVelocity); // Use flock velocity to ensure movement
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(0.1);
    return steer;
  }

  // Update the boid's position and velocity
  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(params.flockVelocity); // Limit the speed of the boids
    this.position.add(this.velocity);
    this.acceleration.mult(0);

    // Wrap around edges
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;
  }

  // Display the boid on the canvas
  display() {
    fill(127);
    stroke(200);
    ellipse(this.position.x, this.position.y, 6, 6);
  }
}

// Q-Learning function to choose the next action using the TensorFlow.js model
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
  // Use tidy to keep memory usage in check, but avoid wrapping async calls
  tf.tidy(() => {
    // Convert state and nextState to tensors
    const stateTensor = tf.tensor2d([state]);
    const nextStateTensor = tf.tensor2d([nextState]);

    // Get the predicted Q-values for the current state and next state
    const currentQValues = model.predict(stateTensor);
    const nextQValues = model.predict(nextStateTensor);

    // Calculate the target Q-value for the chosen action
    const maxNextQValue = tf.max(nextQValues).dataSync()[0];
    const targetQValue = reward + 0.95 * maxNextQValue;

    // Update the current Q-value tensor with the target for the specific action taken
    const updatedQValues = currentQValues.dataSync();
    const actionIndex = updatedQValues.indexOf(Math.max(...updatedQValues));
    updatedQValues[actionIndex] = targetQValue;

    // Train the model on the updated Q-values
    const targetTensor = tf.tensor2d([updatedQValues]);
    model.fit(stateTensor, targetTensor, { epochs: 1 }).then(() => {
      console.log('Model trained with state:', state, 'action:', action, 'reward:', reward, 'next state:', nextState);
    });

    // Dispose of tensors to free memory
    stateTensor.dispose();
    nextStateTensor.dispose();
    currentQValues.dispose();
    nextQValues.dispose();
    targetTensor.dispose();
  });
}

// Function to handle the feedback submission
function submitFeedback() {
  if (cycleCount < trainingCycles) {
    // Get user feedback and update reward
    let reward = getUserFeedback();

    // Get current state
    let state = [params.separationWeight, params.alignmentWeight, params.cohesionWeight, params.flockVelocity];

    // Choose action based on current state using Q-learning
    let nextAction = chooseAction(state);

    // Update parameters dynamically based on the predicted action
    params.separationWeight += nextAction[0];
    params.alignmentWeight += nextAction[1];
    params.cohesionWeight += nextAction[2];
    params.flockVelocity += nextAction[3];

    // Train the model with the new state
    trainModel(state, nextAction, reward, [params.separationWeight, params.alignmentWeight, params.cohesionWeight, params.flockVelocity]);

    // Reinitialize the swarm with updated parameters
    initializeSwarm();

    // Increment cycle count
    cycleCount++;
    cycleDisplay.html(`Training Cycle: ${cycleCount}`); // Update the displayed cycle count
    console.log('Cycle count incremented to:', cycleCount);
  }
}

// Function to get user feedback from the slider
function getUserFeedback() {
  const feedback = feedbackSlider.value();
  console.log('User feedback received:', feedback);
  return feedback;
}
