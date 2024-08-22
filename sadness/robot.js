class Robot {
    constructor(x, y, radius) {
      this.center = createVector(x, y);
      this.radius = radius;
      this.angle = random(TWO_PI);
      this.velocity = createVector(random(-1, 1), random(-1, 1));
      this.position = createVector(x + radius * cos(this.angle), y + radius * sin(this.angle));
      this.pauseProbability = 0.001;
      this.moving = true;
    }
  
    update(params, robots) {
      let centerX = 0;
      let centerY = 0;
      robots.forEach(robot => {
        centerX += robot.position.x;
        centerY += robot.position.y;
      });
      centerX /= robots.length;
      centerY /= robots.length;
  
      let averageDistance = 0;
      robots.forEach(robot => {
        let dist = p5.Vector.dist(this.position, robot.position);
        averageDistance += dist;
      });
      averageDistance /= robots.length;
  
      if (averageDistance > params.P1) {
        this.velocity.setMag(this.velocity.mag() * 0.9);
      } else {
        this.velocity.setMag(this.velocity.mag() * 1.1);
      }
  
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
        this.velocity.rotate(random(-0.1, 0.1));
      }
  
      if (params.P4 > 0) {
        let centerVector = createVector(centerX, centerY);
        let directionToCenter = p5.Vector.sub(centerVector, this.position);
        this.velocity.add(directionToCenter.setMag(0.05 * params.P4));
      } else {
        let awayFromCenter = p5.Vector.sub(this.position, createVector(centerX, centerY));
        this.velocity.add(awayFromCenter.setMag(0.02 * (1 - params.P4)));
      }
  
      if (this.isLeader && params.P5 > 0.5) {
        this.velocity.rotate(random(-0.05, 0.05));
      } else if (!this.isLeader && params.P5 <= 0.5) {
        this.velocity.rotate(random(-0.02, 0.02));
      }
  
      if (params.P6 > 0.5) {
        this.velocity.rotate(0.1 * (params.P6 - 0.5));
      } else {
        this.velocity.rotate(-0.1 * (0.5 - params.P6));
      }
  
      this.position.add(this.velocity);
      if (this.position.x > width) this.position.x = 0;
      if (this.position.x < 0) this.position.x = width;
      if (this.position.y > height) this.position.y = 0;
      if (this.position.y < 0) this.position.y = height;
    }
  
    display() {
      ellipse(this.position.x, this.position.y, 10, 10);
    }
  }