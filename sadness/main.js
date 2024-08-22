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
model.add(tf.layers.dense({ units: 64, inputShape: [6], activation: 'relu' }));
model.add(tf.layers.dropout({ rate: 0.2 }));
model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
model.add(tf.layers.dropout({ rate: 0.2 }));
model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
model.add(tf.layers.dense({ units: 6, activation: 'linear' }));
model.compile({ optimizer: tf.train.adam(0.001), loss: 'meanSquaredError' });

// Target network
const targetModel = tf.sequential();
targetModel.add(tf.layers.dense({ units: 64, inputShape: [6], activation: 'relu' }));
targetModel.add(tf.layers.dropout({ rate: 0.2 }));
targetModel.add(tf.layers.dense({ units: 64, activation: 'relu' }));
targetModel.add(tf.layers.dropout({ rate: 0.2 }));
targetModel.add(tf.layers.dense({ units: 32, activation: 'relu' }));
targetModel.add(tf.layers.dense({ units: 6, activation: 'linear' }));
targetModel.compile({ optimizer: tf.train.adam(0.001), loss: 'meanSquaredError' });

// Copy weights to target model
function updateTargetModel() {
  targetModel.setWeights(model.getWeights());
}

// Replay memory buffer
let replayBuffer = [];
const bufferSize = 500; // Adjust buffer size as needed
const batchSize = 32;

let epsilon = 1.0;
let epsilonMin = 0.01;
let epsilonDecay = 0.99;

function chooseAction(state) {
  if (Math.random() < epsilon) {
    return Array.from({ length: 6 }, () => Math.random() * 100);
  } else {
    return tf.tidy(() => {
      const input = tf.tensor2d([state]);
      const prediction = model.predict(input);
      const action = prediction.dataSync();
      return action;
    });
  }
}

function storeExperience(state, action, reward, nextState) {
  if (replayBuffer.length >= bufferSize) {
    replayBuffer.shift(); // Remove the oldest experience if buffer is full
  }
  replayBuffer.push({ state, action, reward, nextState });
}

function trainModel() {
  if (replayBuffer.length < batchSize) {
    return;
  }

  const batch = [];
  for (let i = 0; i < batchSize; i++) {
    const index = Math.floor(Math.random() * replayBuffer.length);
    batch.push(replayBuffer[index]);
  }

  const states = batch.map(e => e.state);
  const actions = batch.map(e => e.action);
  const rewards = batch.map(e => e.reward);
  const nextStates = batch.map(e => e.nextState);

  tf.tidy(() => {
    const stateTensor = tf.tensor2d(states);
    const actionTensor = tf.tensor2d(actions);
    const rewardTensor = tf.tensor2d(rewards, [batchSize, 1]);
    const nextStateTensor = tf.tensor2d(nextStates);

    const predictedQValues = model.predict(stateTensor);
    const nextQValues = targetModel.predict(nextStateTensor);

    const maxNextQValues = nextQValues.max(1).reshape([batchSize, 1]);

    const targetQValues = rewardTensor.add(maxNextQValues.mul(0.95));

    const loss = model.fit(stateTensor, targetQValues, { epochs: 1 });

    stateTensor.dispose();
    actionTensor.dispose();
    rewardTensor.dispose();
    nextStateTensor.dispose();
  });

  // if (epsilon > epsilonMin) {
  //   epsilon *= epsilonDecay;
  // }
  if (rewards < 50 && epsilon > epsilonMin) {
    epsilon *= (epsilonDecay * 0.6); // 更快速地减少 epsilon
  } else if (rewards >= 70) { // 高分反馈
    epsilon = Math.max(epsilon * 0.9, epsilonMin); // 快速降低 epsilon，减少探索
  } else if (epsilon > epsilonMin) {
      epsilon *= epsilonDecay; // 正常衰减
  }

  console.log('Model trained on a batch of experiences');
}

let feedbackHistory = [];
let paramsHistory = [];

function submitFeedback() {
    if (cycleCount < trainingCycles) {
        let reward = getUserFeedback();
        let action = chooseAction(state);
        let adjustmentFactor = (reward / 100) * 2;

        let nextState = action.map((value, index) => {
            if (reward >= 50) {
                return state[index] + adjustmentFactor * (value - state[index]);
            } else {
                return state[index] - adjustmentFactor * (state[index] - value);
            }
        });

        if (reward < 30) {
            nextState = nextState.map(value => value + (Math.random() - 0.5) * 0.1);
        }

        if (nextState.some(isNaN)) {
            nextState = [params.P1, params.P2, params.P3, params.P4, params.P5, params.P6];
        }

        storeExperience(state, action, reward, nextState);
        trainModel();

        state = nextState;
        params = {
            P1: state[0],
            P2: state[1],
            P3: state[2],
            P4: state[3],
            P5: state[4],
            P6: state[5]
        };

        // Record feedback and parameters
        feedbackHistory.push(reward);
        paramsHistory.push(Object.assign({}, params));

        initializeSwarm();

        cycleCount++;
        cycleDisplay.html(`Training Cycle: ${cycleCount}`);

        if (cycleCount % 10 === 0) {
            updateTargetModel();
        }
    }
}
