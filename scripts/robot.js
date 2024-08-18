// scripts/robot.js

// Class representing a single robot
class Robot {
  constructor(x, y, radius) {
    this.center = createVector(x, y);
    this.radius = radius;
    this.angle = random(TWO_PI); 
    this.velocity = 0.01; 
    this.position = createVector(x + radius * cos(this.angle), y + radius * sin(this.angle));
    this.pauseProbability = 0.001; 
    this.moving = true; 
  }

  update() {

    if (random(1) < this.pauseProbability) {
      this.moving = !this.moving; 
    }

    if (this.moving) {

      this.angle += this.velocity; 
      this.position.x = this.center.x + this.radius * cos(this.angle);
      this.position.y = this.center.y + this.radius * sin(this.angle);
    }


    if (random(1) < 0.05) { 
      this.velocity += random(-0.001, 0.001); 
    }


    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;
  }


  display() {
    ellipse(this.position.x, this.position.y, 10, 10);
  }
}


