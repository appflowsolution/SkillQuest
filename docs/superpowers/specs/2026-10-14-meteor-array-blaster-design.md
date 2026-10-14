# Technical Design: Meteor Array Blaster

## 1. Overview & Pedagogical Purpose
**Meteor Array Blaster** is an interactive, arcade-style multiplication game designed for elementary students (Grades 1 through 5). Instead of static flashcard quizzes that induce math anxiety, the game models multiplication according to its foundational geometric definition: **rectangular arrays and area models (Rows × Columns)**.

### Core Objectives
1. **Geometric Multiplication**: Visualize multiplication as an array of discrete objects partitioned into horizontal rows and vertical columns ($R \times C$).
2. **Commutative Discovery**: Visually experience that $3 \times 4$ and $4 \times 3$ produce the exact same total area (12 meteors).
3. **Factor Pair Exploration**: Discover alternate factor pairs for composite numbers (e.g. 12 can be cleared with $3 \times 4$, $4 \times 3$, $2 \times 6$, or $6 \times 2$).
4. **Zero Punitive Friction**: Inaccurate calibrations do not subtract lives or punish the player; instead, physical feedback shows the area difference (e.g., "Beam covers 15 cells — Swarm has 12!") and prompts adjustment.

---

## 2. Architecture & Component Hierarchy

```
App.tsx
 └── MeteorArrayGame.tsx
      ├── Top HUD (Mission / Swarm Goal / Back to Mission Hub / Sound / Score)
      ├── Swarm Battle Arena
      │    ├── Meteor Swarm Canvas/SVG (Dynamic Asteroid Grid)
      │    ├── Holographic Matrix Targeting Reticle (Rows × Cols overlay)
      │    ├── Real-time Matrix Math Readout ("R ROWS × C COLS = N CELLS")
      │    └── Particle Blast FX (Confetti & Stardust Vaporization)
      └── Arcade Command Console
           ├── Row Dimension Stepper (- / + Buttons, 1..10)
           ├── Column Dimension Stepper (- / + Buttons, 1..10)
           └── Central Fire Button ("FIRE MATRIX BEAM")
```

---

## 3. Detailed Component Specifications

### 3.1 State Management (`MeteorArrayGame.tsx`)
```typescript
interface LevelData {
  id: number;
  outpost: string;
  targetCount: number;
  suggestedFactors: [number, number]; // e.g. [3, 4]
  hint: string;
}

// Active State
- currentLevelIndex: number (0..9)
- selectedRows: number (1..10, defaults to 1 or 2)
- selectedCols: number (1..10, defaults to 1 or 2)
- isFiring: boolean
- isVaporized: boolean
- feedbackMessage: string | null
- score: number
- streak: number
```

### 3.2 The Holographic Targeting Reticle
- As the user taps `+` or `-` on either Rows or Columns:
  - An SVG or CSS grid highlights in bright cyan/amber over the asteroid field.
  - The grid cell count updates in real-time: `selectedRows * selectedCols`.
  - A frequency-ramped Web Audio tone provides instant auditory confirmation of size change.

### 3.3 Target Swarm & Factor Validation
- Swarm target count is calculated based on level progression.
- Validation logic:
  ```typescript
  const beamArea = selectedRows * selectedCols;
  const isCorrect = beamArea === targetCount;
  ```
- Any combination of factors that equals `targetCount` is strictly accepted.
  - If target is 24: $3 \times 8$, $8 \times 3$, $4 \times 6$, $6 \times 4$, $2 \times 12$ are all 100% valid.

---

## 4. Level Progression (Adaptive Difficulty)

| Wave | Outpost Sector | Target Swarm | Primary Factor Pairs | Grade Alignment |
| :--- | :--- | :---: | :--- | :--- |
| **1** | Lunar Outpost Alpha | **6** | $2 \times 3, 3 \times 2$ | Grade 1-2 (Repeated addition) |
| **2** | Orbital Beacon Delta | **8** | $2 \times 4, 4 \times 2$ | Grade 2 (Doubles & arrays) |
| **3** | Phobos Array Station | **9** | $3 \times 3$ | Grade 2-3 (Square arrays) |
| **4** | Asteroid Belt V | **12** | $3 \times 4, 4 \times 3, 2 \times 6, 6 \times 2$ | Grade 3 (Multiple factor pairs) |
| **5** | Jupiter Jovian Gate | **16** | $4 \times 4, 2 \times 8, 8 \times 2$ | Grade 3 (Square & binary factors) |
| **6** | Europa Deep Ridge | **20** | $4 \times 5, 5 \times 4, 2 \times 10$ | Grade 3 (Base 10 multiples) |
| **7** | Saturn Rings Forge | **24** | $3 \times 8, 4 \times 6, 6 \times 4$ | Grade 3-4 (Rich composite numbers) |
| **8** | Uranus Ion Storm | **30** | $5 \times 6, 6 \times 5, 3 \times 10$ | Grade 4 (Tables of 5 and 6) |
| **9** | Neptune Tritan Core | **36** | $6 \times 6, 4 \times 9, 9 \times 4$ | Grade 4-5 (Advanced arrays) |
| **10** | Kuiper Hyper-Matrix | **48** | $6 \times 8, 8 \times 6$ | Grade 5 (High mastery) |

---

## 5. Viewport & Tablet Ergonomics (iPad 9th Gen)
- **Target Viewport**: 1080 × 810 CSS pixels (Safari landscape on iPad 10.2").
- **Guardrail Viewport**: 1024 × 768 CSS pixels (Strict zero-scroll boundary).
- **Touch Target Sizing**:
  - Row/Column stepper buttons: Minimum 56px × 56px with generous tap padding.
  - Fire Matrix Beam button: Full-width or prominent central pill (height ≥ 64px).
  - Return to Mission Hub: Standard 48px header button in top-left, returning directly to Sector 2 (`math`).

---

## 6. Audio Engine Enhancements (`src/utils/audio.ts`)
1. `playGridStep(product: number)`: Synthesizes a clean sine chirp whose frequency scales proportionally with the grid area ($200\text{Hz} + \min(product \times 15, 600\text{Hz})$).
2. `playLaserBeamSweep()`: Synthesizes a rapid sweeping multi-oscillator beam tone.
3. `playAsteroidVaporize()`: Synthesizes white noise explosion with bandpass resonance and pitch drop.

---

## 7. Testing & Verification Plan
1. **Playwright E2E Suite (`e2e/games.spec.ts`)**:
   - Navigate to Sector 2 (Cosmic Math Quests).
   - Launch *Meteor Array Blaster*.
   - Verify Mission 1 target is 6.
   - Adjust Rows to 2 and Columns to 3 (or vice versa).
   - Tap "FIRE MATRIX BEAM" and verify asteroid vaporization and score increment.
   - Tap "Mission Hub" and assert returning strictly to Sector 2.
2. **Viewport Overflow Guard (`e2e/layout.spec.ts`)**:
   - Verify zero horizontal or vertical scroll across `1180x820`, `1080x810`, and `1024x768`.
3. **Build Check**:
   - `pnpm run build` must compile with 0 TypeScript/ESLint warnings.
