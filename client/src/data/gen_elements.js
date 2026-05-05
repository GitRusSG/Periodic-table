// elements data generator

const elements = [

// Z=1 Hydrogen
{
  "atomicNumber": 1, "symbol": "H", "name": "Hydrogen",
  "group": 1, "period": 1, "block": "s", "classification": "nonmetal",
  "atomicMass": 1.008, "density": 0.00008988, "electronegativity": 2.20,
  "electronConfiguration": "1s1", "electronShells": [1],
  "oxidationStates": [-1, 1],
  "isotopes": [
    {"massNumber": 1, "abundance": 99.9885, "halfLife": null},
    {"massNumber": 2, "abundance": 0.0115, "halfLife": null},
    {"massNumber": 3, "abundance": null, "halfLife": "12.32 years"}
  ],
  "ionForms": [{"charge": 1, "notation": "H⁺"}, {"charge": -1, "notation": "H⁻"}],
  "crustalAbundancePpm": 1400, "cosmicAbundance": 739000,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Combat", "lootRarity": "Common"
},
// Z=2 Helium
{
  "atomicNumber": 2, "symbol": "He", "name": "Helium",
  "group": 18, "period": 1, "block": "s", "classification": "noble_gas",
  "atomicMass": 4.0026, "density": 0.0001785, "electronegativity": null,
  "electronConfiguration": "1s2", "electronShells": [2],
  "oxidationStates": [0],
  "isotopes": [
    {"massNumber": 3, "abundance": 0.000137, "halfLife": null},
    {"massNumber": 4, "abundance": 99.999863, "halfLife": null}
  ],
  "ionForms": [],
  "crustalAbundancePpm": 0.008, "cosmicAbundance": 240000,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Passive", "lootRarity": "Rare"
},
// Z=3 Lithium
{
  "atomicNumber": 3, "symbol": "Li", "name": "Lithium",
  "group": 1, "period": 2, "block": "s", "classification": "alkali_metal",
  "atomicMass": 6.941, "density": 0.534, "electronegativity": 0.98,
  "electronConfiguration": "[He] 2s1", "electronShells": [2, 1],
  "oxidationStates": [1],
  "isotopes": [
    {"massNumber": 6, "abundance": 7.59, "halfLife": null},
    {"massNumber": 7, "abundance": 92.41, "halfLife": null}
  ],
  "ionForms": [{"charge": 1, "notation": "Li⁺"}],
  "crustalAbundancePpm": 20, "cosmicAbundance": 6,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Combat", "lootRarity": "Uncommon"
},
// Z=4 Beryllium
{
  "atomicNumber": 4, "symbol": "Be", "name": "Beryllium",
  "group": 2, "period": 2, "block": "s", "classification": "alkaline_earth_metal",
  "atomicMass": 9.0122, "density": 1.85, "electronegativity": 1.57,
  "electronConfiguration": "[He] 2s2", "electronShells": [2, 2],
  "oxidationStates": [2],
  "isotopes": [
    {"massNumber": 9, "abundance": 100, "halfLife": null},
    {"massNumber": 10, "abundance": null, "halfLife": "1.39 million years"}
  ],
  "ionForms": [{"charge": 2, "notation": "Be²⁺"}],
  "crustalAbundancePpm": 2.8, "cosmicAbundance": 0.1,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Uncommon"
},
// Z=5 Boron
{
  "atomicNumber": 5, "symbol": "B", "name": "Boron",
  "group": 13, "period": 2, "block": "p", "classification": "metalloid",
  "atomicMass": 10.81, "density": 2.34, "electronegativity": 2.04,
  "electronConfiguration": "[He] 2s2 2p1", "electronShells": [2, 3],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 10, "abundance": 19.9, "halfLife": null},
    {"massNumber": 11, "abundance": 80.1, "halfLife": null}
  ],
  "ionForms": [{"charge": 3, "notation": "B³⁺"}],
  "crustalAbundancePpm": 10, "cosmicAbundance": 2.4,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Uncommon"
},
// Z=6 Carbon
{
  "atomicNumber": 6, "symbol": "C", "name": "Carbon",
  "group": 14, "period": 2, "block": "p", "classification": "nonmetal",
  "atomicMass": 12.011, "density": 2.267, "electronegativity": 2.55,
  "electronConfiguration": "[He] 2s2 2p2", "electronShells": [2, 4],
  "oxidationStates": [-4, -3, -2, -1, 0, 1, 2, 3, 4],
  "isotopes": [
    {"massNumber": 12, "abundance": 98.93, "halfLife": null},
    {"massNumber": 13, "abundance": 1.07, "halfLife": null},
    {"massNumber": 14, "abundance": null, "halfLife": "5730 years"}
  ],
  "ionForms": [{"charge": 4, "notation": "C⁴⁺"}, {"charge": -4, "notation": "C⁴⁻"}],
  "crustalAbundancePpm": 200, "cosmicAbundance": 4600,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Combat", "lootRarity": "Common"
},
// Z=7 Nitrogen
{
  "atomicNumber": 7, "symbol": "N", "name": "Nitrogen",
  "group": 15, "period": 2, "block": "p", "classification": "nonmetal",
  "atomicMass": 14.007, "density": 0.001251, "electronegativity": 3.04,
  "electronConfiguration": "[He] 2s2 2p3", "electronShells": [2, 5],
  "oxidationStates": [-3, -2, -1, 1, 2, 3, 4, 5],
  "isotopes": [
    {"massNumber": 14, "abundance": 99.632, "halfLife": null},
    {"massNumber": 15, "abundance": 0.368, "halfLife": null}
  ],
  "ionForms": [{"charge": -3, "notation": "N³⁻"}, {"charge": 3, "notation": "N³⁺"}],
  "crustalAbundancePpm": 19, "cosmicAbundance": 960,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Combat", "lootRarity": "Common"
},
// Z=8 Oxygen
{
  "atomicNumber": 8, "symbol": "O", "name": "Oxygen",
  "group": 16, "period": 2, "block": "p", "classification": "nonmetal",
  "atomicMass": 15.999, "density": 0.001429, "electronegativity": 3.44,
  "electronConfiguration": "[He] 2s2 2p4", "electronShells": [2, 6],
  "oxidationStates": [-2, -1, 1, 2],
  "isotopes": [
    {"massNumber": 16, "abundance": 99.757, "halfLife": null},
    {"massNumber": 17, "abundance": 0.038, "halfLife": null},
    {"massNumber": 18, "abundance": 0.205, "halfLife": null}
  ],
  "ionForms": [{"charge": -2, "notation": "O²⁻"}],
  "crustalAbundancePpm": 461000, "cosmicAbundance": 10000,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Combat", "lootRarity": "Common"
},
// Z=9 Fluorine
{
  "atomicNumber": 9, "symbol": "F", "name": "Fluorine",
  "group": 17, "period": 2, "block": "p", "classification": "halogen",
  "atomicMass": 18.998, "density": 0.001696, "electronegativity": 3.98,
  "electronConfiguration": "[He] 2s2 2p5", "electronShells": [2, 7],
  "oxidationStates": [-1],
  "isotopes": [
    {"massNumber": 19, "abundance": 100, "halfLife": null},
    {"massNumber": 18, "abundance": null, "halfLife": "109.77 minutes"}
  ],
  "ionForms": [{"charge": -1, "notation": "F⁻"}],
  "crustalAbundancePpm": 585, "cosmicAbundance": 400,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Combat", "lootRarity": "Common"
},
// Z=10 Neon
{
  "atomicNumber": 10, "symbol": "Ne", "name": "Neon",
  "group": 18, "period": 2, "block": "p", "classification": "noble_gas",
  "atomicMass": 20.18, "density": 0.0009002, "electronegativity": null,
  "electronConfiguration": "[He] 2s2 2p6", "electronShells": [2, 8],
  "oxidationStates": [0],
  "isotopes": [
    {"massNumber": 20, "abundance": 90.48, "halfLife": null},
    {"massNumber": 21, "abundance": 0.27, "halfLife": null},
    {"massNumber": 22, "abundance": 9.25, "halfLife": null}
  ],
  "ionForms": [],
  "crustalAbundancePpm": 0.0005, "cosmicAbundance": 1340,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Passive", "lootRarity": "Rare"
},

