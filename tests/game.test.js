import { describe, assert, assertEqual } from './test-runner.js';
import { FLEET } from '../src/constants.js';
import { createBrain } from '../src/ai.js';
import {
  aiFire,
  createGame,
  placePlayerShip,
  placementComplete,
  playerFire,
  randomPlayerPlacement,
  resetPlacement,
  rotate,
  startGame,
} from '../src/game.js';

function startedGame() {
  const state = createGame();
  randomPlayerPlacement(state);
  startGame(state);
  return state;
}

function sinkEveryShip(state, board, fire) {
  for (const ship of [...board.ships]) {
    for (const cell of ship.cells) {
      if (state.phase !== 'playing') return;
      fire(state, cell.row, cell.col);
    }
  }
}

describe('placement phase', (it) => {
  it('places ships in fleet order and gates the start of the game', () => {
    const state = createGame();
    assert(!startGame(state), 'cannot start before the fleet is placed');
    for (const [index, ship] of FLEET.entries()) {
      assert(placePlayerShip(state, index, 0), `placed ${ship.name}`);
    }
    assert(placementComplete(state));
    assert(startGame(state), 'starts once all five ships are placed');
    assertEqual(state.phase, 'playing');
    assertEqual(state.aiBoard.ships.length, FLEET.length);
  });

  it('rotates between horizontal and vertical', () => {
    const state = createGame();
    assertEqual(state.placement.orientation, 'h');
    rotate(state);
    assertEqual(state.placement.orientation, 'v');
    assert(placePlayerShip(state, 0, 0), 'vertical carrier fits from the top row');
    assertEqual(state.playerBoard.ships[0].cells[4].row, 4);
  });

  it('resets placement back to an empty board', () => {
    const state = createGame();
    randomPlayerPlacement(state);
    resetPlacement(state);
    assertEqual(state.playerBoard.ships.length, 0);
    assertEqual(state.placement.nextShipIndex, 0);
    assert(!placementComplete(state));
  });
});

describe('turn order and win detection', (it) => {
  it('hands the turn to the AI after the player fires', () => {
    const state = startedGame();
    assertEqual(state.turn, 'player');
    assert(playerFire(state, 0, 0));
    assertEqual(state.turn, 'ai');
    assertEqual(playerFire(state, 1, 1), null, 'player cannot fire out of turn');
  });

  it('ignores a repeated shot without losing the turn', () => {
    const state = startedGame();
    playerFire(state, 3, 3);
    state.turn = 'player';
    assertEqual(playerFire(state, 3, 3), null);
    assertEqual(state.turn, 'player');
  });

  it('ends the game when the player clears the enemy fleet', () => {
    const state = startedGame();
    sinkEveryShip(state, state.aiBoard, (game, row, col) => {
      playerFire(game, row, col);
      game.turn = 'player';
    });
    assertEqual(state.phase, 'over');
    assertEqual(state.winner, 'player');
    assertEqual(playerFire(state, 9, 9), null, 'no firing after the game ends');
  });

  it('ends the game when the AI clears the player fleet', () => {
    const state = startedGame();
    const brain = createBrain();
    state.turn = 'ai';
    let guard = 0;
    while (state.phase === 'playing' && guard++ < 200) {
      aiFire(state, brain);
      state.turn = 'ai';
    }
    assertEqual(state.phase, 'over');
    assertEqual(state.winner, 'ai');
  });

  it('starts a brand new game from createGame', () => {
    const fresh = createGame();
    assertEqual(fresh.phase, 'placement');
    assertEqual(fresh.winner, null);
    assertEqual(fresh.log.length, 0);
    assertEqual(fresh.playerBoard.shots.size, 0);
    assertEqual(fresh.aiBoard.ships.length, 0);
  });
});
