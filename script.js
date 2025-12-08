// Games data is now loaded globally from data.js
// But we will override it with localStorage if available

const bingoBoard = document.getElementById('bingo-board');
const gameListContainer = document.getElementById('game-list');
const generateBtn = document.getElementById('generate-btn');
const modeRandomBtn = document.getElementById('mode-random');
const modeManualBtn = document.getElementById('mode-manual');
const manualGuide = document.getElementById('manual-guide');

// CRUD Elements
const addGameBtn = document.getElementById('add-game-btn');
const gameModal = document.getElementById('game-modal');
const closeModal = document.querySelector('.close-modal');
const gameForm = document.getElementById('game-form');
const modalTitle = document.getElementById('modal-title');

// Form Inputs
const inputId = document.getElementById('game-id');
const inputTitleKr = document.getElementById('title-kr');
const inputTitleEn = document.getElementById('title-en');
// Simplified form: Release and Platform not used in inputs anymore


let currentBingoGames = [];
let markedIndices = new Set();
let isManualMode = false;
let draggedGameId = null;

// Dynamic Games List
let allGames = [];

// Initialize
function init() {
    loadGames();
    renderGameList();
    setupEventListeners();
    // Initial State: Random Mode
    setMode(false);
}

function loadGames() {
    const saved = localStorage.getItem('bingoGames');
    if (saved) {
        allGames = JSON.parse(saved);
    } else {
        // Initial load from data.js default
        // Ensure 'games' is defined in data.js
        if (typeof games !== 'undefined') {
            allGames = JSON.parse(JSON.stringify(games));
            saveGames();
        } else {
            console.error("Default games data not found!");
            allGames = [];
        }
    }
}

function saveGames() {
    localStorage.setItem('bingoGames', JSON.stringify(allGames));
}

function setupEventListeners() {
    generateBtn.addEventListener('click', handleGenerateClick);
    modeRandomBtn.addEventListener('click', () => setMode(false));
    modeManualBtn.addEventListener('click', () => setMode(true));

    // CRUD Event Listeners
    addGameBtn.addEventListener('click', openAddModal);
    closeModal.addEventListener('click', closeGameModal);
    gameForm.addEventListener('submit', handleFormSubmit);

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === gameModal) closeGameModal();
    });
}

// --- CRUD Functions ---

function openAddModal() {
    modalTitle.innerText = "게임 추가 (Add Game)";
    gameForm.reset();
    document.getElementById('game-id').value = '';
    gameModal.classList.remove('hidden');
}

function openEditModal(id) {
    const game = allGames.find(g => g.id === id);
    if (!game) return;

    modalTitle.innerText = "게임 수정 (Edit Game)";
    inputId.value = game.id;
    inputTitleKr.value = game.titleKr;
    inputTitleEn.value = game.title;
    // Release and Platform are preserved but not shown

    gameModal.classList.remove('hidden');
}

function closeGameModal() {
    gameModal.classList.add('hidden');
}

function handleFormSubmit(e) {
    e.preventDefault();

    const id = inputId.value ? parseInt(inputId.value) : Date.now();

    // Retrieve existing game to preserve hidden fields if editing
    const existingGame = allGames.find(g => g.id === id);

    const newGame = {
        id: id,
        titleKr: inputTitleKr.value,
        title: inputTitleEn.value,
        // Default values for simplified form
        release: existingGame ? existingGame.release : "2025 (TBD)",
        platform: existingGame ? existingGame.platform : "Both"
    };

    if (inputId.value) {
        // Edit existing
        const idx = allGames.findIndex(g => g.id === id);
        if (idx !== -1) {
            allGames[idx] = newGame;
        }
    } else {
        // Add new
        allGames.push(newGame);
    }

    saveGames();
    renderGameList();

    // If we edited a game currently on board, refresh board
    if (currentBingoGames.some(g => g && g.id === id)) {
        // Update the reference in currentBingoGames
        currentBingoGames = currentBingoGames.map(g => (g && g.id === id) ? newGame : g);
        renderBoard();
    }

    closeGameModal();
}

function deleteGame(id) {
    if (!confirm('정말 삭제하시겠습니까? (Are you sure?)')) return;

    allGames = allGames.filter(g => g.id !== id);
    saveGames();

    // Remove from board if present
    const boardIdx = currentBingoGames.findIndex(g => g && g.id === id);
    if (boardIdx !== -1) {
        currentBingoGames[boardIdx] = null;
        renderBoard();
    }

    renderGameList();
}


function setMode(manual) {
    isManualMode = manual;

    // UI Updates
    if (manual) {
        modeManualBtn.classList.add('active');
        modeRandomBtn.classList.remove('active');
        generateBtn.innerHTML = '<span class="icon">🗑️</span> 보드 초기화 (Clear)';
        generateBtn.classList.add('btn-danger');
        if (manualGuide) manualGuide.classList.remove('hidden');
        enableDragAndDrop(true);
    } else {
        modeRandomBtn.classList.add('active');
        modeManualBtn.classList.remove('active');
        generateBtn.innerHTML = '<span class="icon">🎲</span> 랜덤 생성 (Random)';
        generateBtn.classList.remove('btn-danger');
        if (manualGuide) manualGuide.classList.add('hidden');
        enableDragAndDrop(false);
    }

    // Reset Board on Mode Switch to prevent conflicts
    clearBoard();
    if (!manual) {
        generateBingo(); // Auto-generate for random mode convenience
    } else {
        renderBoard(); // Render empty board for manual
    }
}