// Z=11 Sodium
{
  "atomicNumber": 11, "symbol": "Na", "name": "Sodium",
  "group": 1, "period": 3, "block": "s", "classification": "alkali_metal",
  "atomicMass": 22.99, "density": 0.971, "electronegativity": 0.93,
  "electronConfiguration": "[Ne] 3s1", "electronShells": [2, 8, 1],
  "oxidationStates": [1],
  "isotopes": [
    {"massNumber": 23, "abundance": 100, "halfLife": null},
    {"massNumber": 22, "abundance": null, "halfLife": "2.6019 years"}
  ],
  "ionForms": [{"charge": 1, "notation": "Na⁺"}],
  "crustalAbundancePpm": 23600, "cosmicAbundance": 33,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Combat", "lootRarity": "Common"
},
// Z=12 Magnesium
{
  "atomicNumber": 12, "symbol": "Mg", "name": "Magnesium",
  "group": 2, "period": 3, "block": "s", "classification": "alkaline_earth_metal",
  "atomicMass": 24.305, "density": 1.738, "electronegativity": 1.31,
  "electronConfiguration": "[Ne] 3s2", "electronShells": [2, 8, 2],
  "oxidationStates": [2],
  "isotopes": [
    {"massNumber": 24, "abundance": 78.99, "halfLife": null},
    {"massNumber": 25, "abundance": 10.0, "halfLife": null},
    {"massNumber": 26, "abundance": 11.01, "halfLife": null}
  ],
  "ionForms": [{"charge": 2, "notation": "Mg²⁺"}],
  "crustalAbundancePpm": 23300, "cosmicAbundance": 580,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Common"
},
// Z=13 Aluminium
{
  "atomicNumber": 13, "symbol": "Al", "name": "Aluminium",
  "group": 13, "period": 3, "block": "p", "classification": "post_transition_metal",
  "atomicMass": 26.982, "density": 2.698, "electronegativity": 1.61,
  "electronConfiguration": "[Ne] 3s2 3p1", "electronShells": [2, 8, 3],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 27, "abundance": 100, "halfLife": null},
    {"massNumber": 26, "abundance": null, "halfLife": "717000 years"}
  ],
  "ionForms": [{"charge": 3, "notation": "Al³⁺"}],
  "crustalAbundancePpm": 82300, "cosmicAbundance": 58,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Common"
},
// Z=14 Silicon
{
  "atomicNumber": 14, "symbol": "Si", "name": "Silicon",
  "group": 14, "period": 3, "block": "p", "classification": "metalloid",
  "atomicMass": 28.085, "density": 2.329, "electronegativity": 1.90,
  "electronConfiguration": "[Ne] 3s2 3p2", "electronShells": [2, 8, 4],
  "oxidationStates": [-4, 4],
  "isotopes": [
    {"massNumber": 28, "abundance": 92.23, "halfLife": null},
    {"massNumber": 29, "abundance": 4.67, "halfLife": null},
    {"massNumber": 30, "abundance": 3.10, "halfLife": null}
  ],
  "ionForms": [{"charge": 4, "notation": "Si⁴⁺"}, {"charge": -4, "notation": "Si⁴⁻"}],
  "crustalAbundancePpm": 282000, "cosmicAbundance": 650,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Common"
},
// Z=15 Phosphorus
{
  "atomicNumber": 15, "symbol": "P", "name": "Phosphorus",
  "group": 15, "period": 3, "block": "p", "classification": "nonmetal",
  "atomicMass": 30.974, "density": 1.82, "electronegativity": 2.19,
  "electronConfiguration": "[Ne] 3s2 3p3", "electronShells": [2, 8, 5],
  "oxidationStates": [-3, 3, 5],
  "isotopes": [
    {"massNumber": 31, "abundance": 100, "halfLife": null},
    {"massNumber": 32, "abundance": null, "halfLife": "14.263 days"}
  ],
  "ionForms": [{"charge": -3, "notation": "P³⁻"}, {"charge": 5, "notation": "P⁵⁺"}],
  "crustalAbundancePpm": 1050, "cosmicAbundance": 7.2,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Combat", "lootRarity": "Common"
},
// Z=16 Sulfur
{
  "atomicNumber": 16, "symbol": "S", "name": "Sulfur",
  "group": 16, "period": 3, "block": "p", "classification": "nonmetal",
  "atomicMass": 32.06, "density": 2.067, "electronegativity": 2.58,
  "electronConfiguration": "[Ne] 3s2 3p4", "electronShells": [2, 8, 6],
  "oxidationStates": [-2, 2, 4, 6],
  "isotopes": [
    {"massNumber": 32, "abundance": 94.99, "halfLife": null},
    {"massNumber": 33, "abundance": 0.75, "halfLife": null},
    {"massNumber": 34, "abundance": 4.25, "halfLife": null},
    {"massNumber": 36, "abundance": 0.01, "halfLife": null}
  ],
  "ionForms": [{"charge": -2, "notation": "S²⁻"}, {"charge": 6, "notation": "S⁶⁺"}],
  "crustalAbundancePpm": 350, "cosmicAbundance": 440,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Combat", "lootRarity": "Common"
},
// Z=17 Chlorine
{
  "atomicNumber": 17, "symbol": "Cl", "name": "Chlorine",
  "group": 17, "period": 3, "block": "p", "classification": "halogen",
  "atomicMass": 35.45, "density": 0.003214, "electronegativity": 3.16,
  "electronConfiguration": "[Ne] 3s2 3p5", "electronShells": [2, 8, 7],
  "oxidationStates": [-1, 1, 3, 5, 7],
  "isotopes": [
    {"massNumber": 35, "abundance": 75.77, "halfLife": null},
    {"massNumber": 37, "abundance": 24.23, "halfLife": null}
  ],
  "ionForms": [{"charge": -1, "notation": "Cl⁻"}, {"charge": 1, "notation": "Cl⁺"}],
  "crustalAbundancePpm": 145, "cosmicAbundance": 90,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Combat", "lootRarity": "Common"
},
// Z=18 Argon
{
  "atomicNumber": 18, "symbol": "Ar", "name": "Argon",
  "group": 18, "period": 3, "block": "p", "classification": "noble_gas",
  "atomicMass": 39.948, "density": 0.001784, "electronegativity": null,
  "electronConfiguration": "[Ne] 3s2 3p6", "electronShells": [2, 8, 8],
  "oxidationStates": [0],
  "isotopes": [
    {"massNumber": 36, "abundance": 0.3365, "halfLife": null},
    {"massNumber": 38, "abundance": 0.0632, "halfLife": null},
    {"massNumber": 40, "abundance": 99.6003, "halfLife": null}
  ],
  "ionForms": [],
  "crustalAbundancePpm": 3.5, "cosmicAbundance": 133,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Passive", "lootRarity": "Uncommon"
},
// Z=19 Potassium
{
  "atomicNumber": 19, "symbol": "K", "name": "Potassium",
  "group": 1, "period": 4, "block": "s", "classification": "alkali_metal",
  "atomicMass": 39.098, "density": 0.862, "electronegativity": 0.82,
  "electronConfiguration": "[Ar] 4s1", "electronShells": [2, 8, 8, 1],
  "oxidationStates": [1],
  "isotopes": [
    {"massNumber": 39, "abundance": 93.258, "halfLife": null},
    {"massNumber": 40, "abundance": 0.012, "halfLife": "1.248 billion years"},
    {"massNumber": 41, "abundance": 6.730, "halfLife": null}
  ],
  "ionForms": [{"charge": 1, "notation": "K⁺"}],
  "crustalAbundancePpm": 20900, "cosmicAbundance": 3.7,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Combat", "lootRarity": "Common"
},
// Z=20 Calcium
{
  "atomicNumber": 20, "symbol": "Ca", "name": "Calcium",
  "group": 2, "period": 4, "block": "s", "classification": "alkaline_earth_metal",
  "atomicMass": 40.078, "density": 1.55, "electronegativity": 1.00,
  "electronConfiguration": "[Ar] 4s2", "electronShells": [2, 8, 8, 2],
  "oxidationStates": [2],
  "isotopes": [
    {"massNumber": 40, "abundance": 96.941, "halfLife": null},
    {"massNumber": 42, "abundance": 0.647, "halfLife": null},
    {"massNumber": 44, "abundance": 2.086, "halfLife": null},
    {"massNumber": 48, "abundance": 0.187, "halfLife": null}
  ],
  "ionForms": [{"charge": 2, "notation": "Ca²⁺"}],
  "crustalAbundancePpm": 41500, "cosmicAbundance": 60,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Common"
},

// Z=21 Scandium
{
  "atomicNumber": 21, "symbol": "Sc", "name": "Scandium",
  "group": 3, "period": 4, "block": "d", "classification": "transition_metal",
  "atomicMass": 44.956, "density": 2.985, "electronegativity": 1.36,
  "electronConfiguration": "[Ar] 3d1 4s2", "electronShells": [2, 8, 9, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 45, "abundance": 100, "halfLife": null},
    {"massNumber": 46, "abundance": null, "halfLife": "83.79 days"}
  ],
  "ionForms": [{"charge": 3, "notation": "Sc³⁺"}],
  "crustalAbundancePpm": 22, "cosmicAbundance": 0.034,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Uncommon"
},
// Z=22 Titanium
{
  "atomicNumber": 22, "symbol": "Ti", "name": "Titanium",
  "group": 4, "period": 4, "block": "d", "classification": "transition_metal",
  "atomicMass": 47.867, "density": 4.506, "electronegativity": 1.54,
  "electronConfiguration": "[Ar] 3d2 4s2", "electronShells": [2, 8, 10, 2],
  "oxidationStates": [2, 3, 4],
  "isotopes": [
    {"massNumber": 46, "abundance": 8.25, "halfLife": null},
    {"massNumber": 47, "abundance": 7.44, "halfLife": null},
    {"massNumber": 48, "abundance": 73.72, "halfLife": null},
    {"massNumber": 49, "abundance": 5.41, "halfLife": null},
    {"massNumber": 50, "abundance": 5.18, "halfLife": null}
  ],
  "ionForms": [{"charge": 4, "notation": "Ti⁴⁺"}, {"charge": 2, "notation": "Ti²⁺"}],
  "crustalAbundancePpm": 5650, "cosmicAbundance": 2.4,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Common"
},
// Z=23 Vanadium
{
  "atomicNumber": 23, "symbol": "V", "name": "Vanadium",
  "group": 5, "period": 4, "block": "d", "classification": "transition_metal",
  "atomicMass": 50.942, "density": 6.0, "electronegativity": 1.63,
  "electronConfiguration": "[Ar] 3d3 4s2", "electronShells": [2, 8, 11, 2],
  "oxidationStates": [2, 3, 4, 5],
  "isotopes": [
    {"massNumber": 50, "abundance": 0.25, "halfLife": null},
    {"massNumber": 51, "abundance": 99.75, "halfLife": null}
  ],
  "ionForms": [{"charge": 5, "notation": "V⁵⁺"}, {"charge": 2, "notation": "V²⁺"}],
  "crustalAbundancePpm": 120, "cosmicAbundance": 0.29,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Common"
},
// Z=24 Chromium
{
  "atomicNumber": 24, "symbol": "Cr", "name": "Chromium",
  "group": 6, "period": 4, "block": "d", "classification": "transition_metal",
  "atomicMass": 51.996, "density": 7.15, "electronegativity": 1.66,
  "electronConfiguration": "[Ar] 3d5 4s1", "electronShells": [2, 8, 13, 1],
  "oxidationStates": [2, 3, 6],
  "isotopes": [
    {"massNumber": 50, "abundance": 4.345, "halfLife": null},
    {"massNumber": 52, "abundance": 83.789, "halfLife": null},
    {"massNumber": 53, "abundance": 9.501, "halfLife": null},
    {"massNumber": 54, "abundance": 2.365, "halfLife": null}
  ],
  "ionForms": [{"charge": 3, "notation": "Cr³⁺"}, {"charge": 6, "notation": "Cr⁶⁺"}],
  "crustalAbundancePpm": 102, "cosmicAbundance": 1.3,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Common"
},
// Z=25 Manganese
{
  "atomicNumber": 25, "symbol": "Mn", "name": "Manganese",
  "group": 7, "period": 4, "block": "d", "classification": "transition_metal",
  "atomicMass": 54.938, "density": 7.21, "electronegativity": 1.55,
  "electronConfiguration": "[Ar] 3d5 4s2", "electronShells": [2, 8, 13, 2],
  "oxidationStates": [2, 3, 4, 7],
  "isotopes": [
    {"massNumber": 55, "abundance": 100, "halfLife": null},
    {"massNumber": 54, "abundance": null, "halfLife": "312.03 days"}
  ],
  "ionForms": [{"charge": 2, "notation": "Mn²⁺"}, {"charge": 7, "notation": "Mn⁷⁺"}],
  "crustalAbundancePpm": 950, "cosmicAbundance": 0.93,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Common"
},
// Z=26 Iron
{
  "atomicNumber": 26, "symbol": "Fe", "name": "Iron",
  "group": 8, "period": 4, "block": "d", "classification": "transition_metal",
  "atomicMass": 55.845, "density": 7.874, "electronegativity": 1.83,
  "electronConfiguration": "[Ar] 3d6 4s2", "electronShells": [2, 8, 14, 2],
  "oxidationStates": [2, 3],
  "isotopes": [
    {"massNumber": 54, "abundance": 5.845, "halfLife": null},
    {"massNumber": 56, "abundance": 91.754, "halfLife": null},
    {"massNumber": 57, "abundance": 2.119, "halfLife": null},
    {"massNumber": 58, "abundance": 0.282, "halfLife": null}
  ],
  "ionForms": [{"charge": 2, "notation": "Fe²⁺"}, {"charge": 3, "notation": "Fe³⁺"}],
  "crustalAbundancePpm": 56300, "cosmicAbundance": 1090,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Common"
},
// Z=27 Cobalt
{
  "atomicNumber": 27, "symbol": "Co", "name": "Cobalt",
  "group": 9, "period": 4, "block": "d", "classification": "transition_metal",
  "atomicMass": 58.933, "density": 8.9, "electronegativity": 1.88,
  "electronConfiguration": "[Ar] 3d7 4s2", "electronShells": [2, 8, 15, 2],
  "oxidationStates": [2, 3],
  "isotopes": [
    {"massNumber": 59, "abundance": 100, "halfLife": null},
    {"massNumber": 60, "abundance": null, "halfLife": "5.2714 years"}
  ],
  "ionForms": [{"charge": 2, "notation": "Co²⁺"}, {"charge": 3, "notation": "Co³⁺"}],
  "crustalAbundancePpm": 25, "cosmicAbundance": 0.23,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Uncommon"
},
// Z=28 Nickel
{
  "atomicNumber": 28, "symbol": "Ni", "name": "Nickel",
  "group": 10, "period": 4, "block": "d", "classification": "transition_metal",
  "atomicMass": 58.693, "density": 8.908, "electronegativity": 1.91,
  "electronConfiguration": "[Ar] 3d8 4s2", "electronShells": [2, 8, 16, 2],
  "oxidationStates": [2, 3],
  "isotopes": [
    {"massNumber": 58, "abundance": 68.077, "halfLife": null},
    {"massNumber": 60, "abundance": 26.223, "halfLife": null},
    {"massNumber": 62, "abundance": 3.634, "halfLife": null}
  ],
  "ionForms": [{"charge": 2, "notation": "Ni²⁺"}],
  "crustalAbundancePpm": 84, "cosmicAbundance": 0.49,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Common"
},
// Z=29 Copper
{
  "atomicNumber": 29, "symbol": "Cu", "name": "Copper",
  "group": 11, "period": 4, "block": "d", "classification": "transition_metal",
  "atomicMass": 63.546, "density": 8.96, "electronegativity": 1.90,
  "electronConfiguration": "[Ar] 3d10 4s1", "electronShells": [2, 8, 18, 1],
  "oxidationStates": [1, 2],
  "isotopes": [
    {"massNumber": 63, "abundance": 69.15, "halfLife": null},
    {"massNumber": 65, "abundance": 30.85, "halfLife": null}
  ],
  "ionForms": [{"charge": 1, "notation": "Cu⁺"}, {"charge": 2, "notation": "Cu²⁺"}],
  "crustalAbundancePpm": 60, "cosmicAbundance": 0.052,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Common"
},
// Z=30 Zinc
{
  "atomicNumber": 30, "symbol": "Zn", "name": "Zinc",
  "group": 12, "period": 4, "block": "d", "classification": "transition_metal",
  "atomicMass": 65.38, "density": 7.134, "electronegativity": 1.65,
  "electronConfiguration": "[Ar] 3d10 4s2", "electronShells": [2, 8, 18, 2],
  "oxidationStates": [2],
  "isotopes": [
    {"massNumber": 64, "abundance": 48.6, "halfLife": null},
    {"massNumber": 66, "abundance": 27.9, "halfLife": null},
    {"massNumber": 68, "abundance": 18.8, "halfLife": null}
  ],
  "ionForms": [{"charge": 2, "notation": "Zn²⁺"}],
  "crustalAbundancePpm": 70, "cosmicAbundance": 0.12,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Common"
},

