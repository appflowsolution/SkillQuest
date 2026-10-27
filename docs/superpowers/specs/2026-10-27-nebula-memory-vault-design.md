# Technical Design: Nebula Memory Vault

## 1. Overview & Pedagogical Purpose

**Nebula Memory Vault** is a classic pair-matching memory game reframed as a vault-recovery mission. The learner turns over cosmic symbol capsules stored in a derelict vault and must reunite identical pairs to restore the archive.

The target is **visual working memory and sustained attention**, the executive-function substrate that most other missions in Sector 1 depend on. Every other game in the arcade asks the learner to *do* something (request, wait, imitate); this one asks the learner to *hold and compare* information across time — the prerequisite skill that makes the rest teachable.

### Core Objectives

1. **Visual Working Memory**: Retain the position of a revealed symbol while scanning a deck of 6 to 20 capsules.
2. **Sustained Attention**: Maintain engagement across a full 20-card sweep without escape or off-task behavior.
3. **Rule-Governed Persistence**: Learn that a mismatch is information, not failure — the capsule simply returns to its slot.
4. **Impulse Regulation**: Wait for the second card to resolve before tapping again (the deck locks during comparison).

### Explicit non-goals

- Not a math mission. The symbols carry no numeric meaning.
- Not a duplicate of *Icon Quest Island* (Skill 10). That mission trains prompt tolerance on an AAC grid; this one trains recall. No AAC vocabulary is used, and no hand-over-hand guidance is modeled.
- No competitive scoring against a clock by default. A timer exists for the co-pilot, never as a failure condition.

---

## 2. Architecture & Component Hierarchy

```
App.tsx
 └── MemoryVaultGame.tsx
      ├── Top HUD (Mission Hub / Educational Alignment / Level name / Score / Sound)
      ├── RBT Co-Pilot Bar (only when rbtMode)
      │    ├─ Independent vs Prompted match counters
      │    ├─ Moves + Accuracy readout
      │    ├─ "Peek" modeling button
      │    └─ "Restart Level" / "Skip Level"
      ├── Vault Arena
      │    ├── Capsule Grid (CSS grid, columns derived from level)
      │    └── Capsule (3D flip card: back face = vault seal, front face = symbol)
      └── Overlays
           ├── Level Intro Banner
           ├── Level Cleared panel (stats + continue)
           ├── Mission Complete panel (final stats + return)
           └── Educational Alignment panel
```

New supporting module:

```
src/components/games/MemorySymbolIcon.tsx   → 12 hand-authored SVG glyphs
```

---

## 3. Detailed Component Specifications

### 3.1 Types (`MemoryVaultGame.tsx`)

```typescript
interface MemoryVaultGameProps {
  onExit: () => void;
  rbtMode?: boolean;
}

type SymbolId =
  | 'star' | 'planet' | 'rocket' | 'comet'
  | 'crystal' | 'moon' | 'galaxy' | 'satellite'
  | 'portal' | 'asteroid' | 'nebula' | 'alien';

interface Capsule {
  uid: number;          // unique instance id (React key)
  symbol: SymbolId;     // matching identity
  matched: boolean;
}

interface LevelConfig {
  id: number;
  vault: string;        // narrative name shown in HUD
  pairs: number;
  cols: number;
  rows: number;
}
```

### 3.2 State

| State | Type | Purpose |
|---|---|---|
| `levelIndex` | `number` | 0..3 progression cursor |
| `deck` | `Capsule[]` | Shuffled capsules for the current level |
| `flippedUids` | `number[]` | Currently face-up, unresolved capsules (max 2) |
| `moves` | `number` | Comparison attempts (2-card resolutions) |
| `matchedCount` | `number` | Resolved pairs |
| `score` | `number` | 10 per match + streak bonus |
| `streak` | `number` | Consecutive matches without a miss |
| `isLocked` | `boolean` | Blocks input during mismatch resolution |
| `peekActive` | `boolean` | Co-pilot "Peek" reveals the whole deck |
| `levelCleared` | `boolean` | Level cleared overlay |
| `missionComplete` | `boolean` | Final overlay |
| `independentMatches` | `number` | Matches found without a peek in the current level |
| `promptedMatches` | `number` | Matches found after a peek in the current level |
| `showClinicalInfo` | `boolean` | Educational alignment panel |

### 3.3 Deck Construction

