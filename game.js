import { sdk } from 'https://esm.sh/@farcaster/frame-sdk';

sdk.actions.ready();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const levelEl = document.getElementById('level');
const ballsEl = document.getElementById('balls');
const gameOverEl = document.getElementById('gameOver');
const finalLevelEl = document.getElementById('finalLevel');
const retryBtn = document.getElementById('retryBtn');
const shareBtn = document.getElementById('shareBtn');
const bossAlertEl = document.getElementById('bossAlert');
const bossEmojiEl = document.getElementById('bossEmoji');
const onboardingEl = document.getElementById('onboarding');
const startGameBtn = document.getElementById('startGameBtn');
const leaderboardEl = document.getElementById('leaderboard');
const leaderboardListEl = document.getElementById('leaderboardList');
const leaderboardLoadingEl = document.getElementById('leaderboardLoading');
const closeLeaderboardBtn = document.getElementById('closeLeaderboard');

// Leaderboard contract address (set after deployment)
// TODO: Replace with your deployed contract address
const LEADERBOARD_CONTRACT = ''; // Example: '0x1234...'
const API_BASE_URL = window.location.origin;

const MAX_VISUAL_BALLS = 40;
const FINAL_BOSS_NUMBER = 10;

const BOSS_HEALTH = [100, 200, 350, 500, 750, 1000, 1500, 2000, 3000, 5000];

// Skills
const SKILL_TYPES = [
    { id: 'nuke', name: '☢️ NUKE', description: '%50 Damage!', color: '#ff0000', duration: 0, weight: 4, damagePercent: 0.50 },
    { id: 'mega_attack', name: '💥 MEGA', description: '%35 Damage!', color: '#ff6600', duration: 0, weight: 10, damagePercent: 0.35 },
    { id: 'super_blast', name: '💣 BLAST', description: '%25 Damage!', color: '#ff3300', duration: 0, weight: 15, damagePercent: 0.25 },
    { id: 'lightning', name: '⚡ BOLT', description: '%20 Damage!', color: '#ffff00', duration: 0, weight: 12, damagePercent: 0.20 },
    { id: 'fire_burst', name: '🔥 FIRE', description: '%15 Damage!', color: '#ff4400', duration: 0, weight: 18, damagePercent: 0.15 },
    { id: 'x10_damage', name: '💎 x10', description: 'x10 Damage 5s!', color: '#ff00ff', duration: 5000, weight: 3 },
    { id: 'x5_damage', name: '⭐ x5', description: 'x5 Damage 5s!', color: '#ffaa00', duration: 5000, weight: 8 },
    { id: 'x3_damage', name: '🌟 x3', description: 'x3 Damage 4s!', color: '#ffdd00', duration: 4000, weight: 12 },
    { id: 'shield', name: '🛡️ SHIELD', description: '6s Invincible!', color: '#00ffff', duration: 6000, weight: 10 },
    { id: 'rapid_fire', name: '🔴 RAPID', description: '4x Speed 5s!', color: '#ff0044', duration: 5000, weight: 12 },
    { id: 'heal', name: '💚 HEAL', description: '+30 Balls!', color: '#00ff88', duration: 0, weight: 12 },
    { id: 'triple_shot', name: '🎯 TRIPLE', description: '3 Shots 4s!', color: '#9900ff', duration: 4000, weight: 10 },
    { id: 'laser', name: '🔵 LASER', description: 'Beam Attack!', color: '#00aaff', duration: 0, weight: 8, damagePercent: 0.10 }
];

// Boss types with emoji faces and evolution traits
const BOSS_TYPES = [
    { name: 'DEMON', emoji: '👹', color: '#ff4444', attackColor: 'rgba(255, 50, 50, 0.8)', trait: 'flames' },
    { name: 'VAMPIRE', emoji: '🧛', color: '#6633cc', attackColor: 'rgba(150, 50, 200, 0.8)', trait: 'fangs' },
    { name: 'ZOMBIE', emoji: '🧟', color: '#55aa55', attackColor: 'rgba(100, 200, 100, 0.8)', trait: 'cracks' },
    { name: 'GHOST', emoji: '👻', color: '#aaaaee', attackColor: 'rgba(150, 150, 255, 0.8)', trait: 'glow' },
    { name: 'SKULL', emoji: '💀', color: '#ffffff', attackColor: 'rgba(200, 200, 200, 0.8)', trait: 'bones' },
    { name: 'DRAGON', emoji: '🐉', color: '#ff6600', attackColor: 'rgba(255, 150, 50, 0.8)', trait: 'scales' },
    { name: 'ALIEN', emoji: '👽', color: '#00ff88', attackColor: 'rgba(50, 255, 150, 0.8)', trait: 'rings' },
    { name: 'PUMPKIN', emoji: '🎃', color: '#ff8800', attackColor: 'rgba(255, 180, 50, 0.8)', trait: 'spikes' },
    { name: 'ROBOT', emoji: '🤖', color: '#4488ff', attackColor: 'rgba(68, 136, 255, 0.8)', trait: 'electric' },
    { name: 'DEVIL', emoji: '😈', color: '#cc00ff', attackColor: 'rgba(200, 0, 255, 0.9)', trait: 'horns' }
];

let gameState = {
    balls: 10,
    level: 1,
    speed: 6.5,
    isPlaying: true,
    isBoss: false,
    isVictory: false,
    bossType: null,
    bossHealth: 0,
    bossMaxHealth: 0,
    bossY: 220,
    bossSize: 70,
    bossProjectiles: [],
    lastBossAttack: 0,
    bossAttackSpeed: 1500,
    bossDamageMultiplier: 1,
    distance: 0,
    gateDistance: 380,
    gates: [],
    playerBalls: [],
    particles: [],
    attackBalls: [],
    playerSide: 0,
    gatesPassed: 0,
    lastAttackTime: 0,
    bossNumber: 0,
    droppedSkills: [],
    activeSkills: {},
    lastSkillDrop: 0,
    skillDropInterval: 4500, // Daha sık skill
    confetti: [],
    defeatedBosses: [],
    ballColor: '#00ffff',
    ballColorSecondary: '#0066ff',
    ballTraits: [],
    isHolding: false
};

