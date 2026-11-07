// The perception console's library, in order. Each file exports its modules; register them in MODULES and the menu
// finds their groups by itself (GROUPS orders the shelves; a group not listed there is shelved at the end).
import { NECKER, RUBIN, QUARTET, SPHERE } from "./demos.js";
import { KANIZSA, GRIDS, MIB, TROXLER, LILAC, AFTER, FEET, DRIFT, EBBING } from "./demos2.js";
import { CARRASCO } from "./carrasco.js";
import { CSF, POSNER, ROTATION, CROWDING, NUMBER } from "./classics2.js";
import { HV, ML } from "./lines.js";
import { SEARCH } from "./search.js";
import { ADELSON } from "./lightness.js";
import { MAE } from "./mae.js";
import { LIB_VISION } from "./lib_vision.js";
import { LIB_ADJUST } from "./lib_adjust.js";
export const MODULES = [NECKER, RUBIN, QUARTET, SPHERE, KANIZSA, GRIDS, MIB, TROXLER, LILAC, AFTER, FEET, DRIFT, EBBING, CARRASCO, CSF, POSNER, ROTATION, CROWDING, NUMBER, HV, ML, SEARCH, ADELSON, MAE, ...LIB_VISION, ...LIB_ADJUST];

// the shelves, in the order the menu shows them
export const GROUPS = ["AMBIGUOUS", "ILLUSIONS", "CLASSICS", "PS 327 LABS", "ATTENTION", "ACTION", "MEMORY", "LEARNING", "FORM", "MOTION", "NUMBER",
  "LIGHT & COLOUR", "HEARING", "TIME"];
export const groupsOf = (mods = MODULES) => { const have = [...new Set(mods.map(m => m.group))];
  return [...GROUPS.filter(g => have.includes(g)), ...have.filter(g => !GROUPS.includes(g))]; };

// a module's ref is one citation, or a list of them when the module draws on more than one paper
export const refsOf = (m) => [].concat(m.ref || []).filter(Boolean);
// every citation in the console, once each, by first author (for the credits)
const sortKey = (r) => r.replace(/^(von|van|de|der|da|di|le|la)\s+/i, "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export const CONSOLE_REFS = () => [...new Set(MODULES.flatMap(refsOf))].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
