import { randomShot } from './ai.js';
import {
  aiFire,
  createGame,
  placePlayerShip,
  playerFire,
  randomPlayerPlacement,
  resetPlacement,
  rotate,
  startGame,
} from './game.js';
import { buildBoards, render } from './render.js';

const AI_DELAY_MS = 600;

const elements = {
  playerGrid: document.getElementById('player-grid'),
  aiGrid: document.getElementById('ai-grid'),
  fleetList: document.getElementById('fleet-list'),
  status: document.getElementById('status'),
  remaining: document.getElementById('remaining'),
  log: document.getElementById('log'),
  rotateBtn: document.getElementById('rotate'),
  randomBtn: document.getElementById('random'),
  resetBtn: document.getElementById('reset'),
  startBtn: document.getElementById('start'),
  playAgainBtn: document.getElementById('play-again'),
  orientation: document.getElementById('orientation'),
};

let state = createGame();
let preview = null;

function draw() {
  render(state, elements, preview);
}

function cellFrom(event) {
  const cell = event.target.closest('.cell');
  if (!cell) return null;
  return { row: Number(cell.dataset.row), col: Number(cell.dataset.col) };
}

function takeAiTurn() {
  window.setTimeout(() => {
    aiFire(state, (board) => randomShot(board));
    draw();
  }, AI_DELAY_MS);
}

buildBoards(elements, {
  playerGridClick(event) {
    const cell = cellFrom(event);
    if (cell && placePlayerShip(state, cell.row, cell.col)) draw();
  },
  playerGridHover(event) {
    const cell = cellFrom(event);
    preview = event.type === 'mouseleave' ? null : cell;
    draw();
  },
  aiGridClick(event) {
    const cell = cellFrom(event);
    if (!cell) return;
    if (playerFire(state, cell.row, cell.col)) {
      draw();
      if (state.phase === 'playing') takeAiTurn();
    }
  },
});

elements.rotateBtn.addEventListener('click', () => {
  rotate(state);
  draw();
});
elements.randomBtn.addEventListener('click', () => {
  randomPlayerPlacement(state);
  draw();
});
elements.resetBtn.addEventListener('click', () => {
  resetPlacement(state);
  draw();
});
elements.startBtn.addEventListener('click', () => {
  if (startGame(state)) draw();
});
elements.playAgainBtn.addEventListener('click', () => {
  state = createGame();
  preview = null;
  draw();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'r' || event.key === 'R') {
    if (state.phase === 'placement') {
      rotate(state);
      draw();
    }
  }
});

draw();
