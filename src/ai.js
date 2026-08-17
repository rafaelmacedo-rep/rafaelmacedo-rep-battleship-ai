import { BOARD_SIZE } from './constants.js';
import { alreadyFiredAt } from './board.js';

/**
 * Stage 1 placeholder: pick a uniformly random cell that has not been fired at.
 * Stage 2 replaces this with a parity-based hunt & target strategy.
 */
export function randomShot(board, random = Math.random) {
  const candidates = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!alreadyFiredAt(board, row, col)) candidates.push({ row, col });
    }
  }
  if (candidates.length === 0) return null;
  return candidates[Math.floor(random() * candidates.length)];
}
