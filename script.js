const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("statusText");
const resetBtn = document.getElementById("resetBtn");
const board = document.getElementById("board");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");
const twoPlayerBtn = document.getElementById("twoPlayerBtn");
const vsComputerBtn = document.getElementById("vsComputerBtn");

const scores = { X: 0, O: 0, draw: 0 };
let currentPlayer = "X";
let gameOver = false;
let vsComputer = false;

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function updateScoreboard() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
    scoreDraw.textContent = scores.draw;
}

function endGame() {
    gameOver = true;
    board.classList.add("locked");
    updateScoreboard();
}

function checkWinner() {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (
            cells[a].textContent &&
            cells[a].textContent === cells[b].textContent &&
            cells[a].textContent === cells[c].textContent
        ) {
            cells[a].classList.add("winner");
            cells[b].classList.add("winner");
            cells[c].classList.add("winner");
            return cells[a].textContent;
        }
    }
    return null;
}

function checkDraw() {
    return [...cells].every(cell => cell.textContent !== "");
}

function makeMove(cell, index) {
    cell.textContent = currentPlayer;
    cell.classList.add("filled", currentPlayer.toLowerCase());

    const winner = checkWinner();

    if (winner) {
        statusText.textContent = `${winner} wins!`;
        statusText.classList.add("win", winner.toLowerCase());
        scores[winner]++;
        endGame();
        return;
    }

    if (checkDraw()) {
        statusText.textContent = "It's a draw!";
        statusText.classList.add("draw");
        scores.draw++;
        endGame();
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `${currentPlayer}'s turn`;

    if (vsComputer && currentPlayer === "O" && !gameOver) {
        setTimeout(computerMove, 500);
    }
}

// Checks: "if `player` played at `index`, would that win the game?"
function wouldWin(index, player) {
    const original = cells[index].textContent;
    cells[index].textContent = player;

    let result = false;
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (
            cells[a].textContent === player &&
            cells[b].textContent === player &&
            cells[c].textContent === player
        ) {
            result = true;
            break;
        }
    }

    cells[index].textContent = original; // undo the pretend move
    return result;
}

function getBestMove() {
    const emptyIndices = [...cells]
        .map((cell, i) => (cell.textContent === "" ? i : null))
        .filter(i => i !== null);

    // 1. Can O win right now?
    for (let i of emptyIndices) {
        if (wouldWin(i, "O")) return i;
    }

    // 2. Can X win next turn? Block it.
    for (let i of emptyIndices) {
        if (wouldWin(i, "X")) return i;
    }

    // 3. Otherwise, random
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

function computerMove() {
    if (gameOver) return;

    const index = getBestMove();
    const cell = cells[index];
    makeMove(cell, index);
}

cells.forEach(cell => {
    cell.addEventListener("click", () => {
        if (gameOver || cell.textContent !== "") return;
        if (vsComputer && currentPlayer === "O") return;
        makeMove(cell, Number(cell.dataset.index));
    });
});

resetBtn.addEventListener("click", () => {
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("winner", "filled", "x", "o");
    });

    board.classList.remove("locked");
    currentPlayer = "X";
    gameOver = false;
    statusText.textContent = "X's turn";
    statusText.classList.remove("win", "draw", "x", "o");
});

twoPlayerBtn.addEventListener("click", () => {
    vsComputer = false;
    twoPlayerBtn.classList.add("active");
    vsComputerBtn.classList.remove("active");
    resetBtn.click();
});

vsComputerBtn.addEventListener("click", () => {
    vsComputer = true;
    vsComputerBtn.classList.add("active");
    twoPlayerBtn.classList.remove("active");
    resetBtn.click();
});