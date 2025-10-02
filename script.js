// -------- get elements --------
const boardEl = document.getElementById("board");
const pvpBtn = document.getElementById("pvpBtn");
const pvcBtn = document.getElementById("pvcBtn");
const player1Input = document.getElementById("player1");
const player2Input = document.getElementById("player2");
const turnIndicator = document.getElementById("turnIndicator");
const p1NameEl = document.getElementById("p1Name");
const p2NameEl = document.getElementById("p2Name");
const p1ScoreEl = document.getElementById("p1Score");
const p2ScoreEl = document.getElementById("p2Score");
const resetBtn = document.getElementById("resetBtn");
const newGameBtn = document.getElementById("newGameBtn");

// Popup elements (must exist in HTML)
const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popupTitle");
const popupTagline = document.getElementById("popupTagline");
const closePopup = document.getElementById("closePopup");

// -------- game state --------
let gameMode = "pvc"; // "pvc" or "pvp"
let board = Array(9).fill("");
let currentPlayer = "X";
let scores = { p1: 0, p2: 0 };
let gameActive = true;

const winTaglines = [
  "Bragging rights unlocked! 🏆",
  "That’s how it’s done 😎",
  "You nailed it! 🎯",
  "Champion of the grid! ✨"
];

const loseTaglines = [
  "Defeat… but not the end!!",
  "Oof, that was close! 😮",
  "Reset and try again! 🔄",
  "Better luck next time! 💔"
];

// -------- helper utilities --------
const WIN_PATTERNS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function createBoard() {
  boardEl.innerHTML = "";
  board = Array(9).fill("");
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.addEventListener("click", handleMove);
    boardEl.appendChild(cell);
  }
  updateUINames();
  updateTurnIndicator();
}

function handleMove(e) {
  const index = Number(e.target.dataset.index);
  if (!gameActive || board[index] !== "") return;

  board[index] = currentPlayer;
  const cell = boardEl.children[index];
  cell.textContent = currentPlayer;
  cell.classList.add("filled");

  if (checkWin(currentPlayer)) {
    gameActive = false;
    updateScore(currentPlayer);
    const winnerName = getCurrentName();
    const pattern = winningPattern(currentPlayer);
    if (pattern) highlightWin(pattern);
    showPopup(`${winnerName}`);
    return;
  }

  if (board.every(cell => cell !== "")) {
    gameActive = false;
    showDraw();
    return;
  }

  switchTurn();
  if (gameMode === "pvc" && currentPlayer === "O") {
    setTimeout(computerMove, 450);
  }
}

function computerMove() {
  // --- unbeatable AI using minimax ---
  const bestMove = findBestMove(board);
  if (bestMove === null) return;

  board[bestMove] = "O";
  const cell = boardEl.children[bestMove];
  cell.textContent = "O";
  cell.classList.add("filled");

  if (checkWin("O")) {
    gameActive = false;
    updateScore("O");
    const pattern = winningPattern("O");
    if (pattern) highlightWin(pattern);
    showPopup("Computer");
    return;
  }

  if (board.every(cell => cell !== "")) {
    gameActive = false;
    showDraw();
    return;
  }

  switchTurn();
}

function switchTurn() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurnIndicator();
}

function updateTurnIndicator(){
  turnIndicator.textContent = `${getCurrentName()}'s Turn`;
}

function getCurrentName() {
  if (currentPlayer === "X") return player1Input.value.trim() || "P1";
  return (gameMode === "pvp") ? (player2Input.value.trim() || "P2") : "Computer";
}

function checkWin(player) {
  return WIN_PATTERNS.some(pattern => pattern.every(i => board[i] === player));
}

function winningPattern(player) {
  return WIN_PATTERNS.find(pattern => pattern.every(i => board[i] === player));
}

function highlightWin(pattern) {
  if (!pattern) return;
  pattern.forEach(i => {
    const c = boardEl.children[i];
    if (c) c.classList.add("win");
  });
}

function updateScore(player) {
  if (player === "X") {
    scores.p1++;
    p1ScoreEl.textContent = scores.p1;
  } else {
    scores.p2++;
    p2ScoreEl.textContent = scores.p2;
  }
}

function resetGame() {
  scores = { p1: 0, p2: 0 };
  p1ScoreEl.textContent = 0;
  p2ScoreEl.textContent = 0;
  newRound();
}

