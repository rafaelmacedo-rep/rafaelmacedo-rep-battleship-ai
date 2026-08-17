export const BOARD_SIZE = 10;

export const FLEET = [
  { name: 'Carrier', size: 5 },
  { name: 'Battleship', size: 4 },
  { name: 'Cruiser', size: 3 },
  { name: 'Submarine', size: 3 },
  { name: 'Destroyer', size: 2 },
];

export const TOTAL_SHIP_CELLS = FLEET.reduce((sum, ship) => sum + ship.size, 0);

export const HORIZONTAL = 'h';
export const VERTICAL = 'v';

export const MISS = 'miss';
export const HIT = 'hit';

/** Column letters A..J, rows are 1-based: "B4". */
export function cellName(row, col) {
  return String.fromCharCode(65 + col) + (row + 1);
}

export function key(row, col) {
  return row + ',' + col;
}

export function inBounds(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}
