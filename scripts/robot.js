// 假设 p5.js 库已经被正确导入并可用
class Robot {
  constructor(x, y, radius) {
    this.center = createVector(x, y); // 中心点
    this.radius = radius; // 半径
    this.angle = random(TWO_PI); // 初始角度
    this.velocity = createVector(random(-0.1, 0.1), random(-0.1, 0.1)); // 控制速度，较小的值表示慢速移动
    this.position = createVector(x + radius * cos(this.angle), y + radius * sin(this.angle));
    this.pauseProbability = 0.001; // 设置停顿的概率
    this.moving = true; // 判断是否在移动
  }

  // Update the position of the robot based on swarm parameters P1 to P6
  update(params, robots) {
    // Calculate the center of the swarm
    let centerX = 0;
    let centerY = 0;
    robots.forEach(robot => {
        centerX += robot.position.x;
        centerY += robot.position.y;
    });
    centerX /= robots.length;
    centerY /= robots.length;

    // Calculate average distance to other robots
    let averageDistance = 0;
    robots.forEach(robot => {
        let dist = p5.Vector.dist(this.position, robot.position);
        averageDistance += dist;
    });
    averageDistance /= robots.length;

    // Adjust velocity based on P1 - Inter-Robot Distance
    if (averageDistance > params.P1) {
        this.velocity.setMag(this.velocity.mag() * 0.9); // Move closer
    } else {
        this.velocity.setMag(this.velocity.mag() * 1.1); // Move apart
    }

    // P2 - Spatial Synchronicity & P3 - Temporal Synchronicity
    if (params.P2 > 0.5 || params.P3 > 0.5) {
        let avgVelX = 0;
        let avgVelY = 0;
        robots.forEach(robot => {
            avgVelX += robot.velocity.x;
            avgVelY += robot.velocity.y;
        });
        avgVelX /= robots.length;
        avgVelY /= robots.length;
        this.velocity.lerp(new p5.Vector(avgVelX, avgVelY), 0.1 * params.P2);
    } else {
        // Optionally add different behavior when synchronicity is low
        this.velocity.rotate(random(-0.1, 0.1)); // Random small rotation
    }

    // P4 - Aggregation Tendency
    if (params.P4 > 0.5) {
        let centerVector = createVector(centerX, centerY);
        let directionToCenter = p5.Vector.sub(centerVector, this.position);
        this.velocity.add(directionToCenter.setMag(0.05 * params.P4));
    } else {
        // Move slightly away from the center or other custom behavior
        let awayFromCenter = p5.Vector.sub(this.position, createVector(centerX, centerY));
        this.velocity.add(awayFromCenter.setMag(0.02 * (1 - params.P4))); // Weaker influence
    }

    // P5 - Leadership Tendency
    if (this.isLeader && params.P5 > 0.5) {
        this.velocity.rotate(random(-0.05, 0.05)); // Leaders might make more pronounced movements
    } else if (!this.isLeader && params.P5 <= 0.5) {
        // Non-leaders or low leadership influence
        this.velocity.rotate(random(-0.02, 0.02)); // Smaller random adjustments
    }

    // P6 - Figure Formation
    if (params.P6 > 0.5) {
        this.velocity.rotate(0.1 * (params.P6 - 0.5)); // Rotate velocity for formation
    } else {
        // Simpler or no special formation
        this.velocity.rotate(-0.1 * (0.5 - params.P6)); // Opposite small adjustment
    }

    // Apply the velocity to the position and ensure robots stay within bounds
    this.position.add(this.velocity);
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;
  }



  // 显示机器人
  display() {
    ellipse(this.position.x, this.position.y, 10, 10);
  }
}
