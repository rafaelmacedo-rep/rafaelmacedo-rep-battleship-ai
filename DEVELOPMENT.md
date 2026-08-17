# Development notes — how this game was built with Devin

This project was built as a take-home exercise. The goal was not only to ship a working Battleship game, but to build it the way an engineering team would work with an AI software engineer: plan first, execute in stages, review every change as a pull request, and keep an honest log of what went well and what did not.

All code was written by Devin. My role was the one of an engineering manager / reviewer: defining the brief, approving the plan, reviewing and merging pull requests, testing the game, reporting bugs and taking the administrative actions Devin could not.

## Workflow at a glance

| Stage | What happened | Devin features used | Output |
|---|---|---|---|
| Brief & plan | Single detailed brief; Devin proposed file structure, state/rendering separation, AI strategy and a staged plan before writing any code. Plan approved in the same session. | Session with interactive planning · follow-up messages · live activity panel (Desktop / Shell / Changes views) | Approved plan |
| Repository setup | Devin could not create the repository or enable GitHub Pages: its GitHub app installation token has no permission for those administrative actions. It diagnosed this itself and offered three options (I create the repo and authorize Devin on it; a session-only PAT; a permanent PAT secret). I chose the least-privilege option and created the empty public repo manually. | GitHub integration (Devin GitHub app authorization) · secrets management offered as an option | Public repo, Devin authorized |
| Stage 1 — PR #1 | Core game logic, ship placement and firing UI. Devin asked where I wanted PRs opened (Devin interface, Devin Review or GitHub); I chose GitHub. Before opening the PR, it offered to run an analysis, found 7 issues in its own code and fixed them automatically, then offered the merge. | Branch-based workflow · pull request creation · automated pre-PR analysis and self-fix · Devin Review · merge from the Devin platform (synced with GitHub) | PR #1 merged |
| GitHub Pages | Same permission boundary: I enabled Pages from the repository settings manually and confirmed to Devin, which resumed immediately. | Session follow-up / unblocking | Live game URL |
| Stage 2 — PR #2 | Hunt-and-target AI opponent (parity hunting, adjacent targeting, line following). | Follow-up in the same session · branch + PR · Devin Review · merge | PR #2 merged |
| Understanding the workflow | Noticed PRs shown in different colours; opened a new session just to ask why (green open, purple merged, red closed, grey draft — GitHub's PR states). | Ask Devin (Q&A session about the platform/GitHub) · parallel session | Clarity on PR states |
| Stage 3 — PR #3 | Dependency-free unit tests, README, BUGS.md and an AI targeting fix (two ships sharing a row were being merged into one line), covered by a regression test. | Follow-up in the same session · unit tests · Devin Review · merge | PR #3 merged |
| Verification | Devin offered to play a full game and send a recording as a test. | Browser-based end-to-end testing with recorded playthrough | Recorded playthrough |
| Polish — PR #4 | Placement preview colour on the hovered cell and washed-out disabled cells (CSS specificity issues). | Bug-fix session · branch + PR · Devin Review · merge | PR #4 merged |
| Bug log clean-up | Asked Devin to complete and restructure BUGS.md: recover the 7 early self-fixes, renumber, group by area, add summary and known limitations. | Dedicated session · PR · Devin Review | Complete BUGS.md |
| Documentation | Asked Devin Wiki to generate the full documentation of the project (architecture, state model, rendering, AI strategy, tests) and used it as the reference for the README's architecture section and for my own understanding of the code. | Devin Wiki (auto-generated project documentation) · Ask Devin over the codebase | Project wiki + README architecture section |

## What I observed about working with Devin

- **Visibility while it works.** The right-hand panel let me follow the session live in different views — desktop, shell and file changes — so the work never felt like a black box.
- **Plan before code.** Asking for a plan first and approving it produced a clean, staged delivery and made review easy.
- **Pull requests are the unit of work.** Every stage arrived as a PR. It was interesting to see that PRs can be reviewed and merged inside the Devin platform while remaining fully synchronised with GitHub — and Devin Review organises the diff and explains it, which made review accessible even for a non-engineer.
- **It verifies its own work.** Seven issues were caught and fixed by Devin's own analysis before I ever saw PR #1; later it proactively offered a recorded full-game test, and the AI targeting bug was fixed with a regression test that fails on the old code and passes on the new one.
- **The platform explains itself and the code.** When I did not understand something (PR colours, how the AI decides its next shot), a quick Ask Devin session or the Wiki answered it — the Wiki ended up being how I learned the architecture of the project I "own".
- **Clear boundaries, clear communication.** The two moments Devin was blocked (repository creation, Pages) were both administrative permission boundaries. In each case it explained exactly why, offered alternatives with their trade-offs, and resumed immediately once unblocked. In an enterprise rollout, this is precisely where setup and integration guidance matters most.

## Where to look

- Live game: https://rafaelmacedo-rep.github.io/rafaelmacedo-rep-battleship-ai/
- Bug log: `BUGS.md` (Symptom → Root cause → Fix → How verified)
- Project documentation: Devin Wiki for this repository; architecture summary in the README
- Tests: see README for how to run them
