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
    killer: {
        name: '킬러 (Killers)',
        desc: '경쟁과 승리를 즐기며, 다른 플레이어에게 영향을 주는 것을 선호합니다.',
        longDesc: '다른 사람에게 영향력을 행사하는 것을 즐깁니다. 경쟁, 전투, 그리고 승리가 이들의 주된 동기입니다.',
        tags: 'Players + Acting',
        symbol: '♣'
    },
    achiever: {
        name: '성취가 (Achievers)',
        desc: '목표 달성과 성장을 즐기며, 게임 세계 내에서의 성공을 선호합니다.',
        longDesc: '게임 시스템 내에서의 성공을 추구합니다. 포인트 획득, 레벨 업, 장비 수집 등 목표 달성을 중시합니다.',
        tags: 'World + Acting',
        symbol: '♦'
    },
    socializer: {
        name: '사교가 (Socializers)',
        desc: '관계와 소통을 즐기며, 다른 플레이어와의 상호작용을 선호합니다.',
        longDesc: '게임은 사람들과 어울리기 위한 수단입니다. 대화, 협동, 커뮤니티 활동에서 가장 큰 즐거움을 찾습니다.',
        tags: 'Players + Interacting',
        symbol: '♥'
    },
    explorer: {
        name: '탐험가 (Explorers)',
        desc: '발견과 이해를 즐기며, 게임 세계 자체와의 상호작용을 선호합니다.',
        longDesc: '게임 세계의 비밀을 파헤치는 것을 좋아합니다. 맵 탐험, 이스터 에그 발견, 세계관 이해에 몰입합니다.',
        tags: 'World + Interacting',
        symbol: '♠'
    }
};

function drawChart() {
    if (!canvas.logicalWidth) return; // Wait for resize

    const w = canvas.logicalWidth;
    const h = canvas.logicalHeight;
    const centerX = w / 2;
    const centerY = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Draw Background Symbol if currentPos exists
    if (currentPos) {
        // Determine type for symbol
        let typeKey = '';
        if (currentPos.y < centerY) {
            typeKey = (currentPos.x < centerX) ? 'killer' : 'achiever';
        } else {
            typeKey = (currentPos.x < centerX) ? 'socializer' : 'explorer';
        }

        const symbol = types[typeKey].symbol;
        const color = types[typeKey].color || colors[typeKey]; // Fallback to global colors if needed

        ctx.save();
        ctx.font = 'bold 400px sans-serif'; // Large font
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.1; // Low opacity
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, centerX, centerY);
        ctx.restore();
    }

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

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(''); // Korean character split might be better by simple length or extensive logic, but spaces for words
    // For Korean/Mixed text simpler approach:
    let line = '';
    let testLine = '';
    let lineCount = 0;

    // improved for mixed content: split by spaces but handle CJK char by char if needed. 
    // Simple word-break-all style:
    for (let i = 0; i < text.length; i++) {
        testLine = line + text[i];
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && i > 0) {
            ctx.fillText(line, x, y);
            line = text[i];
            y += lineHeight;
            lineCount++;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}