// Z=31 Gallium
{
  "atomicNumber": 31, "symbol": "Ga", "name": "Gallium",
  "group": 13, "period": 4, "block": "p", "classification": "post_transition_metal",
  "atomicMass": 69.723, "density": 5.91, "electronegativity": 1.81,
  "electronConfiguration": "[Ar] 3d10 4s2 4p1", "electronShells": [2, 8, 18, 3],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 69, "abundance": 60.108, "halfLife": null},
    {"massNumber": 71, "abundance": 39.892, "halfLife": null}
  ],
  "ionForms": [{"charge": 3, "notation": "Ga³⁺"}],
  "crustalAbundancePpm": 19, "cosmicAbundance": 0.0036,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Uncommon"
},
// Z=32 Germanium
{
  "atomicNumber": 32, "symbol": "Ge", "name": "Germanium",
  "group": 14, "period": 4, "block": "p", "classification": "metalloid",
  "atomicMass": 72.63, "density": 5.323, "electronegativity": 2.01,
  "electronConfiguration": "[Ar] 3d10 4s2 4p2", "electronShells": [2, 8, 18, 4],
  "oxidationStates": [2, 4],
  "isotopes": [
    {"massNumber": 70, "abundance": 20.84, "halfLife": null},
    {"massNumber": 72, "abundance": 27.54, "halfLife": null},
    {"massNumber": 74, "abundance": 36.28, "halfLife": null}
  ],
  "ionForms": [{"charge": 4, "notation": "Ge⁴⁺"}, {"charge": 2, "notation": "Ge²⁺"}],
  "crustalAbundancePpm": 1.5, "cosmicAbundance": 0.115,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Uncommon"
},
// Z=33 Arsenic
{
  "atomicNumber": 33, "symbol": "As", "name": "Arsenic",
  "group": 15, "period": 4, "block": "p", "classification": "metalloid",
  "atomicMass": 74.922, "density": 5.727, "electronegativity": 2.18,
  "electronConfiguration": "[Ar] 3d10 4s2 4p3", "electronShells": [2, 8, 18, 5],
  "oxidationStates": [-3, 3, 5],
  "isotopes": [
    {"massNumber": 75, "abundance": 100, "halfLife": null},
    {"massNumber": 73, "abundance": null, "halfLife": "80.3 days"}
  ],
  "ionForms": [{"charge": 3, "notation": "As³⁺"}, {"charge": -3, "notation": "As³⁻"}],
  "crustalAbundancePpm": 1.8, "cosmicAbundance": 0.0062,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Uncommon"
},
// Z=34 Selenium
{
  "atomicNumber": 34, "symbol": "Se", "name": "Selenium",
  "group": 16, "period": 4, "block": "p", "classification": "nonmetal",
  "atomicMass": 78.971, "density": 4.809, "electronegativity": 2.55,
  "electronConfiguration": "[Ar] 3d10 4s2 4p4", "electronShells": [2, 8, 18, 6],
  "oxidationStates": [-2, 4, 6],
  "isotopes": [
    {"massNumber": 78, "abundance": 23.77, "halfLife": null},
    {"massNumber": 80, "abundance": 49.61, "halfLife": null},
    {"massNumber": 82, "abundance": 8.73, "halfLife": null}
  ],
  "ionForms": [{"charge": -2, "notation": "Se²⁻"}, {"charge": 4, "notation": "Se⁴⁺"}],
  "crustalAbundancePpm": 0.05, "cosmicAbundance": 0.062,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Combat", "lootRarity": "Rare"
},
// Z=35 Bromine
{
  "atomicNumber": 35, "symbol": "Br", "name": "Bromine",
  "group": 17, "period": 4, "block": "p", "classification": "halogen",
  "atomicMass": 79.904, "density": 3.122, "electronegativity": 2.96,
  "electronConfiguration": "[Ar] 3d10 4s2 4p5", "electronShells": [2, 8, 18, 7],
  "oxidationStates": [-1, 1, 3, 5],
  "isotopes": [
    {"massNumber": 79, "abundance": 50.69, "halfLife": null},
    {"massNumber": 81, "abundance": 49.31, "halfLife": null}
  ],
  "ionForms": [{"charge": -1, "notation": "Br⁻"}, {"charge": 1, "notation": "Br⁺"}],
  "crustalAbundancePpm": 2.4, "cosmicAbundance": 0.0057,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Combat", "lootRarity": "Uncommon"
},
// Z=36 Krypton
{
  "atomicNumber": 36, "symbol": "Kr", "name": "Krypton",
  "group": 18, "period": 4, "block": "p", "classification": "noble_gas",
  "atomicMass": 83.798, "density": 0.003749, "electronegativity": 3.00,
  "electronConfiguration": "[Ar] 3d10 4s2 4p6", "electronShells": [2, 8, 18, 8],
  "oxidationStates": [0, 2],
  "isotopes": [
    {"massNumber": 78, "abundance": 0.355, "halfLife": null},
    {"massNumber": 80, "abundance": 2.286, "halfLife": null},
    {"massNumber": 82, "abundance": 11.593, "halfLife": null},
    {"massNumber": 84, "abundance": 56.987, "halfLife": null}
  ],
  "ionForms": [],
  "crustalAbundancePpm": 0.0001, "cosmicAbundance": 0.55,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Passive", "lootRarity": "Rare"
},
// Z=37 Rubidium
{
  "atomicNumber": 37, "symbol": "Rb", "name": "Rubidium",
  "group": 1, "period": 5, "block": "s", "classification": "alkali_metal",
  "atomicMass": 85.468, "density": 1.532, "electronegativity": 0.82,
  "electronConfiguration": "[Kr] 5s1", "electronShells": [2, 8, 18, 8, 1],
  "oxidationStates": [1],
  "isotopes": [
    {"massNumber": 85, "abundance": 72.17, "halfLife": null},
    {"massNumber": 87, "abundance": 27.83, "halfLife": "49.23 billion years"}
  ],
  "ionForms": [{"charge": 1, "notation": "Rb⁺"}],
  "crustalAbundancePpm": 90, "cosmicAbundance": 0.24,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Combat", "lootRarity": "Common"
},
// Z=38 Strontium
{
  "atomicNumber": 38, "symbol": "Sr", "name": "Strontium",
  "group": 2, "period": 5, "block": "s", "classification": "alkaline_earth_metal",
  "atomicMass": 87.62, "density": 2.64, "electronegativity": 0.95,
  "electronConfiguration": "[Kr] 5s2", "electronShells": [2, 8, 18, 8, 2],
  "oxidationStates": [2],
  "isotopes": [
    {"massNumber": 84, "abundance": 0.56, "halfLife": null},
    {"massNumber": 86, "abundance": 9.86, "halfLife": null},
    {"massNumber": 87, "abundance": 7.0, "halfLife": null},
    {"massNumber": 88, "abundance": 82.58, "halfLife": null}
  ],
  "ionForms": [{"charge": 2, "notation": "Sr²⁺"}],
  "crustalAbundancePpm": 370, "cosmicAbundance": 0.87,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Common"
},
// Z=39 Yttrium
{
  "atomicNumber": 39, "symbol": "Y", "name": "Yttrium",
  "group": 3, "period": 5, "block": "d", "classification": "transition_metal",
  "atomicMass": 88.906, "density": 4.472, "electronegativity": 1.22,
  "electronConfiguration": "[Kr] 4d1 5s2", "electronShells": [2, 8, 18, 9, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 89, "abundance": 100, "halfLife": null},
    {"massNumber": 90, "abundance": null, "halfLife": "64.1 hours"}
  ],
  "ionForms": [{"charge": 3, "notation": "Y³⁺"}],
  "crustalAbundancePpm": 33, "cosmicAbundance": 0.17,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Uncommon"
},
// Z=40 Zirconium
{
  "atomicNumber": 40, "symbol": "Zr", "name": "Zirconium",
  "group": 4, "period": 5, "block": "d", "classification": "transition_metal",
  "atomicMass": 91.224, "density": 6.52, "electronegativity": 1.33,
  "electronConfiguration": "[Kr] 4d2 5s2", "electronShells": [2, 8, 18, 10, 2],
  "oxidationStates": [4],
  "isotopes": [
    {"massNumber": 90, "abundance": 51.45, "halfLife": null},
    {"massNumber": 91, "abundance": 11.22, "halfLife": null},
    {"massNumber": 92, "abundance": 17.15, "halfLife": null},
    {"massNumber": 94, "abundance": 17.38, "halfLife": null}
  ],
  "ionForms": [{"charge": 4, "notation": "Zr⁴⁺"}],
  "crustalAbundancePpm": 165, "cosmicAbundance": 0.11,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Common"
},

