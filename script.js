(async () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // load config
  const cfg = await fetch('config.json').then(r => r.json());
  const numSteps = cfg.numSteps || 3799;

  // settings
  const offsetX = 10;
  const margin = 60;
  const stepW = 90, stepH = 50;
  const viewW = canvas.width, viewH = canvas.height;
  const worldWidth = margin * 2 + stepW * numSteps;
  const worldHeight = margin * 2 + stepH * numSteps;

  // load and resize images (like Python load_and_resize function)
  const loadAndResize = (src, height, width = null) =>
    new Promise(res => {
      const img = new Image();
      img.onload = () => {
        // Calculate dimensions
        let targetWidth, targetHeight;
        if (width === null) {
          const scale = height / img.height;
          targetWidth = Math.round(img.width * scale);
          targetHeight = height;
        } else {
          targetWidth = width;
          targetHeight = height;
        }
        
        // Create resized canvas
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        res(canvas);
      };
      img.onerror = () => {
        // Create red circle placeholder (like Python)
        const canvas = document.createElement('canvas');
        canvas.width = height;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(255, 0, 0, 255)';
        ctx.beginPath();
        ctx.arc(height/2, height/2, height/2 - 2, 0, 2*Math.PI);
        ctx.fill();
        res(canvas);
      };
      img.src = src;
    });

  // Simple image loader for background
  const loadImg = src =>
    new Promise(res => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => {
        // Create a simple placeholder
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'green';
        ctx.fillRect(0, 0, 100, 100);
        res(canvas);
      };
      img.src = src;
    });

  const bgImg = await loadImg('assets/resources/images/bg.png');
  
  // Helper to overlay images with proper transparency handling (similar to Python overlay function)
  function overlay(ctx, fg, x, y) {
    if (fg.tagName === 'CANVAS' || fg.tagName === 'IMG') {
      ctx.drawImage(fg, x, y);
    }
  }

  // Load and resize character images using the Python-like function
  const char1Img = await loadAndResize('assets/resources/images/wanning.png', stepH);
  const char2Img = await loadAndResize('assets/resources/images/moran.png', stepH);
  const flagImgOrig = await loadImg('assets/resources/images/flag.png');

  let stepPos = 0;
  let gameOver = false;

  function getStepXY(i) {
    const x = margin + i * stepW;
    const y = margin + (numSteps - i - 1) * stepH;
    return { x, y };
  }

  function draw() {
    // Character world position (similar to Python)
    const { x, y } = getStepXY(stepPos);
    const char2X = x + 10;
    const char2Y = y + stepH/2 - char2Img.height/2;
    const char1X = char2X + offsetX;
    const char1Y = char2Y;

    // Camera: always follows char1, keeping her centered (like Python camera logic)
    const camCx = char1X + char1Img.width/2;
    const camCy = char1Y + char1Img.height/2;
    const halfWinW = viewW / 2;
    const halfWinH = viewH / 2;
    let roiX1 = camCx - halfWinW;
    let roiY1 = camCy - halfWinH;
    
    // Clamp camera to world bounds
    roiX1 = Math.max(0, Math.min(worldWidth - viewW, roiX1));
    roiY1 = Math.max(0, Math.min(worldHeight - viewH, roiY1));

    // Start with fresh background
    ctx.clearRect(0, 0, viewW, viewH);
    ctx.drawImage(bgImg, 0, 0, viewW, viewH);

    // Dynamically draw only visible stairs (like Python)
    const firstVisibleIdx = Math.max(0, Math.floor((roiX1 - margin) / stepW) - 2);
    const lastVisibleIdx = Math.min(numSteps-1, Math.floor((roiX1 + viewW - margin) / stepW) + 2);
    ctx.lineWidth = 7;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = '16px sans-serif';

    for (let i = firstVisibleIdx; i <= lastVisibleIdx; i++) {
      const { x, y } = getStepXY(i);
      const sx = x - roiX1;
      const sy = y - roiY1;
      
      // Draw step surface (polygon like Python)
      ctx.fillStyle = 'rgb(80,80,80)';
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + stepW, sy);
      ctx.lineTo(sx + stepW, sy + stepH);
      ctx.lineTo(sx, sy + stepH);
      ctx.closePath();
      ctx.fill();
      
      // Draw step edges (lines like Python)
      ctx.strokeStyle = 'rgb(60,60,60)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + stepW, sy);
      ctx.stroke();
      
      if (i < numSteps) {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx, sy + stepH);
        ctx.stroke();
      }
      
      // Step number
      ctx.fillStyle = 'rgb(30,30,30)';
      ctx.fillText(String(i + 1), sx + 10, sy + stepH/2);
      
      // Flag on last step (scaled like Python)
      if (i === numSteps - 1) {
        const desiredWidth = stepW * 1.2;
        const scale = desiredWidth / flagImgOrig.width;
        const desiredHeight = flagImgOrig.height * scale;
        const flagX = sx + (stepW - desiredWidth) / 2;
        const flagY = sy - desiredHeight;
        overlay(ctx, flagImgOrig, flagX, flagY);
      }
    }

    // Draw characters (relative to viewport like Python)
    const drawChar2X = char2X - roiX1;
    const drawChar2Y = char2Y - roiY1;
    const drawChar1X = char1X - roiX1;
    const drawChar1Y = char1Y - roiY1;
    overlay(ctx, char2Img, drawChar2X, drawChar2Y);
    overlay(ctx, char1Img, drawChar1X, drawChar1Y);

    // End state text with centered overlay (like Python draw_text_with_bg)
    if (stepPos === numSteps - 1) {
      const text = `Chu Wanning carries Mo Ran ${numSteps} steps, is a significant moment in the story, specifically when Mo Ran is injured and Chu Wanning carries him back to the sect after they worked together to mend the heavenly rift.`;
      const wrapWidth = 32;
      
      // Word wrapping (like Python textwrap.wrap)
      const words = text.split(' ');
      let lines = [];
      let line = '';
      for (let w of words) {
        if ((line + w).length > wrapWidth) {
          if (line) lines.push(line.trim());
          line = w + ' ';
        } else {
          line += w + ' ';
        }
      }
      if (line) lines.push(line.trim());
      
      const fontSize = 20;
      const scale = 1.05;
      ctx.font = `${fontSize}px sans-serif`;
      const lineHeight = fontSize * 1.2;
      const thickness = 2;
      const padX = 60;
      const padY = 40;
      
      // Calculate text box dimensions
      const maxLineW = Math.max(...lines.map(l => ctx.measureText(l).width));
      const boxW = maxLineW + 2 * padX;
      const boxH = lines.length * lineHeight + 2 * padY;
      const centerX = viewW / 2;
      const centerY = viewH / 2;
      const bx = centerX - boxW / 2;
      const by = centerY - boxH / 2;
      
      // Semi-transparent background (like Python overlay)
      ctx.fillStyle = 'rgba(24,24,24,0.5)';
      ctx.fillRect(bx, by, boxW, boxH);
      
      // White text
      ctx.fillStyle = 'rgb(255,255,255)';
      ctx.textAlign = 'left';
      lines.forEach((line, i) => {
        const textX = bx + padX;
        const textY = by + padY + (i + 1) * lineHeight - 10;
        ctx.fillText(line, textX, textY);
      });
    }
  }

  // Button handlers (like Python key handlers)
  document.getElementById('btnUp').addEventListener('click', () => {
    if (!gameOver && stepPos < numSteps - 1) {
      stepPos++;
      draw();
    }
  });
  
  document.getElementById('btnQuit').addEventListener('click', () => {
    gameOver = true;
    document.getElementById('btnUp').disabled = true;
  });

  // Keyboard controls (like Python key handling)
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'u' && !gameOver && stepPos < numSteps - 1) {
      stepPos++;
      draw();
    } else if (key === 'q') {
      gameOver = true;
      document.getElementById('btnUp').disabled = true;
    }
  });

  // initial draw
  draw();
})();