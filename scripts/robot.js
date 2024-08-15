// scripts/robot.js

// Class representing a single robot
class Robot {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
  }

  // Update the position of the robot
  update() {
    this.position.add(this.velocity);

    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;
  }

  // Display the robot on the canvas
  display() {
    ellipse(this.position.x, this.position.y, 10, 10);
  }
}
