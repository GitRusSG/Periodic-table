# Design Document

## Periodic Table 3D Game

---

## 1. System Architecture Overview

The application is a browser-based single-page application (SPA) with a lightweight backend. The frontend handles all rendering, game logic, and UI. The backend handles persistence, authentication, leaderboards, and trivia question serving.

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  3D Renderer │  │  Mode System │  │   UI Layer       │  │
│  │  (Three.js)  │  │  (Classic /  │  │  (React + CSS)   │  │
│  │              │  │  Trivia /    │  │                  │  │
│  │  Navigator   │  │  Game)       │  │  Inventory / HUD │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         └─────────────────┴──────────────────┘             │
│                     Game State Store                        │
│                  (Zustand / Redux)                          │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS / REST + WebSocket
┌────────────────────────────▼────────────────────────────────┐
│                        Backend (Node.js)                    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Auth_Service │  │Trivia_Engine │  │Progression_Service│  │
│  │  (JWT)       │  │  (Question   │  │  (XP, Mastery,   │  │
│  │              │  │   Store)     │  │   Leaderboard)   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         └─────────────────┴──────────────────┘             │
│                     Data Access Layer                       │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │   PostgreSQL (accounts,      │
              │   progress, leaderboards)    │
              │   + Redis (sessions,         │
              │   leaderboard cache)         │
              └─────────────────────────────┘
```

**Key architectural decisions:**

- All game logic (combat resolution, loot generation, crafting) runs client-side for responsiveness. The backend validates and persists outcomes but does not drive game loop timing.
- Element data (all 118 elements with chemical properties) is bundled as a static JSON asset loaded at startup — no per-element API calls during gameplay.
- WebSocket connection is used only for real-time leaderboard updates. All other communication is REST.

---

## 2. 3D Rendering and Scene Management

### 2.1 Technology

The renderer is built on **Three.js** (r160+). React Three Fiber (R3F) is used as the React integration layer, allowing scene objects to be declared as JSX components and managed within the React component tree.

### 2.2 Scene Structure

```
Scene
├── StarfieldBackground       (static particle system, ~5000 points)
├── PeriodicTableGroup        (parent transform for all 118 elements)
│   ├── ElementMesh[0..117]   (instanced or individual meshes per element)
│   └── GridLines             (faint layout guides, togglable)
├── AmbientLight
├── DirectionalLight
└── CameraRig                 (controlled by Navigator)
```

**Element positioning** follows the standard 18-column × 7-row periodic table layout, with lanthanides and actinides offset below. Each element occupies a fixed grid cell. World-space coordinates are computed from (group, period) at load time.

### 2.3 Difficulty-Level Model Variants

Each element has up to five mesh variants, loaded lazily on demand:

| Level | Model Description | Asset Strategy |
|-------|-------------------|----------------|
| 1 | Sphere with element symbol texture | Single shared geometry, per-element material |
| 2 | Shell rings around nucleus sphere | Procedurally generated per element |
| 3 | Electron cloud (particle system) + isotope toggle | Particle shader, swapped on isotope select |
| 4 | Physics-based subatomic particles with energy state glow | Animated shader, heavier GPU cost |
| 5 | Quantum probability density volume (raymarched shader) | Highest fidelity, loaded on demand |

Lower-level assets are kept in memory after first load. Level 4 and 5 assets are unloaded when the user navigates away from the Element_Viewer to manage memory.

### 2.4 Navigator (Camera Controls)

The Navigator wraps Three.js `OrbitControls` with custom constraints:

- **Zoom**: min distance 5 units (single element close-up), max distance 200 units (full table overview)
- **Pan**: clamped to a bounding box enclosing the full periodic table plus 20% margin
- **Orbit**: full 360° horizontal, ±80° vertical (prevents flipping)
- **Smooth damping**: enabled with factor 0.08 for fluid feel
- Camera updates are applied every animation frame; input events are debounced to 16 ms (≤1 frame at 60 fps)

### 2.5 Performance Targets

- 30 fps minimum on mid-range hardware (integrated GPU, 8 GB RAM)
- 60 fps target on discrete GPU
- Element meshes at Level 1–2 use instanced rendering (single draw call for all 118)
- Level 3–5 meshes are rendered individually but frustum-culled
- Texture atlases used for element symbol labels to minimize draw calls

---

## 3. Element Data Model

All element data is stored in a single static asset: `elements.json`. This file is the single source of truth for both rendering and game logic.

### 3.1 Element Record Schema

```typescript
interface Element {
  // Identity
  atomicNumber: number;          // 1–118
  symbol: string;                // e.g. "Fe"
  name: string;                  // e.g. "Iron"
  
