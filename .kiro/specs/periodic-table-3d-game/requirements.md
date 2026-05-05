# Requirements Document

## Introduction

A 3D interactive periodic table educational game set in a floating space environment. The system presents all 118 elements as interactive 3D objects arranged in their standard periodic table positions within a starfield. Users can freely navigate the space and engage with elements across three distinct modes: Classic (exploration and visualization), Trivia (quiz-based progression and ranking), and Game (RPG-style combat and mastery). All modes are unified through a persistent account-based progression system tied to element mastery and difficulty levels.

## Glossary

- **Application**: The full Periodic Table 3D Educational Game system
- **Classic_Mode**: The exploration and visualization mode where users inspect element models and data
- **Trivia_Mode**: The quiz-based progression mode where users answer chemistry questions
- **Game_Mode**: The RPG-style mode where elements are represented as interactive combat entities
- **Element**: One of the 118 chemical elements of the periodic table, represented as a 3D interactive object
- **Element_Viewer**: The detailed 3D model viewer opened when a user selects an element in Classic Mode
- **Difficulty_Level**: A numeric tier from 1 to 5 that controls model complexity, data depth, trivia difficulty, and combat complexity
- **Name_Tag**: A collectible item earned by defeating an element for the first time in Game Mode, equippable to grant element-based abilities
- **Zone**: A classification of elements in Game Mode that determines encounter behavior (Passive, Combat, Neutral, Boss, Anomalous)
- **Leaderboard**: A ranked list of users ordered by Trivia Mode performance, scoped per Difficulty_Level
- **Account**: A persistent user profile that stores progress, unlocks, stats, and leaderboard position
- **XP**: Experience points awarded in Trivia Mode for correct answers
- **Loot**: Items dropped by defeated elements in Game Mode, including equipment and crafting materials whose names, descriptions, and stat modifiers are derived from the source element's real-world chemical properties
- **Element_Loot**: A Loot item whose identity is directly tied to the defeated element — its name references the element or one of its real compounds, its stat modifiers reflect the element's chemical characteristics (e.g., conductivity, reactivity, density, toxicity), and its category is determined by the element's periodic group classification
- **Loot_Rarity**: A five-tier classification assigned to each Element_Loot item based on the real-world abundance and significance of the source element. The tiers are: **Common** (cosmically or industrially abundant elements such as Hydrogen, Carbon, Oxygen, Silicon, and Iron — basic stat modifiers, highest drop rate), **Uncommon** (well-known but less abundant elements such as Copper, Zinc, Tin, and Nickel — moderate stat modifiers), **Rare** (scarce or industrially significant elements such as Gold, Silver, Platinum, and Titanium — strong stat modifiers), **Epic** (rare earth elements, lanthanides, and actinides such as Neodymium, Uranium, and Thorium — powerful modifiers with special effects), and **Legendary** (synthetic, exotic, or highly unstable elements such as Oganesson, Flerovium, and Tennessine — unique abilities and maximum stat values, lowest drop rate). Loot_Rarity governs drop rate probability, stat modifier magnitude, inventory UI color-coded border, and crafting recipe requirements.
- **Renderer**: The 3D rendering subsystem responsible for displaying element models and the starfield environment
- **Navigator**: The subsystem handling user camera controls (zoom, pan, orbit) in the 3D space
- **Auth_Service**: The subsystem responsible for user account creation, authentication, and session management
- **Trivia_Engine**: The subsystem that generates, presents, and evaluates trivia questions
- **Combat_Engine**: The subsystem that manages Game Mode encounters, turn resolution, and loot distribution
- **Progression_Service**: The subsystem that tracks XP, unlocks, mastery, and difficulty tier access
- **Electron_Shell_Configuration**: The shell-by-shell electron count notation for an element, expressed as a comma-separated sequence of integers representing the number of electrons in each successive shell (e.g., Helium = 2, Calcium = 2,8,8,2)

---

## Requirements

### Requirement 1: 3D Periodic Table Environment

**User Story:** As a user, I want to see all elements displayed as 3D objects in a spatial starfield environment, so that I can visually understand the periodic table's structure and navigate it intuitively.

#### Acceptance Criteria

1. THE Renderer SHALL display all 118 elements as 3D interactive objects positioned according to the standard periodic table layout within a starfield environment.
2. THE Navigator SHALL support zoom, pan, and orbit camera controls for navigating the 3D element space.
3. WHEN a user applies zoom, pan, or orbit input, THE Navigator SHALL update the camera position and orientation within 16 milliseconds to maintain smooth interaction.
4. THE Renderer SHALL render element objects at a frame rate of no less than 30 frames per second on the target platform under normal operating conditions.
5. WHEN the Application initializes, THE Renderer SHALL load and display the full periodic table environment within 10 seconds on a standard broadband connection.

