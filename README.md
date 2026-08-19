# MatchUp — Football Team Generator

A modern Angular 20 responsive app for creating fair random teams for friendly football matches.

## Pairing rule
Every player must be paired exactly once.

Examples:
- 2 players → 1 pair
- 4 players → 2 pairs
- 6 players → 3 pairs
- 8 players → 4 pairs
- 10 players → 5 pairs

When teams are generated, each pair is guaranteed to be split: one player goes to Team A and the other to Team B.

## Features
- Add/remove players
- Mandatory one-to-one pairing
- Pairing progress indicator
- Generate button activates only when everyone is paired
- Random team generation
- Regenerate teams while respecting all pairs
- Equal team sizes
- Responsive mobile/desktop UI
- No backend required

## Run
```bash
npm install
npm start
```

## Build
```bash
npm run build
```
