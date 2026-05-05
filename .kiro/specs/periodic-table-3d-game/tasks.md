# Implementation Plan: Periodic Table 3D Game

## Overview

Implement a browser-based single-page application featuring a 3D interactive periodic table educational game. The frontend is built with React 18 + TypeScript, Three.js via React Three Fiber, and Zustand for state management. The backend is Node.js + Express with PostgreSQL and Redis. Implementation proceeds from foundational data and rendering through each game mode, then backend services, and finally integration.

## Tasks

- [x] 1. Project scaffolding and element data asset
  - Initialize a monorepo with a `client/` (Vite + React + TypeScript) and `server/` (Node.js + Express + TypeScript) workspace
  - Install core dependencies: `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`, `react`, `react-dom`, `typescript`
  - Create `client/src/data/elements.json` containing all 118 element records conforming to the `Element` interface (atomicNumber, symbol, name, group, period, block, classification, atomicMass, density, electronegativity, electronConfiguration, electronShells, oxidationStates, isotopes, ionForms, crustalAbundancePpm, cosmicAbundance, isSynthetic, isRadioactive, zone, lootRarity)
  - Implement the `lootRarity` pre-computation logic as a standalone script that populates the `lootRarity` field in `elements.json` using the decision tree from the design (isSynthetic → Legendary, radioactive actinide → Epic, lanthanide → Epic, crustalAbundancePpm < 0.005 → Rare, < 50 → Uncommon, else Common)
  - Define all shared TypeScript interfaces in `client/src/types/index.ts`: `Element`, `Isotope`, `IonForm`, `ElementClassification`, `ZoneType`, `LootRarity`, `LootStatBlock`, `CraftingRecipe`, `ProgressionState`, `ModeState`, `ActiveMode`
  - _Requirements: 1.1, 2.1, 7.1, 9.1, 9.2_

- [x] 2. 3D scene foundation and Navigator
  - [x] 2.1 Implement the base Three.js scene with React Three Fiber
    - Create `client/src/components/Scene.tsx` wrapping an R3F `<Canvas>` with ambient and directional lights
    - Add `StarfieldBackground` component: a static particle system of ~5000 points rendered as a `<Points>` mesh
    - _Requirements: 1.1_

  - [x] 2.2 Implement the Navigator (camera controls)
    - Wrap `OrbitControls` from `@react-three/drei` with custom constraints: zoom min 5 / max 200 units, pan clamped to table bounding box + 20% margin, orbit ±80° vertical, smooth damping factor 0.08
    - Debounce input events to 16 ms
    - _Requirements: 1.2, 1.3_

  - [x] 2.3 Write unit tests for Navigator constraints
    - Test that zoom, pan, and orbit values are clamped to their defined bounds
    - Test that camera update is debounced to ≤16 ms
    - _Requirements: 1.3_

  - [x] 2.4 Implement `PeriodicTableGroup` with Level-1 element meshes
    - Compute world-space (x, y, z) positions from each element's `group` and `period` (standard 18-column × 7-row layout; lanthanides/actinides offset below)
    - Render all 118 elements using instanced rendering (`<instancedMesh>`) with a shared sphere geometry and per-element material (element symbol texture)
    - Add faint `GridLines` mesh (togglable via UI)
    - _Requirements: 1.1, 2.2_

  - [x] 2.5 Write unit tests for element position computation
    - Test that all 118 elements receive unique (x, y) grid positions
    - Test that lanthanide/actinide rows are offset below the main table
    - _Requirements: 1.1_

- [x] 3. Checkpoint — Ensure scene renders at ≥30 fps with all 118 elements visible
  - Ensure all tests pass, ask the user if questions arise.

