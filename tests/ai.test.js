import { describe, assert, assertEqual } from './test-runner.js';
import { BOARD_SIZE, key } from '../src/constants.js';
import { allSunk, createBoard, fireAt, placeShip, randomPlacement } from '../src/board.js';
import { createBrain } from '../src/ai.js';

const BATTLESHIP = { name: 'Battleship', size: 4 };

/** Play the AI against a board until the fleet is sunk, collecting its shots. */
function playOut(board, limit = 100) {
  const brain = createBrain();
  const shots = [];
  while (!allSunk(board)) {
    const target = brain.chooseShot(board);
    assert(target, 'AI always finds a legal target while ships remain');
    const shot = fireAt(board, target.row, target.col);
    assert(shot, `AI fired an illegal shot at ${target.row},${target.col}`);
    brain.onResult(board, shot);
    shots.push(target);
    assert(shots.length <= limit, `AI needed more than ${limit} shots`);
  }
  return shots;
}

describe('AI shot selection', (it) => {
  it('never fires at the same cell twice', () => {
    for (let game = 0; game < 30; game++) {
      const shots = playOut(randomPlacement(createBoard()));
      const seen = new Set(shots.map((shot) => key(shot.row, shot.col)));
      assertEqual(seen.size, shots.length, 'every shot is a fresh cell');
    }
  });

  it('only fires inside the board', () => {
    for (const shot of playOut(randomPlacement(createBoard()))) {
      assert(shot.row >= 0 && shot.row < BOARD_SIZE, 'row in bounds');
      assert(shot.col >= 0 && shot.col < BOARD_SIZE, 'col in bounds');
    }
  });

  it('hunts on the parity lattice before any hit', () => {
    const board = createBoard();
    placeShip(board, BATTLESHIP, 0, 0, 'h');
    const brain = createBrain();
    for (let shot = 0; shot < 20; shot++) {
      const target = brain.chooseShot(board);
      assertEqual((target.row + target.col) % 2, 0, 'parity cell');
      const result = fireAt(board, target.row, target.col);
      brain.onResult(board, result);
      if (result.result === 'hit') return;
    }
  });

  it('targets neighbours of a hit and follows the ship line', () => {
    const board = createBoard();
    placeShip(board, BATTLESHIP, 4, 3, 'h');
    const brain = createBrain();

    brain.onResult(board, fireAt(board, 4, 4));
    const firstTarget = brain.chooseShot(board);
    assertEqual(
      Math.abs(firstTarget.row - 4) + Math.abs(firstTarget.col - 4),
      1,
      'first target is adjacent to the hit',
    );

    brain.onResult(board, fireAt(board, 4, 5));
    const lineTarget = brain.chooseShot(board);
    assertEqual(lineTarget.row, 4, 'stays on the row once two hits line up');
    assert([3, 6].includes(lineTarget.col), 'extends one of the open ends');
  });

  it('does not merge two ships that share a row into one line', () => {
    const board = createBoard();
    placeShip(board, { name: 'Destroyer', size: 2 }, 5, 0, 'h');
    placeShip(board, { name: 'Cruiser', size: 3 }, 5, 5, 'h');
    const brain = createBrain();
    brain.onResult(board, fireAt(board, 5, 0));
    brain.onResult(board, fireAt(board, 5, 5));
    const targets = brain.memory.targets.map((cell) => key(cell.row, cell.col));
    assert(targets.includes(key(4, 0)), 'still probes around the first hit');
    assert(!targets.includes(key(5, 2)), 'no gap cell between the two ships');
  });

  it('returns to hunting after a ship sinks', () => {
    const board = createBoard();
    placeShip(board, { name: 'Destroyer', size: 2 }, 0, 0, 'h');
    placeShip(board, BATTLESHIP, 9, 6, 'h');
    const brain = createBrain();
    brain.onResult(board, fireAt(board, 0, 0));
    brain.onResult(board, fireAt(board, 0, 1));
    assertEqual(brain.memory.hits.length, 0, 'sunk ship is forgotten');
    assertEqual(brain.memory.targets.length, 0, 'target queue is cleared');
  });

  it('beats a random searcher on average', () => {
    let total = 0;
    const games = 40;
    for (let game = 0; game < games; game++) {
      total += playOut(randomPlacement(createBoard())).length;
    }
    assert(total / games < 75, `average ${total / games} shots should beat random search`);
  });
});
