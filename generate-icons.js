const { createCanvas } = require('canvas');
const fs = require('fs');

// Helper function to draw neon ball
function drawNeonBall(ctx, x, y, radius, color1, color2) {
    // Glow
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
    glowGradient.addColorStop(0, color1 + '99');
    glowGradient.addColorStop(0.5, color1 + '33');
    glowGradient.addColorStop(1, color1 + '00');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball
    const ballGradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
    ballGradient.addColorStop(0, color1);
    ballGradient.addColorStop(1, color2);
    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
}

// Helper function to draw grid
function drawGrid(ctx, w, h) {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
    for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
}

// Generate icon.png (200x200)
const iconCanvas = createCanvas(200, 200);
const iconCtx = iconCanvas.getContext('2d');

// Background
iconCtx.fillStyle = '#0a0a12';
iconCtx.fillRect(0, 0, 200, 200);

// Grid
drawGrid(iconCtx, 200, 200);

// Side borders
const gradient = iconCtx.createLinearGradient(0, 0, 0, 200);
gradient.addColorStop(0, '#00ffff');
gradient.addColorStop(1, '#bf00ff');
iconCtx.strokeStyle = gradient;
iconCtx.lineWidth = 4;
iconCtx.beginPath();
iconCtx.moveTo(2, 0);
iconCtx.lineTo(2, 200);
iconCtx.stroke();
iconCtx.beginPath();
iconCtx.moveTo(198, 0);
iconCtx.lineTo(198, 200);
iconCtx.stroke();

// Main ball
drawNeonBall(iconCtx, 100, 110, 35, '#00ffff', '#0066ff');

// Smaller balls
drawNeonBall(iconCtx, 60, 140, 15, '#00ffff', '#0066ff');
drawNeonBall(iconCtx, 140, 140, 15, '#00ffff', '#0066ff');

// Title
iconCtx.fillStyle = '#00ffff';
iconCtx.font = 'bold 24px Courier New';
iconCtx.textAlign = 'center';
iconCtx.shadowColor = '#00ffff';
iconCtx.shadowBlur = 10;
iconCtx.fillText('BALL', 100, 45);
iconCtx.fillText('RUN', 100, 70);
iconCtx.shadowBlur = 0;

// Save icon.png
const iconBuffer = iconCanvas.toBuffer('image/png');
fs.writeFileSync('icon.png', iconBuffer);
console.log('✓ icon.png created');

// Generate preview.png (600x400)
const previewCanvas = createCanvas(600, 400);
const previewCtx = previewCanvas.getContext('2d');

// Background
previewCtx.fillStyle = '#0a0a12';
previewCtx.fillRect(0, 0, 600, 400);

// Grid
previewCtx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
previewCtx.lineWidth = 1;
for (let y = 0; y < 400; y += 30) {
    previewCtx.beginPath();
    previewCtx.moveTo(0, y);
    previewCtx.lineTo(600, y);
    previewCtx.stroke();
}
for (let x = 0; x < 600; x += 30) {
    previewCtx.beginPath();
    previewCtx.moveTo(x, 0);
    previewCtx.lineTo(x, 400);
    previewCtx.stroke();
}

// Side borders
const previewGradient = previewCtx.createLinearGradient(0, 0, 0, 400);
previewGradient.addColorStop(0, '#00ffff');
previewGradient.addColorStop(1, '#bf00ff');
previewCtx.strokeStyle = previewGradient;
previewCtx.lineWidth = 4;
previewCtx.beginPath();
previewCtx.moveTo(2, 0);
previewCtx.lineTo(2, 400);
previewCtx.stroke();
previewCtx.beginPath();
previewCtx.moveTo(598, 0);
previewCtx.lineTo(598, 400);
previewCtx.stroke();

// Gates
// Left gate
previewCtx.fillStyle = 'rgba(10, 10, 20, 0.8)';
previewCtx.fillRect(20, 80, 270, 70);
previewCtx.strokeStyle = '#00ff88';
previewCtx.lineWidth = 3;
previewCtx.strokeRect(20, 80, 270, 70);
previewCtx.fillStyle = '#00ff88';
previewCtx.font = 'bold 32px Courier New';
previewCtx.textAlign = 'center';
previewCtx.shadowColor = '#00ff88';
previewCtx.shadowBlur = 15;
previewCtx.fillText('+5', 155, 125);

// Right gate
previewCtx.fillStyle = 'rgba(10, 10, 20, 0.8)';
previewCtx.fillRect(310, 80, 270, 70);
previewCtx.strokeStyle = '#00ffff';
previewCtx.lineWidth = 3;
previewCtx.strokeRect(310, 80, 270, 70);
previewCtx.fillStyle = '#00ffff';
previewCtx.shadowColor = '#00ffff';
previewCtx.fillText('x2', 445, 125);
previewCtx.shadowBlur = 0;

// Divider
previewCtx.fillStyle = '#bf00ff';
previewCtx.shadowColor = '#bf00ff';
previewCtx.shadowBlur = 15;
previewCtx.fillRect(298, 80, 4, 70);
previewCtx.shadowBlur = 0;

// Player balls
drawNeonBall(previewCtx, 300, 300, 25, '#00ffff', '#0066ff');
drawNeonBall(previewCtx, 255, 320, 18, '#00ffff', '#0066ff');
drawNeonBall(previewCtx, 345, 320, 18, '#00ffff', '#0066ff');
drawNeonBall(previewCtx, 230, 345, 14, '#00ffff', '#0066ff');
drawNeonBall(previewCtx, 280, 345, 14, '#00ffff', '#0066ff');
drawNeonBall(previewCtx, 320, 345, 14, '#00ffff', '#0066ff');
drawNeonBall(previewCtx, 370, 345, 14, '#00ffff', '#0066ff');

// Title
previewCtx.fillStyle = '#00ffff';
previewCtx.font = 'bold 36px Courier New';
previewCtx.textAlign = 'center';
previewCtx.shadowColor = '#00ffff';
previewCtx.shadowBlur = 20;
previewCtx.fillText('BALL RUN', 300, 40);
previewCtx.shadowBlur = 0;

// Subtitle
previewCtx.fillStyle = '#bf00ff';
previewCtx.font = '16px Courier New';
previewCtx.shadowColor = '#bf00ff';
previewCtx.shadowBlur = 10;
previewCtx.fillText('Swipe to choose gates • Survive the boss!', 300, 385);
previewCtx.shadowBlur = 0;

// Save preview.png
const previewBuffer = previewCanvas.toBuffer('image/png');
fs.writeFileSync('preview.png', previewBuffer);
console.log('✓ preview.png created');
console.log('\nAll icons generated successfully!');

