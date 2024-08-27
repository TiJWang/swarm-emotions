class Robot {
    constructor(x, y, radius) {
      this.center = createVector(x, y); 
      this.radius = radius; 
      this.angle = random(TWO_PI); 
      this.amplitude = random(5, 15); // 缩小正弦扰动的幅度以表现恐惧
      this.frequency = random(1, 2);   // 缩小正弦扰动的频率
      this.velocity = createVector(random(-0.5, 0.5), random(-0.5, 0.5)); // 减少速度
      this.position = createVector(x + radius * cos(this.angle), y + radius * sin(this.angle));
      this.moving = true; 
      this.isLeader = false; // 在恐惧情境中，不设置领导者
    }
  
    // Update the position of the robot to follow a slow, angular movement pattern
    update(params, robots) {
      let speed = 0.01 * (params.P2 || 1); // 使用P2控制速度，速度更慢
      // speed = constrain(speed, 0.005, 0.02); // 限制速度范围，更加缓慢
      this.angle += speed;
  
      let xOffset = this.amplitude * cos(this.frequency * this.angle);
      let yOffset = this.amplitude * sin(this.frequency * this.angle);
  
      if (params.P6) {
        xOffset *= params.P6; // P6放大或缩小正弦扰动
        yOffset *= params.P6;
      }
  
      xOffset = constrain(xOffset, -this.radius / 3, this.radius / 3); // 减少扰动幅度
      yOffset = constrain(yOffset, -this.radius / 3, this.radius / 3);
  
      let targetX = this.center.x + (this.radius + xOffset) * cos(this.angle);
      let targetY = this.center.y + (this.radius + yOffset) * sin(this.angle);
  
      let lerpFactor = 0.05 * (params.P3 || 1); // 使用P3控制运动平滑度，更加不平滑
      lerpFactor = constrain(lerpFactor, 0.01, 0.1);
      this.position.lerp(createVector(targetX, targetY), lerpFactor);
  
      // P1 - 机器人间距 (Inter-Robot Distance)，保持更大的距离
      if (params.P1) {
        robots.forEach(other => {
          if (other !== this) {
            let distance = p5.Vector.dist(this.position, other.position);
            if (distance < params.P1 * 75) { // 增加距离
              let repulsion = p5.Vector.sub(this.position, other.position);
              repulsion.setMag(0.7); // 增加排斥力以表现逃避
              this.position.add(repulsion);
            }
          }
        });
      }
  
      // 移除聚合倾向和领导倾向
      // 恐惧情境下不聚合也不领导
  
      // 边界吸引力，防止机器人离开中心区域
      let boundaryAttraction = 0.05;
      let distanceFromCenter = dist(this.position.x, this.position.y, width / 2, height / 2);
      if (distanceFromCenter > width / 3) {
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
  