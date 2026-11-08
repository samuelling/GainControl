// THE MAGNET LIFT — the cutscene after THE FOG. The stairwell ends at B3; the fog runs out at an old cage lift (Iris had
// it put in in 1968 to bring the ring magnet's coils down), and it only goes up: B3 to 4F, straight to her hall.
// Drawn as a building section (wireframe, rule 7): seven floors, the stairwell full of fog with Preston's lit earbuds in
// it, the lift shaft, and the 4F hall with the broken light and Iris's door. Everything moves in stepped poses.
// lift(el) → Promise<{ done: true }>. A click hurries each beat along.
import { seg, segC, chip, chipW, arcs, star4 } from "../gfx.js";

const COL = { NELL: "G", MORRIS: "A", IRIS: "V", "PRESTON (BELOW)": "R" };
const FL = ["B3", "B2", "B1", "1F", "2F", "3F", "4F"];
const fy = (f) => 336 - f * 40;            // the floor line of level f (0 = B3 … 6 = 4F)
const X0 = 150, X1 = 470;                  // the building
const SX0 = 190, SX1 = 270;                // the stairwell
const LX0 = 292, LX1 = 328;                // the lift shaft

const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
function line(who, text) {
  if (!who) {   // narration: white, no chip
    return `<text x="320" y="30" text-anchor="middle" style="fill:var(--W);font:500 16px 'Saira Condensed',sans-serif;letter-spacing:.02em">${esc(text.toUpperCase())}</text>`;
  }
  const c = COL[who] || "W", w = chipW(who, 6.5), words = text.toUpperCase().split(" "), rows = [""];
  for (const wd of words) { const r = rows[rows.length - 1]; if ((r + " " + wd).length > 62) rows.push(wd); else rows[rows.length - 1] = r ? r + " " + wd : wd; }
  const x0 = 320 - (w + 8 + Math.max(...rows.map(r => r.length)) * 7.1) / 2;
  let s = chip(who, x0, 14, 6.5, "f" + c);
  rows.forEach((r, i) => { s += `<text x="${(x0 + w + 8).toFixed(1)}" y="${22 + i * 18}" style="fill:var(--${c});font:500 17px 'Saira Condensed',sans-serif;letter-spacing:.02em">${esc(r)}</text>`; });
  return s;
}

// tiny people (at this scale a figure is a glyph: hair, jaw, torso, legs)
function tinyNell(x, y, step = 0) {
  const l = step % 2 ? `M${x - 2},${y - 9} L${x - 4},${y} M${x + 2},${y - 9} L${x + 4},${y}` : `M${x - 2},${y - 9} L${x - 2},${y} M${x + 2},${y - 9} L${x + 2},${y}`;
  return `<g class="hd"><path class="sR" d="M${x - 4},${y - 21} C${x - 6},${y - 29} ${x + 6},${y - 29} ${x + 4},${y - 21}"/>
    <path class="sK" d="M${x - 3.5},${y - 22} C${x - 3},${y - 17.5} ${x + 3},${y - 17.5} ${x + 3.5},${y - 22}"/>
    <path class="hl sW" d="M${x - 3},${y - 23} L${x + 3},${y - 23}"/></g>
    <path class="k sG" d="M${x - 4},${y - 16} L${x + 4},${y - 16} L${x + 4.5},${y - 9} L${x - 4.5},${y - 9} Z"/>
    <path class="sB" d="${l}"/>`;
}
function tinyIris(x, y) {
  return `<g class="hd"><path class="sW" d="M${x - 4},${y - 21} C${x - 5},${y - 28} ${x + 5},${y - 28} ${x + 4},${y - 21}"/>
    <path class="sK" d="M${x - 3.5},${y - 22} C${x - 3},${y - 17.5} ${x + 3},${y - 17.5} ${x + 3.5},${y - 22}"/></g>
    <path class="k sV" d="M${x - 4.5},${y - 16} L${x + 4.5},${y - 16} L${x + 5.5},${y - 3} L${x - 5.5},${y - 3} Z"/>
    <path class="sK" d="M${x - 2},${y - 3} L${x - 2},${y} M${x + 2},${y - 3} L${x + 2},${y}"/>`;
}
// Preston, in the fog: all you can see of him is the earbuds, lit
function earbuds(x, y, dir, dim) {
  if (dim) return `<circle class="k sM" cx="${x - 3}" cy="${y}" r="1.4"/><circle class="k sM" cx="${x + 3}" cy="${y}" r="1.4"/>`;
  return `<circle class="fG" cx="${x - 3}" cy="${y}" r="1.6"/><circle class="fG" cx="${x + 3}" cy="${y}" r="1.6"/>` + arcs(x + dir * 6, y, dir, "hl sG", 2, .45);
}