let canvasWidth, canvasHeight;

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvasWidth = rect.width;
    canvasHeight = rect.height;
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Daha kolay gate seçenekleri - daha fazla pozitif
const operations = [
    { text: '+5', fn: (x) => x + 5, color: '#00ff88' },
    { text: '+8', fn: (x) => x + 8, color: '#00ff88' },
    { text: '+10', fn: (x) => x + 10, color: '#00ff88' },
    { text: '+15', fn: (x) => x + 15, color: '#00ff88' },
    { text: '+20', fn: (x) => x + 20, color: '#00ffaa' },
    { text: 'x2', fn: (x) => x * 2, color: '#00ffff' },
    { text: '-3', fn: (x) => x - 3, color: '#ff0066' },
    { text: '-5', fn: (x) => x - 5, color: '#ff0066' },
    { text: ':2', fn: (x) => Math.floor(x / 2), color: '#ff6600' }
];

function getLevelsUntilBoss() {
    return 5 - (gameState.level % 5);
}

function initGame() {
    gameState = {
        balls: 10,
        level: 1,
        speed: 6.5,
        isPlaying: true,
        isBoss: false,
        isVictory: false,
        bossType: null,
        bossHealth: 0,
        bossMaxHealth: 0,
        bossY: 220,
        bossSize: 70,
        bossProjectiles: [],
        lastBossAttack: 0,
        bossAttackSpeed: 1500,
        bossDamageMultiplier: 1,
        distance: 0,
        gateDistance: 380,
        gates: [],
        playerBalls: [],
        particles: [],
        attackBalls: [],
        playerSide: 0,
        gatesPassed: 0,
        lastAttackTime: 0,
        bossNumber: 0,
        droppedSkills: [],
        activeSkills: {},
        lastSkillDrop: 0,
        skillDropInterval: 4500,
        confetti: [],
        defeatedBosses: [],
        ballColor: '#00ffff',
        ballColorSecondary: '#0066ff',
        ballTraits: [],
        isHolding: false
    };
    
    createPlayerBalls();
    generateGates();
    updateUI();
    gameOverEl.classList.add('hidden');
    bossAlertEl.classList.add('hidden');
    bossEmojiEl.classList.add('hidden');
}

function createPlayerBalls() {
    gameState.playerBalls = [];
    const visualCount = Math.min(gameState.balls, MAX_VISUAL_BALLS);
    
    for (let i = 0; i < visualCount; i++) {
        gameState.playerBalls.push({
            x: canvasWidth / 2,
            y: canvasHeight - 100,
            offsetX: (Math.random() - 0.5) * 100,
            offsetY: (Math.random() - 0.5) * 60,
            radius: 8 + Math.random() * 4,
            phase: Math.random() * Math.PI * 2
        });
    }
}

function syncPlayerBalls() {
    const visualCount = Math.min(Math.max(0, gameState.balls), MAX_VISUAL_BALLS);
    const currentCount = gameState.playerBalls.length;
    
    if (visualCount > currentCount) {
        for (let i = currentCount; i < visualCount; i++) {
            gameState.playerBalls.push({
                x: canvasWidth / 2,
                y: canvasHeight - 100,
                offsetX: (Math.random() - 0.5) * 100,
                offsetY: (Math.random() - 0.5) * 60,
                radius: 8 + Math.random() * 4,
                phase: Math.random() * Math.PI * 2
            });
        }
    } else if (visualCount < currentCount) {
        gameState.playerBalls = gameState.playerBalls.slice(0, visualCount);
    }
}

function generateGates() {
    gameState.gates = [];
    for (let i = 0; i < 3; i++) {
        const y = -150 - (i * gameState.gateDistance);
        addGate(y);
    }
}

function addGate(y) {
    const leftOp = operations[Math.floor(Math.random() * operations.length)];
    let rightOp = operations[Math.floor(Math.random() * operations.length)];
    while (rightOp.text === leftOp.text) {
        rightOp = operations[Math.floor(Math.random() * operations.length)];
    }
    gameState.gates.push({ y, leftOp, rightOp, height: 80, passed: false });
}

function updateUI() {
    levelEl.textContent = `LEVEL ${gameState.level}`;
    ballsEl.textContent = `🔵 ${gameState.balls}`;
}

