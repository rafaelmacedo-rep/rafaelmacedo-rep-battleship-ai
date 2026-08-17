import { BOARD_SIZE, FLEET, cellName } from './constants.js';
import {
  canPlace,
  isSunkCell,
  shipAt,
  shipCells,
  shotAt,
} from './board.js';
import {
  fleetSummary,
  nextShipType,
  placementComplete,
  statusText,
} from './game.js';

function buildGrid(container, onCellEvent) {
  container.innerHTML = '';
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      cell.setAttribute('aria-label', cellName(row, col));
      container.appendChild(cell);
    }
  }
  container.addEventListener('click', onCellEvent.click);
  if (onCellEvent.hover) {
    container.addEventListener('mouseover', onCellEvent.hover);
    container.addEventListener('mouseleave', onCellEvent.hover);
  }
}

export function buildBoards(elements, handlers) {
  buildGrid(elements.playerGrid, {
    click: handlers.playerGridClick,
    hover: handlers.playerGridHover,
  });
  buildGrid(elements.aiGrid, { click: handlers.aiGridClick });
}

function cellsOf(container) {
  return container.querySelectorAll('.cell');
}

function previewKeys(state, preview) {
  if (state.phase !== 'placement' || !preview) return { keys: new Set(), valid: false };
  const shipType = nextShipType(state);
  if (!shipType) return { keys: new Set(), valid: false };
  const cells = shipCells(preview.row, preview.col, shipType.size, state.placement.orientation);
  const valid = canPlace(
    state.playerBoard,
    preview.row,
    preview.col,
    shipType.size,
    state.placement.orientation,
  );
  return { keys: new Set(cells.map((cell) => cell.row + ',' + cell.col)), valid };
}

function paintPlayerGrid(state, container, preview) {
  const { keys, valid } = previewKeys(state, preview);
  for (const cell of cellsOf(container)) {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const shot = shotAt(state.playerBoard, row, col);
    cell.className = 'cell';
    if (shipAt(state.playerBoard, row, col)) cell.classList.add('ship');
    if (shot === 'miss') cell.classList.add('miss');
    if (shot === 'hit') {
      cell.classList.add(isSunkCell(state.playerBoard, row, col) ? 'sunk' : 'hit');
    }
    if (keys.has(row + ',' + col)) {
      cell.classList.add(valid ? 'preview' : 'preview-invalid');
    }
  }
}

function paintAiGrid(state, container) {
  const playable = state.phase === 'playing' && state.turn === 'player';
  for (const cell of cellsOf(container)) {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const shot = shotAt(state.aiBoard, row, col);
    cell.className = 'cell';
    if (shot === 'miss') cell.classList.add('miss');
    if (shot === 'hit') {
      cell.classList.add(isSunkCell(state.aiBoard, row, col) ? 'sunk' : 'hit');
    }
    cell.disabled = !playable || Boolean(shot);
  }
}

function paintFleetList(state, container) {
  container.innerHTML = '';
  for (const [index, shipType] of FLEET.entries()) {
    const item = document.createElement('li');
    item.textContent = `${shipType.name} (${shipType.size})`;
    if (state.phase === 'placement') {
      if (index < state.playerBoard.ships.length) item.classList.add('placed');
      else if (index === state.placement.nextShipIndex) item.classList.add('current');
    } else {
      const ship = state.playerBoard.ships[index];
      if (ship && ship.hits.size === ship.size) item.classList.add('destroyed');
    }
    container.appendChild(item);
  }
}

export function render(state, elements, preview) {
  paintPlayerGrid(state, elements.playerGrid, preview);
  paintAiGrid(state, elements.aiGrid);
  paintFleetList(state, elements.fleetList);

  elements.status.textContent = statusText(state);
  const remaining = fleetSummary(state);
  elements.remaining.textContent =
    state.phase === 'placement'
      ? ''
      : `Your ships: ${remaining.player}/5 — Enemy ships: ${remaining.ai}/5`;

  elements.log.innerHTML = '';
  for (const entry of state.log.slice(0, 30)) {
    const item = document.createElement('li');
    item.textContent = entry;
    elements.log.appendChild(item);
  }

  const placing = state.phase === 'placement';
  elements.rotateBtn.disabled = !placing || placementComplete(state);
  elements.randomBtn.disabled = !placing;
  elements.resetBtn.disabled = !placing;
  elements.startBtn.disabled = !placing || !placementComplete(state);
  elements.playAgainBtn.hidden = state.phase !== 'over';
  elements.orientation.textContent =
    state.placement.orientation === 'h' ? 'Horizontal' : 'Vertical';
}
