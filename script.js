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