function drawBackground() {
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    
    const gridSize = 40;
    const offset = (gameState.distance * 0.5) % gridSize;
    
    for (let y = offset; y < canvasHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }
    
    for (let x = 0; x < canvasWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(191, 0, 255, 0.8)');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.lineTo(2, canvasHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(canvasWidth - 2, 0);
    ctx.lineTo(canvasWidth - 2, canvasHeight);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawBossCounter() {
    if (gameState.isBoss) return;
    
    const levelsLeft = getLevelsUntilBoss();
    ctx.fillStyle = levelsLeft <= 2 ? '#ff0066' : '#bf00ff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    ctx.fillText(`⚠️ BOSS IN ${levelsLeft} ⚠️`, canvasWidth / 2, 55);
    ctx.shadowBlur = 0;
}

function drawGates() {
    gameState.gates.forEach(gate => {
        if (gate.y > canvasHeight + 50 || gate.y + gate.height < -50) return;
        
        const gateWidth = canvasWidth / 2 - 15;
        drawGate(10, gate.y, gateWidth, gate.height, gate.leftOp);
        drawGate(canvasWidth / 2 + 5, gate.y, gateWidth, gate.height, gate.rightOp);
        
        ctx.fillStyle = '#bf00ff';
        ctx.shadowColor = '#bf00ff';
        ctx.shadowBlur = 15;
        ctx.fillRect(canvasWidth / 2 - 3, gate.y, 6, gate.height);
        ctx.shadowBlur = 0;
    });
}

function drawGate(x, y, width, height, op) {
    ctx.fillStyle = 'rgba(10, 10, 20, 0.9)';
    ctx.fillRect(x, y, width, height);
    
    ctx.strokeStyle = op.color;
    ctx.lineWidth = 4;
    ctx.shadowColor = op.color;
    ctx.shadowBlur = 15;
    ctx.strokeRect(x, y, width, height);
    
    ctx.fillStyle = op.color;
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(op.text, x + width / 2, y + height / 2);
    ctx.shadowBlur = 0;
}

function getDamageMultiplier() {
    const now = Date.now();
    if (gameState.activeSkills.x10_damage && now < gameState.activeSkills.x10_damage) return 10;
    if (gameState.activeSkills.x5_damage && now < gameState.activeSkills.x5_damage) return 5;
    if (gameState.activeSkills.x3_damage && now < gameState.activeSkills.x3_damage) return 3;
    return 1;
}

function getBulletStyle() {
    const now = Date.now();
    if (gameState.activeSkills.x10_damage && now < gameState.activeSkills.x10_damage) return { color: '#ff00ff', size: 12, glow: 25, trail: true };
    if (gameState.activeSkills.x5_damage && now < gameState.activeSkills.x5_damage) return { color: '#ffaa00', size: 10, glow: 20, trail: true };
    if (gameState.activeSkills.x3_damage && now < gameState.activeSkills.x3_damage) return { color: '#ffdd00', size: 9, glow: 18, trail: true };
    if (gameState.activeSkills.rapid_fire && now < gameState.activeSkills.rapid_fire) return { color: '#ff0044', size: 7, glow: 15, trail: true };
    if (gameState.activeSkills.triple_shot && now < gameState.activeSkills.triple_shot) return { color: '#9900ff', size: 7, glow: 12, trail: false };
    return { color: gameState.ballColor, size: 6, glow: 10, trail: false };
}

// Draw ball traits based on defeated bosses
function drawBallTrait(x, y, radius, trait) {
    ctx.save();
    
    switch(trait) {
        case 'flames':
            ctx.fillStyle = '#ff660066';
            for (let i = 0; i < 3; i++) {
                const flameX = x + (Math.random() - 0.5) * radius;
                const flameY = y - radius - Math.random() * 8;
                ctx.beginPath();
                ctx.arc(flameX, flameY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        case 'fangs':
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(x - 3, y + radius * 0.5);
            ctx.lineTo(x - 1, y + radius + 4);
            ctx.lineTo(x + 1, y + radius * 0.5);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x + 1, y + radius * 0.5);
            ctx.lineTo(x + 3, y + radius + 4);
            ctx.lineTo(x + 5, y + radius * 0.5);
            ctx.fill();
            break;
        case 'spikes':
            ctx.strokeStyle = '#ffffff88';
            ctx.lineWidth = 2;
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
                ctx.lineTo(x + Math.cos(angle) * (radius + 6), y + Math.sin(angle) * (radius + 6));
                ctx.stroke();
            }
            break;
        case 'horns':
            ctx.fillStyle = '#ff000088';
            ctx.beginPath();
            ctx.moveTo(x - radius * 0.5, y - radius * 0.8);
            ctx.lineTo(x - radius * 0.3, y - radius - 8);
            ctx.lineTo(x - radius * 0.1, y - radius * 0.8);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x + radius * 0.1, y - radius * 0.8);
            ctx.lineTo(x + radius * 0.3, y - radius - 8);
            ctx.lineTo(x + radius * 0.5, y - radius * 0.8);
            ctx.fill();
            break;
        case 'glow':
            ctx.fillStyle = '#ffffff22';
            ctx.beginPath();
            ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'rings':
            ctx.strokeStyle = '#00ff8844';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 'electric':
            ctx.strokeStyle = '#ffff0066';
            ctx.lineWidth = 1;
            const time = Date.now() * 0.01;
            ctx.beginPath();
            ctx.moveTo(x, y - radius);
            ctx.lineTo(x + Math.sin(time) * 5, y - radius - 6);
            ctx.stroke();
            break;
        case 'scales':
            ctx.fillStyle = '#ff880033';
            ctx.beginPath();
            ctx.arc(x - 3, y - 2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 3, y + 2, 3, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'bones':
            ctx.strokeStyle = '#ffffff44';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - radius, y);
            ctx.lineTo(x + radius, y);
            ctx.stroke();
            break;
        case 'cracks':
            ctx.strokeStyle = '#33ff3344';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y - radius * 0.5);
            ctx.lineTo(x + 3, y);
            ctx.lineTo(x - 2, y + radius * 0.3);
            ctx.stroke();
            break;
    }
    
    ctx.restore();
}

