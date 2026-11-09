// THE REAL RECORD: three small hidden objects that are not fiction (the 2018 invitation behind the kitchen corkboard, the
// 1977 issue in Iris's journal towers, the toy rocking chair on her sill). Findable whenever those rooms can be visited
// (Acts III–V); each scores once for the whole game.
import { segC, chip, chipW } from "../gfx.js";

/* ---------------- THE REAL RECORD: three hidden objects that are not fiction ---------------- */
// Not part of the story. Factual notes on the real societies the NRT parodies, in our own words, with sources.
// No private individuals: the 2018 invitation is shown with its sender removed.
const REAL = {
  ap1977: { year: "1977", title: "PSYCHOLOGICAL ROUND TABLE", glyph: (x, y) => `<rect class="sA" x="${x - 18}" y="${y - 24}" width="36" height="48"/><path class="hl sA" d="M${x - 12},${y - 14} L${x + 12},${y - 14} M${x - 12},${y - 8} L${x + 8},${y - 8}"/>`,
    lines: [
      "THE REAL RECORD|This one isn't part of the game. In 1977, American Psychologist printed a letter by the neuroscientist Charles Gross, \"Psychological Round Table in the 1960s,\" about a real society of young experimental psychologists.",
      "THE REAL RECORD|It began in 1936, when young East Coast psychologists started meeting without the supervision of their elders. In the 1950s, a young psychologist could look forward to an invitation as his first important professional honor. Members were men, under forty, from Eastern universities. They met once a year over a weekend to present their research to one another, and they left at forty.",
      "THE REAL RECORD|The Neuroscientific Round Table is invented. The Psychological Round Table is not.\n\nSources: C. G. Gross, American Psychologist (1977); J. Shanteau et al. (eds.), Decision Science and Technology (Kluwer, 1999).",
    ] },
  rocker: { year: "1960s", title: "GUV", glyph: (x, y) => `<path class="sA" d="M${x - 20},${y + 18} C${x - 8},${y + 26} ${x + 8},${y + 26} ${x + 20},${y + 18} M${x - 10},${y + 21} L${x - 8},${y - 2} M${x + 10},${y + 21} L${x + 8},${y - 2} M${x - 9},${y + 4} L${x + 9},${y + 4} M${x + 8},${y - 2} L${x + 10},${y - 24} M${x - 8},${y - 2} L${x - 6},${y - 24} M${x - 6},${y - 20} L${x + 10},${y - 20}"/>`,
    lines: [
      "THE REAL RECORD|Also real. In the early 1960s, Round Table alumni in the Midwest, among them the decision scientist Ward Edwards, founded a version of their own: GUV, the Gesellschaft für Unendliche Versuche. One account calls it \"bad German for 'Society for Endless Research.'\"",
      "THE REAL RECORD|Unlike the East Coast original, GUV admitted women. Members still aged out at forty. One founder was given a miniature wooden rocking chair marked GUV on his fortieth birthday, and decades later was invited back once, as a golden oldie.",
      "THE REAL RECORD|In this game, the Table's creed is endless research. That joke is sixty years old.\n\nSource: J. Shanteau et al. (eds.), Decision Science and Technology: Reflections on the Contributions of Ward Edwards (Kluwer, 1999).",
    ] },
  invite2018: { year: "2018", title: "AN INVITATION", glyph: (x, y) => `<rect class="sW" x="${x - 26}" y="${y - 17}" width="52" height="34"/><path class="sW" d="M${x - 26},${y - 17} L${x},${y + 3} L${x + 26},${y - 17}"/>`,
    lines: [
      "THE REAL RECORD|Real, with the sender's name removed. In 2018, the person who made this game got an emailed invitation to the Psychological Round Table. It still meets every year, and women attend now.",
      "THE REAL RECORD|It explained that everyone is \"unceremoniously ushered out\" at forty, and that new members give \"Revelations\": short talks on unpublished work. No programs are printed, no minutes are kept, and membership is traditionally left off CVs. Crass images, it noted, were \"now verboten.\" A receipt could be provided for reimbursement.",
      "THE REAL RECORD|To accept, you emailed back two things: that you wanted to come, and your date of birth, so they could make sure you weren't \"wizened and aged.\"\n\nSource: a private email, 2018. Quoted in part; sender withheld.",
    ] },
};
export async function realRecord(api, id) {
  const r = REAL[id];
  await api.readout(`<rect class="k sW" x="190" y="60" width="260" height="190"/>${chip("FROM THE REAL RECORD", 320 - chipW("FROM THE REAL RECORD", 6) / 2, 74, 6, "fW")}${r.glyph(320, 140)}
    ${segC(r.title, 320, 196, 10, "sW", 1.4)}${segC(r.year, 320, 222, 7, "sA", 1)}`, "THE REAL RECORD|You've found something that isn't fiction.");
  for (const t of r.lines) await api.say(t);
  // found is found for the whole game: acts reset their flags, so the count comes from the score keys (which persist)
  api.flag("real_" + id, true); api.score("real_" + id, 1);
  const n = Object.keys(REAL).filter(k => api.G.scored.has("real_" + k)).length;
  return n === 3 ? "THE REAL RECORD|3 OF 3. That's all of it. Everything else in Fechner Hall is made up. Mostly." : `THE REAL RECORD|${n} OF 3.`;
}

// the hotspot for one record, the same LOOK in every mode a room is visited in
export const realHS = (id, label) => { const l = { look: (api) => realRecord(api, id) }; return { label, day: l, night: l, morning: l, morris: l }; };
