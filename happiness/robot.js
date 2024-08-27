class Robot {
    constructor(x, y, radius) {
      this.center = createVector(x, y); 
      this.radius = radius; 
      this.angle = random(TWO_PI); 
      this.amplitude = random(10, 20);
      this.frequency = random(1, 3);  
      this.velocity = createVector(random(-1, 1), random(-1, 1));
      this.position = createVector(x + radius * cos(this.angle), y + radius * sin(this.angle));
      this.moving = true; 
      this.isLeader = random(1) < 0.2; // 20% chance to be leader
    }

    update(params, robots) {
      let speed = 0.02 * (params.P2 || 1); // p2 control speed
      speed = constrain(speed, 0.01, 0.05); // limit speed range
      this.angle += speed;
  
      let xOffset = this.amplitude * cos(this.frequency * this.angle);
      let yOffset = this.amplitude * sin(this.frequency * this.angle);
  
      if (params.P6) {
        xOffset *= params.P6;
        yOffset *= params.P6;
      }
  
      xOffset = constrain(xOffset, -this.radius / 2, this.radius / 2);
      yOffset = constrain(yOffset, -this.radius / 2, this.radius / 2);
  
      let targetX = this.center.x + (this.radius + xOffset) * cos(this.angle);
      let targetY = this.center.y + (this.radius + yOffset) * sin(this.angle);
  
      let lerpFactor = 0.1 * (params.P3 || 1); // p3 control smoothness
      lerpFactor = constrain(lerpFactor, 0.05, 0.2);
      this.position.lerp(createVector(targetX, targetY), lerpFactor);
  
      // P1
      if (params.P1) {
        // calculate distance with others and not too close
        robots.forEach(other => {
          if (other !== this) {
            let distance = p5.Vector.dist(this.position, other.position);
            if (distance < params.P1 * 50) {
              let repulsion = p5.Vector.sub(this.position, other.position);
              repulsion.setMag(0.5);
              this.position.add(repulsion);
            }
          }
        });
      }
  
      // P4
      if (params.P4) {
        let centerVector = createVector(width / 2, height / 2);
        let directionToCenter = p5.Vector.sub(centerVector, this.position);
        directionToCenter.setMag(0.05 * params.P4); // towards
        this.position.add(directionToCenter);
      }
  
      // P5
      if (this.isLeader && params.P5) {
        this.velocity.rotate(random(-0.05, 0.05) * params.P5); // leader more movement
        this.position.add(this.velocity);
      }
  
      let boundaryAttraction = 0.05;
      let distanceFromCenter = dist(this.position.x, this.position.y, width / 2, height / 2);
      if (distanceFromCenter > width / 3) {
        let directionToCenter = createVector(width / 2, height / 2).sub(this.position);
        directionToCenter.setMag(boundaryAttraction);
        this.position.add(directionToCenter);
      }
  
      if (this.position.x > width) this.position.x = width - 10;
      if (this.position.x < 0) this.position.x = 10;
      if (this.position.y > height) this.position.y = height - 10;
      if (this.position.y < 0) this.position.y = 10;
    }
  
    display() {
      ellipse(this.position.x, this.position.y, 10, 10);
    }
  }