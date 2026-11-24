

let rows = 14;
let columns = 20;
let xSpace = 55;
let ySpace = 55;

let particles = [];
let floaters = [];

let keepText;
let letters = [];
let ripples = [];

let textFocusX = 0;
let textFocusY = 0;

// MOTIVATION + BURNOUT
let exhaustion = 0;
let visualExhaustion = 0;
let speedBoost = 0;
let motionSpeed = 1.2;
let textPhase = 0;
let lastClick = 0;

let textFontSize = 100;

// BACKGROUND INTENSITY
let bgOpacity = 0.52;


//////////////////////////////
// SETUP
//////////////////////////////

function setup() {

  let canvas = createCanvas(
    windowWidth,
    windowHeight,
    WEBGL
  );

  canvas.position(0, 0);
  canvas.style('z-index', '0');
  canvas.style('opacity', String(bgOpacity));
  canvas.style('pointer-events', 'none');

  document.body.style.margin = '0';
  document.body.style.overflow = 'hidden';
  document.body.style.background = '#090611';

  colorMode(HSB, 360, 100, 100, 100);
  angleMode(RADIANS);
  noStroke();


  // BACKGROUND PARTICLES
  for (let i = 0; i < 180; i++) {

    particles.push({
      x: random(-width / 2, width / 2),
      y: random(-height / 2, height / 2),
      size: random(2, 10),
      speedX: random(-0.4, 0.4),
      speedY: random(-0.4, 0.4),
      hueOffset: random(360)
    });

  }


  // FLOATING SHAPES
  for (let i = 0; i < 24; i++) {

    floaters.push({
      x: random(-width / 2, width / 2),
      y: random(-height / 2, height / 2),
      baseSize: random(30, 120),
      rot: random(TWO_PI),
      rotSpeed: random(-0.02, 0.02),
      driftX: random(-0.5, 0.5),
      driftY: random(-0.5, 0.5),
      hueOffset: random(360),
      type: floor(random(4))
    });

  }


  //////////////////////////////
  // INTERACTIVE TYPOGRAPHY
  //////////////////////////////

  keepText = createDiv('');

  keepText.style('position', 'absolute');
  keepText.style('z-index', '20');
  keepText.style('display', 'flex');
  keepText.style('align-items', 'center');
  keepText.style('justify-content', 'center');
  keepText.style('gap', '0');
  keepText.style('letter-spacing', '-0.045em');
  keepText.style('line-height', '1');
  keepText.style('mix-blend-mode', 'screen');

  keepText.style(
    'font-family',
    'Arial, Helvetica, sans-serif'
  );

  keepText.style('font-weight', '900');
  keepText.style('white-space', 'nowrap');
  keepText.style('text-align', 'center');

  keepText.style(
    'transform',
    'translate(-50%, -50%)'
  );

  keepText.style('user-select', 'none');
  keepText.style('pointer-events', 'auto');
  keepText.style('cursor', 'pointer');
  keepText.style('touch-action', 'manipulation');


  // INDIVIDUAL LETTERS
  for (let character of 'KEEP GOING') {

    const glyph = createSpan(
      character === ' ' ? '\u00a0' : character
    );

    glyph.parent(keepText);

    glyph.style('display', 'inline-block');
    glyph.style('position', 'relative');
    glyph.style('white-space', 'pre');
    glyph.style('pointer-events', 'none');
    glyph.style('will-change', 'transform, opacity');

    letters.push(glyph);
  }


  // CLICK INTERACTION
  keepText.elt.setAttribute('role', 'button');
  keepText.elt.setAttribute('tabindex', '0');

  keepText.elt.setAttribute(
    'aria-label',
    'KEEP GOING. Click to make a wave.'
  );

  keepText.elt.addEventListener('keydown', event => {

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      pushSystem();
    }

  });

  keepText.mousePressed(pushSystem);

  updateLayout();
  lastClick = millis();
}


//////////////////////////////
// MAIN DRAW LOOP
//////////////////////////////