- [~] 4. Difficulty level model variants
  - [x] 4.1 Implement Level-2 mesh: shell rings around nucleus sphere
    - Procedurally generate ring geometry per element based on `electronShells`
    - _Requirements: 2.3_

  - [x] 4.2 Implement Level-3 mesh: electron cloud particle system + isotope toggle
    - Create a particle shader for the electron cloud
    - Wire isotope selection to swap the particle system
    - _Requirements: 2.4_

  - [x] 4.3 Implement Level-4 mesh: physics-based subatomic particles with energy state glow
    - Animated shader with per-element energy state color
    - _Requirements: 2.5_

  - [x] 4.4 Implement Level-5 mesh: quantum probability density volume (raymarched shader)
    - Raymarching fragment shader approximating orbital probability density
    - Load on demand; unload when user leaves Element_Viewer
    - _Requirements: 2.6_

  - [x] 4.5 Implement lazy mesh loading and memory management
    - Level 1–2 assets kept in memory after first load
    - Level 4–5 assets unloaded when Element_Viewer closes
    - _Requirements: 2.1, 2.6_

- [~] 5. Classic Mode — Element Viewer
  - [x] 5.1 Implement click handler on element meshes for Classic Mode
    - Register a pointer-down event on each element mesh that dispatches to the mode system; in Classic Mode, open the Element_Viewer
    - _Requirements: 3.1_

  - [x] 5.2 Implement `ElementViewer` panel component
    - Isolated R3F canvas (not the main scene) rendering the selected element's model at the current difficulty level
    - Drag-to-rotate and pinch/scroll-to-zoom interactions on the isolated canvas
    - Data panel: atomic number, atomic mass, element group, classification, Electron_Shell_Configuration
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 5.3 Implement isotope dropdown in Element_Viewer
    - Populate from `element.isotopes`; on selection, update the 3D model to reflect the isotope's mass number at the current difficulty level
    - _Requirements: 3.4, 3.6_

  - [x] 5.4 Implement ion form dropdown in Element_Viewer
    - Populate from `element.ionForms`; on selection, update the data panel to show the ion's charge and notation
    - _Requirements: 3.5, 3.7_

  - [ ] 5.5 Implement error state for Element_Viewer model load failure
    - Display a descriptive error message and a retry button if the model asset fails to load
    - _Requirements: 3.8_

  - [x] 5.6 Write unit tests for Element_Viewer data panel
    - Test that all required fields (atomic number, mass, group, classification, shell config) are rendered for a sample element
    - Test that isotope selection updates the model and ion selection updates the data panel
    - _Requirements: 3.3, 3.6, 3.7_

- [x] 6. Mode system and global state store
  - [x] 6.1 Implement Zustand store with mode slice
    - `ModeState`: `active: ActiveMode`, `difficultyLevel: 1|2|3|4|5`
    - Actions: `setMode`, `setDifficultyLevel`
    - _Requirements: 2.1, 4.1_

  - [x] 6.2 Implement difficulty level lock/unlock logic in the store
    - `unlockedDifficulties` set; `setDifficultyLevel` rejects locked levels
    - _Requirements: 2.7_

  - [x] 6.3 Write unit tests for mode and difficulty state transitions
    - Test that locked difficulty levels cannot be selected
    - Test that mode transitions update the active mode correctly
    - _Requirements: 2.7, 4.1_

- [x] 7. Trivia Mode — client-side engine
  - [x] 7.1 Implement `TriviaEngine` client module
    - `GET /api/trivia/questions?difficulty=N&count=10` to fetch a signed question batch
    - Cache batch locally; trigger next fetch when 3 questions remain
    - Present one question at a time; evaluate answer locally for instant feedback
    - _Requirements: 4.1, 4.2_

  - [x] 7.2 Implement Trivia Mode UI overlay
    - Question panel rendered over the 3D scene
    - Highlight the relevant element mesh as the question subject
    - Show correct answer + explanation on incorrect submission (Requirement 4.4)
    - _Requirements: 4.1, 4.4_

  - [x] 7.3 Implement answer submission and XP update
    - `POST /api/trivia/answers { questionToken, answer }` on each answer
    - Update local XP display from server response `{ correct, xpAwarded, newTotal }`
    - _Requirements: 4.3_

  - [x] 7.4 Implement Trivia Engine loading and retry logic
    - Show loading indicator if question fetch exceeds 3 seconds
    - Retry up to 3 times; display error message on exhaustion
    - _Requirements: 4.7_

  - [x] 7.5 Write unit tests for TriviaEngine batch management
    - Test that a new batch is requested when 3 questions remain
    - Test that the loading indicator appears after 3 seconds and retries up to 3 times
    - _Requirements: 4.7_

