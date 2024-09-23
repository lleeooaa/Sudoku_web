let selectedCell = null;
let sudokuData = null;
let pencilMarkMode = false;
let startTime = null;
let timerInterval = null;

document.addEventListener('keydown', handleKeyDown);

function togglePencilMarkMode() {
    pencilMarkMode = !pencilMarkMode;
    const pencilMarkButton = document.getElementById('pencil-mark-button');
    pencilMarkButton.textContent = pencilMarkMode ? 'Pencil Mark : On' : 'Pencil Mark : Off';
}

function generateSudoku(difficulty) {
    const n = 9;
    let k;

    switch (difficulty) {
        case 'easy':
            k = 40;
            break;
        case 'medium':
            k = 45;
            break;
        case 'hard':
            k = 50;
            break;
        case 'expert':
            k = 55;
            break;
    }

    sudokuData = generateEmptyBoard(n);
    fillDiagonalBoxes(n);
    fillRemainingCells(0, 3, n);
    removeKDigits(k, n);

    renderSudokuGrid(sudokuData);
    console.log(sudokuData);
    displayMessage('');
    startTimer();
}

function generateEmptyBoard(n) {
    return Array.from({ length: n }, () => Array(n).fill(0));
}

function fillDiagonalBoxes(n) {
    const sqrt = Math.sqrt(n);
    for (let i = 0; i < n; i += sqrt) {
        fillBox(i, i, n);
    }
}

function fillBox(row, col, n) {
    let num;
    const usedNumbers = new Set();

    for (let i = 0; i < Math.sqrt(n); i++) {
        for (let j = 0; j < Math.sqrt(n); j++) {
            do {
                num = Math.floor(Math.random() * n) + 1;
            } while (usedNumbers.has(num));

            usedNumbers.add(num);
            sudokuData[row + i][col + j] = num;
        }
    }
}

function fillRemainingCells(i, j, n) {
    if (j >= n && i < n - 1) {
        i++;
        j = 0;
    }

    if (i >= n && j >= n) return true;

    if (i < Math.sqrt(n)) {
        if (j < Math.sqrt(n)) j = Math.sqrt(n);
    } else if (i < n - Math.sqrt(n)) {
        if (j === Math.floor(i / Math.sqrt(n)) * Math.sqrt(n)) j += Math.sqrt(n);
    } else {
        if (j === n - Math.sqrt(n)) {
            i++;
            j = 0;
            if (i >= n) return true;
        }
    }

    for (let num = 1; num <= n; num++) {
        if (isSafe(sudokuData, i, j, num, n)) {
            sudokuData[i][j] = num;
            if (fillRemainingCells(i, j + 1, n)) return true;
            sudokuData[i][j] = 0;
        }
    }
    return false;
}

function isSafe(board, row, col, num, n) {
    return !usedInRow(board, row, num, n) && !usedInCol(board, col, num, n) && !usedInBox(board, row - row % Math.sqrt(n), col - col % Math.sqrt(n), num, n);
}

function usedInRow(board, row, num) {
    return board[row].includes(num);
}

function usedInCol(board, col, num) {
    return board.some(row => row[col] === num);
}

function usedInBox(board, boxStartRow, boxStartCol, num, n) {
    for (let i = 0; i < Math.sqrt(n); i++) {
        for (let j = 0; j < Math.sqrt(n); j++) {
            if (board[boxStartRow + i][boxStartCol + j] === num) return true;
        }
    }
    return false;
}

