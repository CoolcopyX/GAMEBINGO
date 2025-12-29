const canvas = document.getElementById('bartleChart');
const ctx = canvas.getContext('2d');
const resultDisplay = document.getElementById('result-display');
const infoCards = document.querySelectorAll('.info-card');

// Set canvas resolution for Retina displays
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    // We need to store logical width/height for drawing calculations
    canvas.logicalWidth = rect.width;
    canvas.logicalHeight = rect.height;

    drawChart();
}

window.addEventListener('resize', resizeCanvas);

// Initial State
let currentPos = null;

// Colors
const colors = {
    killer: '#ef4444',
    achiever: '#f59e0b',
    socializer: '#ec4899',
    explorer: '#3b82f6',
    bg: 'rgba(30, 41, 59, 0.5)',
    grid: 'rgba(148, 163, 184, 0.2)',
    axis: '#94a3b8'
};

const types = {
    killer: { name: '킬러 (Killers)', desc: '경쟁과 승리를 즐기며, 다른 플레이어에게 영향을 주는 것을 선호합니다.' },
    achiever: { name: '성취가 (Achievers)', desc: '목표 달성과 성장을 즐기며, 게임 세계 내에서의 성공을 선호합니다.' },
    socializer: { name: '사교가 (Socializers)', desc: '관계와 소통을 즐기며, 다른 플레이어와의 상호작용을 선호합니다.' },
    explorer: { name: '탐험가 (Explorers)', desc: '발견과 이해를 즐기며, 게임 세계 자체와의 상호작용을 선호합니다.' }
};

function drawChart() {
    if (!canvas.logicalWidth) return; // Wait for resize

    const w = canvas.logicalWidth;
    const h = canvas.logicalHeight;
    const centerX = w / 2;
    const centerY = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Draw Grid (Subtle)
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;

    // Draw Axes
    ctx.beginPath();
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 2;

    // Vertical Axis
    ctx.moveTo(centerX, 20);
    ctx.lineTo(centerX, h - 20);

    // Horizontal Axis
    ctx.moveTo(20, centerY);
    ctx.lineTo(w - 20, centerY);
    ctx.stroke();

    // Arrow Heads
    drawArrow(centerX, 20, 'up');
    drawArrow(centerX, h - 20, 'down');
    drawArrow(20, centerY, 'left');
    drawArrow(w - 20, centerY, 'right');

    // Draw Current Position if exists
    if (currentPos) {
        // Draw dashed lines to axis
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;

        ctx.moveTo(currentPos.x, centerY);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.lineTo(centerX, currentPos.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Point
        ctx.beginPath();
        ctx.arc(currentPos.x, currentPos.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = currentPos.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(currentPos.x, currentPos.y, 12, 0, Math.PI * 2);
        ctx.strokeStyle = currentPos.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glow effect
        ctx.shadowColor = currentPos.color;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
    }
}

function drawArrow(x, y, direction) {
    ctx.beginPath();
    ctx.fillStyle = colors.axis;
    if (direction === 'up') {
        ctx.moveTo(x, y);
        ctx.lineTo(x - 5, y + 10);
        ctx.lineTo(x + 5, y + 10);
    } else if (direction === 'down') {
        ctx.moveTo(x, y);
        ctx.lineTo(x - 5, y - 10);
        ctx.lineTo(x + 5, y - 10);
    } else if (direction === 'left') {
        ctx.moveTo(x, y);
        ctx.lineTo(x + 10, y - 5);
        ctx.lineTo(x + 10, y + 5);
    } else if (direction === 'right') {
        ctx.moveTo(x, y);
        ctx.lineTo(x - 10, y - 5);
        ctx.lineTo(x - 10, y + 5);
    }
    ctx.fill();
}

// Interaction
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const w = canvas.logicalWidth;
    const h = canvas.logicalHeight;
    const centerX = w / 2;
    const centerY = h / 2;

    // Determine Quadrant / Type
    // Top-Left: Killer (x < center, y < center)
    // Top-Right: Achiever (x > center, y < center)
    // Bottom-Left: Socializer (x < center, y > center)
    // Bottom-Right: Explorer (x > center, y > center)

    let type = '';
    let color = '';

    if (y < centerY) { // Top (Acting)
        if (x < centerX) { // Left (Players)
            type = 'killer';
            color = colors.killer;
        } else { // Right (World)
            type = 'achiever';
            color = colors.achiever;
        }
    } else { // Bottom (Interacting)
        if (x < centerX) { // Left (Players)
            type = 'socializer';
            color = colors.socializer;
        } else { // Right (World)
            type = 'explorer';
            color = colors.explorer;
        }
    }

    currentPos = { x, y, color };
    drawChart();
    updateUI(type);
});