function drawPlayerBalls() {
    const targetX = canvasWidth / 2 + gameState.playerSide * (canvasWidth / 4);
    const baseY = canvasHeight - 100;
    const now = Date.now();
    
    // Shield effect
    if (gameState.activeSkills.shield && now < gameState.activeSkills.shield) {
        const shieldPulse = 1 + Math.sin(now * 0.01) * 0.1;
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.5 + Math.sin(now * 0.005) * 0.3})`;
        ctx.lineWidth = 5;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(targetX, baseY, 75 * shieldPulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
    
    // Power-up aura
    const multiplier = getDamageMultiplier();
    if (multiplier > 1) {
        const auraColor = multiplier >= 10 ? '#ff00ff' : multiplier >= 5 ? '#ffaa00' : '#ffdd00';
        const auraGradient = ctx.createRadialGradient(targetX, baseY, 0, targetX, baseY, 80);
        auraGradient.addColorStop(0, auraColor + '44');
        auraGradient.addColorStop(1, auraColor + '00');
        ctx.fillStyle = auraGradient;
        ctx.beginPath();
        ctx.arc(targetX, baseY, 80, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Rapid fire rings
    if (gameState.activeSkills.rapid_fire && now < gameState.activeSkills.rapid_fire) {
        ctx.strokeStyle = '#ff004444';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const ringSize = 50 + (now * 0.1 + i * 30) % 40;
            ctx.beginPath();
            ctx.arc(targetX, baseY, ringSize, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // Draw balls with evolution colors and traits
    gameState.playerBalls.forEach((ball) => {
        ball.x += (targetX + ball.offsetX - ball.x) * 0.12;
        ball.y = baseY + ball.offsetY + Math.sin(ball.phase + gameState.distance * 0.02) * 3;
        ball.phase += 0.04;
        
        // Determine ball colors (with multiplier override)
        let ballColor1 = gameState.ballColor;
        let ballColor2 = gameState.ballColorSecondary;
        if (multiplier >= 10) { ballColor1 = '#ff00ff'; ballColor2 = '#9900ff'; }
        else if (multiplier >= 5) { ballColor1 = '#ffaa00'; ballColor2 = '#ff6600'; }
        else if (multiplier >= 3) { ballColor1 = '#ffdd00'; ballColor2 = '#ffaa00'; }
        
        // Glow
        ctx.fillStyle = ballColor1 + '44';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 1.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Ball
        const ballGradient = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 0, ball.x, ball.y, ball.radius);
        ballGradient.addColorStop(0, ballColor1);
        ballGradient.addColorStop(0.7, ballColor2);
        ballGradient.addColorStop(1, '#001122');
        
        ctx.fillStyle = ballGradient;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw all acquired traits
        gameState.ballTraits.forEach(trait => {
            drawBallTrait(ball.x, ball.y, ball.radius, trait);
        });
    });
    
    // Ball count
    ctx.fillStyle = gameState.ballColor;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = gameState.ballColor;
    ctx.shadowBlur = 10;
    const countText = multiplier > 1 ? `${gameState.balls} (x${multiplier})` : `${gameState.balls}`;
    ctx.fillText(countText, targetX, baseY + 55);
    ctx.shadowBlur = 0;
    
    // Evolution indicator
    if (gameState.ballTraits.length > 0) {
        ctx.fillStyle = '#ffffff88';
        ctx.font = '10px Arial';
        ctx.fillText(`Evolution: ${gameState.ballTraits.length}/${FINAL_BOSS_NUMBER}`, targetX, baseY + 70);
    }
    
    drawActiveSkills();
}

function drawActiveSkills() {
    let y = canvasHeight - 180;
    const now = Date.now();
    
    Object.keys(gameState.activeSkills).forEach(skillId => {
        const skill = SKILL_TYPES.find(s => s.id === skillId);
        if (skill && gameState.activeSkills[skillId] && skill.duration > 0) {
            const remaining = Math.ceil((gameState.activeSkills[skillId] - now) / 1000);
            if (remaining > 0) {
                ctx.fillStyle = skill.color;
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.shadowColor = skill.color;
                ctx.shadowBlur = 8;
                ctx.fillText(`${skill.name} ${remaining}s`, canvasWidth / 2, y);
                ctx.shadowBlur = 0;
                y -= 18;
            } else {
                delete gameState.activeSkills[skillId];
            }
        }
    });
}

function drawAttackBalls() {
    const bulletStyle = getBulletStyle();
    const multiplier = getDamageMultiplier();
    
    gameState.attackBalls = gameState.attackBalls.filter(ball => {
        const dx = canvasWidth / 2 - ball.x;
        const dy = gameState.bossY - ball.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < gameState.bossSize + 10) {
            let damage = ball.damage || 1;
            if (!ball.isMega) damage *= multiplier;
            gameState.bossHealth -= damage;
            
            const particleColor = damage >= 10 ? '255, 0, 255' : damage >= 5 ? '255, 170, 0' : '255, 100, 50';
            createParticles(ball.x, ball.y, particleColor, Math.min(damage + 5, 20));
            
            if (gameState.bossHealth <= 0) {
                gameState.bossHealth = 0;
                defeatBoss();
            }
            return false;
        }
        
        const speed = ball.isMega ? 20 : 16;
        ball.x += (dx / dist) * speed;
        ball.y += (dy / dist) * speed;
        
        // Trail
        if (bulletStyle.trail || ball.isMega) {
            const trailColor = ball.isMega ? ball.color : bulletStyle.color;
            ctx.fillStyle = trailColor + '44';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y + 10, bulletStyle.size * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const color = ball.isMega ? ball.color : bulletStyle.color;
        const size = ball.isMega ? 14 : bulletStyle.size;
        
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = ball.isMega ? 25 : bulletStyle.glow;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        if (ball.isMega) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.shadowBlur = 0;
        return true;
    });
}

function getRandomSkill() {
    const totalWeight = SKILL_TYPES.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    for (const skill of SKILL_TYPES) {
        random -= skill.weight;
        if (random <= 0) return skill;
    }
    return SKILL_TYPES[0];
}

function checkSkillDrop() {
    const now = Date.now();
    if (now - gameState.lastSkillDrop >= gameState.skillDropInterval) {
        gameState.lastSkillDrop = now;
        dropSkill();
    }
}

function dropSkill() {
    const skill = getRandomSkill();
    gameState.droppedSkills.push({
        ...skill,
        x: canvasWidth * 0.15 + Math.random() * canvasWidth * 0.7,
        y: 130,
        vy: 3.5,
        rotation: 0
    });
}

function drawDroppedSkills() {
    const playerY = canvasHeight - 100;
    
    gameState.droppedSkills = gameState.droppedSkills.filter(skill => {
        skill.y += skill.vy;
        skill.rotation += 0.06;
        
        if (skill.y >= playerY - 50) {
            activateSkill(skill);
            createParticles(skill.x, skill.y, '255, 255, 100', 30);
            showSkillPopup(skill);
            return false;
        }
        
        ctx.save();
        ctx.translate(skill.x, skill.y);
        ctx.rotate(skill.rotation);
        
        ctx.fillStyle = skill.color;
        ctx.shadowColor = skill.color;
        ctx.shadowBlur = 35;
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(skill.name.split(' ')[0], 0, 0);
        
        ctx.restore();
        
        ctx.fillStyle = skill.color;
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = skill.color;
        ctx.shadowBlur = 5;
        ctx.fillText(skill.description, skill.x, skill.y + 40);
        ctx.shadowBlur = 0;
        
        return true;
    });
}

let skillPopup = { text: '', color: '', time: 0 };

function showSkillPopup(skill) {
    skillPopup = { text: `${skill.name} ACTIVATED!`, color: skill.color, time: Date.now() + 2000 };
}

function drawSkillPopup() {
    if (Date.now() < skillPopup.time) {
        const progress = (skillPopup.time - Date.now()) / 2000;
        const scale = 1 + (1 - progress) * 0.3;
        
        ctx.save();
        ctx.globalAlpha = progress;
        ctx.fillStyle = skillPopup.color;
        ctx.font = `bold ${26 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.shadowColor = skillPopup.color;
        ctx.shadowBlur = 30;
        ctx.fillText(skillPopup.text, canvasWidth / 2, canvasHeight / 2 - 30);
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}

