
let resetButton;

// POSTER SETTINGS
const EXPLOSION_COUNT = 35;
const FPS = 30;
const SPRITE_SIZE = 920;

// Explosion storage
let explosions = [];

// Cached graphics
let spaceLayer;
let posterLayer;

// Astronomy images
let explosionImages = [];
let imagesReady = false;

// Poster animation
let posterStart = 0;
let textProgress = 0;
let showText = false;
let posterStarted = false;


// SETUP - p5.js 2.x
async function setup() {

  createCanvas(windowWidth, windowHeight);

  pixelDensity(1);
  frameRate(FPS);
  angleMode(DEGREES);

  // Static space background
  spaceLayer = createGraphics(width, height);
  spaceLayer.pixelDensity(1);

  // Finished explosions
  posterLayer = createGraphics(width, height);
  posterLayer.pixelDensity(1);
  posterLayer.clear();

  setupSpace();

  resetButton = createButton("RESET");
  resetButton.position(20, 20);
  resetButton.mousePressed(resetCanvas);

  textFont("Arial");
  textStyle(BOLD);

  // Load the 3 images
  try {

    explosionImages = await Promise.all([
      loadImage("img1.png"),
      loadImage("img2.png"),
      loadImage("img3.png")
    ]);

    console.log("All 3 images loaded!");

  } catch (error) {

    console.error("Image loading error:", error);
    explosionImages = [];

  }

  imagesReady = true;

}


// STATIC SPACE BACKGROUND
function setupSpace() {

  spaceLayer.background(1, 2, 8);
  spaceLayer.noStroke();

  // Faint stars
  for (let i = 0; i < 250; i++) {

    spaceLayer.fill(
      190,
      210,
      255,
      random(25, 110)
    );

    spaceLayer.circle(
      random(width),
      random(height),
      random(0.5, 2)
    );

  }

  // Faint stationary debris
  for (let i = 0; i < 75; i++) {

    let dx = random(width);
    let dy = random(height);

    spaceLayer.stroke(
      160,
      185,
      220,
      random(10, 40)
    );

    spaceLayer.strokeWeight(
      random(0.3, 1)
    );

    spaceLayer.line(
      dx,
      dy,
      dx - random(2, 9),
      dy
    );

  }

}


// MAIN LOOP
function draw() {

  // Background never moves
  image(spaceLayer, 0, 0);

  // Previously finished explosions
  image(posterLayer, 0, 0);

  if (!imagesReady) {
    return;
  }

  let allFinished = true;
  let elapsed = millis() - posterStart;

  // Draw every explosion
  for (let i = 0; i < explosions.length; i++) {

    let e = explosions[i];

    if (e.finished) {
      continue;
    }

    allFinished = false;

    // Random stagger
    if (elapsed < e.delay) {
      continue;
    }

    // Build its image only ONCE
    if (e.sprite === null) {

      e.sprite = createExplosionSprite(e.seed);

    }

   
    e.progress += e.speed;

    e.progress = constrain(
      e.progress,
      0,
      1
    );

   
    let ease =
      1 - pow(1 - e.progress, 4);

   
    let bounce =
      sin(e.progress * 180) *
      (1 - e.progress) *
      e.bounce;

  
    let shockwave =
      sin(e.progress * 540) *
      pow(1 - e.progress, 2) *
      0.06;

    let scaleAmount =
      max(0, ease + bounce + shockwave);

    // Individual final size
    let finalSize =
      SPRITE_SIZE * e.sizeMultiplier;

    let animatedSize =
      finalSize * scaleAmount;

    //  merge to permanent poster
    if (e.progress >= 1) {

      let finalX = e.x - finalSize / 2;
      let finalY = e.y - finalSize / 2;

      posterLayer.push();

      // Bake into permanent layer
      posterLayer.image(
        e.sprite,
        finalX,
        finalY,
        finalSize,
        finalSize
      );

      posterLayer.pop();

    
      image(
        e.sprite,
        finalX,
        finalY,
        finalSize,
        finalSize
      );

      // Release temporary graphics
      e.sprite.remove();
      e.sprite = null;

      e.finished = true;

    } else {

      // Animate the cached image
      image(
        e.sprite,
        e.x - animatedSize / 2,
        e.y - animatedSize / 2,
        animatedSize,
        animatedSize
      );

    }

  }

  // Check when ALL 35 have finished
  if (
    posterStarted &&
    explosions.length === EXPLOSION_COUNT
  ) {

    allFinished = explosions.every(
      e => e.finished
    );

    if (allFinished) {
      showText = true;
    }

  }

  // Typography
  if (showText) {
    animateText();
  }

}


// CLICK TO GENERATE A NEW POSTER
function mousePressed() {

  if (!imagesReady) {
    return;
  }

  if (mouseX < 110 && mouseY < 60) {
    return;
  }

  generatePoster();

}