function saveImage() {
    // Create a temporary canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Size: Keep width, extend height significantly for clear separation
    const extraHeight = 450;
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height + extraHeight;
    const w = tempCanvas.width;
    const h = tempCanvas.height;
    const chartH = canvas.height;

    // Fill Background (Main)
    tempCtx.fillStyle = '#0f172a'; // Dark blue background
    tempCtx.fillRect(0, 0, w, h);

    // Draw the main chart
    tempCtx.drawImage(canvas, 0, 0);

    // Draw Divider Area Background (Card style)
    tempCtx.fillStyle = 'rgba(30, 41, 59, 1)';
    tempCtx.fillRect(0, chartH, w, extraHeight);

    // Separator Line
    tempCtx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    tempCtx.lineWidth = 2;
    tempCtx.beginPath();
    tempCtx.moveTo(40, chartH);
    tempCtx.lineTo(w - 40, chartH);
    tempCtx.stroke();

    const scale = tempCanvas.width / 1500;

    // Add Axis Labels (Top section) - Same as before
    const fontSize = Math.max(24, 40 * scale);
    tempCtx.font = `bold ${fontSize}px "Noto Sans KR", sans-serif`;
    tempCtx.fillStyle = 'rgba(255,255,255,0.7)';
    tempCtx.textAlign = 'center';

    tempCtx.fillText('ACTING (행동)', w / 2, 60 * scale + 40);
    tempCtx.fillText('INTERACTING (상호작용)', w / 2, chartH - (40 * scale + 20));

    tempCtx.save();
    tempCtx.translate(60 * scale + 20, chartH / 2);
    tempCtx.rotate(-Math.PI / 2);
    tempCtx.fillText('PLAYERS (플레이어)', 0, 0);
    tempCtx.restore();

    tempCtx.save();
    tempCtx.translate(w - (60 * scale + 20), chartH / 2);
    tempCtx.rotate(Math.PI / 2);
    tempCtx.fillText('WORLD (세계)', 0, 0);
    tempCtx.restore();

    // If result exists
    if (currentPos) {
        // Find current type
        const cx = canvas.logicalWidth / 2;
        const cy = canvas.logicalHeight / 2;
        let typeKey = '';

        if (currentPos.y < cy) {
            typeKey = (currentPos.x < cx) ? 'killer' : 'achiever';
        } else {
            typeKey = (currentPos.x < cx) ? 'socializer' : 'explorer';
        }

        const data = types[typeKey];
        const typeName = data.name;
        const typeTags = data.tags;
        const typeSymbol = data.symbol;
        const typeLongDesc = data.longDesc;
        const mainColor = colors[typeKey];

        // Bottom Section Content
        const bottomCenterY = chartH + (extraHeight / 2);

        // 1. Symbol Icon (Left side or Top center of bottom section?)
        // Let's put it top center of bottom section
        tempCtx.font = `${100 * scale}px sans-serif`;
        tempCtx.fillStyle = mainColor;
        tempCtx.textAlign = 'center';
        tempCtx.fillText(typeSymbol, w / 2, chartH + 100 * scale);

        // 2. Type Name
        const bigFontSize = Math.max(50, 80 * scale);
        tempCtx.font = `900 ${bigFontSize}px "Noto Sans KR", sans-serif`;
        tempCtx.fillStyle = '#ffffff';
        tempCtx.shadowColor = 'rgba(0,0,0,0.5)';
        tempCtx.shadowBlur = 20;
        tempCtx.fillText(typeName, w / 2, chartH + 100 * scale + bigFontSize + 20);
        tempCtx.shadowBlur = 0;

        // 3. Tags
        const tagFontSize = Math.max(20, 30 * scale);
        tempCtx.font = `500 ${tagFontSize}px "Noto Sans KR", sans-serif`;
        tempCtx.fillStyle = '#94a3b8';
        tempCtx.fillText(typeTags, w / 2, chartH + 100 * scale + bigFontSize + tagFontSize + 40);

        // 4. Long Description
        const descFontSize = Math.max(26, 36 * scale);
        tempCtx.font = `400 ${descFontSize}px "Noto Sans KR", sans-serif`;
        tempCtx.fillStyle = '#e2e8f0';
        const lineHeight = descFontSize * 1.6;
        const maxWidth = w * 0.8; // 80% width

        wrapText(tempCtx, typeLongDesc, w / 2, chartH + 100 * scale + bigFontSize + tagFontSize + 120, maxWidth, lineHeight);

        // Footer
        tempCtx.font = `300 ${descFontSize * 0.6}px "Noto Sans KR", sans-serif`;
        tempCtx.fillStyle = '#64748b';
        tempCtx.fillText('바틀의 게이머 유형 테스트', w / 2, h - 30);
    } else {
        // No result selected state
        const descFontSize = Math.max(24, 30 * scale);
        tempCtx.font = `400 ${descFontSize}px "Noto Sans KR", sans-serif`;
        tempCtx.fillStyle = '#94a3b8';
        tempCtx.textAlign = 'center';
        tempCtx.fillText('결과가 선택되지 않았습니다.', w / 2, chartH + extraHeight / 2);
    }

    // Trigger Download
    const link = document.createElement('a');
    link.download = `bartle-test-result-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
}

// Init
setTimeout(resizeCanvas, 100);
