class Robot {
  constructor(x, y, radius) {
      this.center = createVector(x, y); 
      this.radius = radius; 
      this.angle = random(TWO_PI); 
      this.amplitude = random(5, 15); // 减少正弦扰动的幅度以增强角度变化
      this.frequency = random(3, 6);   // 增加正弦扰动的频率
      this.velocity = createVector(random(-2, 2), random(-2, 2)); // 增加初始速度范围
      this.position = createVector(x + radius * cos(this.angle), y + radius * sin(this.angle));
      this.moving = true; 
      this.isLeader = random(1) < 0.2; // 20%的概率成为领导者
  }

  // 更新机器人位置，使其沿着带有正弦扰动的圆形路径移动
  update(params, robots) {
      let speed = 0.04 * (params.P2 || 1); // 增加基础速度
      speed = constrain(speed, 0.03, 0.1); // 增加速度范围

      this.angle += speed;

      let xOffset = this.amplitude * cos(this.frequency * this.angle);
      let yOffset = this.amplitude * sin(this.frequency * this.angle);

      if (params.P6) {
          xOffset *= params.P6; // P6放大或缩小正弦扰动
          yOffset *= params.P6;
      }

      xOffset = constrain(xOffset, -this.radius / 2, this.radius / 2);
      yOffset = constrain(yOffset, -this.radius / 2, this.radius / 2);

      let targetX = this.center.x + (this.radius + xOffset) * cos(this.angle);
      let targetY = this.center.y + (this.radius + yOffset) * sin(this.angle);

      let lerpFactor = 0.2 * (params.P3 || 1); // 增加运动的急剧变化
      lerpFactor = constrain(lerpFactor, 0.1, 0.3);
      this.position.lerp(createVector(targetX, targetY), lerpFactor);

      // P1 - 机器人间距
      if (params.P1) {
          robots.forEach(other => {
              if (other !== this) {
                  let distance = p5.Vector.dist(this.position, other.position);
                  if (distance < params.P1 * 30) { // 缩小机器人间距
                      let repulsion = p5.Vector.sub(this.position, other.position);
                      repulsion.setMag(1); // 增加排斥力
                      this.position.add(repulsion);
                  }
              }
          });
      }

      // P4 - 聚合倾向
      if (params.P4) {
          let centerVector = createVector(width / 2, height / 2);
          let directionToCenter = p5.Vector.sub(centerVector, this.position);
          directionToCenter.setMag(0.1 * params.P4); // 增强向中心的聚集力
          this.position.add(directionToCenter);
      }

      // P5 - 领导倾向
      if (this.isLeader && params.P5) {
          this.velocity.rotate(random(-0.1, 0.1) * params.P5); // 领导者具有更明显的运动变化
          this.position.add(this.velocity);
      }

      // 边界吸引力，防止机器人离开中心区域
      let boundaryAttraction = 0.1; // 增强边界吸引力
      let distanceFromCenter = dist(this.position.x, this.position.y, width / 2, height / 2);
      if (distanceFromCenter > width / 4) { // 减小允许的中心距离
          let directionToCenter = createVector(width / 2, height / 2).sub(this.position);
          directionToCenter.setMag(boundaryAttraction);
          this.position.add(directionToCenter);
      }

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