function activateSkill(skill) {
    const centerX = canvasWidth / 2;
    
    if (skill.damagePercent) {
        const damage = Math.ceil(gameState.bossMaxHealth * skill.damagePercent);
        let bulletColor = '#ff6600';
        if (skill.id === 'nuke') bulletColor = '#ff0000';
        else if (skill.id === 'lightning') bulletColor = '#ffff00';
        else if (skill.id === 'laser') bulletColor = '#00aaff';
        
        gameState.attackBalls.push({ x: centerX, y: canvasHeight - 100, damage, isMega: true, color: bulletColor });
        
        if (skill.id === 'nuke') {
            for (let i = 0; i < 60; i++) createParticles(centerX + (Math.random() - 0.5) * 100, canvasHeight - 100, '255, 100, 0', 2);
        } else if (skill.id === 'laser') {
            for (let i = 0; i < 5; i++) {
                gameState.attackBalls.push({ x: centerX + (Math.random() - 0.5) * 30, y: canvasHeight - 100 - i * 20, damage: Math.ceil(damage / 5), isMega: true, color: '#00aaff' });
            }
        }
        return;
    }
    
    switch(skill.id) {
        case 'x10_damage':
            gameState.activeSkills.x10_damage = Date.now() + skill.duration;
            createParticles(centerX, canvasHeight - 100, '255, 0, 255', 40);
            break;
        case 'x5_damage':
            gameState.activeSkills.x5_damage = Date.now() + skill.duration;
            createParticles(centerX, canvasHeight - 100, '255, 170, 0', 35);
            break;
        case 'x3_damage':
            gameState.activeSkills.x3_damage = Date.now() + skill.duration;
            createParticles(centerX, canvasHeight - 100, '255, 220, 0', 30);
            break;
        case 'shield':
            gameState.activeSkills.shield = Date.now() + skill.duration;
            createParticles(centerX, canvasHeight - 100, '0, 255, 255', 35);
            break;
        case 'rapid_fire':
            gameState.activeSkills.rapid_fire = Date.now() + skill.duration;
            createParticles(centerX, canvasHeight - 100, '255, 0, 68', 30);
            break;
        case 'heal':
            gameState.balls += 30;
            syncPlayerBalls();
            updateUI();
            createParticles(centerX, canvasHeight - 100, '0, 255, 136', 40);
            break;
        case 'triple_shot':
            gameState.activeSkills.triple_shot = Date.now() + skill.duration;
            createParticles(centerX, canvasHeight - 100, '153, 0, 255', 30);
            break;
    }
}

// Draw emoji boss - HTML overlay for Apple compatibility
function drawBoss() {
    if (!gameState.isBoss || !gameState.bossType) {
        bossEmojiEl.classList.add('hidden');
        return;
    }
    
    const boss = gameState.bossType;
    const centerX = canvasWidth / 2;
    const bossY = gameState.bossY;
    const size = gameState.bossSize;
    
    // Title
    ctx.fillStyle = boss.color;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = boss.color;
    ctx.shadowBlur = 20;
    ctx.fillText(`${boss.emoji} ${boss.name} BOSS`, centerX, 50);
    ctx.shadowBlur = 0;
    
    // Health bar
    const barWidth = canvasWidth * 0.8;
    const barX = (canvasWidth - barWidth) / 2;
    ctx.fillStyle = '#220000';
    ctx.fillRect(barX, 65, barWidth, 16);
    
    const healthPercent = Math.max(0, gameState.bossHealth / gameState.bossMaxHealth);
    ctx.fillStyle = boss.color;
    ctx.shadowColor = boss.color;
    ctx.shadowBlur = 10;
    ctx.fillRect(barX, 65, barWidth * healthPercent, 16);
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Arial';
    ctx.fillText(`${Math.max(0, gameState.bossHealth)} / ${gameState.bossMaxHealth}`, centerX, 77);
    
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 10px Arial';
    ctx.fillText(`Boss ${gameState.bossNumber}/${FINAL_BOSS_NUMBER}`, centerX, 95);
    
    // Boss aura
    const auraGradient = ctx.createRadialGradient(centerX, bossY, 0, centerX, bossY, size * 2);
    auraGradient.addColorStop(0, boss.attackColor);
    auraGradient.addColorStop(0.5, boss.color + '33');
    auraGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(centerX, bossY, size * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Emoji boss as HTML overlay (for Apple compatibility)
    // Pozisyonu game container'a göre hesapla
    const gameContainer = document.getElementById('game');
    if (!gameContainer) return;
    
    // Canvas'ın container içindeki pozisyonunu hesapla
    // Canvas ve container aynı boyutta olduğu için direkt bossY kullanabiliriz
    const relativeY = bossY;
    
    // Emoji'yi set et - Apple için özel format
    bossEmojiEl.innerHTML = `<span style="font-size: inherit; display: inline-block;">${boss.emoji}</span>`;
    bossEmojiEl.setAttribute('aria-label', boss.name);
    
    // Stil ayarları - Apple için optimize edilmiş
    bossEmojiEl.style.color = boss.color;
    bossEmojiEl.style.top = `${relativeY}px`;
    bossEmojiEl.style.left = '50%';
    bossEmojiEl.style.fontSize = `${Math.max(140, size * 2.8)}px`;
    bossEmojiEl.style.transform = 'translateX(-50%) translateY(-50%)';
    bossEmojiEl.style.webkitTransform = 'translateX(-50%) translateY(-50%)';
    bossEmojiEl.style.marginTop = '0';
    
    // Apple için özel ayarlar
    bossEmojiEl.style.textRendering = 'optimizeLegibility';
    bossEmojiEl.style.fontFeatureSettings = '"liga" 1, "kern" 1';
    bossEmojiEl.style.webkitTextSizeAdjust = '100%';
    
    // Force reflow for Apple devices
    void bossEmojiEl.offsetHeight;
    
    bossEmojiEl.classList.remove('hidden');
}

function bossAttack() {
    if (!gameState.isBoss || !gameState.isPlaying) return;
    
    const now = Date.now();
    if (now - gameState.lastBossAttack < gameState.bossAttackSpeed) return;
    gameState.lastBossAttack = now;
    
    const boss = gameState.bossType;
    const projectileCount = 3 + Math.floor(gameState.bossNumber / 2);
    
    for (let i = 0; i < projectileCount; i++) {
        const angle = (Math.PI * 0.3) + (Math.PI * 0.4 * i / Math.max(1, projectileCount - 1));
        const speed = 3.5 + gameState.bossNumber * 0.3;
        
        gameState.bossProjectiles.push({
            x: canvasWidth / 2 + (Math.random() - 0.5) * 50,
            y: gameState.bossY + gameState.bossSize,
            vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
            vy: Math.sin(angle) * speed + 2.5,
            radius: 10 + Math.random() * 8,
            color: boss.attackColor,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.3
        });
    }
    
    createParticles(canvasWidth / 2, gameState.bossY + gameState.bossSize, '255, 100, 100', 10);
}

function drawBossProjectiles() {
    const hasShield = gameState.activeSkills.shield && Date.now() < gameState.activeSkills.shield;
    const playerY = canvasHeight - 100;
    const playerX = canvasWidth / 2 + gameState.playerSide * (canvasWidth / 4);
    
    gameState.bossProjectiles = gameState.bossProjectiles.filter(proj => {
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.vy += 0.12;
        proj.rotation += proj.rotationSpeed;
        
        if (proj.y > canvasHeight + 50) return false;
        
        const dx = playerX - proj.x;
        const dy = playerY - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < proj.radius + 25 && !hasShield) {
            const damage = Math.max(1, Math.floor(gameState.balls * 0.025 * gameState.bossDamageMultiplier));
            gameState.balls -= damage;
            if (gameState.balls < 0) gameState.balls = 0;
            syncPlayerBalls();
            updateUI();
            createParticles(proj.x, proj.y, '255, 100, 100', 12);
            
            if (gameState.balls <= 0) endGame();
            return false;
        }
        
        ctx.save();
        ctx.translate(proj.x, proj.y);
        ctx.rotate(proj.rotation);
        
        ctx.fillStyle = proj.color;
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff88';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const spikeAngle = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(spikeAngle) * proj.radius * 0.5, Math.sin(spikeAngle) * proj.radius * 0.5);
            ctx.lineTo(Math.cos(spikeAngle) * proj.radius * 1.2, Math.sin(spikeAngle) * proj.radius * 1.2);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.restore();
        
        return true;
    });
}