function draw() {

  drawingContext.disable(
    drawingContext.DEPTH_TEST
  );


  //////////////////////////////
  // PSYCHEDELIC BACKGROUND
  //////////////////////////////

  let bgHue = (
    frameCount * 0.35 +
    sin(frameCount * 0.01) * 60 +
    360
  ) % 360;

  let bgBright =
    12 + sin(frameCount * 0.02) * 10;

  background(bgHue, 65, bgBright);


  // UPDATE TYPOGRAPHY
  ripples = ripples.filter(
    ripple => millis() - ripple.started < 2400
  );

  updateKeepGoing();


  rotateZ(
    sin(frameCount * 0.003) * 0.08
  );

  drawGlowRings();
  drawParticles();
  drawFloaters();
  drawTextWake();


  //////////////////////////////
  // ABSTRACT WAVE GRID
  //////////////////////////////

  push();

  rotateX(
    sin(frameCount * 0.01) * 0.12
  );

  rotateY(
    cos(frameCount * 0.012) * 0.12
  );

  rotateZ(
    sin(frameCount * 0.008) * 0.08
  );

  scale(
    1 + sin(frameCount * 0.015) * 0.04
  );

  translate(
    -(columns - 1) * xSpace / 2,
    -(rows - 1) * ySpace / 2
  );

  noStroke();


  for (let j = 0; j < rows; j++) {

    for (let i = 0; i < columns; i++) {

      let x = i * xSpace;
      let y = j * ySpace;

      let worldX =
        x - (columns - 1) * xSpace / 2;

      let worldY =
        y - (rows - 1) * ySpace / 2;

      let field = sampleField(worldX, worldY);


      // ORIGINAL WAVE MOVEMENT
      let xWave = cos(
        frameCount * 0.035 +
        i * 0.45 +
        j * 0.22
      ) * 30 + field.dx * 0.8;

      let yWave = sin(
        frameCount * 0.045 +
        i * 0.35 +
        j * 0.28
      ) * 30 + field.dy * 0.8;


      let pulse = sin(
        frameCount * 0.08 +
        i * 0.4 +
        j * 0.25
      );

      let s = map(
        pulse, -1, 1, 8, 28
      );


      // BACKGROUND REACTS TO TEXT
      let nearText =
        textProximity(worldX, worldY) *
        (1 - visualExhaustion * 0.65);

      s *= 1 + nearText * 0.45;


      let hue =
        fieldHue(worldX, worldY);

      let bright = map(
        sin(
          frameCount * 0.06 +
          i * 0.2 +
          j * 0.3
        ),
        -1, 1, 60, 100
      );


      push();

      translate(
        x + xWave,
        y + yWave
      );


      // SOFT GLOW
      fill(
        hue,
        70,
        100,
        10 + nearText * 9
      );

      ellipse(
        0, 0,
        s * 2.8,
        s * 2.8
      );


      // MAIN SHAPES
      fill(
        hue,
        80,
        bright,
        50 + nearText * 23
      );

      rotate(
        frameCount * 0.01 +
        (i + j) * 0.1
      );

      let shapeType = (i + j) % 4;


      if (shapeType === 0) {

        ellipse(
          0, 0,
          s * 1.2,
          s * 1.2
        );

      } else if (shapeType === 1) {

        rectMode(CENTER);

        rect(
          0, 0,
          s * 1.2,
          s * 1.2
        );

      } else if (shapeType === 2) {

        triangle(
          0, -s,
          -s * 0.85, s,
          s * 0.85, s
        );

      } else {

        beginShape();

        for (
          let a = 0;
          a < TWO_PI;
          a += TWO_PI / 6
        ) {

          vertex(
            cos(a) * s,
            sin(a) * s
          );

        }

        endShape(CLOSE);
      }


      // INNER ACCENT
      fill(
        (hue + 180) % 360,
        40,
        100,
        35
      );

      ellipse(
        0, 0,
        s * 0.35,
        s * 0.35
      );

      pop();

    }
  }

  pop();
}


//////////////////////////////
// CLICK INTERACTION
// MOTIVATION VS BURNOUT
//////////////////////////////

function pushSystem() {

  lastClick = millis();


  // INITIAL CLICKS GIVE MOTIVATION
  // EACH CLICK ADDS MOMENTUM
  // BUT THE EFFECT WEAKENS WITH FATIGUE

  let motivation = pow(
    1 - exhaustion,
    1.15
  );

  speedBoost +=
    1.6 * motivation;

  speedBoost = min(
    speedBoost,
    7
  );


  // EXHAUSTION COMPOUNDS
  // SLOWLY AT FIRST, THEN FASTER

  exhaustion +=
    0.09 + exhaustion * 0.04;

  exhaustion = constrain(
    exhaustion,
    0,
    1
  );


  // RIPPLE INTERACTION

  ripples.push({

    x: textFocusX - width / 2,

    y: textFocusY - height / 2,

    started: millis(),

    strength:
      18 + 32 * (1 - exhaustion)

  });


  if (ripples.length > 8) {
    ripples.shift();
  }
}


//////////////////////////////
// MOTIVATION + BURNOUT SYSTEM
//////////////////////////////