  // Periodic table position
  group: number | null;          // 1–18, null for lanthanides/actinides
  period: number;                // 1–7
  block: "s" | "p" | "d" | "f";
  classification: ElementClassification;
  
  // Physical/chemical properties (used for stat derivation)
  atomicMass: number;            // unified atomic mass units
  density: number | null;        // g/cm³ at STP
  electronegativity: number | null; // Pauling scale
  electronConfiguration: string; // e.g. "[Ar] 3d6 4s2"
  electronShells: number[];      // e.g. [2, 8, 14, 2]
  oxidationStates: number[];
  isotopes: Isotope[];
  ionForms: IonForm[];
  
  // Abundance (drives Loot_Rarity)
  crustalAbundancePpm: number | null;
  cosmicAbundance: number | null;
  isSynthetic: boolean;
  isRadioactive: boolean;
  
  // Game classification
  zone: ZoneType;
  lootRarity: LootRarity;
}

type ElementClassification =
  | "alkali_metal" | "alkaline_earth_metal" | "transition_metal"
  | "post_transition_metal" | "metalloid" | "nonmetal"
  | "halogen" | "noble_gas" | "lanthanide" | "actinide";

type ZoneType = "Passive" | "Combat" | "Neutral" | "Boss" | "Anomalous";

type LootRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

interface Isotope {
  massNumber: number;
  abundance: number | null;  // natural abundance %, null if synthetic
  halfLife: string | null;   // null if stable
}

interface IonForm {
  charge: number;
  notation: string;  // e.g. "Fe²⁺"
}
```

### 3.2 Loot Rarity Assignment Rules

Rarity is pre-computed and stored in `elements.json` using this decision tree:

```
if isSynthetic → Legendary
else if isRadioactive AND atomicNumber >= 89 (actinides) → Epic
else if classification in [lanthanide] → Epic
else if crustalAbundancePpm < 0.005 OR cosmicAbundance < 0.001 → Rare
  (covers Au, Ag, Pt, Ti relative scarcity)
else if crustalAbundancePpm < 50 → Uncommon
  (covers Cu, Zn, Sn, Ni range)
else → Common
  (H, C, O, Si, Fe, Al, Ca, Na, Mg, K, etc.)
```

This produces the intended mapping:
- **Common**: H, He, C, N, O, Na, Mg, Al, Si, P, S, Cl, Ar, K, Ca, Fe, ...
- **Uncommon**: Cu, Zn, Ga, Ge, As, Se, Br, Sn, Sb, Ni, Co, Mn, ...
- **Rare**: Ti, V, Cr, Ag, Cd, In, Au, Hg, Tl, Pb, Bi, Pt, Pd, Ir, Os, Re, ...
- **Epic**: La–Lu (lanthanides), Ac, Th, Pa, U, Np, Pu, Am, Cm, ...
- **Legendary**: Bk, Cf, Es, Fm, Md, No, Lr, Rf–Og (all synthetic transactinides)

---

## 4. Mode System

The mode system is a top-level state machine. Only one mode is active at a time. Mode transitions are explicit user actions (menu selection).

```
         ┌──────────┐
    ┌───▶│  Classic │◀───┐
    │    └──────────┘    │
    │                    │
┌───┴──────┐        ┌────┴─────┐
│  Trivia  │        │   Game   │
└──────────┘        └──────────┘
```

Each mode mounts its own React subtree and registers its own event handlers on the shared 3D scene. The scene itself (starfield, element meshes) is always rendered; modes change what happens when the user interacts with element meshes.

### 4.1 Mode State Interface

```typescript
type ActiveMode = "classic" | "trivia" | "game";