function handleGenerateClick() {
    if (isManualMode) {
        clearBoard();
        renderBoard(); // Re-render empty
    } else {
        generateBingo();
    }
}

// Render the full list of games on the side
function renderGameList() {
    gameListContainer.innerHTML = '';

    // Sort games by release date descending (latest first)
    const sortedGames = [...allGames].sort((a, b) => {
        return new Date(b.release) - new Date(a.release);
    });

    sortedGames.forEach(game => {
        const item = document.createElement('div');
        item.className = 'game-item';
        item.draggable = isManualMode; // Set draggable based on mode
        item.dataset.id = game.id;

        const actions = document.createElement('div');
        actions.className = 'item-actions';
        actions.innerHTML = `
            <button class="btn-sm btn-edit" title="수정">✏️</button>
            <button class="btn-sm btn-delete" title="삭제">🗑️</button>
        `;

        // Action Event Listeners
        actions.querySelector('.btn-edit').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent drag start or other clicks
            openEditModal(game.id);
        });
        actions.querySelector('.btn-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteGame(game.id);
        });

        const info = document.createElement('div');
        info.className = 'game-info';
        info.innerHTML = `
            <span class="game-title-kr">${game.titleKr}</span>
            <span class="game-title-en">${game.title}</span>
        `;

        item.appendChild(info);
        item.appendChild(actions);


        // Drag Events
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);

        gameListContainer.appendChild(item);
    });

    updateUsedGameList();
}

function enableDragAndDrop(enabled) {
    const items = document.querySelectorAll('.game-item');
    items.forEach(item => {
        item.draggable = enabled;
        // Visual feedback for already used items handled in render
    });
}


// --- Drag and Drop Handlers ---

function handleDragStart(e) {
    if (!isManualMode) {
        e.preventDefault();
        return;
    }
    draggedGameId = parseInt(this.dataset.id);
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', draggedGameId);
    e.dataTransfer.effectAllowed = 'copy';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedGameId = null;

    // Clean up drag-over classes
    document.querySelectorAll('.bingo-cell').forEach(cell => cell.classList.remove('drag-over'));
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'copy';
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');

    if (!isManualMode || !draggedGameId) return;

    const cellIndex = parseInt(this.dataset.index);
    const game = allGames.find(g => g.id === draggedGameId);

    if (game) {
        // Update data
        currentBingoGames[cellIndex] = game;
        // Re-render this cell
        renderCell(this, game);
        updateUsedGameList();
    }
}


function updateUsedGameList() {
    // Check if currentBingoGames has elements before mapping
    const usedIds = new Set(currentBingoGames.filter(g => g).map(g => g.id));
    const listItems = document.querySelectorAll('.game-item');
    listItems.forEach(item => {
        const id = parseInt(item.dataset.id);
        if (usedIds.has(id)) {
            item.classList.add('used');
        } else {
            item.classList.remove('used');
        }
    });
}


// --- Core Bingo Functions ---

function clearBoard() {
    markedIndices.clear();
    currentBingoGames = new Array(16).fill(null); // Initialize with nulls
    bingoBoard.innerHTML = '';

    // Reset used list visuals
    updateUsedGameList();
}

// Generate a new random bingo board
function generateBingo() {
    clearBoard();

    // Shuffle and pick 16 games
    const shuffled = [...allGames].sort(() => 0.5 - Math.random());
    currentBingoGames = shuffled.slice(0, 16);

    renderBoard();
}

// Render the 4x4 grid
function renderBoard() {
    bingoBoard.innerHTML = '';

    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'bingo-cell';
        cell.dataset.index = i;

        const game = currentBingoGames[i];
        if (game) {
            renderCell(cell, game);
        } else {
            cell.innerHTML = '<span style="opacity:0.3">+</span>';
        }

        cell.addEventListener('click', () => handleCellClick(i, cell));

        // Drop Listeners for Manual Mode
        cell.addEventListener('dragover', handleDragOver);
        cell.addEventListener('dragleave', handleDragLeave);
        cell.addEventListener('drop', handleDrop);

        bingoBoard.appendChild(cell);
    }

    updateUsedGameList();
}

function renderCell(cellElement, game) {
    cellElement.innerHTML = `
        <div class="cell-title">${game.titleKr}</div>
    `;
}

// Handle cell click (toggle mark)
function handleCellClick(index, cellElement) {
    // Only allow marking if cell has a game
    if (!currentBingoGames[index]) return;

    if (markedIndices.has(index)) {
        markedIndices.delete(index);
        cellElement.classList.remove('marked');
    } else {
        markedIndices.add(index);
        cellElement.classList.add('marked');
        checkWin();
    }
}

// Check for bingo (4 in a row/col/diag)
function checkWin() {
    const wins = [
        // Rows
        [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
        // Cols
        [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
        // Diagonals
        [0, 5, 10, 15], [3, 6, 9, 12]
    ];

    let bingoCount = 0;
    wins.forEach(pattern => {
        if (pattern.every(idx => markedIndices.has(idx))) {
            bingoCount++;
        }
    });

    if (bingoCount > 0) {
        console.log(`BINGO! ${bingoCount} lines completed.`);
        bingoBoard.style.boxShadow = `0 0 50px ${bingoCount * 10}px rgba(138, 43, 226, 0.3)`;
        setTimeout(() => {
            bingoBoard.style.boxShadow = '0 20px 50px rgba(0,0,0,0.5)';
        }, 1000);
    }
}

init();