function updateKeepGoing() {

  let dt =
    min(deltaTime, 50);

  let realDt =
    max(0, deltaTime);

  let timeSinceClick =
    millis() - lastClick;


  //////////////////////////////
  // RECOVERY
  //////////////////////////////

  // START RECOVERING AFTER 1.8 SECONDS

  if (timeSinceClick > 1800) {

    exhaustion -=
      realDt * 0.00032;

    exhaustion = max(
      0,
      exhaustion
    );

    if (exhaustion < 0.005) {
      exhaustion = 0;
    }
  }


  //////////////////////////////
  // MOMENTUM DECAY
  //////////////////////////////

  // MOMENTUM LASTS LONGER WHEN ENERGIZED
  // AND DISAPPEARS FASTER WHEN EXHAUSTED

  let burstDuration =
    1350 - exhaustion * 850;

  speedBoost *= exp(
    -realDt / burstDuration
  );


  // RESET MOMENTUM AFTER RECOVERY

  if (
    exhaustion === 0 &&
    timeSinceClick > 5000
  ) {
    speedBoost = 0;
  }


  //////////////////////////////
  // MOVEMENT SPEED
  //////////////////////////////

  // THE MORE EXHAUSTED YOU ARE,
  // THE LESS EACH CLICK CAN HELP

  let stamina = pow(
    1 - exhaustion,
    1.55
  );


  // NORMAL SPEED + MOTIVATION BOOST

  let desiredSpeed =
    0.035 +
    1.2 * stamina +
    speedBoost * 1.8 * stamina;


  // SMOOTH PHYSICAL INERTIA
  // QUICK ACCELERATION
  // GRADUAL DECELERATION

  let responseTime =
    desiredSpeed > motionSpeed
      ? 145
      : 340;

  let motionEase =
    1 - exp(-realDt / responseTime);

  motionSpeed +=
    (desiredSpeed - motionSpeed) *
    motionEase;


  // ADVANCE TEXT MOTION

  textPhase +=
    motionSpeed * dt / 1000;


  //////////////////////////////
  // SMOOTH VISUAL RECOVERY
  //////////////////////////////

  // THE VISIBLE EFFECT LAGS SLIGHTLY
  // BEHIND EXHAUSTION FOR SMOOTHNESS

  let visualResponse =
    exhaustion > visualExhaustion
      ? 190
      : 450;

  let visualEase =
    1 - exp(-realDt / visualResponse);

  visualExhaustion +=
    (exhaustion - visualExhaustion) *
    visualEase;


  // COMPLETELY RESTORE ORIGINAL STATE

  if (
    exhaustion === 0 &&
    visualExhaustion < 0.001
  ) {
    visualExhaustion = 0;
  }


  //////////////////////////////
  // TYPOGRAPHY POSITION
  //////////////////////////////

  let phraseWidth =
    keepText.elt.offsetWidth;

  let horizontalRange = max(
    0,
    min(
      width * 0.11,
      (width - phraseWidth) / 2 - 18
    )
  );


  // TEXT DRIFTS WITH THE BACKGROUND

  textFocusX =
    width / 2 +
    sin(textPhase * 0.58) *
    horizontalRange;

  textFocusY =
    height * 0.46 +
    sin(textPhase * 0.42) * 15;

  keepText.position(
    textFocusX,
    textFocusY
  );


  //////////////////////////////
  // SMOOTH TEXT APPEARANCE
  //////////////////////////////

  // OPACITY

  let textOpacity =
    0.16 +
    0.84 *
    pow(1 - visualExhaustion, 1.5);


  // STROKE THICKNESS

  let strokeSize =
    1.8 * (1 - visualExhaustion);


  // GLOW INTENSITY

  let glowSize =
    6 + 25 * (1 - visualExhaustion);


  keepText.style(
    'opacity',
    String(textOpacity)
  );


  // SUBTLE BLUR WHEN EXHAUSTED
  // SMOOTHLY DISAPPEARS WHEN RECOVERING

  keepText.style(
    'filter',
    `blur(${(visualExhaustion * 1.25).toFixed(2)}px)`
  );


  //////////////////////////////
  // INDIVIDUAL LETTERS
  //////////////////////////////

  for (let i = 0; i < letters.length; i++) {

    const glyph =
      letters[i];

    const localX =
      glyph.elt.offsetLeft +
      glyph.elt.offsetWidth / 2 -
      phraseWidth / 2;

    const worldX =
      textFocusX -
      width / 2 +
      localX;

    const worldY =
      textFocusY -
      height / 2;


    // SHARED BACKGROUND FIELD

    const field =
      sampleField(worldX, worldY);

    const hue =
      fieldHue(worldX, worldY);


    // LETTER ANIMATION USES TEXT SPEED
    // SO CLICKS ACCELERATE THE LETTERS TOO

    const wobble =
      sin(
        textPhase * 1.8 +
        i * 0.43
      );


    const x =
      field.dx * 1.05;

    const y =
      field.dy * 1.15 +
      wobble * 4;

    const tilt =
      field.dx * 0.18 +
      wobble * 3.2;


    const scaleY =
      1 +
      sin(
        textPhase * 1.65 +
        i * 0.48
      ) * 0.035;


    // CONTINUOUS THINNING
    // NO ABRUPT FONT-WEIGHT CHANGES

    const scaleX =
      1 - visualExhaustion * 0.22;


    glyph.style(
      'transform',
      `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) ` +
      `rotate(${tilt.toFixed(2)}deg) ` +
      `scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`
    );


    // SHARED PSYCHEDELIC COLORS

    glyph.style(
      'color',
      `hsl(${hue.toFixed(0)} 100% 82%)`
    );


    // SMOOTH OUTLINE

    glyph.style(
      '-webkit-text-stroke',
      `${strokeSize.toFixed(2)}px hsla(${hue.toFixed(0)}, 100%, 94%, 0.8)`
    );


    // SMOOTH GLOW

    glyph.style(
      'text-shadow',
      `0 0 ${glowSize.toFixed(0)}px hsla(${hue.toFixed(0)},100%,65%,0.95), ` +
      '0 3px 16px rgba(0,0,0,0.9)'
    );

  }
}


