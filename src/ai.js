import { BOARD_SIZE, HIT, inBounds, key } from './constants.js';
import { alreadyFiredAt } from './board.js';

/**
 * Hunt & target opponent.
 *
 * Hunt: fire on the (row + col) % 2 === 0 lattice — no ship of size >= 2 can sit
 * on a board without touching it, so half the cells are enough to find the fleet.
 * Target: after a hit, work through the neighbours of confirmed hits; once two
 * hits line up, only extend along that line until the ship sinks.
 */
export function createAi(random = Math.random) {
  return { random, targets: [], hits: [] };
}

function untriedCells(board, predicate) {
  const cells = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!alreadyFiredAt(board, row, col) && (!predicate || predicate(row, col))) {
        cells.push({ row, col });
      }
    }
  }
  return cells;
}

function pick(cells, random) {
  if (cells.length === 0) return null;
  return cells[Math.floor(random() * cells.length)];
}

function neighbours({ row, col }) {
  return [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 },
  ];
}

/** Hits that line up with `hit` either horizontally or vertically. */
function lineThrough(hits, hit) {
  const sameRow = hits.filter((other) => other.row === hit.row);
  const sameCol = hits.filter((other) => other.col === hit.col);
  if (sameRow.length > 1) return { cells: sameRow, axis: 'row' };
  if (sameCol.length > 1) return { cells: sameCol, axis: 'col' };
  return null;
}

/** Both open ends of a known ship line, e.g. left/right of a horizontal run. */
function lineEnds(line) {
  const { cells, axis } = line;
  if (axis === 'row') {
    const cols = cells.map((cell) => cell.col);
    const row = cells[0].row;
    return [
      { row, col: Math.min(...cols) - 1 },
      { row, col: Math.max(...cols) + 1 },
    ];
  }
  const rows = cells.map((cell) => cell.row);
  const col = cells[0].col;
  return [
    { row: Math.min(...rows) - 1, col },
    { row: Math.max(...rows) + 1, col },
  ];
}

/** Recompute the target queue from the hits that belong to still-floating ships. */
function rebuildTargets(ai, board) {
  const candidates = [];
  for (const hit of ai.hits) {
    const line = lineThrough(ai.hits, hit);
    for (const cell of line ? lineEnds(line) : neighbours(hit)) candidates.push(cell);
  }
  const seen = new Set();
  ai.targets = candidates.filter((cell) => {
    const cellKey = key(cell.row, cell.col);
    if (seen.has(cellKey)) return false;
    seen.add(cellKey);
    return inBounds(cell.row, cell.col) && !alreadyFiredAt(board, cell.row, cell.col);
  });
}

export function chooseShot(ai, board) {
  if (ai.targets.length > 0) {
    const target = ai.targets.shift();
    if (!alreadyFiredAt(board, target.row, target.col)) return target;
    return chooseShot(ai, board);
  }
  const parity = untriedCells(board, (row, col) => (row + col) % 2 === 0);
  return pick(parity.length > 0 ? parity : untriedCells(board), ai.random);
}

/** Feed the outcome of a shot back into the AI's memory. */
export function registerResult(ai, board, shot) {
  if (!shot || shot.result !== HIT) return;
  if (shot.sunk) {
    const sunkKeys = new Set(shot.ship.cells.map((cell) => key(cell.row, cell.col)));
    ai.hits = ai.hits.filter((hit) => !sunkKeys.has(key(hit.row, hit.col)));
  } else {
    ai.hits.push({ row: shot.row, col: shot.col });
  }
  rebuildTargets(ai, board);
}

/** Brain object consumed by `aiFire`. */
export function createBrain(random = Math.random) {
  const ai = createAi(random);
  return {
    memory: ai,
    chooseShot: (board) => chooseShot(ai, board),
    onResult: (board, shot) => registerResult(ai, board, shot),
  };
}