// Z=41 Niobium
{
  "atomicNumber": 41, "symbol": "Nb", "name": "Niobium",
  "group": 5, "period": 5, "block": "d", "classification": "transition_metal",
  "atomicMass": 92.906, "density": 8.57, "electronegativity": 1.6,
  "electronConfiguration": "[Kr] 4d4 5s1", "electronShells": [2, 8, 18, 12, 1],
  "oxidationStates": [3, 5],
  "isotopes": [
    {"massNumber": 93, "abundance": 100, "halfLife": null},
    {"massNumber": 92, "abundance": null, "halfLife": "34.7 million years"}
  ],
  "ionForms": [{"charge": 5, "notation": "Nb⁵⁺"}],
  "crustalAbundancePpm": 20, "cosmicAbundance": 0.0079,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Uncommon"
},
// Z=42 Molybdenum
{
  "atomicNumber": 42, "symbol": "Mo", "name": "Molybdenum",
  "group": 6, "period": 5, "block": "d", "classification": "transition_metal",
  "atomicMass": 95.95, "density": 10.22, "electronegativity": 2.16,
  "electronConfiguration": "[Kr] 4d5 5s1", "electronShells": [2, 8, 18, 13, 1],
  "oxidationStates": [2, 3, 4, 6],
  "isotopes": [
    {"massNumber": 92, "abundance": 14.53, "halfLife": null},
    {"massNumber": 96, "abundance": 16.67, "halfLife": null},
    {"massNumber": 98, "abundance": 24.39, "halfLife": null}
  ],
  "ionForms": [{"charge": 6, "notation": "Mo⁶⁺"}, {"charge": 4, "notation": "Mo⁴⁺"}],
  "crustalAbundancePpm": 1.2, "cosmicAbundance": 0.026,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Uncommon"
},
// Z=43 Technetium
{
  "atomicNumber": 43, "symbol": "Tc", "name": "Technetium",
  "group": 7, "period": 5, "block": "d", "classification": "transition_metal",
  "atomicMass": 98, "density": 11.5, "electronegativity": 1.9,
  "electronConfiguration": "[Kr] 4d5 5s2", "electronShells": [2, 8, 18, 13, 2],
  "oxidationStates": [4, 7],
  "isotopes": [
    {"massNumber": 97, "abundance": null, "halfLife": "4.21 million years"},
    {"massNumber": 98, "abundance": null, "halfLife": "4.2 million years"},
    {"massNumber": 99, "abundance": null, "halfLife": "211100 years"}
  ],
  "ionForms": [{"charge": 7, "notation": "Tc⁷⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=44 Ruthenium
{
  "atomicNumber": 44, "symbol": "Ru", "name": "Ruthenium",
  "group": 8, "period": 5, "block": "d", "classification": "transition_metal",
  "atomicMass": 101.07, "density": 12.37, "electronegativity": 2.2,
  "electronConfiguration": "[Kr] 4d7 5s1", "electronShells": [2, 8, 18, 15, 1],
  "oxidationStates": [2, 3, 4, 8],
  "isotopes": [
    {"massNumber": 102, "abundance": 31.55, "halfLife": null},
    {"massNumber": 104, "abundance": 18.62, "halfLife": null},
    {"massNumber": 101, "abundance": 17.06, "halfLife": null}
  ],
  "ionForms": [{"charge": 3, "notation": "Ru³⁺"}, {"charge": 4, "notation": "Ru⁴⁺"}],
  "crustalAbundancePpm": 0.001, "cosmicAbundance": 0.017,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Rare"
},
// Z=45 Rhodium
{
  "atomicNumber": 45, "symbol": "Rh", "name": "Rhodium",
  "group": 9, "period": 5, "block": "d", "classification": "transition_metal",
  "atomicMass": 102.906, "density": 12.41, "electronegativity": 2.28,
  "electronConfiguration": "[Kr] 4d8 5s1", "electronShells": [2, 8, 18, 16, 1],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 103, "abundance": 100, "halfLife": null},
    {"massNumber": 102, "abundance": null, "halfLife": "207 days"}
  ],
  "ionForms": [{"charge": 3, "notation": "Rh³⁺"}],
  "crustalAbundancePpm": 0.0002, "cosmicAbundance": 0.0034,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Rare"
},
// Z=46 Palladium
{
  "atomicNumber": 46, "symbol": "Pd", "name": "Palladium",
  "group": 10, "period": 5, "block": "d", "classification": "transition_metal",
  "atomicMass": 106.42, "density": 12.023, "electronegativity": 2.20,
  "electronConfiguration": "[Kr] 4d10", "electronShells": [2, 8, 18, 18],
  "oxidationStates": [2, 4],
  "isotopes": [
    {"massNumber": 106, "abundance": 27.33, "halfLife": null},
    {"massNumber": 108, "abundance": 26.46, "halfLife": null},
    {"massNumber": 110, "abundance": 11.72, "halfLife": null}
  ],
  "ionForms": [{"charge": 2, "notation": "Pd²⁺"}, {"charge": 4, "notation": "Pd⁴⁺"}],
  "crustalAbundancePpm": 0.0006, "cosmicAbundance": 0.014,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Rare"
},
// Z=47 Silver
{
  "atomicNumber": 47, "symbol": "Ag", "name": "Silver",
  "group": 11, "period": 5, "block": "d", "classification": "transition_metal",
  "atomicMass": 107.868, "density": 10.49, "electronegativity": 1.93,
  "electronConfiguration": "[Kr] 4d10 5s1", "electronShells": [2, 8, 18, 18, 1],
  "oxidationStates": [1],
  "isotopes": [
    {"massNumber": 107, "abundance": 51.839, "halfLife": null},
    {"massNumber": 109, "abundance": 48.161, "halfLife": null}
  ],
  "ionForms": [{"charge": 1, "notation": "Ag⁺"}],
  "crustalAbundancePpm": 0.075, "cosmicAbundance": 0.0063,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Rare"
},
// Z=48 Cadmium
{
  "atomicNumber": 48, "symbol": "Cd", "name": "Cadmium",
  "group": 12, "period": 5, "block": "d", "classification": "transition_metal",
  "atomicMass": 112.414, "density": 8.65, "electronegativity": 1.69,
  "electronConfiguration": "[Kr] 4d10 5s2", "electronShells": [2, 8, 18, 18, 2],
  "oxidationStates": [2],
  "isotopes": [
    {"massNumber": 114, "abundance": 28.73, "halfLife": null},
    {"massNumber": 112, "abundance": 24.07, "halfLife": null},
    {"massNumber": 110, "abundance": 12.49, "halfLife": null}
  ],
  "ionForms": [{"charge": 2, "notation": "Cd²⁺"}],
  "crustalAbundancePpm": 0.15, "cosmicAbundance": 0.015,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Rare"
},
// Z=49 Indium
{
  "atomicNumber": 49, "symbol": "In", "name": "Indium",
  "group": 13, "period": 5, "block": "p", "classification": "post_transition_metal",
  "atomicMass": 114.818, "density": 7.31, "electronegativity": 1.78,
  "electronConfiguration": "[Kr] 4d10 5s2 5p1", "electronShells": [2, 8, 18, 18, 3],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 113, "abundance": 4.29, "halfLife": null},
    {"massNumber": 115, "abundance": 95.71, "halfLife": "441 trillion years"}
  ],
  "ionForms": [{"charge": 3, "notation": "In³⁺"}],
  "crustalAbundancePpm": 0.25, "cosmicAbundance": 0.0034,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Rare"
},
// Z=50 Tin
{
  "atomicNumber": 50, "symbol": "Sn", "name": "Tin",
  "group": 14, "period": 5, "block": "p", "classification": "post_transition_metal",
  "atomicMass": 118.71, "density": 7.287, "electronegativity": 1.96,
  "electronConfiguration": "[Kr] 4d10 5s2 5p2", "electronShells": [2, 8, 18, 18, 4],
  "oxidationStates": [2, 4],
  "isotopes": [
    {"massNumber": 120, "abundance": 32.58, "halfLife": null},
    {"massNumber": 118, "abundance": 24.22, "halfLife": null},
    {"massNumber": 116, "abundance": 14.54, "halfLife": null}
  ],
  "ionForms": [{"charge": 2, "notation": "Sn²⁺"}, {"charge": 4, "notation": "Sn⁴⁺"}],
  "crustalAbundancePpm": 2.3, "cosmicAbundance": 0.037,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Uncommon"
},

// Z=51 Antimony
{
  "atomicNumber": 51, "symbol": "Sb", "name": "Antimony",
  "group": 15, "period": 5, "block": "p", "classification": "metalloid",
  "atomicMass": 121.76, "density": 6.685, "electronegativity": 2.05,
  "electronConfiguration": "[Kr] 4d10 5s2 5p3", "electronShells": [2, 8, 18, 18, 5],
  "oxidationStates": [-3, 3, 5],
  "isotopes": [
    {"massNumber": 121, "abundance": 57.21, "halfLife": null},
    {"massNumber": 123, "abundance": 42.79, "halfLife": null}
  ],
  "ionForms": [{"charge": 3, "notation": "Sb³⁺"}, {"charge": 5, "notation": "Sb⁵⁺"}],
  "crustalAbundancePpm": 0.2, "cosmicAbundance": 0.00094,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Rare"
},
// Z=52 Tellurium
{
  "atomicNumber": 52, "symbol": "Te", "name": "Tellurium",
  "group": 16, "period": 5, "block": "p", "classification": "metalloid",
  "atomicMass": 127.6, "density": 6.232, "electronegativity": 2.1,
  "electronConfiguration": "[Kr] 4d10 5s2 5p4", "electronShells": [2, 8, 18, 18, 6],
  "oxidationStates": [-2, 4, 6],
  "isotopes": [
    {"massNumber": 130, "abundance": 34.08, "halfLife": null},
    {"massNumber": 128, "abundance": 31.74, "halfLife": null},
    {"massNumber": 126, "abundance": 18.84, "halfLife": null}
  ],
  "ionForms": [{"charge": -2, "notation": "Te²⁻"}, {"charge": 4, "notation": "Te⁴⁺"}],
  "crustalAbundancePpm": 0.001, "cosmicAbundance": 0.0047,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Rare"
},
// Z=53 Iodine
{
  "atomicNumber": 53, "symbol": "I", "name": "Iodine",
  "group": 17, "period": 5, "block": "p", "classification": "halogen",
  "atomicMass": 126.904, "density": 4.933, "electronegativity": 2.66,
  "electronConfiguration": "[Kr] 4d10 5s2 5p5", "electronShells": [2, 8, 18, 18, 7],
  "oxidationStates": [-1, 1, 5, 7],
  "isotopes": [
    {"massNumber": 127, "abundance": 100, "halfLife": null},
    {"massNumber": 131, "abundance": null, "halfLife": "8.0197 days"}
  ],
  "ionForms": [{"charge": -1, "notation": "I⁻"}, {"charge": 1, "notation": "I⁺"}],
  "crustalAbundancePpm": 0.45, "cosmicAbundance": 0.00090,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Combat", "lootRarity": "Rare"
},
// Z=54 Xenon
{
  "atomicNumber": 54, "symbol": "Xe", "name": "Xenon",
  "group": 18, "period": 5, "block": "p", "classification": "noble_gas",
  "atomicMass": 131.293, "density": 0.005887, "electronegativity": 2.60,
  "electronConfiguration": "[Kr] 4d10 5s2 5p6", "electronShells": [2, 8, 18, 18, 8],
  "oxidationStates": [0, 2, 4, 6],
  "isotopes": [
    {"massNumber": 132, "abundance": 26.909, "halfLife": null},
    {"massNumber": 129, "abundance": 26.401, "halfLife": null},
    {"massNumber": 131, "abundance": 21.232, "halfLife": null}
  ],
  "ionForms": [],
  "crustalAbundancePpm": 0.00003, "cosmicAbundance": 0.17,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Passive", "lootRarity": "Rare"
},
// Z=55 Caesium
{
  "atomicNumber": 55, "symbol": "Cs", "name": "Caesium",
  "group": 1, "period": 6, "block": "s", "classification": "alkali_metal",
  "atomicMass": 132.905, "density": 1.873, "electronegativity": 0.79,
  "electronConfiguration": "[Xe] 6s1", "electronShells": [2, 8, 18, 18, 8, 1],
  "oxidationStates": [1],
  "isotopes": [
    {"massNumber": 133, "abundance": 100, "halfLife": null},
    {"massNumber": 137, "abundance": null, "halfLife": "30.17 years"}
  ],
  "ionForms": [{"charge": 1, "notation": "Cs⁺"}],
  "crustalAbundancePpm": 3, "cosmicAbundance": 0.00087,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Combat", "lootRarity": "Uncommon"
},
// Z=56 Barium
{
  "atomicNumber": 56, "symbol": "Ba", "name": "Barium",
  "group": 2, "period": 6, "block": "s", "classification": "alkaline_earth_metal",
  "atomicMass": 137.327, "density": 3.51, "electronegativity": 0.89,
  "electronConfiguration": "[Xe] 6s2", "electronShells": [2, 8, 18, 18, 8, 2],
  "oxidationStates": [2],
  "isotopes": [
    {"massNumber": 138, "abundance": 71.698, "halfLife": null},
    {"massNumber": 137, "abundance": 11.232, "halfLife": null},
    {"massNumber": 136, "abundance": 7.854, "halfLife": null}
  ],
  "ionForms": [{"charge": 2, "notation": "Ba²⁺"}],
  "crustalAbundancePpm": 425, "cosmicAbundance": 0.16,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Common"
},
// Z=57 Lanthanum
{
  "atomicNumber": 57, "symbol": "La", "name": "Lanthanum",
  "group": null, "period": 6, "block": "f", "classification": "lanthanide",
  "atomicMass": 138.905, "density": 6.162, "electronegativity": 1.10,
  "electronConfiguration": "[Xe] 5d1 6s2", "electronShells": [2, 8, 18, 18, 9, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 139, "abundance": 99.91, "halfLife": null},
    {"massNumber": 138, "abundance": 0.09, "halfLife": "102 billion years"}
  ],
  "ionForms": [{"charge": 3, "notation": "La³⁺"}],
  "crustalAbundancePpm": 39, "cosmicAbundance": 0.16,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Epic"
},
// Z=58 Cerium
{
  "atomicNumber": 58, "symbol": "Ce", "name": "Cerium",
  "group": null, "period": 6, "block": "f", "classification": "lanthanide",
  "atomicMass": 140.116, "density": 6.77, "electronegativity": 1.12,
  "electronConfiguration": "[Xe] 4f1 5d1 6s2", "electronShells": [2, 8, 18, 19, 9, 2],
  "oxidationStates": [3, 4],
  "isotopes": [
    {"massNumber": 140, "abundance": 88.45, "halfLife": null},
    {"massNumber": 142, "abundance": 11.11, "halfLife": null},
    {"massNumber": 138, "abundance": 0.25, "halfLife": null}
  ],
  "ionForms": [{"charge": 3, "notation": "Ce³⁺"}, {"charge": 4, "notation": "Ce⁴⁺"}],
  "crustalAbundancePpm": 66.5, "cosmicAbundance": 0.41,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Epic"
},
// Z=59 Praseodymium
{
  "atomicNumber": 59, "symbol": "Pr", "name": "Praseodymium",
  "group": null, "period": 6, "block": "f", "classification": "lanthanide",
  "atomicMass": 140.908, "density": 6.77, "electronegativity": 1.13,
  "electronConfiguration": "[Xe] 4f3 6s2", "electronShells": [2, 8, 18, 21, 8, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 141, "abundance": 100, "halfLife": null},
    {"massNumber": 143, "abundance": null, "halfLife": "13.57 days"}
  ],
  "ionForms": [{"charge": 3, "notation": "Pr³⁺"}],
  "crustalAbundancePpm": 9.2, "cosmicAbundance": 0.059,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Epic"
},
// Z=60 Neodymium
{
  "atomicNumber": 60, "symbol": "Nd", "name": "Neodymium",
  "group": null, "period": 6, "block": "f", "classification": "lanthanide",
  "atomicMass": 144.242, "density": 7.01, "electronegativity": 1.14,
  "electronConfiguration": "[Xe] 4f4 6s2", "electronShells": [2, 8, 18, 22, 8, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 142, "abundance": 27.2, "halfLife": null},
    {"massNumber": 144, "abundance": 23.8, "halfLife": "2.29 quintillion years"},
    {"massNumber": 146, "abundance": 17.2, "halfLife": null}
  ],
  "ionForms": [{"charge": 3, "notation": "Nd³⁺"}],
  "crustalAbundancePpm": 41.5, "cosmicAbundance": 0.17,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Epic"
},