//////////////////////////////
// SHARED COLOR FIELD
//////////////////////////////

function fieldHue(x, y) {

  const col =
    (x + (columns - 1) * xSpace / 2) /
    xSpace;

  const row =
    (y + (rows - 1) * ySpace / 2) /
    ySpace;

  return (
    frameCount * 1.2 +
    col * 18 +
    row * 12 +
    3600
  ) % 360;
}


//////////////////////////////
// SHARED MOTION FIELD
//////////////////////////////

function sampleField(x, y) {

  const time =
    frameCount * 0.035;

  let dx =
    cos(
      time +
      x * 0.009 +
      y * 0.005
    ) * 16 +
    sin(
      time * 0.6 -
      y * 0.011
    ) * 8;

  let dy =
    sin(
      time * 0.9 +
      x * 0.012 -
      y * 0.006
    ) * 17 +
    cos(
      time * 0.55 +
      x * 0.008
    ) * 8;


  //////////////////////////////
  // TRAVELING CLICK RIPPLES
  //////////////////////////////

  for (let ripple of ripples) {

    const age =
      (millis() - ripple.started) /
      1000;

    const vx =
      x - ripple.x;

    const vy =
      y - ripple.y;

    const distance =
      sqrt(vx * vx + vy * vy);

    const front =
      age * 340;

    const ring = exp(
      -pow(
        (distance - front) / 82,
        2
      )
    );

    const amount =
      ring *
      ripple.strength *
      max(0, 1 - age / 2.4);

    dx +=
      vx / max(distance, 1) *
      amount;

    dy +=
      vy / max(distance, 1) *
      amount;
  }

  return { dx, dy };
}


//////////////////////////////
// TEXT INFLUENCE ON BACKGROUND
//////////////////////////////

function textProximity(x, y) {

  const nx =
    (x - (textFocusX - width / 2)) /
    max(1, textFontSize * 4.5);

  const ny =
    (y - (textFocusY - height / 2)) /
    max(1, textFontSize * 1.25);

  return exp(
    -(nx * nx + ny * ny) * 1.6
  );
}


//////////////////////////////
// GLOWING TEXT WAKE
//////////////////////////////

function drawTextWake() {

  push();

  noFill();
  strokeWeight(1.5);

  const x =
    textFocusX - width / 2;

  const y =
    textFocusY - height / 2;


  // WAVES SURROUNDING THE TEXT

  for (let i = 0; i < 3; i++) {

    const pulse =
      sin(
        frameCount * 0.03 +
        i * 0.8
      ) * 18;

    stroke(
      (fieldHue(x, y) + i * 35) % 360,
      85,
      100,
      (11 - i * 2) *
      (1 - visualExhaustion * 0.7)
    );

    ellipse(
      x,
      y,
      textFontSize * (5 + i) + pulse,
      textFontSize * (1.25 + i * 0.5) + pulse
    );
  }


  // TRAVELING RIPPLES

  for (let ripple of ripples) {

    const age =
      (millis() - ripple.started) /
      1000;

    const radius =
      age * 340;

    stroke(
      fieldHue(ripple.x, ripple.y),
      80,
      100,
      max(
        0,
        15 * (1 - age / 2.4)
      )
    );

    ellipse(
      ripple.x,
      ripple.y,
      radius * 2,
      radius * 2
    );

  }

  pop();
}


