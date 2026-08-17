import { describe, assert, assertEqual } from './test-runner.js';
import { BOARD_SIZE, FLEET, key } from '../src/constants.js';
import {
  allSunk,
  canPlace,
  createBoard,
  fireAt,
  isSunk,
  placeShip,
  randomPlacement,
  shipsRemaining,
  shotAt,
} from '../src/board.js';

const CARRIER = { name: 'Carrier', size: 5 };
const DESTROYER = { name: 'Destroyer', size: 2 };

describe('placement validation', (it) => {
  it('accepts a ship that fits on empty water', () => {
    const board = createBoard();
    assert(placeShip(board, CARRIER, 0, 0, 'h'));
    assertEqual(board.ships.length, 1);
    assertEqual(board.ships[0].cells.length, 5);
  });

  it('rejects a ship running off the right edge', () => {
    const board = createBoard();
    assert(!canPlace(board, 0, BOARD_SIZE - 2, CARRIER.size, 'h'));
    assert(!placeShip(board, CARRIER, 0, BOARD_SIZE - 2, 'h'));
    assertEqual(board.ships.length, 0);
  });

  it('rejects a ship running off the bottom edge', () => {
    const board = createBoard();
    assert(!placeShip(board, CARRIER, BOARD_SIZE - 1, 0, 'v'));
    assertEqual(board.ships.length, 0);
  });

  it('rejects overlapping ships', () => {
    const board = createBoard();
    placeShip(board, CARRIER, 4, 0, 'h');
    assert(!placeShip(board, DESTROYER, 4, 3, 'h'), 'overlap on the same row');
    assert(!placeShip(board, DESTROYER, 3, 2, 'v'), 'overlap crossing the carrier');
    assert(placeShip(board, DESTROYER, 5, 0, 'h'), 'adjacent placement is allowed');
  });

  it('places the whole fleet randomly without overlaps', () => {
    for (let attempt = 0; attempt < 50; attempt++) {
      const board = randomPlacement(createBoard());
      assertEqual(board.ships.length, FLEET.length);
      const cells = new Set();
      for (const ship of board.ships) {
        assertEqual(ship.cells.length, ship.size);
        for (const cell of ship.cells) {
          assert(cell.row >= 0 && cell.row < BOARD_SIZE, 'row in bounds');
          assert(cell.col >= 0 && cell.col < BOARD_SIZE, 'col in bounds');
          assert(!cells.has(key(cell.row, cell.col)), 'no overlap');
          cells.add(key(cell.row, cell.col));
        }
      }
    }
  });
});

describe('firing', (it) => {
  it('reports a miss on empty water', () => {
    const board = createBoard();
    placeShip(board, DESTROYER, 0, 0, 'h');
    const shot = fireAt(board, 5, 5);
    assertEqual(shot.result, 'miss');
    assertEqual(shot.ship, null);
    assertEqual(shotAt(board, 5, 5), 'miss');
  });

  it('reports a hit and names the sunk ship', () => {
    const board = createBoard();
    placeShip(board, DESTROYER, 2, 2, 'h');
    const first = fireAt(board, 2, 2);
    assertEqual(first.result, 'hit');
    assert(!first.sunk, 'not sunk after one hit');
    const second = fireAt(board, 2, 3);
    assert(second.sunk, 'sunk after both cells hit');
    assertEqual(second.ship.name, 'Destroyer');
    assert(isSunk(board.ships[0]));
  });

  it('refuses a repeated or off-board shot', () => {
    const board = createBoard();
    fireAt(board, 1, 1);
    assertEqual(fireAt(board, 1, 1), null);
    assertEqual(fireAt(board, -1, 0), null);
    assertEqual(fireAt(board, 0, BOARD_SIZE), null);
    assertEqual(board.shots.size, 1);
  });

  it('tracks remaining ships and detects a cleared board', () => {
    const board = createBoard();
    placeShip(board, DESTROYER, 0, 0, 'h');
    placeShip(board, CARRIER, 2, 0, 'h');
    assertEqual(shipsRemaining(board), 2);
    fireAt(board, 0, 0);
    fireAt(board, 0, 1);
    assertEqual(shipsRemaining(board), 1);
    assert(!allSunk(board));
    for (let col = 0; col < CARRIER.size; col++) fireAt(board, 2, col);
    assertEqual(shipsRemaining(board), 0);
    assert(allSunk(board));
  });

  it('does not treat an empty board as fully sunk', () => {
    assert(!allSunk(createBoard()));
  });
});
