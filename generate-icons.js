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

// Generate icon.png (1024x1024 for Base featured requirements)
const iconCanvas = createCanvas(1024, 1024);
const iconCtx = iconCanvas.getContext('2d');

// Background (no transparency for Base requirements)
iconCtx.fillStyle = '#0a0a12';
iconCtx.fillRect(0, 0, 1024, 1024);

// Grid
drawGrid(iconCtx, 1024, 1024);

// Side borders
const gradient = iconCtx.createLinearGradient(0, 0, 0, 1024);
gradient.addColorStop(0, '#00ffff');
gradient.addColorStop(1, '#bf00ff');
iconCtx.strokeStyle = gradient;
iconCtx.lineWidth = 20;
iconCtx.beginPath();
iconCtx.moveTo(10, 0);
iconCtx.lineTo(10, 1024);
iconCtx.stroke();
iconCtx.beginPath();
iconCtx.moveTo(1014, 0);
iconCtx.lineTo(1014, 1024);
iconCtx.stroke();

// Main ball (scaled up)
drawNeonBall(iconCtx, 512, 560, 180, '#00ffff', '#0066ff');

// Smaller balls (scaled up)
drawNeonBall(iconCtx, 310, 720, 75, '#00ffff', '#0066ff');
drawNeonBall(iconCtx, 714, 720, 75, '#00ffff', '#0066ff');

// Title (scaled up)
iconCtx.fillStyle = '#00ffff';
iconCtx.font = 'bold 120px Courier New';
iconCtx.textAlign = 'center';
iconCtx.shadowColor = '#00ffff';
iconCtx.shadowBlur = 50;
iconCtx.fillText('BALL', 512, 230);
iconCtx.fillText('RUN', 512, 360);
iconCtx.shadowBlur = 0;

// Save icon.png
const iconBuffer = iconCanvas.toBuffer('image/png');
fs.writeFileSync('icon.png', iconBuffer);
console.log('✓ icon.png created (1024x1024)');

// Generate preview.png (1200x800 for Base embed - 3:2 aspect ratio)
const previewCanvas = createCanvas(1200, 800);
const previewCtx = previewCanvas.getContext('2d');

// Background (no transparency)
previewCtx.fillStyle = '#0a0a12';
previewCtx.fillRect(0, 0, 1200, 800);

// Grid (scaled)
previewCtx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
previewCtx.lineWidth = 2;
for (let y = 0; y < 800; y += 50) {
    previewCtx.beginPath();
    previewCtx.moveTo(0, y);
    previewCtx.lineTo(1200, y);
    previewCtx.stroke();
}
for (let x = 0; x < 1200; x += 50) {
    previewCtx.beginPath();
    previewCtx.moveTo(x, 0);
    previewCtx.lineTo(x, 800);
    previewCtx.stroke();
}

// Side borders (scaled)
const previewGradient = previewCtx.createLinearGradient(0, 0, 0, 800);
previewGradient.addColorStop(0, '#00ffff');
previewGradient.addColorStop(1, '#bf00ff');
previewCtx.strokeStyle = previewGradient;
previewCtx.lineWidth = 8;
previewCtx.beginPath();
previewCtx.moveTo(4, 0);
previewCtx.lineTo(4, 800);
previewCtx.stroke();
previewCtx.beginPath();
previewCtx.moveTo(1196, 0);
previewCtx.lineTo(1196, 800);
previewCtx.stroke();

// Gates (scaled for 3:2 ratio)
// Left gate
previewCtx.fillStyle = 'rgba(10, 10, 20, 0.8)';
previewCtx.fillRect(40, 200, 540, 140);
previewCtx.strokeStyle = '#00ff88';
previewCtx.lineWidth = 6;
previewCtx.strokeRect(40, 200, 540, 140);
previewCtx.fillStyle = '#00ff88';
previewCtx.font = 'bold 64px Courier New';
previewCtx.textAlign = 'center';
previewCtx.shadowColor = '#00ff88';
previewCtx.shadowBlur = 30;
previewCtx.fillText('+5', 310, 300);
previewCtx.shadowBlur = 0;

// Right gate
previewCtx.fillStyle = 'rgba(10, 10, 20, 0.8)';
previewCtx.fillRect(620, 200, 540, 140);
previewCtx.strokeStyle = '#00ffff';
previewCtx.lineWidth = 6;
previewCtx.strokeRect(620, 200, 540, 140);
previewCtx.fillStyle = '#00ffff';
previewCtx.shadowColor = '#00ffff';
previewCtx.fillText('x2', 890, 300);
previewCtx.shadowBlur = 0;

// Divider
previewCtx.fillStyle = '#bf00ff';
previewCtx.shadowColor = '#bf00ff';
previewCtx.shadowBlur = 30;
previewCtx.fillRect(596, 200, 8, 140);
previewCtx.shadowBlur = 0;

// Player balls (scaled)
drawNeonBall(previewCtx, 600, 600, 50, '#00ffff', '#0066ff');
drawNeonBall(previewCtx, 510, 640, 36, '#00ffff', '#0066ff');
drawNeonBall(previewCtx, 690, 640, 36, '#00ffff', '#0066ff');
drawNeonBall(previewCtx, 460, 670, 28, '#00ffff', '#0066ff');
drawNeonBall(previewCtx, 560, 670, 28, '#00ffff', '#0066ff');
drawNeonBall(previewCtx, 640, 670, 28, '#00ffff', '#0066ff');
drawNeonBall(previewCtx, 740, 670, 28, '#00ffff', '#0066ff');

// Title (scaled)
previewCtx.fillStyle = '#00ffff';
previewCtx.font = 'bold 72px Courier New';
previewCtx.textAlign = 'center';
previewCtx.shadowColor = '#00ffff';
previewCtx.shadowBlur = 40;
previewCtx.fillText('BALL RUN', 600, 100);
previewCtx.shadowBlur = 0;

// Subtitle (scaled)
previewCtx.fillStyle = '#bf00ff';
previewCtx.font = '32px Courier New';
previewCtx.shadowColor = '#bf00ff';
previewCtx.shadowBlur = 20;
previewCtx.fillText('Swipe to choose gates • Survive the boss!', 600, 750);
previewCtx.shadowBlur = 0;

// Save preview.png
const previewBuffer = previewCanvas.toBuffer('image/png');
fs.writeFileSync('preview.png', previewBuffer);
console.log('✓ preview.png created (1200x800 - 3:2 aspect ratio for Base embed)');
console.log('\nAll icons generated successfully!');
console.log('\nNote: Screenshots (1284x2778) need to be created manually or via browser automation.');