```typescript
function buildDeck(pairs: number): Capsule[] {
  const picks = shuffle(SYMBOL_POOL).slice(0, pairs);
  const deck = [...picks, ...picks].map((symbol, index) => ({
    uid: index,
    symbol,
    matched: false,
  }));
  return shuffle(deck);
}
```

- `pairs` never exceeds the 12-symbol pool, so every level produces distinct symbols with no accidental extra pairs.
- Fisher–Yates shuffle, no `Math.random()` sort comparator.

### 3.4 Resolution Logic

```text
tap(capsule):
  if isLocked or capsule.matched or flippedUids includes capsule.uid → ignore
  if flippedUids.length === 0 → flip, playCardFlip
  else:
    flip second, moves += 1
    if symbols equal:
       mark both matched, matchedCount += 1, streak += 1
       score += 10 + min(streak, 5) * 2
       sound.playPairMatch()
       if all matched → clear level
    else:
       isLocked = true, streak = 0
       sound.playPairMiss()
       after 850 ms: unflip both, isLocked = false
```

Guards that must hold:

- Input is ignored, never queued, while `isLocked` is true.
- A cleared level cannot accept further taps.
- `moves` increments once per comparison, not once per card tap.
- Timers are cleared on unmount and on level restart to prevent state writes after teardown.

### 3.5 Co-Pilot (RBT) Bar

Rendered only when `rbtMode` is true, following the *Chroma Critters Lab* convention.

- **Independent vs Prompted counters**: a match is *Prompted* if a Peek occurred earlier in that level, otherwise *Independent*. The flag resets on level change.
- **Moves / Accuracy**: `Accuracy = round(matchedCount / moves * 100)`, shown as `—` until the first move.
- **Peek**: reveals every unmatched capsule for 1500 ms. The modeling equivalent of a physical prompt.
- **Restart Level**: rebuilds the deck, keeps cumulative score.
- **Skip Level**: advances without scoring, for session time pressure.

### 3.6 Clinical Metadata

| Field | Value |
|---|---|
| `id` | `memory-vault` |
| `sector` | `behavior` |
| `number` | `7` |
| `ribbon` | `MISSION 7` |
| `ribbonColor` | `bg-teal-500 text-white` |
| `skillName` | `Visual Working Memory & Sustained Attention` |
| `skillCode` | `EF 1` (executive function; not an ABA skill number) |
| `skillDescription` | Holding symbol identity and location in mind across turns so the learner can compare a new capsule against a remembered one, while staying on task across a full deck sweep. |
| `gameAlignment` | A 6-to-20 capsule vault where every pair requires recalling a previous reveal. Mismatches resolve without penalty, teaching that a wrong guess is information. The co-pilot bar separates independent recall from prompted (peeked) recall. |

`skillCode: 'EF 1'` is deliberate: no invented ABA skill number. If the clinical team later maps this to a numbered skill, only `games.ts` changes.

### 3.7 Player Modes (1P / 2P)

A segmented selector in the mission bar switches the session between one and two players.

| Mode | Turn rule | Scoring |
|---|---|---|
| **1 Player** | Always the learner | One accumulator, shown in the HUD |
| **2 Players** | A match keeps the turn; a mismatch passes it after the pair re-seals | Two independent accumulators, active player highlighted |

- Changing the mode restarts the current vault and clears both accumulators, so a shared session never starts unbalanced.
- In 2P the HUD marks whose turn it is with a dedicated banner; the waiting player is never blocked from seeing the board.
- The turn passes only after the mismatch animation resolves (850 ms), not on the tap, so the learner sees which pair failed.
- Co-pilot counters stay session-level and are not split per player.

### 3.8 Match Celebration (attention effect)

When a pair resolves, three simultaneous signals fire so the success is impossible to miss:

1. **Localized confetti** — the burst origin is the midpoint between the two capsules' on-screen rects, so it erupts from the pair, not from a fixed corner. Two waves, 130 ms apart.
2. **Card flash** — the matched capsules receive a temporary glow/pulse class for 700 ms on top of their permanent matched styling.
3. **Score popup** — a `+N` badge rises from the matched capsule and fades.

The audio cue (`playPairMatch`) is unchanged. All timers created by the effect are tracked and cleared on unmount and level change.

### 3.9 Level Selector

Four vault buttons in the mission bar jump directly to any level:

- Selection rebuilds the deck, resets per-level stats (moves, matched, peek flag), and keeps session accumulators.
- No unlocking: the RBT may start at the densest vault to calibrate memory load, and level 4 is reachable in one tap instead of three Skip presses.
- The active vault is visually marked and exposed as `aria-pressed`.

