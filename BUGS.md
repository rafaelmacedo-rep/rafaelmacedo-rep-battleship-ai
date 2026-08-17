# Bug log

Every bug found while building the game, newest first.
Format: **Symptom → Root cause → Fix → How verified**.

## 1. AI could chase a ship line that did not exist

- **Symptom:** when two ships sat in the same row with a gap between them (e.g. a
  Destroyer on row 5 columns 0-1 and a Cruiser on row 5 columns 5-7), the AI stopped
  probing around the hits it had and instead fired at the far ends of the whole row,
  wasting shots on empty water between and beyond the two ships.
- **Root cause:** `lineThrough` in `src/ai.js` grouped hits by *any* shared row or column,
  not by adjacency, so two hits on the same row were treated as one long ship. The target
  queue then only contained `min(col) - 1` and `max(col) + 1` of that fake run, discarding
  the real neighbours of each hit.
- **Fix:** `runThrough` walks outwards from a hit while the next cell is also a hit, so
  only an unbroken run counts as a line; `lineThrough` returns a line just for runs of
  length 2 or more, and isolated hits fall back to their four neighbours.
- **How verified:** added `ai.test.js` case "does not merge two ships that share a row
  into one line", which hits both ships once and asserts the queue still probes around
  the first hit and never contains the gap cell between them. It fails on the old code and
  passes on the fixed code; the 500-game simulation still finishes every game without a
  repeated shot, averaging ~54 shots.

## 2. Log panel had a broken CSS declaration

- **Symptom:** the `.log` block's `max-height` was ignored in the first draft, so a long
  game stretched the side panel instead of scrolling.
- **Root cause:** a stray newline split the declaration (`max-height: 260px` and `;` on
  separate lines), which the browser dropped along with the following `overflow-y` in some
  parses.
- **Fix:** joined the declaration back into `max-height: 260px;` in `styles.css`.
- **How verified:** caught while reviewing the stylesheet before the first commit; after
  the fix, a long game in the browser keeps the log scrolling inside a fixed-height panel
  and the board layout no longer shifts.
