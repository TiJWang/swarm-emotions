class Robot {
    constructor(x, y, radius) {
      this.center = createVector(x, y); 
      this.radius = radius; 
      this.angle = random(TWO_PI); 
      this.amplitude = random(10, 20); // 正弦扰动的幅度
      this.frequency = random(1, 3);   // 正弦扰动的频率
      this.velocity = createVector(random(-1, 1), random(-1, 1));
      this.position = createVector(x + radius * cos(this.angle), y + radius * sin(this.angle));
      this.moving = true; 
    }
  
    // Update the position of the robot to follow a circular path with a sinusoidal perturbation
    update(params, robots) {
      // 更新角度，使其沿圆形轨迹运动
      let speed = 0.02 * (params.P2 || 1); // 使用P2控制速度
      speed = constrain(speed, 0.01, 0.05); // 限制速度范围
      this.angle += speed;
  
      // 应用正弦扰动到机器人位置
      let xOffset = this.amplitude * cos(this.frequency * this.angle);
      let yOffset = this.amplitude * sin(this.frequency * this.angle);
  
      // P6 - 图形形成 (Figure Formation)
      if (params.P6) {
        xOffset *= params.P6;
        yOffset *= params.P6;
      }
  
      // 限制正弦扰动的最大幅度
      xOffset = constrain(xOffset, -this.radius / 2, this.radius / 2);
      yOffset = constrain(yOffset, -this.radius / 2, this.radius / 2);
  
      // 计算机器人在新角度下的目标位置
      let targetX = this.center.x + (this.radius + xOffset) * cos(this.angle);
      let targetY = this.center.y + (this.radius + yOffset) * sin(this.angle);
  
      // P3 - 时间同步性 (Temporal Synchronicity)
      let lerpFactor = 0.1 * (params.P3 || 1);
      lerpFactor = constrain(lerpFactor, 0.05, 0.2); // 限制平滑度范围
      this.position.lerp(createVector(targetX, targetY), lerpFactor);
  
      // 确保机器人在画布内移动
      if (this.position.x > width) this.position.x = width - 10;
      if (this.position.x < 0) this.position.x = 10;
      if (this.position.y > height) this.position.y = height - 10;
      if (this.position.y < 0) this.position.y = 10;
    }
  
    display() {
      ellipse(this.position.x, this.position.y, 10, 10);
    }
  }
  