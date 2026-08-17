import {
  BOARD_SIZE,
  FLEET,
  HORIZONTAL,
  HIT,
  MISS,
  cellName,
  inBounds,
  key,
} from './constants.js';

export function createBoard() {
  return { ships: [], shots: new Map() };
}

/** Cells a ship of `size` would occupy from (row, col) going right/down. */
export function shipCells(row, col, size, orientation) {
  const cells = [];
  for (let i = 0; i < size; i++) {
    cells.push(
      orientation === HORIZONTAL
        ? { row, col: col + i }
        : { row: row + i, col },
    );
  }
  return cells;
}

export function occupiedKeys(board) {
  const keys = new Set();
  for (const ship of board.ships) {
    for (const cell of ship.cells) keys.add(key(cell.row, cell.col));
  }
  return keys;
}

/** A placement is valid when every cell is on the board and unoccupied. */
export function canPlace(board, row, col, size, orientation) {
  const cells = shipCells(row, col, size, orientation);
  const occupied = occupiedKeys(board);
  return cells.every(
    (cell) => inBounds(cell.row, cell.col) && !occupied.has(key(cell.row, cell.col)),
  );
}

export function placeShip(board, shipType, row, col, orientation) {
  if (!canPlace(board, row, col, shipType.size, orientation)) return false;
  board.ships.push({
    name: shipType.name,
    size: shipType.size,
    orientation,
    cells: shipCells(row, col, shipType.size, orientation),
    hits: new Set(),
  });
  return true;
}

export function shipAt(board, row, col) {
  return (
    board.ships.find((ship) =>
      ship.cells.some((cell) => cell.row === row && cell.col === col),
    ) || null
  );
}

export function isSunk(ship) {
  return ship.hits.size === ship.size;
}

export function allSunk(board) {
  return board.ships.length > 0 && board.ships.every(isSunk);
}

export function alreadyFiredAt(board, row, col) {
  return board.shots.has(key(row, col));
}

/**
 * Fire at a cell. Returns null when the shot is illegal (off-board or repeated),
 * otherwise { result, ship, sunk, cell }.
 */
export function fireAt(board, row, col) {
  if (!inBounds(row, col) || alreadyFiredAt(board, row, col)) return null;
  const ship = shipAt(board, row, col);
  if (!ship) {
    board.shots.set(key(row, col), MISS);
    return { result: MISS, ship: null, sunk: false, cell: cellName(row, col) };
  }
  ship.hits.add(key(row, col));
  board.shots.set(key(row, col), HIT);
  return {
    result: HIT,
    ship,
    sunk: isSunk(ship),
    cell: cellName(row, col),
  };
}

export function shotAt(board, row, col) {
  return board.shots.get(key(row, col)) || null;
}

/** Sunk ships are drawn differently from plain hits. */
export function isSunkCell(board, row, col) {
  const ship = shipAt(board, row, col);
  return Boolean(ship && isSunk(ship));
}

export function shipsRemaining(board) {
  return board.ships.filter((ship) => !isSunk(ship)).length;
}

export function randomPlacement(board, random = Math.random) {
  board.ships = [];
  for (const shipType of FLEET) {
    let placed = false;
    while (!placed) {
      const orientation = random() < 0.5 ? 'h' : 'v';
      const row = Math.floor(random() * BOARD_SIZE);
      const col = Math.floor(random() * BOARD_SIZE);
      placed = placeShip(board, shipType, row, col, orientation);
    }
  }
  return board;
}
