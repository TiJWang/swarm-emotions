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
    // random circle center
    let centerX = random(50, width - 50);
    let centerY = random(50, height - 50);

    let radius = random(50, 50);

    robots.push(new Robot(centerX, centerY, radius));
  }
  console.log('Swarm initialized with ' + numRobots + ' robots.');
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
    let reward = getUserFeedback(); // 获取用户反馈
    let action = chooseAction(state); // 根据当前状态选择最优动作

    // 根据 reward 调整更新幅度
    let adjustmentFactor = (reward / 100) * 2; // reward 越大，调整幅度越大

    // 根据 reward 调整状态，如果 reward 小于某个阈值，可以考虑反向调整
    let nextState = action.map((value, index) => {
      if (reward >= 50) {
        // 用户满意，朝着模型预测方向调整
        return state[index] + adjustmentFactor * (value - state[index]);
      } else {
        // 用户不满意，可以考虑反向调整
        return state[index] - adjustmentFactor * (state[index] - value);
      }
    });

    if (reward < 30) { // 在极低的反馈时引入随机扰动
      nextState = nextState.map(value => value + (Math.random() - 0.5) * 0.1);
    }
  

    // 确保 nextState 是有效的
    if (nextState.some(isNaN)) {
      nextState = [params.P1, params.P2, params.P3, params.P4, params.P5, params.P6];
    }


    // 使用当前状态、动作、奖励和下一个状态训练模型
    trainModel(state, action, reward, nextState);

    // 更新状态并重新初始化机器人群
    state = nextState;
    params = {
      P1: state[0],
      P2: state[1],
      P3: state[2],
      P4: state[3],
      P5: state[4],
      P6: state[5]
    };
    initializeSwarm(); // 使用更新的参数重新初始化机器人群

    // 增加训练周期计数
    cycleCount++;
    cycleDisplay.html(`Training Cycle: ${cycleCount}`);
    console.log('Cycle count incremented to:', cycleCount);
  }
}