function removeKDigits(k,n) {
    let pairsToRemove = Math.floor((k - 10) / 2);

    while (pairsToRemove > 0) {
        let row = getRandomInt(n);
        let col = getRandomInt(n);

        while (sudokuData[row][col] === 0) {
            row = getRandomInt(n);
            col = getRandomInt(n);
        }

        let symRow = n - 1 - row;
        let symCol = n - 1 - col;

        // Ensure symmetry
        if (sudokuData[symRow][symCol] === 0) {
            continue;
        }

        // Backup numbers
        let backup1 = sudokuData[row][col];
        let backup2 = sudokuData[symRow][symCol];

        // Remove numbers
        sudokuData[row][col] = 0;
        sudokuData[symRow][symCol] = 0;

        if (!hasUniqueSolution(n)) {
            // Restore numbers if the solution is not unique
            sudokuData[row][col] = backup1;
            sudokuData[symRow][symCol] = backup2;
        } else {
            pairsToRemove--;
            k -= 2;
        }
    }

    // Remove the remaining K numbers one by one
    while (k >= 0) {
        let row = getRandomInt(n);
        let col = getRandomInt(n);

        while (sudokuData[row][col] === 0) {
            row = getRandomInt(n);
            col = getRandomInt(n);
        }

        let backup = sudokuData[row][col];
        sudokuData[row][col] = 0;

        if (!hasUniqueSolution(n)) {
            sudokuData[row][col] = backup;
        } else {
            k--;
        }
    }
}

function hasUniqueSolution(n) {
    let copy = sudokuData.map(arr => arr.slice());
    let solutions = countSolutions(copy, n);
    return solutions === 1;
}

function countSolutions(board, n) {
    let row = -1;
    let col = -1;
    let isEmpty = true;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (board[i][j] === 0) {
                row = i;
                col = j;
                isEmpty = false;
                break;
            }
        }
        if (!isEmpty) {
            break;
        }
    }

    if (isEmpty) {
        return 1;
    }

    let count = 0;
    for (let num = 1; num <= n; num++) {
        if (isSafe(board, row, col, num, n)) {
            board[row][col] = num;
            count += countSolutions(board, n);
            if (count > 1) {
                break;
            }
            board[row][col] = 0;
        }
    }
    return count;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function renderSudokuGrid(data) {
    const sudokuGrid = document.getElementById('sudoku-grid');
    sudokuGrid.innerHTML = '';
    for (let i = 0; i < data.length; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < data[i].length; j++) {
            const cell = document.createElement('td');
            const value = data[i][j];
            cell.textContent = value === 0 ? '' : value;
            if (value === 0) {
                cell.classList.add('empty');
            } else {
                cell.classList.add('predefined');
            }
            cell.addEventListener('click', selectCell);
            row.appendChild(cell);
        }
        sudokuGrid.appendChild(row);
    }
}

function startTimer() {
    startTime = new Date();
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const elapsedTime = new Date() - startTime;
    const seconds = Math.floor((elapsedTime / 1000) % 60);
    const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
    const hours = Math.floor((elapsedTime / (1000 * 60 * 60)) % 24);
    document.getElementById('timer').textContent = `${hours}:${minutes}:${seconds}`;
}

function stopTimer() {
    clearInterval(timerInterval);
}

function selectCell(event) {
    const target = event.target.closest('td'); // Use closest to handle clicks on pencil marks

    if (selectedCell) {
        clearHighlights();
        selectedCell.classList.remove('selected');
    }
    selectedCell = target;
    selectedCell.classList.add('selected');

    // Only highlight cells with numbers
    if (selectedCell.textContent !== '' && !selectedCell.classList.contains('pencil-mode')) {
        highlightCells(selectedCell);
        highlightSameValues(selectedCell);
    }
}

function fillCell(value) {
    if (selectedCell && selectedCell.classList.contains('empty')) {
        const row = selectedCell.parentElement.rowIndex;
        const col = selectedCell.cellIndex;

        if (pencilMarkMode) {
            togglePencilMark(selectedCell, value);
        } else {
            if (isSafe(sudokuData, row, col, value, 9)) {
                sudokuData[row][col] = value;
                selectedCell.textContent = value;
                selectedCell.classList.remove('pencil-mode'); // Remove pencil mark if cell is filled
                clearPencilMarks(row, col, value);
                clearHighlights();
                selectedCell.classList.remove('selected');
                selectedCell = null;
                displayMessage('');
                checkWin();
            } else {
                displayMessage('Illegal move!');
            }
        }
    }
}

