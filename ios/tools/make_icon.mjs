// Render ios/tools/icon.html to the app icons (1024×1024 PNG): the iOS asset catalog and the Mac app.
//   node ios/tools/make_icon.mjs        (needs Playwright; serves the repo root on a spare port)
import { createServer } from "node:http";
import { readFile, copyFile } from "node:fs/promises";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const PW = process.env.PLAYWRIGHT || "playwright";
const { chromium } = await import(PW);
const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2" };
const srv = createServer(async (q, r) => {
  try { const p = join(root, decodeURIComponent(q.url.split("?")[0])); r.writeHead(200, { "content-type": types[extname(p)] || "application/octet-stream" }); r.end(await readFile(p)); }
  catch { r.writeHead(404); r.end(); }
}).listen(0);
const port = srv.address().port;
const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1024, height: 1024 } });
await p.goto(`http://127.0.0.1:${port}/ios/tools/icon.html`); await p.waitForSelector("body[data-ready]"); await p.waitForTimeout(300);
const out = join(root, "ios/GainControl/Assets.xcassets/AppIcon.appiconset/AppIcon.png");
await p.screenshot({ path: out, omitBackground: false });
await copyFile(out, join(root, "macos/AppIcon.png"));
await b.close(); srv.close();
console.log("wrote", out, "and macos/AppIcon.png");
