class Robot {
  constructor(x, y, radius) {
      this.center = createVector(x, y); 
      this.radius = radius; 
      this.angle = random(TWO_PI); 
      this.amplitude = random(5, 15); // reduce sine perturbation amplitude to enhance angle change
      this.frequency = random(3, 6);   // increase sine frequency
      this.velocity = createVector(random(-2, 2), random(-2, 2)); // higher initial velocity range
      this.position = createVector(x + radius * cos(this.angle), y + radius * sin(this.angle));
      this.moving = true; 
      this.isLeader = random(1) < 0.2; // 20% chance to be leader
  }

  // sine perturbation with circle
  update(params, robots) {
      let speed = 0.04 * (params.P2 || 1); // initial speed
    //   speed = constrain(speed, 0.03, 0.1); // speed range

      this.angle += speed;

      let xOffset = this.amplitude * cos(this.frequency * this.angle);
      let yOffset = this.amplitude * sin(this.frequency * this.angle);

      if (params.P6) {
          xOffset *= params.P6; // adjust sine perturbation
          yOffset *= params.P6;
      }

      xOffset = constrain(xOffset, -this.radius / 2, this.radius / 2);
      yOffset = constrain(yOffset, -this.radius / 2, this.radius / 2);

      let targetX = this.center.x + (this.radius + xOffset) * cos(this.angle);
      let targetY = this.center.y + (this.radius + yOffset) * sin(this.angle);

      let lerpFactor = 0.2 * (params.P3 || 1); // make movement more intense
      lerpFactor = constrain(lerpFactor, 0.1, 0.3);
      this.position.lerp(createVector(targetX, targetY), lerpFactor);

      // P1
      if (params.P1) {
          robots.forEach(other => {
              if (other !== this) {
                  let distance = p5.Vector.dist(this.position, other.position);
                  if (distance < params.P1 * 30) { // reduce distance between
                      let repulsion = p5.Vector.sub(this.position, other.position);
                      repulsion.setMag(1); // increase replusive force
                      this.position.add(repulsion);
                  }
              }
          });
      }

      // P4 - leadership
      if (params.P4) {
          let centerVector = createVector(width / 2, height / 2);
          let directionToCenter = p5.Vector.sub(centerVector, this.position);
          directionToCenter.setMag(0.1 * params.P4); // move towards central
          this.position.add(directionToCenter);
      }

      // P5 - leadership
      if (this.isLeader && params.P5) {
          this.velocity.rotate(random(-0.1, 0.1) * params.P5); // more movement for leader
          this.position.add(this.velocity);
      }

      // avoid robot leave central area
      let boundaryAttraction = 0.1; // increase attraction
      let distanceFromCenter = dist(this.position.x, this.position.y, width / 2, height / 2);
      if (distanceFromCenter > width / 4) {
          let directionToCenter = createVector(width / 2, height / 2).sub(this.position);
          directionToCenter.setMag(boundaryAttraction);
          this.position.add(directionToCenter);
      }

      // robot move within canvas
      if (this.position.x > width) this.position.x = width - 10;
      if (this.position.x < 0) this.position.x = 10;
      if (this.position.y > height) this.position.y = height - 10;
      if (this.position.y < 0) this.position.y = 10;
  }

  display() {
      ellipse(this.position.x, this.position.y, 10, 10);
  }
}
