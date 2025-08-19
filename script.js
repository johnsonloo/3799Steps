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
  // Target mobile-friendly size
  let w = Math.min(window.innerWidth, 480);
  let h = Math.min(window.innerHeight, 800);
  // Landscape fallback
  if (w > h) {
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
  const x = margin + i * stepW;
  const y = margin + (numSteps - i - 1) * stepH;
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

  // Draw visible steps
  const startStep = Math.max(0, stepPos - 10);
  const endStep = Math.min(numSteps - 1, stepPos + 10);

  for (let i = startStep; i <= endStep; i++) {
    const stepXY = getStepXY(i);
    const screenX = stepXY.x - camX;
    const screenY = stepXY.y - camY;

    // Only draw if visible
    if (screenX > -stepW && screenX < viewW + stepW &&
        screenY > -stepH && screenY < viewH + stepH) {

      // Draw step
      ctx.fillStyle = i === stepPos ? '#606060' : '#404040';
      ctx.fillRect(screenX, screenY, stepW, stepH);

      // Step border
      ctx.strokeStyle = '#808080';
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX, screenY, stepW, stepH);

      // Step number
      ctx.fillStyle = 'white';
      ctx.font = Math.max(12, Math.floor(stepH/3)) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), screenX + stepW/2, screenY + stepH/2 + 5);

      // Highlight current step
      if (i === stepPos) {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX - 2, screenY - 2, stepW + 4, stepH + 4);
      }
    }
  }

  // Draw characters on current step
  const charScreenX = charX - camX;
  const charScreenY = charY - camY;

  // Character 1 (Mo Ran) - red or image
  if (char2Img && char2Img.complete && !assetsFailed) {
    const scale = stepH / char2Img.height;
    const charW = char2Img.width * scale;
    const charH = stepH;
    ctx.drawImage(char2Img, charScreenX, charScreenY, charW, charH);
  } else {
    // Fallback red rectangle
    ctx.fillStyle = 'red';
    ctx.fillRect(charScreenX, charScreenY, Math.max(16, Math.floor(stepW/4)), Math.max(32, Math.floor(stepH*0.8)));
    ctx.fillStyle = 'darkred';
    ctx.fillRect(charScreenX + 2, charScreenY + 2, Math.max(12, Math.floor(stepW/5)), Math.max(12, Math.floor(stepH/4))); // head
  }

  // Character 2 (Chu Wanning) - blue or image
  if (char1Img && char1Img.complete && !assetsFailed) {
    const scale = stepH / char1Img.height;
    const charW = char1Img.width * scale;
    const charH = stepH;
    ctx.drawImage(char1Img, charScreenX + Math.max(24, Math.floor(stepW/3)), charScreenY, charW, charH);
  } else {
    // Fallback blue rectangle
    ctx.fillStyle = 'blue';
    ctx.fillRect(charScreenX + Math.max(20, Math.floor(stepW/3)), charScreenY, Math.max(16, Math.floor(stepW/4)), Math.max(32, Math.floor(stepH*0.8)));
    ctx.fillStyle = 'darkblue';
    ctx.fillRect(charScreenX + Math.max(22, Math.floor(stepW/3)+2), charScreenY + 2, Math.max(12, Math.floor(stepW/5)), Math.max(12, Math.floor(stepH/4))); // head
  }

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
  document.getElementById('btnUp').disabled = false;
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
document.getElementById('btnUp').addEventListener('click', climbStep);
document.getElementById('btnReset').addEventListener('click', resetGame);

// Keyboard controls
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'u') {
    climbStep();
  } else if (key === 'r') {
    resetGame();
  }
});

// Touch controls for mobile
let touchStartTime = 0;
let touchTimer = null;

canvas.addEventListener('touchstart', function(e) {
  e.preventDefault();
  touchStartTime = Date.now();
  // Start timer for long press
  touchTimer = setTimeout(() => {
    resetGame();
    touchTimer = null;
  }, 5000); // 5 seconds hold to reset
}, { passive: false });

canvas.addEventListener('touchend', function(e) {
  e.preventDefault();
  const touchDuration = Date.now() - touchStartTime;
  if (touchTimer) {
    clearTimeout(touchTimer);
    touchTimer = null;
    // If touch was short, treat as step up
    if (touchDuration < 5000) {
      climbStep();
    }
  }
});

// Initialize game and responsive canvas
resizeCanvas();
console.log('Game ready!');