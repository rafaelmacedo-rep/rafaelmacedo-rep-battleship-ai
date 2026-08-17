# battleship-ai

Browser-based Battleship: you against a "hunt and target" AI opponent. Vanilla HTML, CSS
and JavaScript — no frameworks, no build step, no dependencies.

**Play now:** https://rafaelmacedo-rep.github.io/rafaelmacedo-rep-battleship-ai/

## How to play

1. **Place your fleet.** Click a cell to drop the current ship — the click sets its bow
   (top/left end) and the hover preview shows where it lands (red means it would fall off
   the board or overlap). Use **Rotate** (or the `R` key) to switch between horizontal and
   vertical, **Random placement** to place all five ships at once, and **Reset** to start
   over. **Start game** unlocks once all five ships are on the board.
2. **Fire.** Click a cell on *Enemy waters*. The AI answers about half a second later.
   Each cell can only be fired at once; already-fired cells are not clickable.
3. **Read the state.** Cells are water (unknown), pale (miss), red (hit) or dark red (a
   ship that has been sunk). The status line shows whose turn it is, the counter shows
   ships still afloat on both sides, and the log lists every shot and every sinking.
4. **Win or lose.** Sinking all five enemy ships wins, losing all five loses; the game
   stops accepting shots and **Play again** resets everything, including the AI's memory.

Fleet: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2). Ships may
touch but not overlap, and may not run off the board or sit diagonally.

## Run locally

The code uses ES modules, so it must be served over HTTP (opening `index.html` from the
filesystem is blocked by the browser's module CORS rules):

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Run the tests

Browser (no tooling at all): serve the project as above and open
<http://localhost:8000/tests/tests.html>. Results are printed on the page and to the
console.

Node (same suite, no dependencies):

```bash
node tests/run-node.mjs
```

The runner (`tests/test-runner.js`, ~70 lines) provides `describe` / `it` / `assert` /
`assertEqual` and is the only test infrastructure. Coverage: placement validation
(off-board, overlap, both orientations), hit / miss / sunk detection and ship naming,
repeated and off-board shots being refused, turn order, win and lose detection, full
reset, and AI behaviour (parity hunting, line following, returning to hunt after a sink,
and never firing at the same cell twice).

## Project structure

```
index.html          markup: two boards, controls, status and log panel
styles.css          board and panel styling, responsive down to phone width
src/constants.js    board size, fleet definition, cell keys and A1-style names
src/board.js        pure board model: placement validation, firing, sunk/win checks
src/game.js         game state machine: phases, turn order, logging, win/lose
src/ai.js           hunt and target opponent
src/render.js       renders state into the DOM; contains no game rules
src/main.js         event wiring: click -> logic -> render
tests/              dependency-free test runner and suites
BUGS.md             bug log: symptom, root cause, fix, verification
```

The split is deliberate: `board.js`, `game.js` and `ai.js` never touch the DOM and hold
all the rules, `render.js` only reads state and paints it, and `main.js` is the only place
that listens to events. Data flows one way — event → logic → `render(state)` — so the
tests can drive a whole game without a browser.

## AI strategy

**Hunt.** With no live hits to chase, the AI fires only at cells where
`(row + col) % 2 === 0`. Every ship is at least two cells long, so no ship can hide from
that lattice, and searching half the board finds the whole fleet. Choice among the
remaining lattice cells is uniformly random, so games differ.

**Target.** Each hit on a ship that is still afloat is remembered. The target queue is
rebuilt from those hits: an isolated hit expands into its four orthogonal neighbours, but
as soon as two hits sit next to each other in a row (or column) the AI keeps only the two
open ends of that run and follows the ship's line until it sinks. Only *contiguous* hits
count as a line, so two different ships sharing a row are not mistaken for one long ship.

**After a sink.** The sunk ship's cells are dropped from memory and the queue is rebuilt,
so hits belonging to *another* damaged ship stay in play; the AI goes back to hunting only
when there is nothing left to finish.

**Never repeats a shot.** Candidates are filtered against the board's shot map and
de-duplicated when the queue is rebuilt, and the head of the queue is re-checked before
firing. Result: about 54 shots to clear a fleet, against about 95 for uniform random fire.

## Notable choices

- Click places the ship's bow rather than drag-and-drop: fewer moving parts and it works
  the same on a touch screen.
- The player always fires first.
- No persistence — refreshing starts a new game.
- The AI's shot is delayed 600 ms so the log is readable rather than instant.
- Ships are allowed to touch, which is the standard rule set.
