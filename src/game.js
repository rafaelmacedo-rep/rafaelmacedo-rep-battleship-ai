import { FLEET, HIT, HORIZONTAL, VERTICAL } from './constants.js';
import {
  allSunk,
  createBoard,
  fireAt,
  placeShip,
  randomPlacement,
  shipsRemaining,
} from './board.js';

export function createGame() {
  return {
    phase: 'placement',
    turn: 'player',
    winner: null,
    playerBoard: createBoard(),
    aiBoard: createBoard(),
    placement: { nextShipIndex: 0, orientation: HORIZONTAL },
    log: [],
  };
}

export function nextShipType(state) {
  return FLEET[state.placement.nextShipIndex] || null;
}

export function placementComplete(state) {
  return state.playerBoard.ships.length === FLEET.length;
}

export function rotate(state) {
  state.placement.orientation =
    state.placement.orientation === HORIZONTAL ? VERTICAL : HORIZONTAL;
}

export function log(state, message) {
  state.log.unshift(message);
}

export function placePlayerShip(state, row, col) {
  if (state.phase !== 'placement') return false;
  const shipType = nextShipType(state);
  if (!shipType) return false;
  if (!placeShip(state.playerBoard, shipType, row, col, state.placement.orientation)) {
    return false;
  }
  state.placement.nextShipIndex += 1;
  log(state, `Placed ${shipType.name} (${shipType.size}).`);
  return true;
}

export function randomPlayerPlacement(state, random = Math.random) {
  if (state.phase !== 'placement') return;
  randomPlacement(state.playerBoard, random);
  state.placement.nextShipIndex = FLEET.length;
  log(state, 'Fleet placed randomly.');
}

export function resetPlacement(state) {
  if (state.phase !== 'placement') return;
  state.playerBoard = createBoard();
  state.placement.nextShipIndex = 0;
  log(state, 'Placement reset.');
}

export function startGame(state, random = Math.random) {
  if (state.phase !== 'placement' || !placementComplete(state)) return false;
  randomPlacement(state.aiBoard, random);
  state.phase = 'playing';
  state.turn = 'player';
  log(state, 'Battle started — your turn.');
  return true;
}

function describe(who, shot) {
  const target = shot.result === HIT ? 'hit' : 'miss';
  const sunk = shot.sunk ? ` — ${shot.ship.name} sunk!` : '';
  return `${who} fired ${shot.cell}: ${target}${sunk}`;
}

function endIfWon(state) {
  if (allSunk(state.aiBoard)) {
    state.phase = 'over';
    state.winner = 'player';
    log(state, 'All enemy ships destroyed — you win!');
  } else if (allSunk(state.playerBoard)) {
    state.phase = 'over';
    state.winner = 'ai';
    log(state, 'Your fleet has been destroyed — you lose.');
  }
}

/** Player fires at the AI board. Returns the shot, or null if illegal. */
export function playerFire(state, row, col) {
  if (state.phase !== 'playing' || state.turn !== 'player') return null;
  const shot = fireAt(state.aiBoard, row, col);
  if (!shot) return null;
  log(state, describe('You', shot));
  endIfWon(state);
  if (state.phase === 'playing') state.turn = 'ai';
  return shot;
}

/**
 * AI fires at the player board. `chooseShot(board)` supplies the target;
 * Stage 1 uses a random legal cell, Stage 2 replaces it with hunt & target.
 */
export function aiFire(state, chooseShot) {
  if (state.phase !== 'playing' || state.turn !== 'ai') return null;
  const target = chooseShot(state.playerBoard);
  if (!target) return null;
  const shot = fireAt(state.playerBoard, target.row, target.col);
  if (!shot) return null;
  log(state, describe('Enemy', shot));
  endIfWon(state);
  if (state.phase === 'playing') state.turn = 'player';
  return shot;
}

export function statusText(state) {
  if (state.phase === 'placement') {
    const shipType = nextShipType(state);
    return shipType
      ? `Place your ${shipType.name} (${shipType.size} cells)`
      : 'Fleet ready — press "Start game"';
  }
  if (state.phase === 'over') {
    return state.winner === 'player' ? 'You win!' : 'You lose.';
  }
  return state.turn === 'player' ? 'Your turn — fire at the enemy fleet' : 'Enemy is firing...';
}

export function fleetSummary(state) {
  return {
    player: shipsRemaining(state.playerBoard),
    ai: shipsRemaining(state.aiBoard),
  };
}
