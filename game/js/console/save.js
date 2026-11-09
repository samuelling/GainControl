// Saving files from the console: results (CSV), zips of them, and the PsychoPy / Psychtoolbox scripts. In a browser,
// a download. In the Mac and iOS apps (js/native.js), the app saves it: a save panel on the Mac, the share sheet on
// iPhone and iPad (Save to Files, AirDrop, Mail), since a web view there can't download on its own.
import { NATIVE, post } from "../native.js";

const b64 = (bytes) => { let s = ""; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); };

export function saveFile(name, data, mime = "text/plain") {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  if (NATIVE) { post("save", { name, mime, b64: b64(bytes) }); return; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([bytes], { type: mime })); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

// a timestamp for file names: 2026-11-09_1412
export const stamp = (d = new Date()) => { const p = (v) => String(v).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`; };
