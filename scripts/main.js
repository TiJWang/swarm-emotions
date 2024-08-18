// scripts/main.js

function setup() {
  createCanvas(800, 600);

  params = initialParams();
  initializeSwarm();

  feedbackSlider = createSlider(0, 100, 50);
  feedbackSlider.position(10, height + 20);
  feedbackSlider.style('width', '780px');

  let feedbackLabel = createDiv('Feedback: How sad is this representation?');
  feedbackLabel.position(10, height - 30);

  let submitButton = createButton('Submit Feedback');
  submitButton.position(10, height + 60);
  submitButton.mousePressed(submitFeedback);

  cycleDisplay = createDiv('Training Cycle: 0');
  cycleDisplay.position(10, height + 100);

  stateDisplay = createDiv('State Parameters: ');
  stateDisplay.position(10, height + 140);

  state = [params.P1, params.P2, params.P3, params.P4, params.P5, params.P6];

  console.log('Initial Parameters:', params);
}

function draw() {
  background(220);

  for (let robot of robots) {
    robot.update(params, robots);
    robot.display();
  }

  cycleDisplay.html(`Training Cycle: ${cycleCount}`);
  stateDisplay.html(`State Parameters: P1=${params.P1.toFixed(2)}, P2=${params.P2.toFixed(2)}, P3=${params.P3.toFixed(2)}, P4=${params.P4.toFixed(2)}, P5=${params.P5.toFixed(2)}, P6=${params.P6.toFixed(2)}`);
}

// Set up the neural network model using TensorFlow.js
const model = tf.sequential();
model.add(tf.layers.dense({ units: 24, inputShape: [6], activation: 'relu' }));
model.add(tf.layers.dense({ units: 24, activation: 'relu' }));
model.add(tf.layers.dense({ units: 6, activation: 'linear' }));
model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

function chooseAction(state) {
  return tf.tidy(() => {
    const input = tf.tensor2d([state]);
    const prediction = model.predict(input);
    const action = prediction.dataSync();
    console.log('Chosen action based on current state:', action);
    return action;
  });
}

function trainModel(state, action, reward, nextState) {
  const target = reward + 0.95 * Math.max(...chooseAction(nextState));
  const targetVector = chooseAction(state);
  targetVector[targetVector.indexOf(Math.max(...targetVector))] = target;

  const input = tf.tensor2d([state]);
  const targetTensor = tf.tensor2d([targetVector]);

  model.fit(input, targetTensor, { epochs: 1 }).then(() => {
    input.dispose();
    targetTensor.dispose();
    console.log('Model trained with state:', state, 'action:', action, 'reward:', reward, 'next state:', nextState);
  });
}