function clearPencilMarks(row, col, value) {
    const sudokuGrid = document.getElementById('sudoku-grid');

    // Clear pencil marks in the row
    for (let i = 0; i < 9; i++) {
        const cell = sudokuGrid.rows[row].cells[i];
        if (cell.classList.contains('pencil-mode')) {
            const subCell = cell.getElementsByClassName('pencil-mark')[value - 1];
            subCell.textContent = '';
        }
    }

    // Clear pencil marks in the column
    for (let i = 0; i < 9; i++) {
        const cell = sudokuGrid.rows[i].cells[col];
        if (cell.classList.contains('pencil-mode')) {
            const subCell = cell.getElementsByClassName('pencil-mark')[value - 1];
            subCell.textContent = '';
        }
    }

    // Clear pencil marks in the 3x3 box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
            const cell = sudokuGrid.rows[i].cells[j];
            if (cell.classList.contains('pencil-mode')) {
                const subCell = cell.getElementsByClassName('pencil-mark')[value - 1];
                subCell.textContent = '';
            }
        }
    }
}

function togglePencilMark(cell, value) {
    if (!cell.classList.contains('pencil-mode')) {
        cell.innerHTML = '';
        cell.classList.add('pencil-mode');
        for (let i = 1; i <= 9; i++) {
            const subCell = document.createElement('div');
            subCell.classList.add('pencil-mark');
            cell.appendChild(subCell);
        }
    }
    const subCells = cell.getElementsByClassName('pencil-mark');
    const subCell = subCells[value - 1];
    subCell.textContent = subCell.textContent === String(value) ? '' : value;
}

function clearCell() {
    if (selectedCell && selectedCell.classList.contains('empty')) {
        const row = selectedCell.parentElement.rowIndex;
        const col = selectedCell.cellIndex;
        sudokuData[row][col] = 0;
        selectedCell.innerHTML = '';
        selectedCell.classList.remove('pencil-mode'); // Remove pencil mark when cell is cleared
        const subCells = selectedCell.getElementsByClassName('pencil-mark');
        for (let subCell of subCells) {
            subCell.textContent = '';
        }
        selectedCell.classList.remove('selected');
        clearHighlights();
        selectedCell = null;
    }
}

function checkWin() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (sudokuData[i][j] === 0) return false;
        }
    }
    if (isWin(sudokuData)) {
        displayMessage('You win!');
        stopTimer();
        return true;
    }
    return false;
}

function isWin(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (!isSafe(board, row, col, board[row][col], 9)) return false;
        }
    }
    return true;
}

function displayMessage(message) {
    const messageContainer = document.getElementById('message-container');
    messageContainer.textContent = message;
}

function highlightCells(cell) {
    const row = cell.parentElement.rowIndex;
    const col = cell.cellIndex;
    const sudokuGrid = document.getElementById('sudoku-grid');

    // Highlight row and column
    for (let i = 0; i < 9; i++) {
        sudokuGrid.rows[row].cells[i].classList.add('highlight');
        sudokuGrid.rows[i].cells[col].classList.add('highlight');
    }

    // Highlight 3x3 box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
            sudokuGrid.rows[i].cells[j].classList.add('highlight');
        }
    }
}

function highlightSameValues(cell) {
    const value = cell.textContent;
    if (value === '') return;

    const sudokuGrid = document.getElementById('sudoku-grid');
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const currentCell = sudokuGrid.rows[i].cells[j];
            if (!currentCell.classList.contains('pencil-mode') && currentCell.textContent === value) {
                highlightCells(currentCell);
            }
        }
    }
}

function clearHighlights() {
    const highlightedCells = document.querySelectorAll('.highlight');
    highlightedCells.forEach(cell => cell.classList.remove('highlight'));
}

function handleKeyDown(event) {
    const key = event.key;

    if (key === 'Shift') {
        //press shift to toggle pencil mode
        togglePencilMarkMode();
    }

    if (key >= '1' && key <= '9') {
        // Check if the key is a number between 1 and 9
        if (selectedCell && selectedCell.classList.contains('empty')) {
            fillCell(parseInt(key));
        }
    } else if (key === 'Backspace' || key === 'Delete') {
        // Clear the cell if Backspace or Delete is pressed
        clearCell();
    }
}