export function lift(el) {
  return new Promise(resolve => {
    const S = { f: 0, sub: 0, gate: 0, nell: [232, 0], pre: [246, fy(1) - 22, 1], preDim: false, fog: 0, door: 0, iris: false,
      flick: 0, line: null, lever: 0, closed: false };
    el.innerHTML = `<svg class="t glm" viewBox="0 0 640 360"></svg>`;
    const svg = el.firstChild;
    const sfx = (n) => { if (window.SFX) window.SFX.play(n); };

    function fogPaths() {
      // hairline wisps in the stairwell from B3 up to 1F, thinning upward; two poses that swap
      let s = "";
      for (let f = 0; f < 4; f++) {
        const n = 4 - f;
        for (let i = 0; i < n; i++) {
          const y = fy(f) - 8 - i * 8, a = (i + S.fog + f) % 2 ? 4 : -4, x = SX0 + 6;
          s += `<path class="hl ${f < 2 ? "sW" : "sM"}" d="M${x},${y} C${x + 14},${y - a} ${x + 24},${y + a} ${x + 36},${y} C${x + 48},${y - a} ${x + 58},${y + a} ${SX1 - 6},${y}"/>`;
        }
      }
      return s;
    }
    function building() {
      let s = "";
      // sky and ground: the roof with a parapet, the machine room for the lift's sheave; earth hatching under grade
      s += `<path class="sW" d="M${X0},${fy(7)} L${X1},${fy(7)} M${X0},${fy(7)} L${X0},${fy(0)} L${X1},${fy(0)} L${X1},${fy(7)}"/>`;
      s += `<path class="hl sW" d="M${X0},${fy(7) - 4} L${X1},${fy(7) - 4} M${X0},${fy(7) - 4} L${X0},${fy(7)} M${X1},${fy(7) - 4} L${X1},${fy(7)}"/>`;
      s += `<rect class="k sA" x="${LX0 - 4}" y="${fy(7) - 20}" width="${LX1 - LX0 + 8}" height="16"/>`;
      s += `<path class="sW" d="M24,${fy(3)} L${X0},${fy(3)} M${X1},${fy(3)} L616,${fy(3)}"/>`;
      for (let x = 30; x < X0 - 4; x += 12) s += `<path class="hl sN" d="M${x},${fy(3) + 4} L${x + 8},${fy(3) + 12}"/>`;
      for (let x = X1 + 8; x < 612; x += 12) s += `<path class="hl sN" d="M${x},${fy(3) + 4} L${x + 8},${fy(3) + 12}"/>`;
      s += seg("GRADE", 30, fy(3) - 8, 4, "sM", .6);
      // floors and their labels
      for (let f = 1; f < 7; f++) s += `<path class="hl ${f === 3 ? "sW" : "sD"}" d="M${X0},${fy(f)} L${X1},${fy(f)}"/>`;
      FL.forEach((t, f) => s += seg(t, X0 - 26, fy(f) - 24, 9, f === 0 ? "sV" : f === 6 ? "sV" : "sM", 1));
      // the stairwell: a flight up and a flight back on every floor, walls in hairline
      s += `<path class="hl sD" d="M${SX0},${fy(7)} L${SX0},${fy(0)} M${SX1},${fy(7)} L${SX1},${fy(0)}"/>`;
      for (let f = 0; f < 7; f++) {
        const y1 = fy(f), ym = y1 - 20, y0 = y1 - 40;
        s += `<path class="hl sM" d="M${SX0 + 4},${y1} L${SX1 - 14},${ym} L${SX1 - 4},${ym} M${SX1 - 14},${ym} L${SX0 + 14},${y0} L${SX0 + 4},${y0}"/>`;
      }
      s += seg("STAIRS B", SX0 + 4, fy(7) - 12, 4, "sM", .6);
      // the lift shaft: guide rails, a gate at every floor, the cable from the sheave
      s += `<path class="hl sA" d="M${LX0},${fy(7)} L${LX0},${fy(0)} M${LX1},${fy(7)} L${LX1},${fy(0)}"/>`;
      // what's on each floor, faint (the 4F hall draws itself)
      ["ANNEX 1961", "STEAM TUNNELS", "MRI SUITE", "HALL", "LIBRARY   LABS", "FACULTY"].forEach((t, f) => s += seg(t, LX1 + 16, fy(f) - 12, 4.4, "sD", .7));
      // the 4F hall: the broken light, and the door at the end
      const hy = fy(6);
      s += `<path class="hl sW" d="M392,${fy(7)} L392,${fy(7) + 6}"/><circle class="k ${S.flick ? "sA" : "sD"}" cx="392" cy="${fy(7) + 9}" r="3"/>`;
      if (S.flick) s += star4(392, fy(7) + 9, 5, "hl sA");
      s += `<rect class="k sV" x="438" y="${hy - 32}" width="22" height="32"/>${seg("EMER.", 441, hy - 28, 3, "sV", .5)}`;
      if (S.door) {   // the door swings in and the office light spills out
        s += `<rect class="fV" x="439" y="${hy - 31}" width="20" height="31" opacity=".18"/><path class="k sV" d="M438,${hy - 32} L430,${hy - 28} L430,${hy + 2} L438,${hy}"/>`;
        for (let i = 0; i < 3; i++) s += `<path class="hl sV" d="M${430 - i * 6},${hy - 1} L${410 - i * 12},${hy - 1}"/>`;
      }
      if (S.iris) s += tinyIris(449, hy);
      return s;
    }
    function cage() {
      const y = fy(S.f) - S.sub * 20, x0 = LX0 + 2, x1 = LX1 - 2, top = y - 34;
      let s = `<path class="hl sW" d="M${(LX0 + LX1) / 2},${fy(7) - 12} L${(LX0 + LX1) / 2},${top}"/><circle class="k sA" cx="${(LX0 + LX1) / 2}" cy="${fy(7) - 12}" r="5"/>`;
      s += `<rect class="sA mech" x="${x0}" y="${top}" width="${x1 - x0}" height="34"/>`;
      // the inside first (Nell, when she's in), then the scissor gate across the front
      if (S.nell[1] === 1) s += tinyNell((x0 + x1) / 2 - 3, y, 0);
      // the lever on the cage wall
      const lx = x0 + 4, lt = S.lever ? [lx + 5, top + 14] : [lx - 1, top + 12];
      s += `<path class="sA" d="M${lx},${top + 22} L${lt[0]},${lt[1]}"/><circle class="k sA" cx="${lt[0]}" cy="${lt[1]}" r="1.6"/>`;
      if (S.gate === 0) {   // open: folded to the right edge
        for (let i = 0; i < 4; i++) s += `<path class="hl sA" d="M${x1 - 1 - i * 1.6},${top + 2} L${x1 - 1 - i * 1.6},${y - 1}"/>`;
      } else {
        const w = S.gate === 1 ? (x1 - x0) / 2 : x1 - x0, xs = x1 - w, n = S.gate === 1 ? 2 : 4, d = w / n;
        let p = "";
        for (let i = 0; i < n; i++) { const a = xs + i * d, b = a + d; p += `M${a},${top + 2} L${b},${y - 1} M${b},${top + 2} L${a},${y - 1} `; }
        s += `<path class="hl sA" d="${p}"/>`;
      }
      return s;
    }
    function readout() {
      let s = chip("MAGNET LIFT", 492, 76, 6, "fA") + seg("1968   UP ONLY", 492, 92, 4, "sM", .6);
      s += seg("FLOOR", 492, 116, 4, "sM", .6) + seg(FL[S.f], 492, 126, 44, "sW", 2.2);
      s += seg("MAX LOAD 1 MAGNET", 492, 184, 4, "sA", .6);
      return s;
    }
    function draw() {
      if (S.closed) return;
      let s = `<rect width="640" height="360" fill="#000"/>` + building() + fogPaths() + cage() + readout();
      if (S.nell[1] === 0) s += tinyNell(S.nell[0], fy(0), S.nell[2] || 0);
      if (S.nell[1] === 2) s += tinyNell(S.nell[0], fy(6), S.nell[2] || 0);
      s += earbuds(S.pre[0], S.pre[1], S.pre[2], S.preDim);
      if (S.line) s += line(S.line[0], S.line[1]);
      s += seg("CLICK >", 598, 344, 4, "sM", .6);
      svg.innerHTML = s;
    }

    // a beat: wait ms, or less if the player clicks
    let hurry = null;
    const beat = (ms) => new Promise(r => { const t = setTimeout(() => { hurry = null; r(); }, ms); hurry = () => { clearTimeout(t); hurry = null; r(); }; });
    const onClick = () => { if (hurry) hurry(); };
    el.addEventListener("click", onClick);
    const say = async (who, text) => {
      S.line = [who, text]; draw();
      if (who && window.SFX && window.SFX.voice) window.SFX.voice(who.replace(" (BELOW)", ""), true);
      await beat(1400 + text.length * 38); S.line = null; draw();
    };
    // the fog and the broken light keep their own clock (pose swaps)
    const iv = setInterval(() => { S.fog++; S.flick = Math.random() < .3 ? 1 : 0; draw(); }, 300);

    (async () => {
      draw(); await beat(700);
      await say(null, "B3. The fog runs out at the bottom of the stairs. There's a cage.");
      for (const x of [244, 258, 272]) { S.nell = [x, 0, (x / 14) % 2]; sfx("step"); draw(); await beat(150); }
      S.nell = [0, 1]; draw();
      await say("NELL", "'Magnet lift, 1968. Up only. Max load: one magnet.'");
      // Preston comes down the last flight
      S.pre = [226, fy(0) - 22, -1]; draw();
      await say("MORRIS", "You weigh less than a magnet, pal. Pull the lever.");
      S.gate = 1; sfx("clunk"); draw(); await beat(180);
      S.gate = 2; sfx("clunk"); draw(); await beat(220);
      S.lever = 1; sfx("clunk"); draw(); await beat(300);
      // up, a floor at a time, two stepped poses per floor
      for (let f = 0; f < 6; f++) {
        S.sub = 1; draw(); await beat(260);
        S.sub = 0; S.f = f + 1; sfx("clunk"); draw(); await beat(260);
        if (f === 0) { S.pre = [214, fy(0) - 22, 1]; draw(); }
        if (f === 1) { S.pre = [236, fy(0) - 22, -1]; draw(); await say("PRESTON (BELOW)", "Nell? Let's circle back."); }
        if (f === 3) { S.preDim = true; draw(); await say("MORRIS", "He doesn't take lifts. Lifts don't network."); }
      }
      sfx("bell"); await beat(300);
      S.gate = 1; sfx("clunk"); draw(); await beat(160);
      S.gate = 0; draw(); await beat(200);
      for (const x of [344, 364, 384, 404, 422]) { S.nell = [x, 2, (x / 20) % 2]; sfx("step"); draw(); await beat(150); }
      S.door = 1; sfx("clunk"); draw(); await beat(240); S.iris = true; draw();
      await say(null, "4F. The end of the hall, past the broken light. The door opens before you knock.");
      await beat(500);
      S.closed = true; clearInterval(iv); el.removeEventListener("click", onClick);
      resolve({ done: true });
    })();
    window.LIFT = S;
  });
}
