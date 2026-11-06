// Open the perception console from a hotspot (the dark booth's CONSOLE verb), as a response function.
// The score switches to its "booth" flavour while the console is up, then back to the room's.
import { perceptionConsole } from "./console.js";
export const openConsole = async (api) => {
  const G = api.G, M = window.MUSIC, scene = (room) => M && M.scene({ act: G.act, mode: G.mode, room, flags: G.flags });
  scene("booth");
  try { await api.mini(perceptionConsole, { score: api.score }); } finally { scene(G.room); }
  return null;
};
