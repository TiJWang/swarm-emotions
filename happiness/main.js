// main.js

let model, targetModel;
let replayMemory = [];
const replayMemorySize = 10000;
const batch_size = 14;
const discountFactor = 0.95;
let epsilon = 1.0;
const epsilonMin = 0.01;
const epsilonDecay = 0.995;

function setup() {
  createCanvas(800, 600);
  params = initialParams();
  initializeSwarm();

  feedbackSlider = createSlider(0, 100, 50);
  feedbackSlider.position(10, height + 20);
  feedbackSlider.style('width', '780px');

  let feedbackLabel = createDiv('Feedback: How sad is this representation?');
  feedbackLabel.position(10, height - 30);

  let sliderValueDisplay = createDiv(`Value: ${feedbackSlider.value()}`);
  sliderValueDisplay.position(10, height + 40);

  feedbackSlider.input(() => {
    sliderValueDisplay.html(`Value: ${feedbackSlider.value()}`);
  });

  let submitButton = createButton('Submit Feedback');
  submitButton.position(10, height + 60);
  submitButton.mousePressed(submitFeedback);

  cycleDisplay = createDiv('Training Cycle: 0');
  cycleDisplay.position(10, height + 100);

  stateDisplay = createDiv('State Parameters: ');
  stateDisplay.position(10, height + 140);

  state = [params.P1, params.P2, params.P3, params.P4, params.P5, params.P6];
  console.log('Initial Parameters:', params);

  model = createDQNModel();
  targetModel = createDQNModel();
  targetModel.setWeights(model.getWeights());
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

function createDQNModel() {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 64, inputShape: [6], activation: 'relu' }));
  model.add(tf.layers.dropout({ rate: 0.2 }));
  model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
  model.add(tf.layers.dropout({ rate: 0.2 }));
  model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 6, activation: 'linear' }));
  model.compile({ optimizer: tf.train.adam(0.001), loss: 'meanSquaredError' });
  return model;
}

function chooseAction(state) {
  if (Math.random() < epsilon) {
    return Array.from({ length: 6 }, () => Math.random() * 100); // Exploratory action
  } else {
    return tf.tidy(() => {
      const input = tf.tensor2d([state]);
      const actionValues = model.predict(input);
      return actionValues.argMax(1).dataSync()[0]; // Select the action with the highest Q-value
    });
  }
}

function trainModel() {
  if (replayMemory.length < batch_size) return;
  const batch = _.sampleSize(replayMemory, batch_size);
  const states = batch.map(({ state }) => state);
  const nextStates = batch.map(({ nextState }) => nextState);

  const qFuture = targetModel.predict(tf.tensor2d(nextStates)).max(1).dataSync();
  const targetQs = batch.map((item, index) => {
    const { reward, action } = item;
    const maxFutureQ = qFuture[index];
    const newQ = reward + discountFactor * maxFutureQ;
    const updatedQs = item.currentQs.slice();
    updatedQs[action] = newQ;
    return updatedQs;
  });

  model.fit(tf.tensor2d(states), tf.tensor2d(targetQs), { epochs: 1 }).then(() => {
    updateTargetModel(); // Update the target model periodically
  });
}

function updateTargetModel() {
  targetModel.setWeights(model.getWeights());
}

