# Rubik's Cube Simulator

A 3x3 Rubik's cube simulator in the spirit of [Twizzle](https://alpha.twizzle.net/),
built on [cubing.js](https://github.com/cubing/cubing.js). Beyond twisting the
cube, it tells you **exactly how many pieces an algorithm changes** and can
**highlight the changed pieces** on the 3D cube.

## Features

- **3D cube** (`<twisty-player>`) with drag-to-orbit camera.
- **Changed-pieces counter** — compares the current state against the solved
  state and reports, out of the 20 movable pieces:
  - corners/edges **moved** (in the wrong position), and
  - corners **twisted** / edges **flipped** in place (right position, wrong
    orientation).

  The comparison is normalized to the centers, so whole-cube rotations
  (`x y z`) count as zero changes, and slice moves (`M E S`) are counted by
  their true effect relative to the centers (e.g. `M` → 16 changed, because
  relative to the centers it equals `L' R`).
- **Highlight toggle** — dims every unchanged piece so the changed ones stand
  out.
- Move buttons (`U D L R F B M E S x y z`, with `'` and `2` variants),
  free-text algorithm input, Scramble, Undo, and Reset.

## Getting started

```sh
npm install
npm run dev      # development server
npm run build    # type-check + production build
```

## Testing

The core logic (analysis, highlight mask, scramble, app store) was built
test-first with [Vitest](https://vitest.dev/):

```sh
npm test
```

Functional browser tests use [Playwright](https://playwright.dev/) against the
built app. They run on Chrome-for-Testing, installed via
`@puppeteer/browsers` (downloads from `storage.googleapis.com`, with a pinned
fallback build for networks that block the version-lookup endpoint):

```sh
npm run browser:install   # one-time download into .browsers/
npm run test:e2e
```

CI (GitHub Actions) runs the build, unit tests, and functional tests on every
push.

## How the counter works

The cube state is tracked with cubing.js's `KPuzzle` (`EDGES`, `CORNERS`,
`CENTERS` orbits). To compare against solved, the analyzer searches the 24
whole-cube orientations for the one that returns the centers to their home
positions, re-orients the state, and then diffs each corner and edge slot:
a piece is *moved* if the slot holds the wrong piece, and *twisted/flipped*
if it holds the right piece in the wrong orientation. The highlight mask
feeds the same per-piece flags to the player's
`experimentalStickeringMaskOrbits` API (`-` = regular, `D` = dimmed).
