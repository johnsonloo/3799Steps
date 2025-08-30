// Simple working version of the 3799 Steps game
console.log('Game script loading...');


const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

if (!canvas || !ctx) {
  console.error('Canvas or context not found!');
  throw new Error('Canvas setup failed');
}

// Responsive canvas setup
function resizeCanvas() {
  // Use device pixel ratio for crisp rendering
  const dpr = window.devicePixelRatio || 1;
  // Use full window dimensions for adaptive resolution
  let w = window.innerWidth;
  let h = window.innerHeight;
  // Ensure portrait orientation for mobile
  if (w > h && h < 600) { // Swap if landscape and height is small (likely mobile)
    [w, h] = [h, w];
  }
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
  ctx.scale(dpr, dpr);
  viewW = w;
  viewH = h;
  draw();
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);

console.log('Canvas loaded:', canvas.width, canvas.height);

// Game settings
const numSteps = 3799;
let stepW = 90;
let stepH = 50;
let margin = 60;
const offsetX = 10;
let viewW = canvas.width;
let viewH = canvas.height;

// Game state
let stepPos = 0;
let gameOver = false;


// Asset loading system with robust error handling and loading indicator
let bgImg = null, char1Img = null, char2Img = null, flagImg = null;
let assetsLoaded = false;
let assetsFailed = false;
let assetsToLoad = 4;
let assetsLoadedCount = 0;

// Toggle rendering of characters (set false to show stairs-only like the ASCII sketch)
const SHOW_CHARACTERS = true;

function showLoadingScreen() {
  ctx.clearRect(0, 0, viewW, viewH);
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, viewW, viewH);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Loading game assets...', viewW/2, viewH/2);
}

function assetLoaded() {
  assetsLoadedCount++;
  if (assetsLoadedCount === assetsToLoad) {
    assetsLoaded = true;
    draw();
    console.log('All assets loaded!');
  }
}

function assetFailed(name) {
  assetsFailed = true;
  console.warn(name + ' failed to load. Using fallback.');
  assetLoaded();
}

function loadAssets() {
  showLoadingScreen();
  // Background
  bgImg = new window.Image();
  bgImg.onload = assetLoaded;
  bgImg.onerror = () => assetFailed('Background');
  bgImg.src = 'assets/resources/images/bg.png';

  // Character 1 (Chu Wanning)
  char1Img = new window.Image();
  char1Img.onload = assetLoaded;
  char1Img.onerror = () => assetFailed('Chu Wanning');
  char1Img.src = 'assets/resources/images/wanning.png';

  // Character 2 (Mo Ran)
  char2Img = new window.Image();
  char2Img.onload = assetLoaded;
  char2Img.onerror = () => assetFailed('Mo Ran');
  char2Img.src = 'assets/resources/images/moran.png';

  // Flag
  flagImg = new window.Image();
  flagImg.onload = assetLoaded;
  flagImg.onerror = () => assetFailed('Flag');
  flagImg.src = 'assets/resources/images/flag.png';
}

loadAssets();

function getStepXY(i) {
  // Calculate positions so steps stack upward from the bottom.
  // Bottom step (i=0) sits near the bottom-left; each next step
  // shifts right by `lateralOffset` and up by `verticalOffset` so
  // the tops form the stacked block appearance from the sketch.
  const baseX = Math.max(margin, Math.floor(viewW * 0.08));
  const baseY = viewH - margin - stepH; // front-top Y of the bottom step

  // Use the rendered top 'depth' so each step's top sits on the previous top.
  // This makes the lateral and vertical shifts equal to the top-face offset,
  // producing the stacked-block look from the sketch.
  const depth = Math.max(8, Math.floor(stepW / 8));
  const lateralOffset = depth;
  // Use verticalOffset so the next step's front face sits below the previous top.
  // verticalOffset = stepH + depth ensures the upper block's bottom aligns with
  // the previous block's top-back edge, producing discrete stacked blocks.
  const verticalOffset = stepH + depth;

  const x = baseX + i * lateralOffset;
  const y = baseY - i * verticalOffset;
  return { x, y };
}

