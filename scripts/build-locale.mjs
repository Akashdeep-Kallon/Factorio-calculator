// Builds data/names.es.js / data/names.ca.js (item names in your language) from the game own locale files.
// Usage: npm run locale  |  node scripts/build-locale.mjs "C:\Games\Factorio\data"
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const OUT_DIR = fileURLToPath(new URL('../data/', import.meta.url));
const arg = process.argv[2], home = process.env.HOME || process.env.USERPROFILE || '';
const roots = [arg, 'C:/Program Files (x86)/Steam/steamapps/common/Factorio', 'C:/Program Files/Factorio', 'C:/Games/Factorio', 'D:/SteamLibrary/steamapps/common/Factorio',
  `${home}/.steam/steam/steamapps/common/Factorio`, `${home}/Library/Application Support/Steam/steamapps/common/Factorio/factorio.app/Contents`, '/Applications/factorio.app/Contents'].filter(Boolean);
const dir = roots.flatMap(r => [r, path.join(r, 'data'), path.join(r, '..', '..', 'data')]).find(p => fs.existsSync(path.join(p, 'base', 'locale')));
if (!dir) { console.error('Could not find the Factorio data folder.\nRun: npm run locale -- "<Factorio folder>\\data"  (the folder that contains base, space-age, core...)'); process.exit(1); }
const LANGS = { 'es-ES': 'es', ca: 'ca' }, SECTIONS = ['item-name', 'fluid-name', 'recipe-name', 'entity-name', 'equipment-name'];

for (const [game, app] of Object.entries(LANGS)) {
  const names = {};
  for (const mod of ['base', 'space-age', 'quality', 'elevated-rails']) {
    const ld = path.join(dir, mod, 'locale', game); if (!fs.existsSync(ld)) continue;
    for (const f of fs.readdirSync(ld).filter(f => f.endsWith('.cfg'))) { let sec = '';
      for (const line of fs.readFileSync(path.join(ld, f), 'utf8').split(/\r?\n/)) {
        const m = /^\[(.+)\]$/.exec(line); if (m) { sec = m[1]; continue; }
        const kv = /^([^=;#]+)=(.+)$/.exec(line); if (kv && SECTIONS.includes(sec) && (!kv[2].includes('__') || /^__(ENTITY|ITEM|FLUID|RECIPE)__[^_].*__$/.test(kv[2].trim()))) names[kv[1]] = kv[2].trim(); } }
    for (let pass = 0; pass < 3; pass++) for (const [k, v] of Object.entries(names)) { const m = /^__(?:ENTITY|ITEM|FLUID|RECIPE)__(.+)__$/.exec(v); if (m) { if (names[m[1]] && !names[m[1]].includes('__')) names[k] = names[m[1]]; } }
    for (const [k, v] of Object.entries(names)) if (v.includes('__')) delete names[k]; // unresolved placeholders
  }
  const n = Object.keys(names).length;
  if (n) { fs.writeFileSync(path.join(OUT_DIR, `names.${app}.js`), 'window.NAMES=window.NAMES||{};NAMES.' + app + '=' + JSON.stringify(names) + ';'); console.log(`${app}: ${n} names (from ${dir})`); }
  else console.log(`${app}: no locale files found for "${game}" in ${dir}`);
}