---

### Requirement 2: Difficulty Level System

**User Story:** As a user, I want to select a difficulty level from 1 to 5, so that I can control the visual complexity of element models and the depth of information and challenge presented to me.

#### Acceptance Criteria

1. THE Application SHALL provide five Difficulty_Levels numbered 1 through 5, each defining a distinct tier of model visual fidelity, interactive data depth, trivia difficulty, and combat complexity.
2. WHEN a user selects Difficulty_Level 1, THE Renderer SHALL display simplified atomic representation models for all elements.
3. WHEN a user selects Difficulty_Level 2, THE Renderer SHALL display models with shell structure and basic particle visualization for all elements.
4. WHEN a user selects Difficulty_Level 3, THE Renderer SHALL display models with electron cloud and isotope visualization for all elements.
5. WHEN a user selects Difficulty_Level 4, THE Renderer SHALL display physics-based models with subatomic interactions and energy state visualization for all elements.
6. WHEN a user selects Difficulty_Level 5, THE Renderer SHALL display advanced quantum-level visual approximation models for all elements.
7. WHILE a Difficulty_Level above 1 is locked for a user, THE Application SHALL prevent the user from selecting that Difficulty_Level until the Progression_Service confirms the unlock condition is met.

---

### Requirement 3: Classic Mode – Element Exploration

**User Story:** As a user, I want to click on any element and open a detailed interactive model viewer, so that I can explore atomic structure and element properties visually.

#### Acceptance Criteria

1. WHEN a user clicks an element object in Classic_Mode, THE Application SHALL open the Element_Viewer displaying a 3D model of that element.
2. THE Element_Viewer SHALL support drag-to-rotate and pinch-or-scroll-to-zoom interactions on the displayed element model.
3. THE Element_Viewer SHALL display a data panel containing the element's atomic number, atomic mass, element group, element classification, and Electron_Shell_Configuration.
4. THE Element_Viewer SHALL provide a dropdown menu listing the common isotopes of the selected element.
5. THE Element_Viewer SHALL provide a dropdown menu listing the ion forms and associated charges of the selected element.
6. WHEN a user selects an isotope from the isotope dropdown, THE Element_Viewer SHALL update the 3D model to reflect the selected isotope's structure at the current Difficulty_Level.
7. WHEN a user selects an ion form from the ion dropdown, THE Element_Viewer SHALL update the data panel to reflect the selected ion's charge and relevant properties.
8. IF element model data fails to load, THEN THE Element_Viewer SHALL display a descriptive error message and provide a retry option.

---

### Requirement 4: Trivia Mode – Quiz and Progression

**User Story:** As a user, I want to answer chemistry questions and earn experience points, so that I can test my knowledge and progress through difficulty tiers.

#### Acceptance Criteria

1. WHEN a user enters Trivia_Mode, THE Trivia_Engine SHALL present questions drawn from the following categories: element identification from properties, isotope identification, chemical behavior and periodic trends, and electron configuration and bonding logic.
2. WHEN a user selects a Difficulty_Level, THE Trivia_Engine SHALL scale question complexity to match that Difficulty_Level.
3. WHEN a user submits a correct answer, THE Progression_Service SHALL award XP based on the current Difficulty_Level and the elapsed response time, with faster responses receiving higher XP awards.
4. WHEN a user submits an incorrect answer, THE Trivia_Engine SHALL display the correct answer and a brief explanation before advancing to the next question.
5. THE Progression_Service SHALL track cumulative XP per user and unlock the next Difficulty_Level when the required XP threshold for the current level is reached.
6. WHEN a user's cumulative XP reaches the threshold for the next Difficulty_Level, THE Progression_Service SHALL notify the user that a new Difficulty_Level has been unlocked.
7. IF the Trivia_Engine cannot retrieve a question within 3 seconds, THEN THE Trivia_Engine SHALL display a loading indicator and retry the request up to 3 times before displaying an error message.

---

### Requirement 5: Trivia Mode – Leaderboards

**User Story:** As a user, I want to see how my Trivia Mode performance compares to other players, so that I can track my ranking and compete globally.

#### Acceptance Criteria