function updateDebugInfo() {
  try {
    document.getElementById('stepInfo').textContent = `Step: ${stepPos + 1} / ${numSteps}`;
  } catch (e) {
    console.log('Debug update failed:', e);
  }
}



function draw() {
  // Dynamically scale step size and margin for mobile
  stepW = Math.max(60, Math.floor(viewW / 6));
  stepH = Math.max(30, Math.floor(viewH / 16));
  margin = Math.max(20, Math.floor(viewH / 20));

  if (!assetsLoaded && !assetsFailed) {
    showLoadingScreen();
    return;
  }
  console.log('Drawing at step:', stepPos);

  // Clear canvas
  ctx.clearRect(0, 0, viewW, viewH);

  // Draw background
  if (bgImg && bgImg.complete && !assetsFailed) {
    ctx.drawImage(bgImg, 0, 0, viewW, viewH);
  } else {
    // Fallback background
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(0, 0, viewW, viewH);
  }

  // Update debug info
  updateDebugInfo();

  // Calculate character position
  const { x, y } = getStepXY(stepPos);
  const charX = x + 20;
  const charY = y + stepH/2 - 25;

  // Simple camera - center on character
  const camX = charX - viewW/2;
  const camY = charY - viewH/2;

  // Draw steps: iterate the full sequence so the stacked tower exists in full.
  // The inner visibility check still prevents off-screen rendering for performance.
  const startStep = 0;
  const endStep = numSteps - 1;

  for (let i = startStep; i <= endStep; i++) {
    const stepXY = getStepXY(i);
    const screenX = stepXY.x - camX;
    const screenY = stepXY.y - camY;

    // Only draw if visible
    if (screenX > -stepW && screenX < viewW + stepW &&
        screenY > -stepH && screenY < viewH + stepH) {

      // Draw 3D step (isometric perspective)
      const depth = Math.max(8, Math.floor(stepW / 8)); // 3D depth
      
      // Step face (front)
      ctx.fillStyle = i === stepPos ? '#707070' : '#505050';
      ctx.fillRect(screenX, screenY, stepW, stepH);
      
      // Step top (lighter)
      ctx.fillStyle = i === stepPos ? '#909090' : '#707070';
      ctx.beginPath();
      ctx.moveTo(screenX, screenY);
      ctx.lineTo(screenX + depth, screenY - depth);
      ctx.lineTo(screenX + stepW + depth, screenY - depth);
      ctx.lineTo(screenX + stepW, screenY);
      ctx.closePath();
      ctx.fill();
      
      // Step side (darker)
      ctx.fillStyle = i === stepPos ? '#505050' : '#303030';
      ctx.beginPath();
      ctx.moveTo(screenX + stepW, screenY);
      ctx.lineTo(screenX + stepW + depth, screenY - depth);
      ctx.lineTo(screenX + stepW + depth, screenY + stepH - depth);
      ctx.lineTo(screenX + stepW, screenY + stepH);
      ctx.closePath();
      ctx.fill();

      // Step outlines for definition
      ctx.strokeStyle = '#808080';
      ctx.lineWidth = 1;
      ctx.strokeRect(screenX, screenY, stepW, stepH);
      
      // Top outline
      ctx.beginPath();
      ctx.moveTo(screenX, screenY);
      ctx.lineTo(screenX + depth, screenY - depth);
      ctx.lineTo(screenX + stepW + depth, screenY - depth);
      ctx.lineTo(screenX + stepW, screenY);
      ctx.stroke();
      
      // Side outline
      ctx.beginPath();
      ctx.moveTo(screenX + stepW, screenY);
      ctx.lineTo(screenX + stepW + depth, screenY - depth);
      ctx.lineTo(screenX + stepW + depth, screenY + stepH - depth);
      ctx.lineTo(screenX + stepW, screenY + stepH);
      ctx.stroke();

      // Highlight current step
      if (i === stepPos) {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX - 1, screenY - 1, stepW + 2, stepH + 2);
      }
    }
  }

  // Draw characters on current step (place on top face of the isometric step)
  // Wrapped behind SHOW_CHARACTERS so we can render stairs-only when desired.
  if (SHOW_CHARACTERS) {
  // Recompute top surface of the current step so characters' feet rest on it.
  const depthForChars = Math.max(8, Math.floor(stepW / 8));
  const currentStep = getStepXY(stepPos);
  const currentScreenX = currentStep.x - camX;
  const currentScreenY = currentStep.y - camY; // this is front-top of the step
  // Top surface Y is above front by 'depthForChars'
  const topY = currentScreenY - depthForChars;

  // Character vertical size (scale to step height)
  const charHeight = stepH; // characters will be roughly step tall
  // Character sizing: compute both widths first so positioning can center the pair
  const leftCharScale = (char2Img && char2Img.height) ? (charHeight / char2Img.height) : 1;
  const leftCharW = char2Img ? (char2Img.width * leftCharScale) : Math.max(16, Math.floor(stepW / 4));
  const rightCharScale = (char1Img && char1Img.height) ? (charHeight / char1Img.height) : 1;
  const rightCharW = char1Img ? (char1Img.width * rightCharScale) : Math.max(16, Math.floor(stepW / 4));

  // Position both characters centered on the step top and touching (small negative gap)
  const centerX = currentScreenX + Math.floor(stepW * 0.5);
  const desiredGap = -Math.max(2, Math.floor(stepW * 0.03));
  const leftCharX = centerX - Math.floor((leftCharW + rightCharW + desiredGap) / 2);
  const leftCharY = topY - charHeight; // draw so bottom sits on top surface
  const rightCharX = leftCharX + leftCharW + desiredGap;
  const rightCharY = leftCharY;

    // Draw left character (Mo Ran)
    if (char2Img && char2Img.complete && !assetsFailed) {
      ctx.drawImage(char2Img, leftCharX, leftCharY, leftCharW, charHeight);
    } else {
      // Fallback red rectangle for left character (use computed size)
      ctx.fillStyle = 'red';
      ctx.fillRect(leftCharX, leftCharY, leftCharW, charHeight);
      ctx.fillStyle = 'darkred';
      ctx.fillRect(leftCharX + 2, leftCharY + 2, Math.max(8, Math.floor(leftCharW * 0.6)), Math.max(8, Math.floor(charHeight * 0.25)));
    }

    // Draw right character (Chu Wanning)
    if (char1Img && char1Img.complete && !assetsFailed) {
      ctx.drawImage(char1Img, rightCharX, rightCharY, rightCharW, charHeight);
    } else {
      // Fallback blue rectangle for right character (use computed size)
      ctx.fillStyle = 'blue';
      ctx.fillRect(rightCharX, rightCharY, rightCharW, charHeight);
      ctx.fillStyle = 'darkblue';
      ctx.fillRect(rightCharX + 2, rightCharY + 2, Math.max(8, Math.floor(rightCharW * 0.6)), Math.max(8, Math.floor(charHeight * 0.25)));
    }
  } // end SHOW_CHARACTERS

  // Draw goal flag on last step
  if (stepPos >= numSteps - 20) { // Show flag when near end
    const goalXY = getStepXY(numSteps - 1);
    const flagScreenX = goalXY.x - camX;
    const flagScreenY = goalXY.y - camY - Math.max(40, Math.floor(stepH));

    if (flagScreenX > -50 && flagScreenX < viewW + 50) {
      if (flagImg && flagImg.complete && !assetsFailed) {
        // Draw flag image
        const flagW = stepW * 1.2;
        const flagH = (flagImg.height / flagImg.width) * flagW;
        ctx.drawImage(flagImg, flagScreenX + stepW/2 - flagW/2, flagScreenY, flagW, flagH);
      } else {
        // Fallback flag
        // Flag pole
        ctx.strokeStyle = 'brown';
        ctx.lineWidth = Math.max(3, Math.floor(stepW/30));
        ctx.beginPath();
        ctx.moveTo(flagScreenX + stepW/2, flagScreenY);
        ctx.lineTo(flagScreenX + stepW/2, flagScreenY + Math.max(40, Math.floor(stepH*1.2)));
        ctx.stroke();

        // Flag
        ctx.fillStyle = 'yellow';
        ctx.fillRect(flagScreenX + stepW/2, flagScreenY, Math.max(24, Math.floor(stepW/3)), Math.max(16, Math.floor(stepH/3)));
        ctx.fillStyle = 'red';
        ctx.font = Math.max(10, Math.floor(stepH/5)) + 'px sans-serif';
        ctx.fillText('END', flagScreenX + stepW/2 + 5, flagScreenY + Math.max(10, Math.floor(stepH/6)));
      }
    }
  }

  // Game completed message
  if (stepPos === numSteps - 1) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, viewW, viewH);

    ctx.fillStyle = 'white';
    ctx.font = 'bold ' + Math.max(18, Math.floor(viewH/20)) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JOURNEY COMPLETE!', viewW/2, viewH/2 - Math.max(40, Math.floor(viewH/12)));

    ctx.font = Math.max(14, Math.floor(viewH/32)) + 'px sans-serif';
    ctx.fillText(`Chu Wanning carries Mo Ran ${numSteps} steps`, viewW/2, viewH/2 - Math.max(12, Math.floor(viewH/40)));
    ctx.fillText('A significant moment in their story', viewW/2, viewH/2 + Math.max(8, Math.floor(viewH/60)));

    ctx.fillStyle = 'yellow';
    ctx.font = Math.max(12, Math.floor(viewH/40)) + 'px sans-serif';
    ctx.fillText('Press R to reset', viewW/2, viewH/2 + Math.max(30, Math.floor(viewH/24)));
  }

  console.log('Draw complete');
}

