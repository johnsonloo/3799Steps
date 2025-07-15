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

  // load images from assets/ folder
  const loadImg = src =>
    new Promise(res => {
      const img = new Image();
      img.onload = () => res(img);
      img.src = src;
    });
  const bgImg = await loadImg('assests/resources/images/bg.png');
  const char1Img = await loadImg('assests/resources/images/wanning.png');
  const char2Img = await loadImg('assests/resources/images//moran.png');
  const flagImgOrig = await loadImg('assests/resources/images//flag.png');

  let stepPos = 0;
  let gameOver = false;

  function getStepXY(i) {
    const x = margin + i * stepW;
    const y = margin + (numSteps - i - 1) * stepH;
    return { x, y };
  }

  function draw() {
    // compute camera offset so char1 is centered
    const { x: cx, y: cy } = getStepXY(stepPos);
    const camX = cx + offsetX + char1Img.width/2 - viewW/2;
    const camY = cy + stepH/2 - viewH/2;

    // draw background
    ctx.clearRect(0,0,viewW,viewH);
    ctx.drawImage(bgImg, 0, 0, viewW, viewH);

    // draw stairs
    const first = Math.max(0, Math.floor((camX - margin) / stepW) - 2);
    const last  = Math.min(numSteps-1,
      Math.ceil((camX + viewW - margin) / stepW) + 2
    );
    ctx.lineWidth = 7;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = '16px sans-serif';

    for (let i = first; i <= last; i++) {
      const { x, y } = getStepXY(i);
      const sx = x - camX;
      const sy = y - camY;
      // surface
      ctx.fillStyle = 'rgb(80,80,80)';
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + stepW, sy);
      ctx.lineTo(sx + stepW, sy + stepH);
      ctx.lineTo(sx, sy + stepH);
      ctx.closePath();
      ctx.fill();
      // edges
      ctx.strokeStyle = 'rgb(60,60,60)';
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
      // number
      ctx.fillStyle = 'rgb(30,30,30)';
      ctx.fillText(String(i+1), sx + 10, sy + stepH/2);
      // last step: draw flag image
      if (i === numSteps - 1) {
        const desiredW = stepW * 1.2;
        const scale = desiredW / flagImgOrig.width;
        const desiredH = flagImgOrig.height * scale;
        const fx = sx + (stepW - desiredW)/2;
        const fy = sy - desiredH;
        ctx.drawImage(flagImgOrig, fx, fy, desiredW, desiredH);
      }
    }

    // draw characters
    const c2 = getStepXY(stepPos);
    const c2x = c2.x + 10 - camX;
    const c2y = c2.y + stepH/2 - char2Img.height/2 - camY;
    const c1x = c2x + offsetX;
    const c1y = c2y;
    ctx.drawImage(char2Img, c2x, c2y);
    ctx.drawImage(char1Img, c1x, c1y);

    // end state text
    if (stepPos === numSteps - 1) {
      const text = `Chu Wanning carries Mo Ran ${numSteps} steps, is a significant moment in the story, specifically when Mo Ran is injured and Chu Wanning carries him back to the sect after they worked together to mend the heavenly rift.`;
      const wrapWidth = 32;
      const lines = text.match(new RegExp(`.{1,${wrapWidth}}(\\s|$)`, 'g'));
      const fontSize = 20;
      ctx.font = `${fontSize}px sans-serif`;
      const lineHeight = fontSize * 1.2;
      const maxLineW = Math.max(...lines.map(l => ctx.measureText(l).width));
      const boxW = maxLineW + 80;
      const boxH = lines.length * lineHeight + 60;
      const bx = (viewW - boxW) / 2;
      const by = (viewH - boxH) / 2;
      // semi-transparent bg
      ctx.fillStyle = 'rgba(24,24,24,0.5)';
      ctx.fillRect(bx, by, boxW, boxH);
      // text
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      lines.forEach((line, i) => {
        ctx.fillText(line, bx + 40, by + 40 + i * lineHeight);
      });
    }
  }

  // button handlers
  document.getElementById('btnUp').addEventListener('click', () => {
    if (stepPos < numSteps - 1) {
      stepPos++;
      draw();
    }
  });
  document.getElementById('btnQuit').addEventListener('click', () => {
    gameOver = true;
    document.getElementById('btnUp').disabled = true;
  });

  // initial draw
  draw();
})();