// Z=61 Promethium
{
  "atomicNumber": 61, "symbol": "Pm", "name": "Promethium",
  "group": null, "period": 6, "block": "f", "classification": "lanthanide",
  "atomicMass": 145, "density": 7.26, "electronegativity": 1.13,
  "electronConfiguration": "[Xe] 4f5 6s2", "electronShells": [2, 8, 18, 23, 8, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 145, "abundance": null, "halfLife": "17.7 years"},
    {"massNumber": 147, "abundance": null, "halfLife": "2.6234 years"}
  ],
  "ionForms": [{"charge": 3, "notation": "Pm³⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=62 Samarium
{
  "atomicNumber": 62, "symbol": "Sm", "name": "Samarium",
  "group": null, "period": 6, "block": "f", "classification": "lanthanide",
  "atomicMass": 150.36, "density": 7.52, "electronegativity": 1.17,
  "electronConfiguration": "[Xe] 4f6 6s2", "electronShells": [2, 8, 18, 24, 8, 2],
  "oxidationStates": [2, 3],
  "isotopes": [
    {"massNumber": 152, "abundance": 26.75, "halfLife": null},
    {"massNumber": 154, "abundance": 22.75, "halfLife": null},
    {"massNumber": 147, "abundance": 14.99, "halfLife": "106 billion years"}
  ],
  "ionForms": [{"charge": 3, "notation": "Sm³⁺"}, {"charge": 2, "notation": "Sm²⁺"}],
  "crustalAbundancePpm": 7.05, "cosmicAbundance": 0.053,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Epic"
},
// Z=63 Europium
{
  "atomicNumber": 63, "symbol": "Eu", "name": "Europium",
  "group": null, "period": 6, "block": "f", "classification": "lanthanide",
  "atomicMass": 151.964, "density": 5.244, "electronegativity": 1.2,
  "electronConfiguration": "[Xe] 4f7 6s2", "electronShells": [2, 8, 18, 25, 8, 2],
  "oxidationStates": [2, 3],
  "isotopes": [
    {"massNumber": 151, "abundance": 47.81, "halfLife": null},
    {"massNumber": 153, "abundance": 52.19, "halfLife": null}
  ],
  "ionForms": [{"charge": 3, "notation": "Eu³⁺"}, {"charge": 2, "notation": "Eu²⁺"}],
  "crustalAbundancePpm": 2.0, "cosmicAbundance": 0.020,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Epic"
},
// Z=64 Gadolinium
{
  "atomicNumber": 64, "symbol": "Gd", "name": "Gadolinium",
  "group": null, "period": 6, "block": "f", "classification": "lanthanide",
  "atomicMass": 157.25, "density": 7.9, "electronegativity": 1.20,
  "electronConfiguration": "[Xe] 4f7 5d1 6s2", "electronShells": [2, 8, 18, 25, 9, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 158, "abundance": 24.84, "halfLife": null},
    {"massNumber": 160, "abundance": 21.86, "halfLife": null},
    {"massNumber": 156, "abundance": 20.47, "halfLife": null}
  ],
  "ionForms": [{"charge": 3, "notation": "Gd³⁺"}],
  "crustalAbundancePpm": 6.2, "cosmicAbundance": 0.069,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Epic"
},
// Z=65 Terbium
{
  "atomicNumber": 65, "symbol": "Tb", "name": "Terbium",
  "group": null, "period": 6, "block": "f", "classification": "lanthanide",
  "atomicMass": 158.925, "density": 8.23, "electronegativity": 1.2,
  "electronConfiguration": "[Xe] 4f9 6s2", "electronShells": [2, 8, 18, 27, 8, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 159, "abundance": 100, "halfLife": null},
    {"massNumber": 160, "abundance": null, "halfLife": "72.3 days"}
  ],
  "ionForms": [{"charge": 3, "notation": "Tb³⁺"}],
  "crustalAbundancePpm": 1.2, "cosmicAbundance": 0.013,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Epic"
},
// Z=66 Dysprosium
{
  "atomicNumber": 66, "symbol": "Dy", "name": "Dysprosium",
  "group": null, "period": 6, "block": "f", "classification": "lanthanide",
  "atomicMass": 162.5, "density": 8.55, "electronegativity": 1.22,
  "electronConfiguration": "[Xe] 4f10 6s2", "electronShells": [2, 8, 18, 28, 8, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 164, "abundance": 28.18, "halfLife": null},
    {"massNumber": 162, "abundance": 25.51, "halfLife": null},
    {"massNumber": 163, "abundance": 24.90, "halfLife": null}
  ],
  "ionForms": [{"charge": 3, "notation": "Dy³⁺"}],
  "crustalAbundancePpm": 5.2, "cosmicAbundance": 0.094,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Epic"
},
// Z=67 Holmium
{
  "atomicNumber": 67, "symbol": "Ho", "name": "Holmium",
  "group": null, "period": 6, "block": "f", "classification": "lanthanide",
  "atomicMass": 164.93, "density": 8.795, "electronegativity": 1.23,
  "electronConfiguration": "[Xe] 4f11 6s2", "electronShells": [2, 8, 18, 29, 8, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 165, "abundance": 100, "halfLife": null},
    {"massNumber": 166, "abundance": null, "halfLife": "26.83 hours"}
  ],
  "ionForms": [{"charge": 3, "notation": "Ho³⁺"}],
  "crustalAbundancePpm": 1.3, "cosmicAbundance": 0.022,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Epic"
},
// Z=68 Erbium
{
  "atomicNumber": 68, "symbol": "Er", "name": "Erbium",
  "group": null, "period": 6, "block": "f", "classification": "lanthanide",
  "atomicMass": 167.259, "density": 9.066, "electronegativity": 1.24,
  "electronConfiguration": "[Xe] 4f12 6s2", "electronShells": [2, 8, 18, 30, 8, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 166, "abundance": 33.61, "halfLife": null},
    {"massNumber": 168, "abundance": 26.78, "halfLife": null},
    {"massNumber": 167, "abundance": 22.93, "halfLife": null}
  ],
  "ionForms": [{"charge": 3, "notation": "Er³⁺"}],
  "crustalAbundancePpm": 3.5, "cosmicAbundance": 0.063,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Epic"
},
// Z=69 Thulium
{
  "atomicNumber": 69, "symbol": "Tm", "name": "Thulium",
  "group": null, "period": 6, "block": "f", "classification": "lanthanide",
  "atomicMass": 168.934, "density": 9.32, "electronegativity": 1.25,
  "electronConfiguration": "[Xe] 4f13 6s2", "electronShells": [2, 8, 18, 31, 8, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 169, "abundance": 100, "halfLife": null},
    {"massNumber": 170, "abundance": null, "halfLife": "128.6 days"}
  ],
  "ionForms": [{"charge": 3, "notation": "Tm³⁺"}],
  "crustalAbundancePpm": 0.52, "cosmicAbundance": 0.0096,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Epic"
},
// Z=70 Ytterbium
{
  "atomicNumber": 70, "symbol": "Yb", "name": "Ytterbium",
  "group": null, "period": 6, "block": "f", "classification": "lanthanide",
  "atomicMass": 173.045, "density": 6.9, "electronegativity": 1.1,
  "electronConfiguration": "[Xe] 4f14 6s2", "electronShells": [2, 8, 18, 32, 8, 2],
  "oxidationStates": [2, 3],
  "isotopes": [
    {"massNumber": 174, "abundance": 31.83, "halfLife": null},
    {"massNumber": 172, "abundance": 21.83, "halfLife": null},
    {"massNumber": 173, "abundance": 16.13, "halfLife": null}
  ],
  "ionForms": [{"charge": 3, "notation": "Yb³⁺"}, {"charge": 2, "notation": "Yb²⁺"}],
  "crustalAbundancePpm": 3.2, "cosmicAbundance": 0.059,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Epic"
},

