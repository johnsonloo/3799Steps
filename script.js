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

// Blood drip effect configuration
const ENABLE_BLOOD = true;
const BLOOD_PER_STEP = 4; // droplets spawned per step
const BLOOD_GRAVITY = 0.35;
const BLOOD_MAX = 200; // cap total active droplets
const BLOOD_FADE = 0.02;
const BLOOD_SPLAT_LIFE = 18;

// Particle arrays (world-space coordinates)
const bloodDrops = []; // { wx, wy, vx, vy, alpha, r }
const bloodSplats = []; // { wx, wy, life, alpha, size }
// Vertical dripping streaks that run down the step faces after a splat (world-space)
const bloodDrips = []; // { x: wx, y: wy, vy, length, maxLength, alpha, width }
// Stored per-step deterministic blood patterns (normalized coords)
const stepBlood = new Map(); // stepIndex -> { splats: [{ox, oy, size, pieces:[{rx,ry,rW,rH,angle}] }], drips: [{ox, oy, maxLength, width}] }
// Global seed for deterministic generation (change for variety)
const BLOOD_GLOBAL_SEED = 0;

// small seeded PRNG (mulberry32)
function mulberry32(a) {
  return function() {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

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

  // (current-step highlight removed)
      // Draw stored blood for this step (if any)
      if (stepBlood.has(i)) {
        const record = stepBlood.get(i);
        // draw splats
        for (let si = 0; si < record.splats.length; si++) {
          const s = record.splats[si];
          const wx = stepXY.x + (s.ox * stepW);
          const wy = stepXY.y + (s.oy * stepH);
          const sx = wx - camX;
          const sy = wy - camY;
          ctx.fillStyle = `rgba(120,0,0,${s.alpha !== undefined ? s.alpha : 1})`;
          const pieces = s.pieces || (3 + Math.floor(s.size / 8));
          for (let k = 0; k < pieces; k++) {
            // use stored piece offsets if present, otherwise random-ish
            const rx = s.pieces && s.pieces[k] ? s.pieces[k].rx : ( (Math.random() - 0.5) * s.size * 0.8 );
            const ry = s.pieces && s.pieces[k] ? s.pieces[k].ry : ( (Math.random() - 0.5) * s.size * 0.4 );
            const rW = s.pieces && s.pieces[k] ? s.pieces[k].rW : (s.size * (0.5 + Math.random() * 0.6));
            const rH = s.pieces && s.pieces[k] ? s.pieces[k].rH : (rW * (0.35 + Math.random() * 0.5));
            const angle = s.pieces && s.pieces[k] ? s.pieces[k].angle : (Math.random() * Math.PI);
            ctx.beginPath();
            ctx.ellipse(sx + rx, sy + ry, rW, rH, angle, 0, Math.PI * 2);
            ctx.fill();
          }
          // small center
          ctx.beginPath();
          ctx.fillStyle = `rgba(90,0,0,${s.alpha !== undefined ? Math.max(0.5, s.alpha) : 1})`;
          ctx.ellipse(sx, sy, Math.max(2, s.size * 0.25), Math.max(1, s.size * 0.12), 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // draw stored drips
        for (let di = 0; di < record.drips.length; di++) {
          const d = record.drips[di];
          const wx = stepXY.x + (d.ox * stepW);
          const wy = stepXY.y + (d.oy * stepH);
          const sx = wx - camX;
          const sy = wy - camY;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(110,10,10,${d.alpha !== undefined ? d.alpha : 1})`;
          ctx.lineWidth = Math.max(1, d.width);
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx, sy + d.length);
          ctx.stroke();
          ctx.beginPath();
          ctx.fillStyle = `rgba(150,0,0,${d.alpha !== undefined ? d.alpha : 1})`;
          ctx.ellipse(sx, sy + d.length + 1, Math.max(1.2, d.width * 0.9), Math.max(1, d.width * 0.5), 0, 0, Math.PI * 2);
          ctx.fill();
        }
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

  // Always update & draw blood particles last so they render on top of steps/characters
  updateBloodParticles(camX, camY);

  console.log('Draw complete');
}

function resetGame() {
  stepPos = 0;
  gameOver = false;
  // clear existing particles and optionally seed the first step so blood is visible from start
  bloodDrops.length = 0;
  bloodSplats.length = 0;
  bloodDrips.length = 0;
  draw();
  if (ENABLE_BLOOD && BLOOD_PER_STEP > 0) spawnBloodAtStep(0);
}

function climbStep() {
  if (!gameOver && stepPos < numSteps - 1) {
    stepPos++;
  // spawn blood at this step (before drawing so it appears immediately)
  spawnBloodAtStep(stepPos);
  draw();
  console.log('Climbed to step:', stepPos + 1);
  }
}

// Spawn blood droplets at top of current step
function spawnBloodAtStep(stepIndex) {
  if (!ENABLE_BLOOD) return;
  const step = getStepXY(stepIndex);
  // Create or reuse a deterministic stored pattern for this step (normalized coords)
  if (!stepBlood.has(stepIndex)) {
    const seed = BLOOD_GLOBAL_SEED + stepIndex;
    const rand = mulberry32(seed);
    const splatCount = 1 + Math.floor(rand() * 2);
    const rec = { splats: [], drips: [] };
    const baseSize = Math.max(6, Math.floor(stepW / 12));
    for (let si = 0; si < splatCount; si++) {
      const ox = 0.2 + rand() * 0.6; // normalized across step width
      const oy = - (rand() * 0.12); // slightly above front top into top-face area
      const size = baseSize * (0.8 + rand() * 1.2);
      const pieces = 3 + Math.floor(size / 8);
      const pieceArr = [];
      for (let k = 0; k < pieces; k++) {
        pieceArr.push({
          rx: (rand() - 0.5) * size * 0.8,
          ry: (rand() - 0.5) * size * 0.4,
          rW: size * (0.5 + rand() * 0.6),
          rH: size * (0.35 + rand() * 0.5),
          angle: rand() * Math.PI
        });
      }
      rec.splats.push({ ox, oy, size, pieces, alpha: 1, piecesData: pieceArr });

      // generate drips for this splat
      const dripCount = Math.floor(rand() * 3);
      for (let di = 0; di < dripCount; di++) {
        const dox = ox + (rand() - 0.5) * 0.12;
        const doy = oy + 0.02 + rand() * 0.06;
        rec.drips.push({ ox: dox, oy: doy, maxLength: 20 + Math.floor(rand() * 60), width: 1 + rand() * 2, alpha: 1, length: 10 + rand() * 30 });
      }
    }
    stepBlood.set(stepIndex, rec);
  }

  // Still spawn transient animated drops in world-space for the current step so we see falling motion
  const depth = Math.max(8, Math.floor(stepW / 8));
  const baseWX = step.x + Math.floor(stepW * 0.5);
  const baseWY = step.y - depth; // top surface world Y
  for (let i = 0; i < BLOOD_PER_STEP; i++) {
    if (bloodDrops.length >= BLOOD_MAX) break;
    const vx = (Math.random() - 0.5) * 0.6;
    const vy = Math.random() * -0.8;
    const wx = baseWX + (Math.random() - 0.5) * stepW * 0.6;
    const wy = baseWY + (Math.random() - 0.5) * 4;
    bloodDrops.push({ wx, wy, vx, vy, alpha: 1, r: Math.max(2, Math.random() * 3) });
  }
}

function updateBloodParticles(camX, camY) {
  // update drops (world-space -> move in world coords)
  for (let i = bloodDrops.length - 1; i >= 0; i--) {
    const p = bloodDrops[i];
    p.vy += BLOOD_GRAVITY;
    p.wx += p.vx;
    p.wy += p.vy;
    p.alpha -= BLOOD_FADE * 0.5;

    // collision with steps: find nearest step front world Y under particle
    for (let s = 0; s < 6; s++) {
      const si = Math.max(0, stepPos - 3 + s);
      const stepXY = getStepXY(si);
      const depth = Math.max(8, Math.floor(stepW / 8));
      const topWY = stepXY.y - depth;
      const frontWY = stepXY.y + stepH;

      // if particle is between topWY and frontWY and within step world X range, create splat
      if (p.wx > stepXY.x - 4 && p.wx < stepXY.x + stepW + 4 && p.wy >= topWY && p.wy <= frontWY + 6 && p.vy > 0) {
        const splatWX = p.wx;
        const splatWY = Math.min(frontWY, p.wy);
        const baseSize = Math.max(6, p.r * 2 + Math.random() * 8);
        bloodSplats.push({ wx: splatWX, wy: splatWY, life: BLOOD_SPLAT_LIFE, alpha: 1, size: baseSize, seed: Math.random() });

        const dripCount = 1 + Math.floor(Math.random() * 3);
        for (let d = 0; d < dripCount; d++) {
          const dx = splatWX + (Math.random() - 0.5) * baseSize * 0.8;
          bloodDrips.push({ wx: dx, wy: splatWY + 2, vy: 0.6 + Math.random() * 1.2, length: 0, maxLength: 20 + Math.random() * 60, alpha: 1, width: 1 + Math.random() * 2 });
        }

        bloodDrops.splice(i, 1);
        break;
      }
    }

    if (p.alpha <= 0) bloodDrops.splice(i, 1);
  }

  // update splats
  for (let i = bloodSplats.length - 1; i >= 0; i--) {
    const s = bloodSplats[i];
    s.life--;
    s.alpha = Math.max(0, s.life / BLOOD_SPLAT_LIFE);
    if (s.life <= 0) bloodSplats.splice(i, 1);
  }

  // update drips: grow length, fall, and fade (world-space)
  for (let i = bloodDrips.length - 1; i >= 0; i--) {
    const d = bloodDrips[i];
    d.vy += 0.12;
    d.length += d.vy;
    d.wy += d.vy;
    d.alpha -= 0.005;
    if (d.length >= d.maxLength || d.alpha <= 0) bloodDrips.splice(i, 1);
  }

  // draw drops (convert world->screen)
  for (let i = 0; i < bloodDrops.length; i++) {
    const p = bloodDrops[i];
    const sx = p.wx - camX;
    const sy = p.wy - camY;
    ctx.beginPath();
    ctx.fillStyle = `rgba(150,0,0,${Math.max(0, p.alpha)})`;
    ctx.arc(sx, sy, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // draw splats
  for (let i = 0; i < bloodSplats.length; i++) {
    const s = bloodSplats[i];
    const sx = s.wx - camX;
    const sy = s.wy - camY;
    ctx.fillStyle = `rgba(120,0,0,${s.alpha})`;
    const pieces = 3 + Math.floor(s.size / 8);
    for (let k = 0; k < pieces; k++) {
      const rx = (Math.random() - 0.5) * s.size * 0.8;
      const ry = (Math.random() - 0.5) * s.size * 0.4;
      const rW = s.size * (0.5 + Math.random() * 0.6);
      const rH = rW * (0.35 + Math.random() * 0.5);
      ctx.beginPath();
      ctx.ellipse(sx + rx, sy + ry, rW, rH, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.fillStyle = `rgba(90,0,0,${Math.max(0.5, s.alpha)})`;
    ctx.ellipse(sx, sy, Math.max(2, s.size * 0.25), Math.max(1, s.size * 0.12), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // draw drips (world->screen)
  for (let i = 0; i < bloodDrips.length; i++) {
    const d = bloodDrips[i];
    const sx = d.wx - camX;
    const sy = d.wy - camY;
    ctx.beginPath();
    ctx.strokeStyle = `rgba(110,10,10,${Math.max(0, d.alpha)})`;
    ctx.lineWidth = Math.max(1, d.width);
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx, sy + d.length);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = `rgba(150,0,0,${Math.max(0, d.alpha)})`;
    ctx.ellipse(sx, sy + d.length + 1, Math.max(1.2, d.width * 0.9), Math.max(1, d.width * 0.5), 0, 0, Math.PI * 2);
    ctx.fill();
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
// Seed initial blood at step 0 so the effect is visible immediately (if enabled)
if (ENABLE_BLOOD && BLOOD_PER_STEP > 0) spawnBloodAtStep(0);
console.log('Game ready!');