//////////////////////////////
// BACKGROUND PARTICLES
//////////////////////////////

function drawParticles() {

  push();
  noStroke();

  for (let p of particles) {

    let h = (
      frameCount * 0.8 +
      p.hueOffset
    ) % 360;

    let b =
      70 +
      sin(
        frameCount * 0.04 +
        p.hueOffset
      ) * 30;

    fill(
      h,
      50,
      b,
      18
    );

    let wave =
      sampleField(p.x, p.y);

    ellipse(
      p.x + wave.dx * 0.36,
      p.y + wave.dy * 0.36,
      p.size
    );


    // PARTICLES FOLLOW THE FLOW

    p.x +=
      p.speedX +
      wave.dx * 0.003;

    p.y +=
      p.speedY +
      wave.dy * 0.003;


    if (p.x > width / 2)
      p.x = -width / 2;

    if (p.x < -width / 2)
      p.x = width / 2;

    if (p.y > height / 2)
      p.y = -height / 2;

    if (p.y < -height / 2)
      p.y = height / 2;
  }

  pop();
}


//////////////////////////////
// FLOATING ABSTRACT SHAPES
//////////////////////////////

function drawFloaters() {

  push();
  noFill();
  strokeWeight(1.5);

  for (let f of floaters) {

    let hue = (
      frameCount +
      f.hueOffset
    ) % 360;

    let alpha =
      10 +
      sin(
        frameCount * 0.03 +
        f.hueOffset
      ) * 5;

    let s =
      f.baseSize +
      sin(
        frameCount * 0.025 +
        f.hueOffset
      ) * 20;

    push();


    // FLOATERS FOLLOW SHARED WAVE

    let wave =
      sampleField(f.x, f.y);

    translate(
      f.x + wave.dx * 0.5,
      f.y + wave.dy * 0.5
    );

    rotate(
      f.rot +
      frameCount * f.rotSpeed
    );

    stroke(
      hue,
      80,
      100,
      alpha
    );


    if (f.type === 0) {

      ellipse(0, 0, s, s);

      ellipse(
        0, 0,
        s * 0.55,
        s * 0.55
      );

    } else if (f.type === 1) {

      rectMode(CENTER);

      rect(0, 0, s, s);

      rect(
        0, 0,
        s * 0.5,
        s * 0.5
      );

    } else if (f.type === 2) {

      triangle(
        0, -s / 2,
        -s / 2, s / 2,
        s / 2, s / 2
      );

      triangle(
        0, -s / 4,
        -s / 4, s / 4,
        s / 4, s / 4
      );

    } else {

      beginShape();

      for (
        let a = 0;
        a < TWO_PI;
        a += TWO_PI / 8
      ) {

        let r =
          s * 0.5 * (
            1 +
            0.2 * sin(
              frameCount * 0.03 +
              a * 3
            )
          );

        vertex(
          cos(a) * r,
          sin(a) * r
        );
      }

      endShape(CLOSE);
    }

    pop();


    f.x += f.driftX;
    f.y += f.driftY;


    if (f.x > width / 2 + 100)
      f.x = -width / 2 - 100;

    if (f.x < -width / 2 - 100)
      f.x = width / 2 + 100;

    if (f.y > height / 2 + 100)
      f.y = -height / 2 - 100;

    if (f.y < -height / 2 - 100)
      f.y = height / 2 + 100;
  }

  pop();
}


//////////////////////////////
// SOFT GLOW RINGS
//////////////////////////////

function drawGlowRings() {

  push();
  noFill();
  strokeWeight(1.5);

  for (let i = 0; i < 6; i++) {

    let ringHue = (
      frameCount * 1.1 +
      i * 45
    ) % 360;

    let size =
      220 +
      i * 130 +
      sin(
        frameCount * 0.025 +
        i
      ) * 50;

    stroke(
      ringHue,
      85,
      100,
      7
    );

    ellipse(
      0,
      0,
      size,
      size
    );
  }

  pop();
}


//////////////////////////////
// RESPONSIVE LAYOUT
//////////////////////////////

function updateLayout() {

  textFontSize = constrain(
    min(
      width * 0.085,
      (width - 24) / 6.2
    ),
    28,
    120
  );

  keepText.style(
    'font-size',
    textFontSize + 'px'
  );

  textFocusX = width / 2;
  textFocusY = height * 0.46;

  keepText.position(
    textFocusX,
    textFocusY
  );
}


//////////////////////////////
// WINDOW RESIZE
//////////////////////////////

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );

  updateLayout();
}