// Z=71 Lutetium
{
  "atomicNumber": 71, "symbol": "Lu", "name": "Lutetium",
  "group": null, "period": 6, "block": "f", "classification": "lanthanide",
  "atomicMass": 174.967, "density": 9.841, "electronegativity": 1.27,
  "electronConfiguration": "[Xe] 4f14 5d1 6s2", "electronShells": [2, 8, 18, 32, 9, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 175, "abundance": 97.401, "halfLife": null},
    {"massNumber": 176, "abundance": 2.599, "halfLife": "37.6 billion years"}
  ],
  "ionForms": [{"charge": 3, "notation": "Lu³⁺"}],
  "crustalAbundancePpm": 0.8, "cosmicAbundance": 0.0094,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Epic"
},
// Z=72 Hafnium
{
  "atomicNumber": 72, "symbol": "Hf", "name": "Hafnium",
  "group": 4, "period": 6, "block": "d", "classification": "transition_metal",
  "atomicMass": 178.49, "density": 13.31, "electronegativity": 1.3,
  "electronConfiguration": "[Xe] 4f14 5d2 6s2", "electronShells": [2, 8, 18, 32, 10, 2],
  "oxidationStates": [4],
  "isotopes": [
    {"massNumber": 180, "abundance": 35.08, "halfLife": null},
    {"massNumber": 178, "abundance": 27.28, "halfLife": null},
    {"massNumber": 177, "abundance": 18.60, "halfLife": null}
  ],
  "ionForms": [{"charge": 4, "notation": "Hf⁴⁺"}],
  "crustalAbundancePpm": 3.0, "cosmicAbundance": 0.0054,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Uncommon"
},
// Z=73 Tantalum
{
  "atomicNumber": 73, "symbol": "Ta", "name": "Tantalum",
  "group": 5, "period": 6, "block": "d", "classification": "transition_metal",
  "atomicMass": 180.948, "density": 16.69, "electronegativity": 1.5,
  "electronConfiguration": "[Xe] 4f14 5d3 6s2", "electronShells": [2, 8, 18, 32, 11, 2],
  "oxidationStates": [5],
  "isotopes": [
    {"massNumber": 181, "abundance": 99.988, "halfLife": null},
    {"massNumber": 180, "abundance": 0.012, "halfLife": null}
  ],
  "ionForms": [{"charge": 5, "notation": "Ta⁵⁺"}],
  "crustalAbundancePpm": 2.0, "cosmicAbundance": 0.0022,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Uncommon"
},
// Z=74 Tungsten
{
  "atomicNumber": 74, "symbol": "W", "name": "Tungsten",
  "group": 6, "period": 6, "block": "d", "classification": "transition_metal",
  "atomicMass": 183.84, "density": 19.25, "electronegativity": 2.36,
  "electronConfiguration": "[Xe] 4f14 5d4 6s2", "electronShells": [2, 8, 18, 32, 12, 2],
  "oxidationStates": [4, 6],
  "isotopes": [
    {"massNumber": 184, "abundance": 30.64, "halfLife": null},
    {"massNumber": 186, "abundance": 28.43, "halfLife": null},
    {"massNumber": 182, "abundance": 26.50, "halfLife": null}
  ],
  "ionForms": [{"charge": 6, "notation": "W⁶⁺"}, {"charge": 4, "notation": "W⁴⁺"}],
  "crustalAbundancePpm": 1.25, "cosmicAbundance": 0.0037,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Uncommon"
},
// Z=75 Rhenium
{
  "atomicNumber": 75, "symbol": "Re", "name": "Rhenium",
  "group": 7, "period": 6, "block": "d", "classification": "transition_metal",
  "atomicMass": 186.207, "density": 21.02, "electronegativity": 1.9,
  "electronConfiguration": "[Xe] 4f14 5d5 6s2", "electronShells": [2, 8, 18, 32, 13, 2],
  "oxidationStates": [4, 7],
  "isotopes": [
    {"massNumber": 185, "abundance": 37.40, "halfLife": null},
    {"massNumber": 187, "abundance": 62.60, "halfLife": "41.2 billion years"}
  ],
  "ionForms": [{"charge": 7, "notation": "Re⁷⁺"}, {"charge": 4, "notation": "Re⁴⁺"}],
  "crustalAbundancePpm": 0.0007, "cosmicAbundance": 0.0017,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Rare"
},
// Z=76 Osmium
{
  "atomicNumber": 76, "symbol": "Os", "name": "Osmium",
  "group": 8, "period": 6, "block": "d", "classification": "transition_metal",
  "atomicMass": 190.23, "density": 22.59, "electronegativity": 2.2,
  "electronConfiguration": "[Xe] 4f14 5d6 6s2", "electronShells": [2, 8, 18, 32, 14, 2],
  "oxidationStates": [4, 8],
  "isotopes": [
    {"massNumber": 192, "abundance": 40.93, "halfLife": null},
    {"massNumber": 190, "abundance": 26.26, "halfLife": null},
    {"massNumber": 188, "abundance": 13.24, "halfLife": null}
  ],
  "ionForms": [{"charge": 4, "notation": "Os⁴⁺"}, {"charge": 8, "notation": "Os⁸⁺"}],
  "crustalAbundancePpm": 0.0015, "cosmicAbundance": 0.026,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Rare"
},
// Z=77 Iridium
{
  "atomicNumber": 77, "symbol": "Ir", "name": "Iridium",
  "group": 9, "period": 6, "block": "d", "classification": "transition_metal",
  "atomicMass": 192.217, "density": 22.56, "electronegativity": 2.20,
  "electronConfiguration": "[Xe] 4f14 5d7 6s2", "electronShells": [2, 8, 18, 32, 15, 2],
  "oxidationStates": [3, 4],
  "isotopes": [
    {"massNumber": 191, "abundance": 37.3, "halfLife": null},
    {"massNumber": 193, "abundance": 62.7, "halfLife": null}
  ],
  "ionForms": [{"charge": 3, "notation": "Ir³⁺"}, {"charge": 4, "notation": "Ir⁴⁺"}],
  "crustalAbundancePpm": 0.001, "cosmicAbundance": 0.024,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Rare"
},
// Z=78 Platinum
{
  "atomicNumber": 78, "symbol": "Pt", "name": "Platinum",
  "group": 10, "period": 6, "block": "d", "classification": "transition_metal",
  "atomicMass": 195.084, "density": 21.45, "electronegativity": 2.28,
  "electronConfiguration": "[Xe] 4f14 5d9 6s1", "electronShells": [2, 8, 18, 32, 17, 1],
  "oxidationStates": [2, 4],
  "isotopes": [
    {"massNumber": 195, "abundance": 33.832, "halfLife": null},
    {"massNumber": 194, "abundance": 32.967, "halfLife": null},
    {"massNumber": 196, "abundance": 25.242, "halfLife": null}
  ],
  "ionForms": [{"charge": 2, "notation": "Pt²⁺"}, {"charge": 4, "notation": "Pt⁴⁺"}],
  "crustalAbundancePpm": 0.005, "cosmicAbundance": 0.017,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Rare"
},
// Z=79 Gold
{
  "atomicNumber": 79, "symbol": "Au", "name": "Gold",
  "group": 11, "period": 6, "block": "d", "classification": "transition_metal",
  "atomicMass": 196.967, "density": 19.3, "electronegativity": 2.54,
  "electronConfiguration": "[Xe] 4f14 5d10 6s1", "electronShells": [2, 8, 18, 32, 18, 1],
  "oxidationStates": [1, 3],
  "isotopes": [
    {"massNumber": 197, "abundance": 100, "halfLife": null},
    {"massNumber": 198, "abundance": null, "halfLife": "2.6943 days"}
  ],
  "ionForms": [{"charge": 1, "notation": "Au⁺"}, {"charge": 3, "notation": "Au³⁺"}],
  "crustalAbundancePpm": 0.004, "cosmicAbundance": 0.0019,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Rare"
},
// Z=80 Mercury
{
  "atomicNumber": 80, "symbol": "Hg", "name": "Mercury",
  "group": 12, "period": 6, "block": "d", "classification": "transition_metal",
  "atomicMass": 200.592, "density": 13.534, "electronegativity": 2.00,
  "electronConfiguration": "[Xe] 4f14 5d10 6s2", "electronShells": [2, 8, 18, 32, 18, 2],
  "oxidationStates": [1, 2],
  "isotopes": [
    {"massNumber": 202, "abundance": 29.86, "halfLife": null},
    {"massNumber": 200, "abundance": 23.10, "halfLife": null},
    {"massNumber": 198, "abundance": 10.02, "halfLife": null}
  ],
  "ionForms": [{"charge": 2, "notation": "Hg²⁺"}, {"charge": 1, "notation": "Hg⁺"}],
  "crustalAbundancePpm": 0.085, "cosmicAbundance": 0.0034,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Rare"
},