- [x] 8. Progression Service — client-side slice
  - [x] 8.1 Implement `ProgressionState` Zustand slice
    - Fields: `xpByDifficulty`, `unlockedDifficulties`, `masteredElements`, `nameTags`, `equippedNameTag`, `inventory`
    - Actions: `addXP`, `unlockDifficulty`, `masterElement`, `addNameTag`, `equipNameTag`, `addInventoryItem`, `removeInventoryItem`
    - _Requirements: 4.5, 6.3, 10.1_

  - [x] 8.2 Implement XP threshold unlock logic
    - After `addXP`, check thresholds (500 / 2000 / 6000 / 15000 XP) and call `unlockDifficulty` + notify user when threshold is crossed
    - _Requirements: 4.5, 4.6_

  - [x] 8.3 Implement backend sync (debounced, max 1 per 5 seconds)
    - `PUT /api/progress` with partial state on meaningful changes
    - `POST /api/progress/mastery` on first element defeat
    - _Requirements: 6.3_

  - [x] 8.4 Write unit tests for XP and unlock logic
    - Test that each XP threshold triggers the correct difficulty unlock
    - Test that the unlock notification fires exactly once per threshold crossing
    - _Requirements: 4.5, 4.6_

- [x] 9. Leaderboard — client-side display
  - [x] 9.1 Implement Leaderboard UI component
    - Display per-difficulty leaderboard: user rank, username, XP score, top entries
    - Friends-filtered view when friends list is connected
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 9.2 Implement WebSocket client for real-time leaderboard updates
    - Subscribe to leaderboard delta events for the active difficulty level
    - Update leaderboard display within 60 seconds of an XP change
    - _Requirements: 5.4_

  - [x] 9.3 Implement unauthenticated leaderboard gate
    - Prompt login/register if user is not authenticated when viewing personalized leaderboard data
    - _Requirements: 5.5_

- [x] 10. Checkpoint — Ensure Classic Mode, Trivia Mode UI, and Progression slice all pass tests
  - Ensure all tests pass, ask the user if questions arise.

- [~] 11. Combat Engine — client-side
  - [x] 11.1 Implement `CombatEngine` as a pure function module
    - State machine: `Idle → EncounterInit → EncounterActive → PlayerTurn / ElementTurn → PlayerWin / PlayerDefeat`
    - `resolveTurn(state, action): TurnResult` — pure function, deterministic given seed
    - `CombatAction` and `TurnResult` types as defined in the design
    - _Requirements: 8.1, 8.2_

  - [x] 11.2 Implement periodic-trend strength/weakness modifiers
    - High electronegativity → debuff potency +20%
    - High atomic mass → stagger chance on heavy attacks
    - High density → damage reduction (armor)
    - Radioactive → applies "radiation" DoT status
    - Noble gas → immune to debuffs
    - Alkali metal → high burst damage, low defense
    - Halogen → applies "corrosion" debuff
    - Oxygen group → multi-hit attacks
    - _Requirements: 8.2, 8.3_

  - [x] 11.3 Write property tests for CombatEngine turn resolution
    - **Property 1: Determinism** — given the same state and action, `resolveTurn` always returns the same `TurnResult`
    - **Validates: Requirements 8.2**

  - [x] 11.4 Write property tests for strength/weakness modifier bounds
    - **Property 2: Modifier bounds** — damage and defense values after modifier application are always non-negative and do not exceed a defined maximum
    - **Validates: Requirements 8.2, 8.3**

  - [x] 11.5 Implement zone-specific encounter behavior
    - Passive zone: open service menu, no combat
    - Combat zone: group-based behavior patterns (alkali, halogen, oxygen-group)
    - Neutral zone: balanced encounter, standard loot
    - Boss zone: high HP, radiation/instability effects, guaranteed Rare+ loot, unique first-defeat reward
    - Anomalous zone: randomized mechanics, guaranteed Epic+ loot
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 11.6 Implement time-windowed action selection
    - Player has a configurable time window to choose an action; if no action is chosen, a default action fires automatically
    - _Requirements: 8.2_

  - [ ] 11.7 Implement combat results summary UI
    - Display XP earned, loot received, and mastery progress at encounter end
    - On player defeat: end encounter, preserve all progress, return to map
    - _Requirements: 8.4, 8.5_

  - [x] 11.8 Write unit tests for zone encounter routing
    - Test that Passive zone opens service menu without initiating combat
    - Test that Boss zone guarantees at least one Rare+ loot item
    - Test that Anomalous zone guarantees at least one Epic+ loot item
    - _Requirements: 7.2, 7.5, 7.6_