function generatePoster() {

  clearExplosionSprites();

  explosions = [];

  posterLayer.clear();

  showText = false;
  textProgress = 0;

  posterStarted = true;
  posterStart = millis();

  for (let i = 0; i < EXPLOSION_COUNT; i++) {

    explosions.push({

      // Random positions
      x: random(width),
      y: random(height),

      // Unique random shapes
      seed: floor(random(1000000)),

      progress: 0,

      // Randomized timing
      delay: i * 65 + random(0, 150),

      // Different animation speeds
      speed: random(0.035, 0.075),

      // Random explosion scale
      sizeMultiplier: random(0.65, 1.15),

      // Different bounce intensities
      bounce: random(0.12, 0.32),

      sprite: null,
      finished: false

    });

  }

}



function createExplosionSprite(seed) {

  let g = createGraphics(
    SPRITE_SIZE,
    SPRITE_SIZE
  );

  g.pixelDensity(1);
  g.angleMode(DEGREES);
  g.clear();

  g.push();

  g.translate(
    SPRITE_SIZE / 2,
    SPRITE_SIZE / 2
  );

  randomSeed(seed);

  let colors = [
    "#FF4D00",
    "#FFB000",
    "#0057FF",
    "#00C2FF",
    "#001F54",
    "#FFFFFF",
    "#FF006E"
  ];

  // Random overall explosion radius
  let explosionSize = random(130, 330);

  // Random number of radial spikes
  let angleStep = random([8, 10, 12, 15]);

  // Main shapes
  for (
    let angle = 0;
    angle < 360;
    angle += angleStep
  ) {

    g.push();

    g.rotate(
      angle + random(-18, 18)
    );

    let img = chooseImage();

    let c = color(random(colors));

    let shapeAlpha = random(70, 255);

    let burstLength = random(
      explosionSize * 0.3,
      explosionSize * 1.05
    );

    let thickness = random(6, 32);

    let shapeChoice = floor(random(3));

    if (shapeChoice === 0) {

      // RECTANGLE
      drawImageShape(
        g,
        img,
        "rectangle",
        [
          random(15, 40),
          -thickness / 2,
          burstLength,
          thickness
        ],
        c,
        shapeAlpha
      );

    } else if (shapeChoice === 1) {

      // TRIANGLE
      drawImageShape(
        g,
        img,
        "triangle",
        [
          random(10, 25), 0,
          burstLength, -thickness,
          burstLength, thickness
        ],
        c,
        shapeAlpha
      );

    } else {

      // CIRCLE
      drawImageShape(
        g,
        img,
        "circle",
        [
          burstLength,
          0,
          thickness * random(1, 2)
        ],
        c,
        shapeAlpha
      );

    }

    g.pop();

  }



  for (let i = 0; i < 12; i++) {

    g.push();

    g.rotate(random(360));

    let img = chooseImage();
    let c = color(random(colors));

    let fragmentDistance = random(
      explosionSize * 0.15,
      explosionSize * 0.8
    );

    drawImageShape(
      g,
      img,
      "rectangle",
      [
        fragmentDistance,
        -random(2, 7),
        random(10, 45),
        random(3, 12)
      ],
      c,
      random(50, 180)
    );

    g.pop();

  }


  // FLYING PARTICLES
  // Kept at 20 for performance
  for (let i = 0; i < 20; i++) {

    let particleAngle = random(360);

    let particleDistance = random(
      explosionSize * 0.5,
      explosionSize * 1.25
    );

    let particleX =
      cos(particleAngle) * particleDistance;

    let particleY =
      sin(particleAngle) * particleDistance;

    let particleSize = random(3, 17);

    drawImageShape(
      g,
      chooseImage(),
      "circle",
      [
        particleX,
        particleY,
        particleSize
      ],
      color(random(colors)),
      random(50, 255)
    );

  }


  // CENTRAL FLASH
  g.noStroke();

  g.fill(
    255,
    random(130, 255)
  );

  g.circle(
    0,
    0,
    random(35, 85)
  );

  g.pop();

  return g;

}


// RANDOMLY PICK ONE OF THREE IMAGES
function chooseImage() {

  if (explosionImages.length === 0) {
    return null;
  }

  return explosionImages[
    floor(random(explosionImages.length))
  ];

}


