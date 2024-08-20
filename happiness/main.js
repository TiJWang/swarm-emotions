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

  // Create a div to display the slider's value
  let sliderValueDisplay = createDiv(`Value: ${feedbackSlider.value()}`);
  sliderValueDisplay.position(10, height + 40);

  // Update the value display when the slider is moved
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
model.add(tf.layers.dropout({ rate: 0.2 })); // Dropout层，防止过拟合
model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
model.add(tf.layers.dropout({ rate: 0.2 })); // 再次添加Dropout层
model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
model.add(tf.layers.dense({ units: 6, activation: 'linear' }));
model.compile({ optimizer: tf.train.adam(0.001), loss: 'meanSquaredError' }); // 将学习率设置为0.001


let epsilon = 1.0; // 初始ε值
let epsilonMin = 0.01; // ε的最小值
let epsilonDecay = 0.99; // 每个训练周期ε的衰减系数

function chooseAction(state) {
  if (Math.random() < epsilon) {
    // 探索：选择随机动作
    return Array.from({ length: 6 }, () => Math.random() * 100); // 假设动作的范围是0到100
  } else {
    // 利用：选择最优动作
    return tf.tidy(() => {
      const input = tf.tensor2d([state]); // Convert the state to a 2D tensor
      const prediction = model.predict(input); // Predict the Q-values for the given state
      const action = prediction.dataSync(); // Return the predicted values as a JavaScript array
      console.log('Chosen action based on current state:', action);
      return action;
    });
  }
}

function trainModel(state, action, reward, nextState) {
  const target = reward + 0.95 * Math.max(...chooseAction(nextState)); // Q-learning update rule
  const targetVector = chooseAction(state); // Predict the current Q-values
  targetVector[targetVector.indexOf(Math.max(...targetVector))] = target; // Update the Q-value for the chosen action with the target value

  const input = tf.tensor2d([state]);
  const targetTensor = tf.tensor2d([targetVector]);

  model.fit(input, targetTensor, { epochs: 1 }).then(() => {
    input.dispose(); // Dispose of the input tensor to free memory
    targetTensor.dispose(); // Dispose of the target tensor to free memory
    console.log('Model trained with state:', state, 'action:', action, 'reward:', reward, 'next state:', nextState);
  });

  // 衰减ε值
  if (reward < 50 && epsilon > epsilonMin) {
    epsilon *= (epsilonDecay * 0.6); // 更快速地减少 epsilon
  } else if (reward >= 70) { // 高分反馈
    epsilon = Math.max(epsilon * 0.9, epsilonMin); // 快速降低 epsilon，减少探索
  } else if (epsilon > epsilonMin) {
      epsilon *= epsilonDecay; // 正常衰减
  }

}