- [x] 12. Loot System — client-side
  - [x] 12.1 Implement `deriveBaseStats(element)` function
    - Normalize electronegativity (0–4) → attack and debuffPotency
    - Normalize density (0–22.6) → defense
    - Normalize atomicMass (1–294) → energy and weight
    - Apply `RARITY_MULTIPLIERS` to scale stats by rarity tier
    - _Requirements: 9.1, 9.8_

  - [x] 12.2 Write property tests for stat derivation
    - **Property 3: Stat monotonicity** — for any two elements where element A has strictly higher electronegativity than element B, `deriveBaseStats(A).attack >= deriveBaseStats(B).attack`
    - **Validates: Requirements 9.8**

  - [x] 12.3 Write property tests for rarity multiplier ordering
    - **Property 4: Rarity ordering** — for any element, the total stat sum after applying rarity multiplier is strictly increasing across Common < Uncommon < Rare < Epic < Legendary
    - **Validates: Requirements 9.4**

  - [x] 12.4 Implement loot generation pipeline
    - `DetermineDropTable(element, zone, difficultyLevel)` → weighted drop table
    - `RollDrops(dropTable)` → probabilistic item selection using base rates (Common 70%, Uncommon 20%, Rare 7%, Epic 2.5%, Legendary 0.5%) with Boss and Anomalous multipliers
    - `GenerateItemStats(element, rarity, difficultyLevel)` → `LootStatBlock`
    - Boss guarantee: re-roll until at least one Rare+ item
    - Anomalous guarantee: re-roll until at least one Epic+ item
    - _Requirements: 9.2, 9.3, 9.6, 9.7_

  - [x] 12.5 Write property tests for drop rate ordering
    - **Property 5: Drop rate ordering** — across a large sample of rolls, Common items drop more frequently than Uncommon, which drop more frequently than Rare, etc.
    - **Validates: Requirements 9.3**

  - [x] 12.6 Implement loot category assignment from periodic group
    - Metal elements → offensive or defensive equipment
    - Non-metal elements → crafting reagents
    - Noble gas elements → rare passive buff items
    - Radioactive elements → unstable artifact items with high stat variance
    - _Requirements: 9.5_

  - [x] 12.7 Implement Epic and Legendary special effects
    - Epic items: add one special effect (e.g., "Radiation Aura")
    - Legendary items: add one unique ability (e.g., "Oganesson Collapse")
    - _Requirements: 9.4_