// CLIP IMAGES INSIDE SHAPES
function drawImageShape(
  g,
  img,
  shapeType,
  points,
  overlayColor,
  alphaVal
) {

  let minX, minY, maxX, maxY;

  if (shapeType === "rectangle") {

    minX = points[0];
    minY = points[1];

    maxX = points[0] + points[2];
    maxY = points[1] + points[3];

  } else if (shapeType === "triangle") {

    minX = Math.min(
      points[0],
      points[2],
      points[4]
    );

    minY = Math.min(
      points[1],
      points[3],
      points[5]
    );

    maxX = Math.max(
      points[0],
      points[2],
      points[4]
    );

    maxY = Math.max(
      points[1],
      points[3],
      points[5]
    );

  } else {

    let radius = points[2] / 2;

    minX = points[0] - radius;
    minY = points[1] - radius;

    maxX = points[0] + radius;
    maxY = points[1] + radius;

  }

  let w = maxX - minX;
  let h = maxY - minY;

  if (w <= 1 || h <= 1) {
    return;
  }

  g.push();

  let ctx = g.drawingContext;

  ctx.save();
  ctx.beginPath();

  if (shapeType === "rectangle") {

    ctx.rect(
      points[0],
      points[1],
      points[2],
      points[3]
    );

  } else if (shapeType === "triangle") {

    ctx.moveTo(points[0], points[1]);
    ctx.lineTo(points[2], points[3]);
    ctx.lineTo(points[4], points[5]);
    ctx.closePath();

  } else {

    ctx.arc(
      points[0],
      points[1],
      points[2] / 2,
      0,
      Math.PI * 2
    );

  }

  ctx.clip();

  // Random image transparency
  ctx.globalAlpha = alphaVal / 255;

  if (img) {

    // Crop image to shape without stretching
    let imageScale = Math.max(
      w / img.width,
      h / img.height
    );

    let imgW = img.width * imageScale;
    let imgH = img.height * imageScale;

    let imgX = minX + (w - imgW) / 2;
    let imgY = minY + (h - imgH) / 2;

    g.imageMode(CORNER);

    g.image(
      img,
      imgX,
      imgY,
      imgW,
      imgH
    );

  } else {

    g.noStroke();
    g.fill(overlayColor);
    g.rect(minX, minY, w, h);

  }

  ctx.globalAlpha = 1;

  // Original randomized color overlay
  let tintColor = color(overlayColor);

  tintColor.setAlpha(
    alphaVal * 0.35
  );

  g.noStroke();
  g.fill(tintColor);

  if (shapeType === "rectangle") {

    g.rect(
      points[0],
      points[1],
      points[2],
      points[3]
    );

  } else if (shapeType === "triangle") {

    g.triangle(
      points[0],
      points[1],
      points[2],
      points[3],
      points[4],
      points[5]
    );

  } else {

    g.circle(
      points[0],
      points[1],
      points[2]
    );

  }

  ctx.restore();

  g.pop();

}



function animateText() {

  if (textProgress < 1) {

    textProgress += 0.04;

    textProgress = constrain(
      textProgress,
      0,
      1
    );

  }

  let word = "SUPERNOVA";
  let letters = word.split("");

  push();

  textAlign(LEFT, CENTER);
  textFont("Arial");
  textStyle(BOLD);

  let fontSize = min(
    width * 0.09,
    120
  );

  textSize(fontSize);

  drawingContext.shadowBlur = 12;
  drawingContext.shadowColor =
    "rgba(0,0,0,0.8)";

  let startXBase = width * 0.08;
  let y = height * 0.18;

  let spacing = fontSize * 0.68;

  for (let i = 0; i < letters.length; i++) {

    let letterProgress = map(
      textProgress,
      i * 0.08,
      1,
      0,
      1
    );

    letterProgress = constrain(
      letterProgress,
      0,
      1
    );

    let ease =
      1 - pow(1 - letterProgress, 3);

    let finalX =
      startXBase + i * spacing;

    let startX = finalX - 120;

    let x = lerp(
      startX,
      finalX,
      ease
    );

    let alpha = lerp(
      0,
      255,
      ease
    );

    fill(255, alpha);
    noStroke();

    text(letters[i], x, y);

  }

  pop();

}


// FREE TEMPORARY GRAPHICS
function clearExplosionSprites() {

  for (let e of explosions) {

    if (e.sprite !== null) {

      e.sprite.remove();
      e.sprite = null;

    }

  }

}


// RESET WITH R
function keyPressed() {

  if (key === "r" || key === "R") {
    resetCanvas();
  }

}


// RESET POSTER
function resetCanvas() {

  clearExplosionSprites();

  explosions = [];

  posterLayer.clear();

  showText = false;
  textProgress = 0;
  posterStarted = false;

}


// RESIZE CANVAS
function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );

  // Rebuild static stars
  spaceLayer.remove();

  spaceLayer = createGraphics(
    width,
    height
  );

  spaceLayer.pixelDensity(1);

  setupSpace();

  // Clear poster on resize
  posterLayer.remove();

  posterLayer = createGraphics(
    width,
    height
  );

  posterLayer.pixelDensity(1);
  posterLayer.clear();

  clearExplosionSprites();

  explosions = [];

  showText = false;
  textProgress = 0;
  posterStarted = false;

}

