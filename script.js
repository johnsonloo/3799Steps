// Simple working version of the 3799 Steps game
console.log('Game script loading...');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

if (!canvas || !ctx) {
  console.error('Canvas or context not found!');
  throw new Error('Canvas setup failed');
}

console.log('Canvas loaded:', canvas.width, canvas.height);

// Game settings
const numSteps = 3799;
const stepW = 90;
const stepH = 50;
const margin = 60;
const offsetX = 10;
const viewW = canvas.width;
const viewH = canvas.height;

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
      ctx.font = '14px sans-serif';
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
    ctx.fillRect(charScreenX, charScreenY, 20, 40);
    ctx.fillStyle = 'darkred';
    ctx.fillRect(charScreenX + 2, charScreenY + 2, 16, 15); // head
  }

  // Character 2 (Chu Wanning) - blue or image
  if (char1Img && char1Img.complete && !assetsFailed) {
    const scale = stepH / char1Img.height;
    const charW = char1Img.width * scale;
    const charH = stepH;
    ctx.drawImage(char1Img, charScreenX + 30, charScreenY, charW, charH);
  } else {
    // Fallback blue rectangle
    ctx.fillStyle = 'blue';
    ctx.fillRect(charScreenX + 25, charScreenY, 20, 40);
    ctx.fillStyle = 'darkblue';
    ctx.fillRect(charScreenX + 27, charScreenY + 2, 16, 15); // head
  }

  // Draw goal flag on last step
  if (stepPos >= numSteps - 20) { // Show flag when near end
    const goalXY = getStepXY(numSteps - 1);
    const flagScreenX = goalXY.x - camX;
    const flagScreenY = goalXY.y - camY - 50;

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
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(flagScreenX + stepW/2, flagScreenY);
        ctx.lineTo(flagScreenX + stepW/2, flagScreenY + 60);
        ctx.stroke();

        // Flag
        ctx.fillStyle = 'yellow';
        ctx.fillRect(flagScreenX + stepW/2, flagScreenY, 30, 20);
        ctx.fillStyle = 'red';
        ctx.font = '12px sans-serif';
        ctx.fillText('END', flagScreenX + stepW/2 + 5, flagScreenY + 12);
      }
    }
  }

  // Game completed message
  if (stepPos === numSteps - 1) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, viewW, viewH);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JOURNEY COMPLETE!', viewW/2, viewH/2 - 60);

    ctx.font = '18px sans-serif';
    ctx.fillText(`Chu Wanning carries Mo Ran ${numSteps} steps`, viewW/2, viewH/2 - 20);
    ctx.fillText('A significant moment in their story', viewW/2, viewH/2 + 10);

    ctx.fillStyle = 'yellow';
    ctx.font = '16px sans-serif';
    ctx.fillText('Press R to reset', viewW/2, viewH/2 + 50);
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

// Initialize game
console.log('Starting initial draw...');
draw();
console.log('Game ready!');