interface ModeState {
  active: ActiveMode;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  // Mode-specific sub-states are owned by each mode's slice
}
```

### 4.2 Classic Mode

Classic mode registers a click handler on element meshes that opens the `ElementViewer` panel. No game state is modified. The `ElementViewer` is a React overlay panel that:

1. Fetches the element record from the in-memory element store
2. Instantiates the appropriate difficulty-level 3D model in an isolated Three.js canvas (not the main scene)
3. Renders the data panel and dropdown controls

### 4.3 Trivia Mode

Trivia mode overlays a question panel on the 3D scene. Element meshes are highlighted as question subjects. The `Trivia_Engine` client module:

1. Requests a question batch from the backend (`GET /api/trivia/questions?difficulty=N&count=10`)
2. Caches the batch locally; fetches the next batch when 3 questions remain
3. Presents one question at a time; evaluates answers locally for instant feedback
4. Submits answer results to the backend (`POST /api/trivia/answers`) for XP award and leaderboard update

### 4.4 Game Mode

Game mode transforms the periodic table into a navigable map. Element meshes display zone-type visual indicators (color aura). Clicking an element initiates an encounter routed through the `Combat_Engine`.

---

## 5. Combat Engine Design

The Combat_Engine runs entirely client-side. It is a pure function module — given a game state and a player action, it returns a new game state. This makes it deterministic and testable.

### 5.1 Combat State Machine

```
Idle ──[select element]──▶ EncounterInit
                                │
                         EncounterActive ◀──────────────┐
                                │                        │
                    ┌───────────┴───────────┐            │
                    ▼                       ▼            │
              PlayerTurn              ElementTurn ───────┘
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
     PlayerWin           PlayerDefeat
          │                    │
     LootGeneration       EncounterEnd
          │                    │
     InventoryUpdate      ReturnToMap
          │
     ProgressUpdate
```

### 5.2 Turn Resolution

Combat uses a **turn-based system with real-time action selection** (player has a time window to choose an action; if no action is chosen, a default action fires automatically).

```typescript
interface CombatAction {
  type: "attack" | "defend" | "special" | "flee";
  sourceId: string;       // player or element atomicNumber
  targetId: string;
  modifiers: string[];    // e.g. ["electronegativity_debuff", "density_armor"]
}

interface TurnResult {
  damageDealt: number;
  damageTaken: number;
  statusEffectsApplied: StatusEffect[];
  narrative: string;      // e.g. "Iron's high density absorbs 12 damage"
}
```

**Strength/weakness derivation from periodic trends:**

| Property | Combat Effect |
|----------|---------------|
| High electronegativity | Debuff potency +20% |
| High atomic mass | Stagger chance on heavy attacks |
| High density | Damage reduction (armor) |
| Radioactive | Applies "radiation" DoT status |
| Noble gas | Immune to debuffs (inert) |
| Alkali metal | High burst damage, low defense |
| Halogen | Applies "corrosion" debuff |
| Oxygen group | Multi-hit attacks |

### 5.3 Zone-Specific Behavior

```typescript
interface EncounterConfig {
  zone: ZoneType;
  elementAtomicNumber: number;
  difficultyLevel: number;
  lootRarityTier: LootRarity;
}
```

- **Passive**: No combat initiated. Opens a service menu (trade, craft, buff, recover).
- **Combat**: Standard encounter. Behavior pattern selected by chemical group.
- **Neutral**: Balanced encounter. Standard loot table.
- **Boss**: High HP, radiation/instability status effects, guaranteed Rare+ loot, unique first-defeat reward.
- **Anomalous**: Randomized mechanics each encounter (random action patterns, random status effects). Guaranteed Epic or Legendary loot.

---

## 6. Loot System with Rarity

### 6.1 Loot Generation Pipeline

```
ElementDefeated
      │
      ▼
DetermineDropTable(element, zone, difficultyLevel)
      │
      ▼
RollDrops(dropTable)          ← probabilistic selection
      │
      ▼
GenerateItemStats(element, rarity, difficultyLevel)
      │
      ▼
ApplyRarityScaling(baseStats, rarity)
      │
      ▼
LootDrop { items: Element_Loot[] }
```

### 6.2 Drop Rate Model

Drop rates are computed per-item using a weighted random draw. Base rates by rarity:

| Rarity | Base Drop Rate | Boss Multiplier | Anomalous Multiplier |
|--------|---------------|-----------------|----------------------|
| Common | 70% | 1.0× | 0.5× |
| Uncommon | 20% | 1.5× | 0.8× |
| Rare | 7% | 3.0× | 1.5× |
| Epic | 2.5% | 5.0× | 3.0× |
| Legendary | 0.5% | 8.0× | 6.0× |

Boss encounters guarantee at least one Rare+ item (re-roll until satisfied). Anomalous encounters guarantee at least one Epic+ item.

### 6.3 Stat Derivation

```typescript
interface LootStatBlock {
  attack: number;
  defense: number;
  energy: number;
  weight: number;
  debuffPotency: number;
}

function deriveBaseStats(element: Element): LootStatBlock {
  return {
    attack:        normalize(element.electronegativity, 0, 4) * 10,
    defense:       normalize(element.density, 0, 22.6) * 10,
    energy:        normalize(element.atomicMass, 1, 294) * 10,
    weight:        normalize(element.atomicMass, 1, 294) * 10,
    debuffPotency: normalize(element.electronegativity, 0, 4) * 10,
  };
}