function newRound() {
  createBoard();
  gameActive = true;
  currentPlayer = "X";
  // ensure names UI is synced
  updateUINames();
  updateTurnIndicator();
}

// -------- popup logic --------
function showPopup(winnerName) {
  popupTitle.textContent = `${winnerName} Wins!`;

  let taglinePool;
  if (winnerName === "Computer" || winnerName === (player2Input.value.trim() || "P2")) {
    taglinePool = loseTaglines;
  } else {
    taglinePool = winTaglines;
  }

  popupTagline.textContent = taglinePool[Math.floor(Math.random() * taglinePool.length)];
  popup.setAttribute("aria-hidden", "false");
  popup.classList.add("visible");
  // keep scores displayed already updated
}

function showDraw() {
  popupTitle.textContent = "Draw!";
  popupTagline.textContent = "Great minds think alike! 🤝";
  popup.setAttribute("aria-hidden", "false");
  popup.classList.add("visible");
}

if (closePopup) {
  closePopup.addEventListener("click", () => {
    popup.setAttribute("aria-hidden", "true");
    popup.classList.remove("visible");
    newRound();
  });
}

// -------- UI & mode handling --------
function updateUINames(){
  p1NameEl.textContent = player1Input.value.trim() || "P1";
  if (gameMode === "pvp") {
    p2NameEl.textContent = player2Input.value.trim() || "P2";
  } else {
    p2NameEl.textContent = "Bot";
  }
}

pvpBtn.addEventListener("click", () => {
  gameMode = "pvp";
  pvpBtn.classList.add("active");
  pvcBtn.classList.remove("active");
  player2Input.disabled = false;
  player2Input.placeholder = "P2";
  p2NameEl.textContent = player2Input.value.trim() || "P2";
  resetGame();
});

pvcBtn.addEventListener("click", () => {
  gameMode = "pvc";
  pvcBtn.classList.add("active");
  pvpBtn.classList.remove("active");
  player2Input.disabled = true;
  player2Input.value = "";
  player2Input.placeholder = "Computer";
  p2NameEl.textContent = "Bot";
  resetGame();
});

resetBtn.addEventListener("click", resetGame);
newGameBtn.addEventListener("click", newRound);

player1Input.addEventListener("input", () => {
  p1NameEl.textContent = player1Input.value.trim() || "P1";
  updateTurnIndicator();
});
player2Input.addEventListener("input", () => {
  if (gameMode === "pvp") {
    p2NameEl.textContent = player2Input.value.trim() || "P2";
    updateTurnIndicator();
  }
});

// -------- AI FUNCTIONS (minimax) --------
function evaluate(b) {
  for (let [a, b2, c] of WIN_PATTERNS) {
    if (b[a] && b[a] === b[b2] && b[a] === b[c]) {
      if (b[a] === "O") return +10;
      else if (b[a] === "X") return -10;
    }
  }
  return 0;
}

function isMovesLeft(b) {
  return b.includes("");
}

function minimax(b, depth, isMax) {
  let score = evaluate(b);
  if (score === 10) return score - depth;
  if (score === -10) return score + depth;
  if (!isMovesLeft(b)) return 0;

  if (isMax) {
    let best = -1000;
    for (let i=0; i<9; i++) {
      if (b[i] === "") {
        b[i] = "O";
        best = Math.max(best, minimax(b, depth+1, false));
        b[i] = "";
      }
    }
    return best;
  } else {
    let best = 1000;
    for (let i=0; i<9; i++) {
      if (b[i] === "") {
        b[i] = "X";
        best = Math.min(best, minimax(b, depth+1, true));
        b[i] = "";
      }
    }
    return best;
  }
}

function findBestMove(b) {
  let bestVal = -1000;
  let bestMove = null;

  for (let i=0; i<9; i++) {
    if (b[i] === "") {
      b[i] = "O";
      let moveVal = minimax(b, 0, false);
      b[i] = "";
      if (moveVal > bestVal) {
        bestMove = i;
        bestVal = moveVal;
      }
    }
  }
  return bestMove;
}

// -------- init --------
createBoard();
p1ScoreEl.textContent = scores.p1;
p2ScoreEl.textContent = scores.p2;
updateUINames();
updateTurnIndicator();