function attackBoss() {
    if (!gameState.isBoss || gameState.balls <= 0) return;
    
    const now = Date.now();
    const hasRapidFire = gameState.activeSkills.rapid_fire && now < gameState.activeSkills.rapid_fire;
    const fireRate = hasRapidFire ? 20 : 65;
    if (now - gameState.lastAttackTime < fireRate) return;
    gameState.lastAttackTime = now;
    
    const hasTripleShot = gameState.activeSkills.triple_shot && now < gameState.activeSkills.triple_shot;
    const shotCount = hasTripleShot ? 3 : 1;
    
    for (let i = 0; i < shotCount; i++) {
        if (gameState.balls <= 0) break;
        gameState.balls--;
        
        const targetX = canvasWidth / 2 + gameState.playerSide * (canvasWidth / 4);
        gameState.attackBalls.push({
            x: targetX + (Math.random() - 0.5) * 60 + (hasTripleShot ? (i - 1) * 25 : 0),
            y: canvasHeight - 100,
            damage: 1
        });
    }
    
    syncPlayerBalls();
    updateUI();
    
    if (gameState.balls <= 0) endGame();
}

function defeatBoss() {
    const boss = gameState.bossType;
    gameState.defeatedBosses.push(boss);
    
    // Evolution: Change ball color to boss color
    gameState.ballColor = boss.color;
    gameState.ballColorSecondary = boss.color + '88';
    
    // Add boss trait to balls
    if (boss.trait && !gameState.ballTraits.includes(boss.trait)) {
        gameState.ballTraits.push(boss.trait);
    }
    
    gameState.isBoss = false;
    gameState.bossProjectiles = [];
    gameState.droppedSkills = [];
    bossAlertEl.classList.add('hidden');
    bossEmojiEl.classList.add('hidden');
    
    if (gameState.bossNumber >= FINAL_BOSS_NUMBER) {
        showVictory();
        return;
    }
    
    gameState.level++;
    gameState.speed += 0.4;
    
    // Big explosion
    for (let i = 0; i < 80; i++) {
        createParticles(canvasWidth / 2 + (Math.random() - 0.5) * 150, gameState.bossY + (Math.random() - 0.5) * 100, '255, 200, 50', 3);
    }
    
    const bonus = 25 + gameState.bossNumber * 20;
    gameState.balls += bonus;
    syncPlayerBalls();
    
    generateGates();
    updateUI();
    
    // Evolution particles
    createParticles(canvasWidth / 2, canvasHeight - 100, boss.color.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16)).join(', '), 50);
}

function showVictory() {
    gameState.isVictory = true;
    gameState.isPlaying = false;
    
    for (let i = 0; i < 400; i++) {
        gameState.confetti.push({
            x: Math.random() * canvasWidth,
            y: -Math.random() * canvasHeight * 2,
            vx: (Math.random() - 0.5) * 6,
            vy: Math.random() * 5 + 2,
            size: Math.random() * 14 + 5,
            color: ['#ff0066', '#00ffff', '#ffff00', '#ff6600', '#00ff88', '#bf00ff', '#ff00ff', '#00ff00'][Math.floor(Math.random() * 8)],
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.3
        });
    }
}

function drawVictory() {
    if (!gameState.isVictory) return;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    gameState.confetti.forEach(c => {
        c.x += c.vx;
        c.y += c.vy;
        c.rotation += c.rotationSpeed;
        if (c.y > canvasHeight + 20) { c.y = -20; c.x = Math.random() * canvasWidth; }
        
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
        ctx.restore();
    });
    
    const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.15;
    
    ctx.fillStyle = '#ffff00';
    ctx.font = `bold ${48 * pulse}px Arial`;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 50;
    ctx.fillText('🏆 VICTORY! 🏆', canvasWidth / 2, 70);
    
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 18px Arial';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.fillText('FULLY EVOLVED!', canvasWidth / 2, 105);
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`Level: ${gameState.level} | Balls: ${gameState.balls}`, canvasWidth / 2, 135);
    ctx.fillText(`Traits: ${gameState.ballTraits.join(', ')}`, canvasWidth / 2, 155);
    
    if (Math.random() < 0.12) {
        createParticles(Math.random() * canvasWidth, Math.random() * canvasHeight * 0.5, ['255, 0, 100', '0, 255, 255', '255, 255, 0'][Math.floor(Math.random() * 3)], 25);
    }
    
    ctx.fillStyle = '#ff0066';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('👑 DEFEATED BOSSES 👑', canvasWidth / 2, 185);
    
    const cols = 5;
    gameState.defeatedBosses.forEach((boss, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = (canvasWidth / (cols + 1)) * (col + 1);
        const y = 240 + row * 70;
        
        ctx.font = '35px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.6;
        ctx.fillText(boss.emoji, x, y);
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = boss.color;
        ctx.font = '9px Arial';
        ctx.fillText(boss.name, x, y + 28);
    });
    
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 18px Arial';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 20;
    ctx.fillText('🎮 TAP TO PLAY AGAIN 🎮', canvasWidth / 2, canvasHeight - 50);
    ctx.shadowBlur = 0;
}

