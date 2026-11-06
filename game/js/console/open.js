// Open the perception console from a hotspot (the dark booth's CONSOLE verb), as a response function.
import { perceptionConsole } from "./console.js";
export const openConsole = async (api) => { await api.mini(perceptionConsole, { score: api.score }); return null; };