const RARITY_MULTIPLIERS: Record<LootRarity, number> = {
  Common:    1.0,
  Uncommon:  1.5,
  Rare:      2.5,
  Epic:      4.0,
  Legendary: 7.0,
};
```

Epic items add one special effect (e.g., "Radiation Aura: applies radiation DoT to attacker on hit"). Legendary items add one unique ability (e.g., "Oganesson Collapse: once per encounter, reduce all enemy stats by 30% for 2 turns").

### 6.4 Inventory UI

Each inventory slot renders a card component:

```
┌─────────────────────────────┐  ← border color = rarity color
│  [Element Symbol Icon]      │    Common: #9E9E9E (grey)
│  Iron Plate                 │    Uncommon: #4CAF50 (green)
│  Source: Iron (Fe)          │    Rare: #2196F3 (blue)
│  ──────────────────────     │    Epic: #9C27B0 (purple)
│  ATK +4  DEF +12  WT +8     │    Legendary: #FFC107 (gold)
│  "Density-forged armor"     │
└─────────────────────────────┘
```

### 6.5 Compound Crafting

Crafting is validated against a pre-built compound lookup table derived from real chemistry:

```typescript
interface CraftingRecipe {
  reagents: { symbol: string; quantity: number }[];  // e.g. [{symbol:"Fe",qty:1},{symbol:"C",qty:1}]
  product: CraftedItem;
  minimumRarityRequired: LootRarity;  // highest rarity among reagents
}
```

The crafting UI shows available recipes filtered to reagents the user currently holds. The output item's rarity equals the highest rarity among the input reagents. If a recipe requires a minimum rarity tier, the UI disables the craft button and shows the missing requirement.

Example recipes:

| Reagents | Product | Min Rarity |
|----------|---------|------------|
| Fe + C | Steel Blade | Common |
| Cu + Sn | Bronze Shield | Uncommon |
| Au + Ag | Electrum Ring | Rare |
| Nd + Fe + B | Neodymium Magnet Core | Epic |
| Og + Fl | Exotic Matter Shard | Legendary |

---

## 7. Progression and Account Services

### 7.1 Progression_Service (Client)

The client-side Progression_Service is a state slice that:

- Tracks XP per difficulty level
- Tracks element mastery (first-defeat flags, Name_Tag collection)
- Tracks equipped Name_Tag
- Syncs to backend on every meaningful state change (debounced, max 1 sync per 5 seconds)

```typescript
interface ProgressionState {
  xpByDifficulty: Record<1|2|3|4|5, number>;
  unlockedDifficulties: Set<1|2|3|4|5>;
  masteredElements: Set<number>;       // atomic numbers
  nameTags: NameTag[];
  equippedNameTag: number | null;      // atomic number
  inventory: InventoryItem[];
}
```

### 7.2 Auth_Service (Backend)

- **Registration**: `POST /api/auth/register` — validates unique username + email, hashes password (bcrypt, cost 12), returns JWT
- **Login**: `POST /api/auth/login` — validates credentials, returns JWT (24h expiry) + refresh token (30d)
- **Refresh**: `POST /api/auth/refresh` — exchanges refresh token for new JWT
- **Session**: JWT stored in `httpOnly` cookie; refresh token stored in `httpOnly` cookie with `SameSite=Strict`
- Error responses never distinguish between "username not found" and "wrong password" (generic "Invalid credentials" message)

### 7.3 Progression_Service (Backend)

- `GET /api/progress` — returns full ProgressionState for authenticated user
- `PUT /api/progress` — accepts partial ProgressionState update, merges server-side (last-write-wins per field)
- `POST /api/progress/mastery` — records first-defeat of an element, awards Name_Tag
- Leaderboard updates are triggered by XP changes; Redis sorted set is updated atomically

### 7.4 XP and Unlock Thresholds

| Difficulty Level | XP to Unlock Next |
|-----------------|-------------------|
| 1 → 2 | 500 XP |
| 2 → 3 | 2,000 XP |
| 3 → 4 | 6,000 XP |
| 4 → 5 | 15,000 XP |

XP awards in Trivia Mode:

```
baseXP = difficultyLevel × 10
timeBonus = max(0, (30 - responseTimeSeconds) / 30) × baseXP
totalXP = baseXP + timeBonus
```

---

## 8. Frontend / Backend Split

### 8.1 What Runs Client-Side

| Concern | Rationale |
|---------|-----------|
| 3D rendering and scene management | Latency-sensitive; must be local |
| Combat turn resolution | Real-time feel; deterministic logic |
| Loot generation | Immediate feedback; validated by backend on sync |
| Crafting validation | Instant UI feedback; recipe table is static |
| Trivia answer evaluation | Instant feedback; server confirms XP award |
| Element data lookup | Static asset; no round-trip needed |
| Inventory management | Local state; synced to backend |

### 8.2 What Runs Server-Side

| Concern | Rationale |
|---------|-----------|
| Authentication and session management | Security; cannot trust client |
| XP award and leaderboard update | Anti-cheat; authoritative source |
| Progression persistence | Durability; cross-device sync |
| Trivia question generation and storage | Content management; prevents client-side cheating |
| Name_Tag award on first defeat | Authoritative record; prevents duplication |

### 8.3 Anti-Cheat Approach

The backend does not blindly accept client-reported XP. For Trivia Mode, the server issues a signed question token with each question. The client submits the answer alongside the token. The server validates the token, evaluates the answer independently, and awards XP only for server-confirmed correct answers.

For Game Mode loot, the client reports the encounter outcome (element defeated, difficulty level, zone type). The server recomputes the loot drop deterministically using the same algorithm seeded with a server-issued encounter seed, then persists the result. The client's locally generated loot is replaced by the server's authoritative result on sync.

---

## 9. Key Data Flows

### 9.1 Application Startup

```
Browser loads SPA
  → Load elements.json (static asset, ~200 KB)
  → Initialize Three.js scene
  → Mount PeriodicTableGroup with Level-1 meshes
  → Check for existing session (cookie)
    → If valid: fetch /api/progress → restore ProgressionState
    → If none: show guest state (progress not persisted)
  → Render complete (target: <10s on broadband)