- [x] 13. Inventory and Crafting UI
  - [x] 13.1 Implement inventory interface
    - Grid of item cards; each card shows: element symbol icon, item name, source element, primary stat and chemical property, color-coded rarity border (Common: #9E9E9E, Uncommon: #4CAF50, Rare: #2196F3, Epic: #9C27B0, Legendary: #FFC107)
    - Equip action applies item stat modifiers to player character for subsequent encounters
    - _Requirements: 9.9, 9.10_

  - [x] 13.2 Implement inventory full prompt
    - When a loot drop is generated and inventory is full, prompt user to discard or store an existing item before adding the new loot
    - _Requirements: 9.13_

  - [x] 13.3 Implement compound crafting UI
    - Show available recipes filtered to reagents the user currently holds (from pre-built `craftingRecipes` lookup table)
    - Crafted item rarity = highest rarity among input reagents
    - Disable craft button and show missing-rarity message when minimum rarity requirement is not met
    - _Requirements: 9.11, 9.12_

  - [x] 13.4 Write unit tests for crafting validation
    - Test that a recipe requiring Rare+ reagents is disabled when only Common reagents are present
    - Test that crafted item rarity equals the highest rarity among reagents
    - _Requirements: 9.11, 9.12_

- [x] 14. Name Tag system
  - [x] 14.1 Implement Name_Tag award on first element defeat
    - On first defeat, `POST /api/progress/mastery` → server awards Name_Tag and returns it
    - Add Name_Tag to local `ProgressionState.nameTags`
    - _Requirements: 10.1_

  - [x] 14.2 Implement Name_Tag equip logic
    - Allow equipping exactly one Name_Tag at a time; replacing active tag removes previous abilities and applies new ones
    - Abilities derived from element chemical properties (e.g., Oxygen → regeneration, Iron → defense, Mercury → speed)
    - _Requirements: 10.2, 10.3, 10.4_

  - [x] 14.3 Implement Name_Tag collection UI
    - Display all earned Name_Tags, indicate which is equipped, show ability description for each
    - _Requirements: 10.6_

  - [x] 14.4 Write unit tests for Name_Tag equip/replace
    - Test that equipping a new Name_Tag removes the previous tag's abilities and applies the new tag's abilities
    - Test that only one Name_Tag can be equipped at a time
    - _Requirements: 10.2, 10.4_

- [x] 15. Checkpoint — Ensure Game Mode (combat, loot, inventory, Name Tags) all pass tests
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Backend — Auth Service
  - [x] 16.1 Implement `POST /api/auth/register`
    - Validate unique username + email; hash password with bcrypt (cost 12); return JWT
    - _Requirements: 6.1_

  - [x] 16.2 Implement `POST /api/auth/login`
    - Validate credentials; return JWT (24h expiry) + refresh token (30d) in `httpOnly` cookies with `SameSite=Strict`
    - Generic "Invalid credentials" error — never distinguish username vs. password
    - _Requirements: 6.2, 6.5_

  - [x] 16.3 Implement `POST /api/auth/refresh`
    - Exchange refresh token for new JWT
    - _Requirements: 6.2_

  - [x] 16.4 Implement session expiry redirect
    - On expired JWT, return 401; client redirects to login and preserves unsaved local progress for post-auth submission
    - _Requirements: 6.6_

  - [x] 16.5 Write unit tests for Auth Service
    - Test that registration rejects duplicate username/email
    - Test that login returns a generic error for both bad username and bad password
    - Test that refresh issues a new JWT from a valid refresh token
    - _Requirements: 6.1, 6.2, 6.5_

- [x] 17. Backend — Progression Service
  - [x] 17.1 Implement `GET /api/progress` and `PUT /api/progress`
    - GET returns full `ProgressionState` for authenticated user
    - PUT accepts partial update, merges server-side (last-write-wins per field)
    - _Requirements: 6.3, 6.4_

  - [x] 17.2 Implement `POST /api/progress/mastery`
    - Record first-defeat of an element; award Name_Tag; prevent duplicate awards
    - _Requirements: 10.1_

  - [x] 17.3 Implement XP award and leaderboard update
    - On XP change: update PostgreSQL user XP; `ZADD leaderboard:{difficultyLevel}` in Redis; publish `leaderboard:update` event
    - _Requirements: 5.1, 5.4_

  - [x] 17.4 Write unit tests for Progression Service
    - Test that `PUT /api/progress` merges partial updates without overwriting unrelated fields
    - Test that mastery endpoint is idempotent (second call for same element does not award a second Name_Tag)
    - _Requirements: 6.3, 10.1_

- [x] 18. Backend — Trivia Engine
  - [x] 18.1 Implement `GET /api/trivia/questions`
    - Select N questions from question store filtered by difficulty; sign each with HMAC token; return batch
    - _Requirements: 4.1, 4.2_

  - [x] 18.2 Implement `POST /api/trivia/answers`
    - Validate HMAC token; evaluate answer server-side; award XP using formula `baseXP = difficultyLevel × 10`, `timeBonus = max(0, (30 - responseTimeSeconds) / 30) × baseXP`; update Redis leaderboard; return `{ correct, xpAwarded, newTotal }`
    - _Requirements: 4.3_

  - [x] 18.3 Write unit tests for Trivia Engine
    - Test that HMAC token validation rejects tampered tokens
    - Test XP formula: correct answer at difficulty 3 with 10s response time yields expected XP
    - _Requirements: 4.3_

- [x] 19. Backend — Game Encounter Service
  - [x] 19.1 Implement `POST /api/game/encounter/start`
    - Validate element and difficulty; generate and return `{ encounterId, seed }`
    - _Requirements: 8.1_

  - [x] 19.2 Implement `POST /api/game/encounter/complete`
    - On victory: recompute loot deterministically using stored seed; persist loot and XP; award Name_Tag if first defeat; return authoritative `{ loot, nameTags, xpAwarded }`
    - On defeat: record encounter, no loot or XP change
    - _Requirements: 8.4, 9.1, 10.1_

  - [x] 19.3 Write unit tests for encounter service
    - Test that loot recomputed from the same seed matches the client-generated loot
    - Test that a defeat outcome records the encounter without awarding loot or XP
    - _Requirements: 8.4, 9.1_

- [x] 20. Backend — WebSocket leaderboard broadcaster
  - Implement WebSocket server (`ws` library) that subscribes to Redis `leaderboard:update` pub/sub events
  - Broadcast leaderboard delta to all clients subscribed to the affected difficulty level
  - _Requirements: 5.4_

- [x] 21. Checkpoint — Ensure all backend endpoints pass tests
  - Ensure all tests pass, ask the user if questions arise.

- [x] 22. Client-side startup flow and session restoration
  - [x] 22.1 Implement application startup sequence
    - Load `elements.json` static asset
    - Initialize Three.js scene and mount `PeriodicTableGroup` with Level-1 meshes
    - Check for existing session cookie; if valid, `GET /api/progress` and restore `ProgressionState`; if none, initialize guest state
    - Target: full render within 10 seconds on broadband
    - _Requirements: 1.5, 6.4_

  - [x] 22.2 Write integration test for startup flow
    - Test that a valid session cookie triggers progress restoration within 5 seconds
    - Test that an absent session cookie initializes guest state without error
    - _Requirements: 1.5, 6.4_

- [x] 23. Docker Compose stack and deployment configuration
  - Create `docker-compose.yml` with four services: `frontend` (nginx serving built SPA), `backend` (Node.js), `postgres`, `redis`
  - Add `Dockerfile` for frontend (multi-stage: build with Node, serve with nginx) and backend
  - Add environment variable configuration for database URLs, JWT secret, Redis URL, and HMAC secret
  - _Requirements: 1.5_

- [x] 24. Final checkpoint — Full integration pass
  - Ensure all unit, property, and integration tests pass across client and server
  - Verify 30 fps render target with all 118 Level-1 meshes in scene
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at meaningful milestones
- Property tests validate universal correctness properties (determinism, ordering, monotonicity)
- Unit tests validate specific examples and edge cases
- The backend anti-cheat approach (server-side loot recomputation with seed, HMAC-signed trivia tokens) is baked into tasks 18–19