function resetGame() {
  stepPos = 0;
  gameOver = false;
  draw();
}

function climbStep() {
  if (!gameOver && stepPos < numSteps - 1) {
    stepPos++;
    draw();
    console.log('Climbed to step:', stepPos + 1);
  }
}


// Event handlers
document.getElementById('btnReset').addEventListener('click', resetGame);

// Touch and mouse controls for single click or continuous hold
let stepInterval = null;
let holdTimer = null;
let isHolding = false;

function startHoldDetection() {
  if (holdTimer) return; // Prevent multiple timers
  holdTimer = setTimeout(() => {
    isHolding = true;
    startContinuousStep();
  }, 300); // 300ms to detect hold
}

function stopHoldDetection() {
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
  if (!isHolding) {
    // If not holding, it was a single click/tap
    climbStep();
  }
  isHolding = false;
  stopContinuousStep();
}

function startContinuousStep() {
  if (stepInterval) return; // Prevent multiple intervals
  stepInterval = setInterval(() => {
    climbStep();
  }, 200); // Climb every 200ms while holding
}

function stopContinuousStep() {
  if (stepInterval) {
    clearInterval(stepInterval);
    stepInterval = null;
  }
}

// Touch events
canvas.addEventListener('touchstart', function(e) {
  e.preventDefault();
  startHoldDetection();
}, { passive: false });

canvas.addEventListener('touchend', function(e) {
  e.preventDefault();
  stopHoldDetection();
}, { passive: false });

// Mouse events
canvas.addEventListener('mousedown', function(e) {
  e.preventDefault();
  startHoldDetection();
});

canvas.addEventListener('mouseup', function(e) {
  e.preventDefault();
  stopHoldDetection();
});

canvas.addEventListener('mouseleave', function(e) {
  // Stop if mouse leaves canvas while holding
  stopHoldDetection();
});

// Keyboard controls (keep for desktop)
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'u') {
    climbStep();
  } else if (key === 'r') {
    resetGame();
  }
});

// Initialize game and responsive canvas
resizeCanvas();
console.log('Game ready!');