// Z=81 Thallium
{
  "atomicNumber": 81, "symbol": "Tl", "name": "Thallium",
  "group": 13, "period": 6, "block": "p", "classification": "post_transition_metal",
  "atomicMass": 204.38, "density": 11.85, "electronegativity": 1.62,
  "electronConfiguration": "[Xe] 4f14 5d10 6s2 6p1", "electronShells": [2, 8, 18, 32, 18, 3],
  "oxidationStates": [1, 3],
  "isotopes": [
    {"massNumber": 203, "abundance": 29.52, "halfLife": null},
    {"massNumber": 205, "abundance": 70.48, "halfLife": null}
  ],
  "ionForms": [{"charge": 1, "notation": "Tl⁺"}, {"charge": 3, "notation": "Tl³⁺"}],
  "crustalAbundancePpm": 0.85, "cosmicAbundance": 0.00018,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Rare"
},
// Z=82 Lead
{
  "atomicNumber": 82, "symbol": "Pb", "name": "Lead",
  "group": 14, "period": 6, "block": "p", "classification": "post_transition_metal",
  "atomicMass": 207.2, "density": 11.34, "electronegativity": 2.33,
  "electronConfiguration": "[Xe] 4f14 5d10 6s2 6p2", "electronShells": [2, 8, 18, 32, 18, 4],
  "oxidationStates": [2, 4],
  "isotopes": [
    {"massNumber": 208, "abundance": 52.4, "halfLife": null},
    {"massNumber": 206, "abundance": 24.1, "halfLife": null},
    {"massNumber": 207, "abundance": 22.1, "halfLife": null}
  ],
  "ionForms": [{"charge": 2, "notation": "Pb²⁺"}, {"charge": 4, "notation": "Pb⁴⁺"}],
  "crustalAbundancePpm": 14, "cosmicAbundance": 0.0037,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Uncommon"
},
// Z=83 Bismuth
{
  "atomicNumber": 83, "symbol": "Bi", "name": "Bismuth",
  "group": 15, "period": 6, "block": "p", "classification": "post_transition_metal",
  "atomicMass": 208.98, "density": 9.807, "electronegativity": 2.02,
  "electronConfiguration": "[Xe] 4f14 5d10 6s2 6p3", "electronShells": [2, 8, 18, 32, 18, 5],
  "oxidationStates": [3, 5],
  "isotopes": [
    {"massNumber": 209, "abundance": 100, "halfLife": "1.9e19 years"},
    {"massNumber": 208, "abundance": null, "halfLife": "368000 years"}
  ],
  "ionForms": [{"charge": 3, "notation": "Bi³⁺"}, {"charge": 5, "notation": "Bi⁵⁺"}],
  "crustalAbundancePpm": 0.025, "cosmicAbundance": 0.00014,
  "isSynthetic": false, "isRadioactive": false,
  "zone": "Neutral", "lootRarity": "Rare"
},
// Z=84 Polonium
{
  "atomicNumber": 84, "symbol": "Po", "name": "Polonium",
  "group": 16, "period": 6, "block": "p", "classification": "post_transition_metal",
  "atomicMass": 209, "density": 9.32, "electronegativity": 2.0,
  "electronConfiguration": "[Xe] 4f14 5d10 6s2 6p4", "electronShells": [2, 8, 18, 32, 18, 6],
  "oxidationStates": [2, 4],
  "isotopes": [
    {"massNumber": 210, "abundance": null, "halfLife": "138.376 days"},
    {"massNumber": 209, "abundance": null, "halfLife": "125.2 years"}
  ],
  "ionForms": [{"charge": 2, "notation": "Po²⁺"}, {"charge": 4, "notation": "Po⁴⁺"}],
  "crustalAbundancePpm": 0.000002, "cosmicAbundance": null,
  "isSynthetic": false, "isRadioactive": true,
  "zone": "Boss", "lootRarity": "Rare"
},
// Z=85 Astatine
{
  "atomicNumber": 85, "symbol": "At", "name": "Astatine",
  "group": 17, "period": 6, "block": "p", "classification": "halogen",
  "atomicMass": 210, "density": 7.0, "electronegativity": 2.2,
  "electronConfiguration": "[Xe] 4f14 5d10 6s2 6p5", "electronShells": [2, 8, 18, 32, 18, 7],
  "oxidationStates": [-1, 1, 3, 5],
  "isotopes": [
    {"massNumber": 210, "abundance": null, "halfLife": "8.1 hours"},
    {"massNumber": 211, "abundance": null, "halfLife": "7.214 hours"}
  ],
  "ionForms": [{"charge": -1, "notation": "At⁻"}, {"charge": 1, "notation": "At⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": false, "isRadioactive": true,
  "zone": "Boss", "lootRarity": "Rare"
},
// Z=86 Radon
{
  "atomicNumber": 86, "symbol": "Rn", "name": "Radon",
  "group": 18, "period": 6, "block": "p", "classification": "noble_gas",
  "atomicMass": 222, "density": 0.00973, "electronegativity": 2.2,
  "electronConfiguration": "[Xe] 4f14 5d10 6s2 6p6", "electronShells": [2, 8, 18, 32, 18, 8],
  "oxidationStates": [0, 2],
  "isotopes": [
    {"massNumber": 222, "abundance": null, "halfLife": "3.8235 days"},
    {"massNumber": 220, "abundance": null, "halfLife": "55.6 seconds"}
  ],
  "ionForms": [],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": false, "isRadioactive": true,
  "zone": "Boss", "lootRarity": "Rare"
},
// Z=87 Francium
{
  "atomicNumber": 87, "symbol": "Fr", "name": "Francium",
  "group": 1, "period": 7, "block": "s", "classification": "alkali_metal",
  "atomicMass": 223, "density": 1.87, "electronegativity": 0.7,
  "electronConfiguration": "[Rn] 7s1", "electronShells": [2, 8, 18, 32, 18, 8, 1],
  "oxidationStates": [1],
  "isotopes": [
    {"massNumber": 223, "abundance": null, "halfLife": "22.0 minutes"},
    {"massNumber": 221, "abundance": null, "halfLife": "4.9 minutes"}
  ],
  "ionForms": [{"charge": 1, "notation": "Fr⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": false, "isRadioactive": true,
  "zone": "Boss", "lootRarity": "Rare"
},
// Z=88 Radium
{
  "atomicNumber": 88, "symbol": "Ra", "name": "Radium",
  "group": 2, "period": 7, "block": "s", "classification": "alkaline_earth_metal",
  "atomicMass": 226, "density": 5.5, "electronegativity": 0.9,
  "electronConfiguration": "[Rn] 7s2", "electronShells": [2, 8, 18, 32, 18, 8, 2],
  "oxidationStates": [2],
  "isotopes": [
    {"massNumber": 226, "abundance": null, "halfLife": "1600 years"},
    {"massNumber": 228, "abundance": null, "halfLife": "5.75 years"}
  ],
  "ionForms": [{"charge": 2, "notation": "Ra²⁺"}],
  "crustalAbundancePpm": 0.0000006, "cosmicAbundance": null,
  "isSynthetic": false, "isRadioactive": true,
  "zone": "Boss", "lootRarity": "Rare"
},
// Z=89 Actinium
{
  "atomicNumber": 89, "symbol": "Ac", "name": "Actinium",
  "group": null, "period": 7, "block": "f", "classification": "actinide",
  "atomicMass": 227, "density": 10.07, "electronegativity": 1.1,
  "electronConfiguration": "[Rn] 6d1 7s2", "electronShells": [2, 8, 18, 32, 18, 9, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 227, "abundance": null, "halfLife": "21.772 years"},
    {"massNumber": 228, "abundance": null, "halfLife": "6.15 hours"}
  ],
  "ionForms": [{"charge": 3, "notation": "Ac³⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": false, "isRadioactive": true,
  "zone": "Boss", "lootRarity": "Epic"
},
// Z=90 Thorium
{
  "atomicNumber": 90, "symbol": "Th", "name": "Thorium",
  "group": null, "period": 7, "block": "f", "classification": "actinide",
  "atomicMass": 232.038, "density": 11.72, "electronegativity": 1.3,
  "electronConfiguration": "[Rn] 6d2 7s2", "electronShells": [2, 8, 18, 32, 18, 10, 2],
  "oxidationStates": [4],
  "isotopes": [
    {"massNumber": 232, "abundance": 100, "halfLife": "14.05 billion years"},
    {"massNumber": 230, "abundance": null, "halfLife": "75400 years"}
  ],
  "ionForms": [{"charge": 4, "notation": "Th⁴⁺"}],
  "crustalAbundancePpm": 9.6, "cosmicAbundance": 0.042,
  "isSynthetic": false, "isRadioactive": true,
  "zone": "Boss", "lootRarity": "Epic"
},

// Z=91 Protactinium
{
  "atomicNumber": 91, "symbol": "Pa", "name": "Protactinium",
  "group": null, "period": 7, "block": "f", "classification": "actinide",
  "atomicMass": 231.036, "density": 15.37, "electronegativity": 1.5,
  "electronConfiguration": "[Rn] 5f2 6d1 7s2", "electronShells": [2, 8, 18, 32, 20, 9, 2],
  "oxidationStates": [4, 5],
  "isotopes": [
    {"massNumber": 231, "abundance": 100, "halfLife": "32760 years"},
    {"massNumber": 233, "abundance": null, "halfLife": "26.975 days"}
  ],
  "ionForms": [{"charge": 5, "notation": "Pa⁵⁺"}, {"charge": 4, "notation": "Pa⁴⁺"}],
  "crustalAbundancePpm": 0.0000014, "cosmicAbundance": null,
  "isSynthetic": false, "isRadioactive": true,
  "zone": "Boss", "lootRarity": "Epic"
},
// Z=92 Uranium
{
  "atomicNumber": 92, "symbol": "U", "name": "Uranium",
  "group": null, "period": 7, "block": "f", "classification": "actinide",
  "atomicMass": 238.029, "density": 19.1, "electronegativity": 1.38,
  "electronConfiguration": "[Rn] 5f3 6d1 7s2", "electronShells": [2, 8, 18, 32, 21, 9, 2],
  "oxidationStates": [3, 4, 5, 6],
  "isotopes": [
    {"massNumber": 238, "abundance": 99.2742, "halfLife": "4.468 billion years"},
    {"massNumber": 235, "abundance": 0.7204, "halfLife": "703.8 million years"},
    {"massNumber": 234, "abundance": 0.0054, "halfLife": "245500 years"}
  ],
  "ionForms": [{"charge": 6, "notation": "U⁶⁺"}, {"charge": 4, "notation": "U⁴⁺"}],
  "crustalAbundancePpm": 2.7, "cosmicAbundance": 0.0090,
  "isSynthetic": false, "isRadioactive": true,
  "zone": "Boss", "lootRarity": "Epic"
},
// Z=93 Neptunium
{
  "atomicNumber": 93, "symbol": "Np", "name": "Neptunium",
  "group": null, "period": 7, "block": "f", "classification": "actinide",
  "atomicMass": 237, "density": 20.45, "electronegativity": 1.36,
  "electronConfiguration": "[Rn] 5f4 6d1 7s2", "electronShells": [2, 8, 18, 32, 22, 9, 2],
  "oxidationStates": [3, 4, 5, 6],
  "isotopes": [
    {"massNumber": 237, "abundance": null, "halfLife": "2.144 million years"},
    {"massNumber": 239, "abundance": null, "halfLife": "2.356 days"}
  ],
  "ionForms": [{"charge": 5, "notation": "Np⁵⁺"}, {"charge": 4, "notation": "Np⁴⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=94 Plutonium
{
  "atomicNumber": 94, "symbol": "Pu", "name": "Plutonium",
  "group": null, "period": 7, "block": "f", "classification": "actinide",
  "atomicMass": 244, "density": 19.84, "electronegativity": 1.28,
  "electronConfiguration": "[Rn] 5f6 7s2", "electronShells": [2, 8, 18, 32, 24, 8, 2],
  "oxidationStates": [3, 4, 5, 6],
  "isotopes": [
    {"massNumber": 244, "abundance": null, "halfLife": "80.8 million years"},
    {"massNumber": 239, "abundance": null, "halfLife": "24110 years"},
    {"massNumber": 238, "abundance": null, "halfLife": "87.7 years"}
  ],
  "ionForms": [{"charge": 4, "notation": "Pu⁴⁺"}, {"charge": 3, "notation": "Pu³⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=95 Americium
{
  "atomicNumber": 95, "symbol": "Am", "name": "Americium",
  "group": null, "period": 7, "block": "f", "classification": "actinide",
  "atomicMass": 243, "density": 13.69, "electronegativity": 1.3,
  "electronConfiguration": "[Rn] 5f7 7s2", "electronShells": [2, 8, 18, 32, 25, 8, 2],
  "oxidationStates": [3, 4, 5, 6],
  "isotopes": [
    {"massNumber": 243, "abundance": null, "halfLife": "7370 years"},
    {"massNumber": 241, "abundance": null, "halfLife": "432.2 years"}
  ],
  "ionForms": [{"charge": 3, "notation": "Am³⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=96 Curium
{
  "atomicNumber": 96, "symbol": "Cm", "name": "Curium",
  "group": null, "period": 7, "block": "f", "classification": "actinide",
  "atomicMass": 247, "density": 13.51, "electronegativity": 1.3,
  "electronConfiguration": "[Rn] 5f7 6d1 7s2", "electronShells": [2, 8, 18, 32, 25, 9, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 247, "abundance": null, "halfLife": "15.6 million years"},
    {"massNumber": 248, "abundance": null, "halfLife": "340000 years"}
  ],
  "ionForms": [{"charge": 3, "notation": "Cm³⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=97 Berkelium
{
  "atomicNumber": 97, "symbol": "Bk", "name": "Berkelium",
  "group": null, "period": 7, "block": "f", "classification": "actinide",
  "atomicMass": 247, "density": 14.79, "electronegativity": 1.3,
  "electronConfiguration": "[Rn] 5f9 7s2", "electronShells": [2, 8, 18, 32, 27, 8, 2],
  "oxidationStates": [3, 4],
  "isotopes": [
    {"massNumber": 247, "abundance": null, "halfLife": "1380 years"},
    {"massNumber": 249, "abundance": null, "halfLife": "330 days"}
  ],
  "ionForms": [{"charge": 3, "notation": "Bk³⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=98 Californium
{
  "atomicNumber": 98, "symbol": "Cf", "name": "Californium",
  "group": null, "period": 7, "block": "f", "classification": "actinide",
  "atomicMass": 251, "density": 15.1, "electronegativity": 1.3,
  "electronConfiguration": "[Rn] 5f10 7s2", "electronShells": [2, 8, 18, 32, 28, 8, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 251, "abundance": null, "halfLife": "898 years"},
    {"massNumber": 252, "abundance": null, "halfLife": "2.645 years"}
  ],
  "ionForms": [{"charge": 3, "notation": "Cf³⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=99 Einsteinium
{
  "atomicNumber": 99, "symbol": "Es", "name": "Einsteinium",
  "group": null, "period": 7, "block": "f", "classification": "actinide",
  "atomicMass": 252, "density": 8.84, "electronegativity": 1.3,
  "electronConfiguration": "[Rn] 5f11 7s2", "electronShells": [2, 8, 18, 32, 29, 8, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 252, "abundance": null, "halfLife": "471.7 days"},
    {"massNumber": 253, "abundance": null, "halfLife": "20.47 days"}
  ],
  "ionForms": [{"charge": 3, "notation": "Es³⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=100 Fermium
{
  "atomicNumber": 100, "symbol": "Fm", "name": "Fermium",
  "group": null, "period": 7, "block": "f", "classification": "actinide",
  "atomicMass": 257, "density": null, "electronegativity": 1.3,
  "electronConfiguration": "[Rn] 5f12 7s2", "electronShells": [2, 8, 18, 32, 30, 8, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 257, "abundance": null, "halfLife": "100.5 days"},
    {"massNumber": 255, "abundance": null, "halfLife": "20.07 hours"}
  ],
  "ionForms": [{"charge": 3, "notation": "Fm³⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},

// Z=101 Mendelevium
{
  "atomicNumber": 101, "symbol": "Md", "name": "Mendelevium",
  "group": null, "period": 7, "block": "f", "classification": "actinide",
  "atomicMass": 258, "density": null, "electronegativity": 1.3,
  "electronConfiguration": "[Rn] 5f13 7s2", "electronShells": [2, 8, 18, 32, 31, 8, 2],
  "oxidationStates": [2, 3],
  "isotopes": [
    {"massNumber": 258, "abundance": null, "halfLife": "51.5 days"},
    {"massNumber": 260, "abundance": null, "halfLife": "31.8 days"}
  ],
  "ionForms": [{"charge": 3, "notation": "Md³⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=102 Nobelium
{
  "atomicNumber": 102, "symbol": "No", "name": "Nobelium",
  "group": null, "period": 7, "block": "f", "classification": "actinide",
  "atomicMass": 259, "density": null, "electronegativity": 1.3,
  "electronConfiguration": "[Rn] 5f14 7s2", "electronShells": [2, 8, 18, 32, 32, 8, 2],
  "oxidationStates": [2, 3],
  "isotopes": [
    {"massNumber": 259, "abundance": null, "halfLife": "58 minutes"},
    {"massNumber": 255, "abundance": null, "halfLife": "3.1 minutes"}
  ],
  "ionForms": [{"charge": 2, "notation": "No²⁺"}, {"charge": 3, "notation": "No³⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=103 Lawrencium
{
  "atomicNumber": 103, "symbol": "Lr", "name": "Lawrencium",
  "group": null, "period": 7, "block": "d", "classification": "actinide",
  "atomicMass": 266, "density": null, "electronegativity": 1.3,
  "electronConfiguration": "[Rn] 5f14 7s2 7p1", "electronShells": [2, 8, 18, 32, 32, 8, 3],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 266, "abundance": null, "halfLife": "11 hours"},
    {"massNumber": 262, "abundance": null, "halfLife": "3.6 hours"}
  ],
  "ionForms": [{"charge": 3, "notation": "Lr³⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=104 Rutherfordium
{
  "atomicNumber": 104, "symbol": "Rf", "name": "Rutherfordium",
  "group": 4, "period": 7, "block": "d", "classification": "transition_metal",
  "atomicMass": 267, "density": null, "electronegativity": null,
  "electronConfiguration": "[Rn] 5f14 6d2 7s2", "electronShells": [2, 8, 18, 32, 32, 10, 2],
  "oxidationStates": [4],
  "isotopes": [
    {"massNumber": 267, "abundance": null, "halfLife": "1.3 hours"},
    {"massNumber": 265, "abundance": null, "halfLife": "13 seconds"}
  ],
  "ionForms": [{"charge": 4, "notation": "Rf⁴⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=105 Dubnium
{
  "atomicNumber": 105, "symbol": "Db", "name": "Dubnium",
  "group": 5, "period": 7, "block": "d", "classification": "transition_metal",
  "atomicMass": 268, "density": null, "electronegativity": null,
  "electronConfiguration": "[Rn] 5f14 6d3 7s2", "electronShells": [2, 8, 18, 32, 32, 11, 2],
  "oxidationStates": [5],
  "isotopes": [
    {"massNumber": 268, "abundance": null, "halfLife": "29 hours"},
    {"massNumber": 262, "abundance": null, "halfLife": "34 seconds"}
  ],
  "ionForms": [{"charge": 5, "notation": "Db⁵⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=106 Seaborgium
{
  "atomicNumber": 106, "symbol": "Sg", "name": "Seaborgium",
  "group": 6, "period": 7, "block": "d", "classification": "transition_metal",
  "atomicMass": 269, "density": null, "electronegativity": null,
  "electronConfiguration": "[Rn] 5f14 6d4 7s2", "electronShells": [2, 8, 18, 32, 32, 12, 2],
  "oxidationStates": [6],
  "isotopes": [
    {"massNumber": 271, "abundance": null, "halfLife": "2.4 minutes"},
    {"massNumber": 269, "abundance": null, "halfLife": "14 minutes"}
  ],
  "ionForms": [{"charge": 6, "notation": "Sg⁶⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=107 Bohrium
{
  "atomicNumber": 107, "symbol": "Bh", "name": "Bohrium",
  "group": 7, "period": 7, "block": "d", "classification": "transition_metal",
  "atomicMass": 270, "density": null, "electronegativity": null,
  "electronConfiguration": "[Rn] 5f14 6d5 7s2", "electronShells": [2, 8, 18, 32, 32, 13, 2],
  "oxidationStates": [7],
  "isotopes": [
    {"massNumber": 270, "abundance": null, "halfLife": "61 seconds"},
    {"massNumber": 272, "abundance": null, "halfLife": "9.8 seconds"}
  ],
  "ionForms": [{"charge": 7, "notation": "Bh⁷⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=108 Hassium
{
  "atomicNumber": 108, "symbol": "Hs", "name": "Hassium",
  "group": 8, "period": 7, "block": "d", "classification": "transition_metal",
  "atomicMass": 269, "density": null, "electronegativity": null,
  "electronConfiguration": "[Rn] 5f14 6d6 7s2", "electronShells": [2, 8, 18, 32, 32, 14, 2],
  "oxidationStates": [8],
  "isotopes": [
    {"massNumber": 269, "abundance": null, "halfLife": "16 seconds"},
    {"massNumber": 270, "abundance": null, "halfLife": "22 seconds"}
  ],
  "ionForms": [{"charge": 8, "notation": "Hs⁸⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=109 Meitnerium
{
  "atomicNumber": 109, "symbol": "Mt", "name": "Meitnerium",
  "group": 9, "period": 7, "block": "d", "classification": "transition_metal",
  "atomicMass": 278, "density": null, "electronegativity": null,
  "electronConfiguration": "[Rn] 5f14 6d7 7s2", "electronShells": [2, 8, 18, 32, 32, 15, 2],
  "oxidationStates": [3, 6],
  "isotopes": [
    {"massNumber": 278, "abundance": null, "halfLife": "7.6 seconds"},
    {"massNumber": 276, "abundance": null, "halfLife": "0.72 seconds"}
  ],
  "ionForms": [{"charge": 3, "notation": "Mt³⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=110 Darmstadtium
{
  "atomicNumber": 110, "symbol": "Ds", "name": "Darmstadtium",
  "group": 10, "period": 7, "block": "d", "classification": "transition_metal",
  "atomicMass": 281, "density": null, "electronegativity": null,
  "electronConfiguration": "[Rn] 5f14 6d8 7s2", "electronShells": [2, 8, 18, 32, 32, 16, 2],
  "oxidationStates": [6],
  "isotopes": [
    {"massNumber": 281, "abundance": null, "halfLife": "12.7 seconds"},
    {"massNumber": 279, "abundance": null, "halfLife": "0.18 seconds"}
  ],
  "ionForms": [{"charge": 6, "notation": "Ds⁶⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},

// Z=111 Roentgenium
{
  "atomicNumber": 111, "symbol": "Rg", "name": "Roentgenium",
  "group": 11, "period": 7, "block": "d", "classification": "transition_metal",
  "atomicMass": 282, "density": null, "electronegativity": null,
  "electronConfiguration": "[Rn] 5f14 6d9 7s2", "electronShells": [2, 8, 18, 32, 32, 17, 2],
  "oxidationStates": [3],
  "isotopes": [
    {"massNumber": 282, "abundance": null, "halfLife": "100 seconds"},
    {"massNumber": 280, "abundance": null, "halfLife": "3.6 seconds"}
  ],
  "ionForms": [{"charge": 3, "notation": "Rg³⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=112 Copernicium
{
  "atomicNumber": 112, "symbol": "Cn", "name": "Copernicium",
  "group": 12, "period": 7, "block": "d", "classification": "transition_metal",
  "atomicMass": 285, "density": null, "electronegativity": null,
  "electronConfiguration": "[Rn] 5f14 6d10 7s2", "electronShells": [2, 8, 18, 32, 32, 18, 2],
  "oxidationStates": [2],
  "isotopes": [
    {"massNumber": 285, "abundance": null, "halfLife": "29 seconds"},
    {"massNumber": 283, "abundance": null, "halfLife": "4 seconds"}
  ],
  "ionForms": [{"charge": 2, "notation": "Cn²⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=113 Nihonium
{
  "atomicNumber": 113, "symbol": "Nh", "name": "Nihonium",
  "group": 13, "period": 7, "block": "p", "classification": "post_transition_metal",
  "atomicMass": 286, "density": null, "electronegativity": null,
  "electronConfiguration": "[Rn] 5f14 6d10 7s2 7p1", "electronShells": [2, 8, 18, 32, 32, 18, 3],
  "oxidationStates": [1, 3],
  "isotopes": [
    {"massNumber": 286, "abundance": null, "halfLife": "9.5 seconds"},
    {"massNumber": 284, "abundance": null, "halfLife": "0.91 seconds"}
  ],
  "ionForms": [{"charge": 1, "notation": "Nh⁺"}, {"charge": 3, "notation": "Nh³⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=114 Flerovium
{
  "atomicNumber": 114, "symbol": "Fl", "name": "Flerovium",
  "group": 14, "period": 7, "block": "p", "classification": "post_transition_metal",
  "atomicMass": 289, "density": null, "electronegativity": null,
  "electronConfiguration": "[Rn] 5f14 6d10 7s2 7p2", "electronShells": [2, 8, 18, 32, 32, 18, 4],
  "oxidationStates": [2],
  "isotopes": [
    {"massNumber": 289, "abundance": null, "halfLife": "2.1 seconds"},
    {"massNumber": 287, "abundance": null, "halfLife": "0.51 seconds"}
  ],
  "ionForms": [{"charge": 2, "notation": "Fl²⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=115 Moscovium
{
  "atomicNumber": 115, "symbol": "Mc", "name": "Moscovium",
  "group": 15, "period": 7, "block": "p", "classification": "post_transition_metal",
  "atomicMass": 290, "density": null, "electronegativity": null,
  "electronConfiguration": "[Rn] 5f14 6d10 7s2 7p3", "electronShells": [2, 8, 18, 32, 32, 18, 5],
  "oxidationStates": [1, 3],
  "isotopes": [
    {"massNumber": 290, "abundance": null, "halfLife": "0.65 seconds"},
    {"massNumber": 289, "abundance": null, "halfLife": "0.22 seconds"}
  ],
  "ionForms": [{"charge": 1, "notation": "Mc⁺"}, {"charge": 3, "notation": "Mc³⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=116 Livermorium
{
  "atomicNumber": 116, "symbol": "Lv", "name": "Livermorium",
  "group": 16, "period": 7, "block": "p", "classification": "post_transition_metal",
  "atomicMass": 293, "density": null, "electronegativity": null,
  "electronConfiguration": "[Rn] 5f14 6d10 7s2 7p4", "electronShells": [2, 8, 18, 32, 32, 18, 6],
  "oxidationStates": [2],
  "isotopes": [
    {"massNumber": 293, "abundance": null, "halfLife": "57 milliseconds"},
    {"massNumber": 291, "abundance": null, "halfLife": "18 milliseconds"}
  ],
  "ionForms": [{"charge": 2, "notation": "Lv²⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=117 Tennessine
{
  "atomicNumber": 117, "symbol": "Ts", "name": "Tennessine",
  "group": 17, "period": 7, "block": "p", "classification": "post_transition_metal",
  "atomicMass": 294, "density": null, "electronegativity": null,
  "electronConfiguration": "[Rn] 5f14 6d10 7s2 7p5", "electronShells": [2, 8, 18, 32, 32, 18, 7],
  "oxidationStates": [-1, 1, 3, 5],
  "isotopes": [
    {"massNumber": 294, "abundance": null, "halfLife": "51 milliseconds"},
    {"massNumber": 293, "abundance": null, "halfLife": "22 milliseconds"}
  ],
  "ionForms": [{"charge": -1, "notation": "Ts⁻"}, {"charge": 1, "notation": "Ts⁺"}],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
},
// Z=118 Oganesson
{
  "atomicNumber": 118, "symbol": "Og", "name": "Oganesson",
  "group": 18, "period": 7, "block": "p", "classification": "noble_gas",
  "atomicMass": 294, "density": null, "electronegativity": null,
  "electronConfiguration": "[Rn] 5f14 6d10 7s2 7p6", "electronShells": [2, 8, 18, 32, 32, 18, 8],
  "oxidationStates": [0, 2, 4, 6],
  "isotopes": [
    {"massNumber": 294, "abundance": null, "halfLife": "0.69 milliseconds"},
    {"massNumber": 295, "abundance": null, "halfLife": "0.18 seconds"}
  ],
  "ionForms": [],
  "crustalAbundancePpm": null, "cosmicAbundance": null,
  "isSynthetic": true, "isRadioactive": true,
  "zone": "Anomalous", "lootRarity": "Legendary"
}
];

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

writeFileSync(__dirname + '/elements.json', JSON.stringify(elements, null, 2));
console.log('Written', elements.length, 'elements to elements.json');