1. THE Application SHALL maintain a separate Leaderboard for each Difficulty_Level, ranking users by cumulative XP earned at that level.
2. WHEN a user views a Leaderboard, THE Application SHALL display the user's current rank, username, and XP score alongside the top-ranked entries for that Difficulty_Level.
3. WHERE a user has connected a friends list, THE Application SHALL display a filtered Leaderboard view showing only the user's friends alongside the user's own entry.
4. WHEN a user's XP score changes, THE Leaderboard SHALL reflect the updated ranking within 60 seconds.
5. IF a user is not authenticated, THEN THE Application SHALL prompt the user to log in or create an Account before displaying personalized Leaderboard data.

---

### Requirement 6: User Accounts and Persistent Progression

**User Story:** As a user, I want a persistent account that saves my progress, unlocks, and stats, so that my achievements are retained across sessions.

#### Acceptance Criteria

1. THE Auth_Service SHALL allow users to create an Account using a unique username and a verified email address.
2. THE Auth_Service SHALL authenticate users via username and password, issuing a session token valid for no less than 24 hours of inactivity.
3. THE Progression_Service SHALL persist each user's XP totals, unlocked Difficulty_Levels, element mastery records, and equipped Name_Tag to the user's Account.
4. WHEN a user logs in, THE Progression_Service SHALL restore all saved progress, unlocks, and stats from the user's Account within 5 seconds.
5. IF authentication fails due to invalid credentials, THEN THE Auth_Service SHALL return a descriptive error message and SHALL NOT reveal whether the username or password was incorrect.
6. IF a session token expires, THEN THE Auth_Service SHALL redirect the user to the login screen and preserve any unsaved local progress for submission after re-authentication.

---

### Requirement 7: Game Mode – Zone Classification and Encounter Behavior

**User Story:** As a user, I want elements to behave as distinct encounter types based on their chemical properties, so that the RPG gameplay reflects real chemistry in an engaging way.

#### Acceptance Criteria

1. THE Application SHALL classify each element into exactly one Zone type: Passive (Noble Gases), Combat (Reactive Elements), Neutral (Transition Metals), Boss (Heavy and Radioactive Elements), or Anomalous (Synthetic and Exotic Elements).
2. WHEN a user enters a Passive Zone element, THE Game_Mode SHALL present trading, crafting upgrade, passive buff, and recovery services without initiating combat.
3. WHEN a user initiates an encounter with a Combat Zone element, THE Combat_Engine SHALL assign behavior based on the element's chemical group: alkali metals use high-damage attack patterns, halogens use debuff and control patterns, and oxygen-group elements use multi-target or swarm patterns.
4. WHEN a user initiates an encounter with a Neutral Zone element, THE Combat_Engine SHALL present a balanced combat encounter with standard Loot drop rates.
5. WHEN a user initiates an encounter with a Boss Zone element, THE Combat_Engine SHALL present a high-difficulty encounter with radiation or instability status effects and rare Loot drops.
6. WHEN a user initiates an encounter with an Anomalous Zone element, THE Combat_Engine SHALL apply randomized combat mechanics and irregular behavior patterns to the encounter.
7. WHEN a user defeats a Boss Zone element for the first time, THE Combat_Engine SHALL grant a unique progression reward in addition to standard Loot.

---

### Requirement 8: Game Mode – Combat System

**User Story:** As a user, I want to engage in combat encounters with elements, so that I can experience RPG-style gameplay grounded in chemical properties.

#### Acceptance Criteria

1. WHEN a user selects a non-Passive element in Game_Mode, THE Combat_Engine SHALL initiate a character encounter for that element.
2. THE Combat_Engine SHALL resolve combat using a turn-based or real-time hybrid system where element strengths and weaknesses are derived from periodic trends and chemical behavior.
3. WHEN an element's strength or weakness applies to a combat action, THE Combat_Engine SHALL modify the action's outcome accordingly and display a visual indicator to the user.
4. WHEN a combat encounter concludes, THE Combat_Engine SHALL display a results summary including XP earned, Loot received, and any mastery progress.
5. IF a user's character is defeated in combat, THEN THE Combat_Engine SHALL end the encounter, preserve all previously earned progress, and return the user to the Game_Mode map without loss of existing Loot or XP.

---

### Requirement 9: Game Mode – Loot System

**User Story:** As a user, I want to receive equipment and crafting materials by defeating elements, so that I can build and customize my character's capabilities using items that reflect real chemical properties and rarity tiers grounded in elemental abundance.

#### Acceptance Criteria