### 3.10 Interaction Between the Three Additions

| Combination | Behavior |
|---|---|
| 2P + level selector | Changing level keeps both accumulators and the current active player |
| 2P + Peek | Peek does not pass the turn; it stays a modeling prompt |
| Match FX + 2P | The popup shows the points credited to the player who found the pair |
| Level selector + Peek | Selection clears the prompted flag, so a new vault starts fair |

---

## 4. Level Progression

| Level | Vault | Pairs | Cards | Grid | Working-memory load |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **1** | Docking Bay Alpha | 3 | 6 | 3 × 2 | Immediate recognition |
| **2** | Comet Corridor | 6 | 12 | 4 × 3 | Short-term retention |
| **3** | Nebula Archive | 8 | 16 | 4 × 4 | Comparison across distance |
| **4** | Vault Core | 10 | 20 | 5 × 4 | Full deck retention |

Difficulty rises only in card count. No timer, no lives, no penalty for a mismatch.

---

## 5. Viewport & Tablet Ergonomics (iPad 9th Gen)

- **Primary target**: 1080 × 810 landscape.
- **Guardrail**: 1024 × 768 with **zero horizontal and vertical scroll** (`e2e/layout.spec.ts`).
- **Capsule sizing**: grid uses `grid-template-columns: repeat(cols, minmax(0, 1fr))` via inline style (dynamic column counts cannot rely on purged Tailwind classes). Capsules are `aspect-square` inside a `max-w`-capped arena, so the grid scales down instead of overflowing.
- **Touch targets**: every capsule is at least 64 × 64 px at 1024 × 768. Level 4 (5 columns) is the binding case and is verified by the layout test.
- **Gesture safety**: `select-none`, `touch-action: manipulation`, no text selection or iOS callout during rapid tapping.
- No scroll container: `overflow-hidden` on the root plus a flex column that lets the arena absorb remaining height.

---

## 6. Audio Engine Additions (`src/utils/audio.ts`)

| Method | Behavior |
|---|---|
| `playCardFlip()` | Short filtered noise transient: a capsule unlatching. |
| `playPairMatch()` | Two-note rising chime (perfect fifth) with a sparkle tail. |
| `playPairMiss()` | Soft descending sine, deliberately quiet and non-punitive. |

Reuse existing `playCheer()` for level clear and mission complete, `playTap()` for navigation.

---

## 7. Testing & Verification Plan

### 7.1 `e2e/games.spec.ts`

```text
Navigate to Sector 1 → launch Nebula Memory Vault →
verify level 1 renders 6 capsules →
tap capsule 1 and capsule 2 (both face up) →
assert a resolved state (match or mismatch resolution) within the timeout →
return to Mission Hub and assert Sector 1 is restored.
```

The test must not depend on shuffle order. It asserts structure (capsule count, face-up count, resolution) rather than a specific pair identity.

### 7.2 `e2e/layout.spec.ts`

- At `1180×820`, `1080×810` and `1024×768`: launch the game, assert `document.scrollWidth <= innerWidth` and `scrollHeight <= innerHeight`, and assert every capsule's bounding box is fully inside the viewport at level 4 (the densest grid) once reachable.
- Assert the Sector 1 dashboard still renders 7 cards without horizontal overflow.

### 7.3 `e2e/dashboard.spec.ts`

- Add the new title to the catalog visibility assertions so the 7 behavior missions are all pinned.

### 7.4 Build

- `pnpm run build` must pass with zero TypeScript errors.

---

## 8. Integration Checklist

| File | Change |
|---|---|
| `src/types/index.ts` | add `'memory-vault'` to `GameId` |
| `src/data/games.ts` | seventh `behavior` entry with clinical metadata |
| `src/App.tsx` | import + render branch |
| `src/components/GameCardIllustration.tsx` | `COVER_IMAGES` entry for the WebP cover |
| `src/components/games/MemorySymbolIcon.tsx` | new: 12 SVG glyphs |
| `src/components/games/MemoryVaultGame.tsx` | new: the game |
| `src/utils/audio.ts` | three new methods |
| `e2e/*.spec.ts` | three suites extended |

**Cover art**: the card renders `public/covers/memory-vault.webp` (1200×896, VP8, ~143 KB), supplied for this mission and registered in `COVER_IMAGES`. `VectorGameIllustration` also carries a `case 'memory-vault'` so the card degrades gracefully if the WebP fails to load. No asset is generated by this change; the vector fallback exists only as a safety net.