function drawParticles() {
    if (gameState.particles.length > 200) gameState.particles = gameState.particles.slice(-200);
    
    gameState.particles = gameState.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.vy += 0.1;
        
        if (p.life <= 0) return false;
        
        ctx.fillStyle = `rgba(${p.color}, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        
        return true;
    });
}

function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        gameState.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.5) * 16 - 3,
            size: Math.random() * 9 + 3,
            life: 1,
            color
        });
    }
}

function checkGateCollision() {
    const playerY = canvasHeight - 100;
    
    gameState.gates.forEach(gate => {
        if (gate.passed) return;
        
        if (gate.y <= playerY + 20 && gate.y + gate.height >= playerY - 20) {
            gate.passed = true;
            gameState.gatesPassed++;
            
            const playerX = canvasWidth / 2 + gameState.playerSide * (canvasWidth / 4);
            const selectedOp = playerX < canvasWidth / 2 ? gate.leftOp : gate.rightOp;
            const oldBalls = gameState.balls;
            gameState.balls = selectedOp.fn(gameState.balls);
            
            if (gameState.balls < 0) gameState.balls = 0;
            
            const particleColor = gameState.balls >= oldBalls ? '0, 255, 136' : '255, 0, 102';
            createParticles(playerX, playerY, particleColor, 12);
            
            syncPlayerBalls();
            updateUI();
            
            if (gameState.balls <= 0) endGame();
        }
    });
}

function startBoss() {
    gameState.isBoss = true;
    gameState.gates = [];
    gameState.attackBalls = [];
    gameState.bossProjectiles = [];
    gameState.droppedSkills = [];
    gameState.lastBossAttack = Date.now();
    gameState.lastSkillDrop = Date.now();
    gameState.bossNumber++;
    
    gameState.bossType = BOSS_TYPES[(gameState.bossNumber - 1) % BOSS_TYPES.length];
    
    const healthIndex = Math.min(gameState.bossNumber - 1, BOSS_HEALTH.length - 1);
    gameState.bossHealth = BOSS_HEALTH[healthIndex];
    gameState.bossMaxHealth = gameState.bossHealth;
    
    gameState.bossSize = 55 + Math.min(gameState.bossNumber * 5, 40);
    gameState.bossY = 220;
    
    // Skill drop daha sık (4-5 saniye)
    gameState.skillDropInterval = Math.max(3500, 4500 - gameState.bossNumber * 100);
    gameState.bossAttackSpeed = Math.max(400, 1400 - gameState.bossNumber * 100);
    gameState.bossDamageMultiplier = 1 + (gameState.bossNumber - 1) * 0.2;
    
    bossAlertEl.classList.remove('hidden');
    setTimeout(() => { if (gameState.isBoss) bossAlertEl.classList.add('hidden'); }, 1500);
}

function endGame() {
    gameState.isPlaying = false;
    gameState.isHolding = false;
    stopHolding();
    finalLevelEl.textContent = `Level: ${gameState.level} | Bosses: ${gameState.bossNumber}`;
    gameOverEl.classList.remove('hidden');
    bossEmojiEl.classList.add('hidden');
}

// Controls - Tek tıklama = tek ateş, basılı tutma = sürekli ateş
let holdInterval = null;

function startHolding() {
    if (holdInterval) return;
    gameState.isHolding = true;
    holdInterval = setInterval(() => {
        if (gameState.isBoss && gameState.isPlaying && gameState.isHolding) {
            attackBoss();
        }
    }, 30);
}

function stopHolding() {
    gameState.isHolding = false;
    if (holdInterval) {
        clearInterval(holdInterval);
        holdInterval = null;
    }
}

// Touch controls
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState.isVictory) { initGame(); return; }
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    gameState.playerSide = (touch.clientX - rect.left) < canvasWidth / 2 ? -1 : 1;
    
    // Tek tıklama = tek ateş
    if (gameState.isBoss && gameState.isPlaying) {
        attackBoss();
    }
    
    // Basılı tutma için zamanlayıcı başlat
    startHolding();
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    gameState.playerSide = (touch.clientX - rect.left) < canvasWidth / 2 ? -1 : 1;
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopHolding();
}, { passive: false });

canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    stopHolding();
}, { passive: false });

// Mouse controls
canvas.addEventListener('mousedown', (e) => {
    if (gameState.isVictory) { initGame(); return; }
    
    const rect = canvas.getBoundingClientRect();
    gameState.playerSide = (e.clientX - rect.left) < canvasWidth / 2 ? -1 : 1;
    
    // Tek tıklama = tek ateş
    if (gameState.isBoss && gameState.isPlaying) {
        attackBoss();
    }
    
    // Basılı tutma için zamanlayıcı başlat
    startHolding();
});

canvas.addEventListener('mouseup', () => {
    stopHolding();
});

canvas.addEventListener('mouseleave', () => {
    stopHolding();
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    gameState.playerSide = (e.clientX - rect.left) < canvasWidth / 2 ? -1 : 1;
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (gameState.isVictory && e.key === ' ') { initGame(); return; }
    if (e.key === 'ArrowLeft' || e.key === 'a') gameState.playerSide = -1;
    if (e.key === 'ArrowRight' || e.key === 'd') gameState.playerSide = 1;
    if (e.key === ' ' && gameState.isBoss && !gameState.isHolding) {
        attackBoss();
        startHolding();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === ' ') {
        stopHolding();
    }
});

// Prevent scrolling on mobile
document.body.addEventListener('touchmove', (e) => {
    if (e.target === canvas || e.target.closest('#game')) {
        e.preventDefault();
    }
}, { passive: false });

function gameLoop() {
    drawBackground();
    
    if (gameState.isVictory) {
        drawVictory();
        drawParticles();
        requestAnimationFrame(gameLoop);
        return;
    }
    
    if (!gameState.isPlaying) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    if (!gameState.isBoss) {
        drawBossCounter();
        
        gameState.gates.forEach(gate => { gate.y += gameState.speed; });
        
        while (gameState.gates.length > 0 && gameState.gates[0].y > canvasHeight + 100) {
            gameState.gates.shift();
            if (gameState.gates.length > 0) {
                const lastGate = gameState.gates[gameState.gates.length - 1];
                addGate(lastGate.y - gameState.gateDistance);
            }
        }
        
        if (gameState.gates.length === 0) {
            gameState.level++;
            gameState.speed += 0.3;
            generateGates();
            updateUI();
        }
        
        if (gameState.gatesPassed >= 3) {
            gameState.gatesPassed = 0;
            gameState.level++;
            gameState.speed += 0.25;
            updateUI();
            
            if (gameState.level % 5 === 0) startBoss();
        }
        
        checkGateCollision();
        drawGates();
    } else {
        checkSkillDrop();
        bossAttack();
        drawBoss();
        drawBossProjectiles();
        drawDroppedSkills();
        drawAttackBalls();
        drawSkillPopup();
    }
    
    drawPlayerBalls();
    drawParticles();
    
    gameState.distance += gameState.speed;
    
    requestAnimationFrame(gameLoop);
}

retryBtn.addEventListener('click', () => { stopHolding(); initGame(); });

startGameBtn.addEventListener('click', () => {
    onboardingEl.classList.add('hidden');
    localStorage.setItem('ballRunOnboarding', 'true');
    if (!gameState.isPlaying) {
        initGame();
    }
});

shareBtn.addEventListener('click', async () => {
    const text = gameState.bossNumber >= FINAL_BOSS_NUMBER 
        ? `🏆 Ball Run VICTORY!\n\nFully evolved with ${gameState.ballTraits.length} traits!\n\nCan you evolve too?`
        : `🎮 Ball Run!\n\nLevel ${gameState.level} | ${gameState.bossNumber} Bosses | ${gameState.ballTraits.length} traits\n\nBeat me!`;
    
    try {
        // Try Farcaster SDK first
        if (sdk && sdk.actions && sdk.actions.composeCast) {
            await sdk.actions.composeCast({ text });
            return;
        }
    } catch (error) {
        console.log('Farcaster share failed:', error);
    }
    
    // Fallback to Web Share API
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Ball Run',
                text: text,
            });
            return;
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.log('Web Share failed:', error);
            } else {
                return; // User cancelled
            }
        }
    }
    
    // Final fallback: Copy to clipboard
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard! 📋', 'success');
    } catch (error) {
        console.error('Clipboard copy failed:', error);
        showNotification('Share failed. Please copy manually.', 'error');
    }
});

// Leaderboard functions
async function submitScoreToBlockchain() {
    if (!LEADERBOARD_CONTRACT) {
        console.log('Leaderboard contract not configured');
        return;
    }

    try {
        // Get user's wallet address from Base App context
        const userAddress = await getBaseAccountAddress();
        
        if (!userAddress) {
            console.log('No wallet address available');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/submit-score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                playerAddress: userAddress,
                level: gameState.level,
                balls: gameState.balls,
                bosses: gameState.bossNumber,
                contractAddress: LEADERBOARD_CONTRACT,
            }),
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('Score submitted:', result.transactionHash);
            // Show success message
            showNotification('Score saved to blockchain! 🎉', 'success');
        } else {
            console.error('Failed to submit score:', result.error);
            showNotification('Failed to save score', 'error');
        }
    } catch (error) {
        console.error('Error submitting score:', error);
        showNotification('Error saving score', 'error');
    }
}

async function getBaseAccountAddress() {
    try {
        // Try to get address from Base App context
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                return accounts[0];
            }
        }
        
        // Try Farcaster SDK
        if (sdk && sdk.context) {
            const context = await sdk.context;
            if (context && context.connectedAddress) {
                return context.connectedAddress;
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error getting address:', error);
        return null;
    }
}

async function loadLeaderboard() {
    if (!LEADERBOARD_CONTRACT) {
        leaderboardListEl.innerHTML = '<p style="color: #ff0066; text-align: center;">Leaderboard contract not configured</p>';
        leaderboardLoadingEl.classList.add('hidden');
        return;
    }

    leaderboardLoadingEl.classList.remove('hidden');
    leaderboardListEl.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/api/get-leaderboard?contractAddress=${LEADERBOARD_CONTRACT}&count=20`);
        const result = await response.json();

        leaderboardLoadingEl.classList.add('hidden');

        if (result.success && result.scores && result.scores.length > 0) {
            result.scores.forEach((score, index) => {
                const item = document.createElement('div');
                item.className = `leaderboard-item rank-${index < 3 ? index + 1 : ''}`;
                
                const shortAddress = `${score.player.slice(0, 6)}...${score.player.slice(-4)}`;
                
                item.innerHTML = `
                    <div class="leaderboard-rank">#${score.rank}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-player">${shortAddress}</div>
                        <div class="leaderboard-stats">
                            <span>Level: ${score.level}</span>
                            <span>Balls: ${score.balls}</span>
                            <span>Bosses: ${score.bosses}</span>
                        </div>
                    </div>
                `;
                
                leaderboardListEl.appendChild(item);
            });
        } else {
            leaderboardListEl.innerHTML = '<p style="color: #cccccc; text-align: center;">No scores yet. Be the first!</p>';
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        leaderboardLoadingEl.classList.add('hidden');
        leaderboardListEl.innerHTML = '<p style="color: #ff0066; text-align: center;">Error loading leaderboard</p>';
    }
}

function showLeaderboard() {
    leaderboardEl.classList.remove('hidden');
    loadLeaderboard();
}

function hideLeaderboard() {
    leaderboardEl.classList.add('hidden');
}

function showNotification(message, type = 'info') {
    // Simple notification (can be enhanced)
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff0066' : '#00ffff'};
        color: #0a0a12;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 1000;
        font-weight: bold;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Leaderboard button event listener
const leaderboardBtn = document.getElementById('leaderboardBtn');
if (leaderboardBtn) {
    leaderboardBtn.addEventListener('click', showLeaderboard);
}

if (closeLeaderboardBtn) {
    closeLeaderboardBtn.addEventListener('click', hideLeaderboard);
}

// Show onboarding on first load
const hasSeenOnboarding = localStorage.getItem('ballRunOnboarding');
if (!hasSeenOnboarding) {
    onboardingEl.classList.remove('hidden');
    gameState.isPlaying = false;
} else {
    initGame();
}

gameLoop();