1. WHEN a user defeats an element in Game_Mode, THE Combat_Engine SHALL generate a Loot drop containing at least one Element_Loot item whose name, description, and stat modifiers are derived from the defeated element's real-world chemical properties.
2. THE Combat_Engine SHALL assign a Loot_Rarity tier to each Element_Loot item based on the source element's real-world abundance and significance: Common for cosmically or industrially abundant elements (e.g., Hydrogen, Carbon, Oxygen, Silicon, Iron), Uncommon for well-known but less abundant elements (e.g., Copper, Zinc, Tin, Nickel), Rare for scarce or industrially significant elements (e.g., Gold, Silver, Platinum, Titanium), Epic for rare earth elements, lanthanides, and actinides (e.g., Neodymium, Uranium, Thorium), and Legendary for synthetic, exotic, or highly unstable elements (e.g., Oganesson, Flerovium, Tennessine).
3. THE Combat_Engine SHALL determine drop rate probability from the Loot_Rarity tier: Common items SHALL have the highest drop probability, and each successive tier SHALL have a strictly lower drop probability than the tier below it, with Legendary items having the lowest drop probability.
4. THE Combat_Engine SHALL scale stat modifier magnitude to the Loot_Rarity tier: Common items SHALL apply basic stat modifiers, Uncommon items SHALL apply moderate stat modifiers, Rare items SHALL apply strong stat modifiers, Epic items SHALL apply powerful modifiers and at least one special effect, and Legendary items SHALL apply maximum stat values and at least one unique ability.
5. THE Combat_Engine SHALL determine the Element_Loot category from the defeated element's periodic group classification: metal elements yield offensive or defensive equipment, non-metal elements yield crafting reagents, noble gas elements yield rare passive buff items, and radioactive elements yield unstable artifact items with high stat variance.
6. WHEN a user defeats a Boss Zone element, THE Combat_Engine SHALL include at least one Rare or higher Loot_Rarity artifact in the Loot drop whose name references a real compound or alloy of that element and whose stat modifiers reflect the element's most notable chemical characteristic.
7. WHEN a user defeats an Anomalous Zone element, THE Combat_Engine SHALL include at least one Epic or Legendary Loot_Rarity item in the Loot drop.
8. THE Combat_Engine SHALL assign stat modifiers to each Element_Loot item based on the source element's measurable chemical properties, including but not limited to: atomic mass influencing weight-based stats, electronegativity influencing energy or debuff potency, and density influencing defensive or impact values.
9. THE Application SHALL provide an inventory interface where users can view, equip, and manage all collected Loot items, with each item displaying its source element name, the chemical property that determines its primary stat, and a color-coded border corresponding to its Loot_Rarity tier (Common: grey, Uncommon: green, Rare: blue, Epic: purple, Legendary: gold).
10. WHEN a user equips an Element_Loot item, THE Combat_Engine SHALL apply the item's stat modifiers to the user's character for subsequent encounters.
11. THE Combat_Engine SHALL support compound crafting, allowing a user to combine two or more Element_Loot crafting reagents that correspond to elements forming a real chemical compound or alloy to produce a new equipment item named after that compound, where the Loot_Rarity of the crafted item SHALL be determined by the highest Loot_Rarity tier among the reagents used.
12. WHEN a crafting recipe requires a reagent of a specific Loot_Rarity tier or higher, THE Application SHALL prevent the crafting action from proceeding if no reagent of the required tier is present in the user's inventory and SHALL display a message indicating the missing rarity requirement.
13. IF the inventory is full when a Loot drop is generated, THEN THE Application SHALL prompt the user to discard or store an existing item before adding the new Loot.

---

### Requirement 10: Game Mode – Element Mastery and Name Tag System

**User Story:** As a user, I want to earn a Name Tag the first time I defeat each element, so that I can equip it to gain unique abilities based on that element's properties.

#### Acceptance Criteria

1. WHEN a user defeats an element in Game_Mode for the first time, THE Progression_Service SHALL award a Name_Tag for that element to the user's Account.
2. THE Application SHALL allow the user to equip exactly one Name_Tag at a time from the user's collected Name_Tags.
3. WHEN a user equips a Name_Tag, THE Combat_Engine SHALL grant the user abilities derived from the corresponding element's chemical properties, such as regeneration effects for Oxygen, defensive reinforcement for Iron, or movement speed modification for Mercury.
4. WHEN a user equips a different Name_Tag, THE Combat_Engine SHALL replace the previously active abilities with the abilities of the newly equipped Name_Tag.
5. THE Progression_Service SHALL persist the user's equipped Name_Tag and full Name_Tag collection to the user's Account so that the state is restored on login.
6. WHEN a user views the Name_Tag collection, THE Application SHALL display all earned Name_Tags, indicate which is currently equipped, and show the ability description for each.