function updateUI(typeKey) {
    const data = types[typeKey];

    // Update Result Box
    const titleEl = document.getElementById('type-title');
    const descEl = document.getElementById('type-desc');
    const box = document.getElementById('result-display');

    titleEl.textContent = data.name;
    titleEl.style.color = colors[typeKey];
    descEl.textContent = data.desc;

    box.style.borderColor = colors[typeKey];
    box.style.boxShadow = `0 0 20px -5px ${colors[typeKey]} `;

    // Show Save Button
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.classList.remove('hidden');
    }

    // Update Info Cards Highlight
    infoCards.forEach(card => {
        card.classList.remove('mobile-highlight');
        // Reset Opacity (optional, or just use scale)
        card.style.opacity = '0.5';

        if (card.dataset.type === typeKey) {
            card.classList.add('mobile-highlight');
            card.style.opacity = '1';
        }
    });
}

// Image Saving
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.addEventListener('click', saveImage);
}

function saveImage() {
    // Create a temporary canvas to composite elements (cleaner export)
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Size matches the current high-res canvas (logical * dpr is actual width in pixels)
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Fill Background
    tempCtx.fillStyle = '#0f172a'; // Dark blue background
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the main chart
    tempCtx.drawImage(canvas, 0, 0);

    // Add Labels manually
    // Scale font size based on canvas width to ensure readability on high-res
    const scale = tempCanvas.width / 1500; // base scale
    const fontSize = Math.max(24, 40 * scale);

    tempCtx.font = `bold ${fontSize}px "Noto Sans KR", sans-serif`;
    tempCtx.fillStyle = 'rgba(255,255,255,0.7)';
    tempCtx.textAlign = 'center';

    const w = tempCanvas.width;
    const h = tempCanvas.height;

    // Axis Labels
    tempCtx.fillText('ACTING (행동)', w / 2, 60 * scale + 40);
    tempCtx.fillText('INTERACTING (상호작용)', w / 2, h - (40 * scale + 20));

    tempCtx.save();
    tempCtx.translate(60 * scale + 20, h / 2);
    tempCtx.rotate(-Math.PI / 2);
    tempCtx.fillText('PLAYERS (플레이어)', 0, 0);
    tempCtx.restore();

    tempCtx.save();
    tempCtx.translate(w - (60 * scale + 20), h / 2);
    tempCtx.rotate(Math.PI / 2);
    tempCtx.fillText('WORLD (세계)', 0, 0);
    tempCtx.restore();

    // If result exists, draw it bigger
    if (currentPos) {
        // Find current type
        const cx = canvas.logicalWidth / 2;
        const cy = canvas.logicalHeight / 2;
        let typeName = '';

        if (currentPos.y < cy) {
            typeName = (currentPos.x < cx) ? 'KILLER' : 'ACHIEVER';
        } else {
            typeName = (currentPos.x < cx) ? 'SOCIALIZER' : 'EXPLORER';
        }

        const bigFontSize = Math.max(60, 100 * scale);
        tempCtx.font = `900 ${bigFontSize}px "Noto Sans KR", sans-serif`;
        tempCtx.fillStyle = '#ffffff';
        tempCtx.textAlign = 'center';
        tempCtx.shadowColor = 'rgba(0,0,0,0.5)';
        tempCtx.shadowBlur = 20;
        tempCtx.fillText(typeName, w / 2, h - (bigFontSize + 50));
    }

    // Trigger Download
    const link = document.createElement('a');
    link.download = `bartle-test-result-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
}

// Init
setTimeout(resizeCanvas, 100);
