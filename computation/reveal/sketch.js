let msg = "CIRCULAR WARP TEXT ";
let radius = 120;

function setup() {
  createCanvas(400, 400);
  angleMode(DEGREES);
  textSize(24);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(240);
  translate(width / 2, height / 2);
  rotate(frameCount * 0.5); // Optional rotation

  let totalChars = msg.length;
  let angleStep = 360 / totalChars;

  for (let i = 0; i < totalChars; i++) {
    push();
    let angle = i * angleStep;
    rotate(angle);
    translate(0, -radius);
    // Counter-rotate the letter so it stays upright
    rotate(-angle); 
    fill(0);
    text(msg[i], 0, 0);
    pop();
  }
}