```

### 9.2 Trivia Question Flow

```
User enters Trivia Mode
  → Client requests GET /api/trivia/questions?difficulty=N&count=10
  → Server selects 10 questions from question store, signs each with HMAC token
  → Client caches batch, presents Question 1
  → User answers
  → Client evaluates locally (instant feedback)
  → Client sends POST /api/trivia/answers { questionToken, answer }
  → Server validates token, evaluates answer, awards XP
  → Server updates Redis leaderboard sorted set
  → Server returns { correct: bool, xpAwarded: number, newTotal: number }
  → Client updates local XP display
  → WebSocket pushes leaderboard delta to subscribed clients
```

### 9.3 Combat and Loot Flow

```
User clicks element in Game Mode
  → Client checks zone type
  → If Passive: open service menu (no server call)
  → If Combat/Neutral/Boss/Anomalous:
      → POST /api/game/encounter/start { elementAtomicNumber, difficultyLevel }
      → Server returns { encounterId, seed }
      → Client runs combat loop (local state machine)
      → On player victory:
          → Client generates loot locally (using seed)
          → Client updates local inventory and progression
          → POST /api/game/encounter/complete { encounterId, outcome }
          → Server recomputes loot with same seed, persists to account
          → Server awards Name_Tag if first defeat
          → Server returns authoritative { loot, nameTags, xpAwarded }
          → Client reconciles local state with server response
      → On player defeat:
          → POST /api/game/encounter/complete { encounterId, outcome: "defeat" }
          → Server records encounter, no loot or XP change
```

### 9.4 Leaderboard Real-Time Update

```
XP change event (server-side)
  → Update PostgreSQL user XP record
  → ZADD leaderboard:{difficultyLevel} score userId (Redis)
  → Publish leaderboard:update event to Redis pub/sub
  → WebSocket server receives event
  → Broadcasts delta to all subscribed clients for that difficulty level
  → Clients update leaderboard display (within 60s SLA)
```

---

## 10. Technology Stack Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| 3D Rendering | Three.js + React Three Fiber | Mature, well-documented, React integration |
| Frontend Framework | React 18 + TypeScript | Component model suits UI complexity |
| State Management | Zustand | Lightweight, works well with R3F |
| Backend Runtime | Node.js + Express | Same language as frontend, fast I/O |
| Database | PostgreSQL | Relational model suits accounts + progress |
| Cache / Leaderboard | Redis | Sorted sets for leaderboard, session cache |
| Auth | JWT + bcrypt | Standard, stateless, secure |
| Real-time | WebSocket (ws library) | Leaderboard updates only |
| Element Data | Static JSON asset | No DB round-trips for read-only data |
| Deployment | Single Docker Compose stack | Frontend (nginx), Backend (node), DB, Redis |
