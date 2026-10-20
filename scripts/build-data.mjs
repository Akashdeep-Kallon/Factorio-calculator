// node scripts/build-data.mjs <data-raw-dump.json> [<factoriolab>/public/data/spa/data.json]  ->  data/data.js  (everything comes from the game's own data; nothing typed by hand)
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const OUT = fileURLToPath(new URL('../data/data.js', import.meta.url)); // always data/data.js, whatever the working directory
const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), A = x => Array.isArray(x) ? x : [];
const num = (s, u) => { const m = new RegExp('^([\\d.]+)\\s*([kMG]?)' + u + '$').exec(s || ''); return m ? +m[1] * { '': 1e-3, k: 1, M: 1e3, G: 1e6 }[m[2]] : 0 }; // -> k(W|J)
const amt = x => (x.amount ?? ((x.amount_min + x.amount_max) / 2)) * (x.probability ?? 1);
const fl = x => x.type === 'fluid' ? 1 : 0, ALL = ['consumption', 'speed', 'productivity', 'pollution', 'quality'];
const allowed = m => (m.allowed_effects === undefined ? ALL : A([].concat(m.allowed_effects)));
// ---- locations (space platform + planets) and the surface conditions recipes/machines need
const prop0 = Object.fromEntries(Object.values(d['surface-property']).map(x => [x.name, x.default_value]));
const LOCS = { 'space-platform': d.surface['space-platform'].surface_properties, ...Object.fromEntries(Object.entries(d.planet).map(([k, v]) => [k, v.surface_properties || {}])) };
const where = conds => { if (!conds) return undefined; const ok = Object.keys(LOCS).filter(l => A(conds).every(c => { const v = LOCS[l][c.property] ?? prop0[c.property]; return v >= (c.min ?? -Infinity) && v <= (c.max ?? Infinity) })); return ok.length === Object.keys(LOCS).length ? undefined : ok };
// ---- recipes (hidden, recycling, barrelling excluded)
const recipes = {};
for (const r of Object.values(d.recipe)) {
  if (['recycling', 'parameters'].includes(r.category) || r.hidden || !A(r.results).length || /^(fill|empty)-/.test(r.name)) continue;
  recipes[r.name] = { c: r.category || 'crafting', t: r.energy_required ?? 0.5, p: r.allow_productivity ? 1 : 0, mp: r.maximum_productivity ?? 3, em: r.emissions_multiplier ?? 1,
    i: A(r.ingredients).map(a => [a.name, a.amount, fl(a)]), r: A(r.results).map(a => [a.name, amt(a), fl(a)]), en: r.enabled === false ? 0 : 1, loc: where(r.surface_conditions) };
}
// ---- machines: crafting (assemblers, furnaces), mining (drills), pumps
const src = m => { const e = m.energy_source || {}; return { e: e.type === 'electric' ? 1 : 0, fc: e.type === 'burner' ? A(e.fuel_categories || (e.fuel_category ? [e.fuel_category] : ['chemical'])) : [], ef: e.effectivity ?? 1, dr: e.type === 'electric' ? (e.drain ? num(e.drain, 'W') : num(m.energy_usage, 'W') / 30) : 0, em: e.emissions_per_minute?.pollution ?? 0 }; };
const machines = {};
for (const t of ['assembling-machine', 'furnace']) for (const m of Object.values(d[t])) if (m.crafting_speed && m.energy_source) machines[m.name] = { k: 'c', loc: where(m.surface_conditions), s: m.crafting_speed, c: A(m.crafting_categories), kw: num(m.energy_usage, 'W'), ms: m.module_slots || 0, ae: allowed(m), bp: m.effect_receiver?.base_effect?.productivity ?? 0, ...src(m) };
for (const m of Object.values(d['mining-drill'])) if (m.mining_speed) machines[m.name] = { k: 'm', loc: where(m.surface_conditions), s: m.mining_speed, c: A(m.resource_categories), kw: num(m.energy_usage, 'W'), ms: m.module_slots || 0, ae: allowed(m), bp: 0, ...src(m) };
for (const m of Object.values(d['offshore-pump'])) machines[m.name] = { k: 'p', s: m.pumping_speed * 60, c: ['pump'], kw: 0, ms: 0, ae: [], bp: 0, e: 0, fc: [], ef: 1, dr: 0, em: 0 };
// ---- resources -> mining "recipes" (id mine:<resource>); crude oil is mined by pumpjacks, water pumped
const home = new Set(['water']);
for (const r of Object.values(d.resource || {})) {
  const mn = r.minable || {}, res = mn.results ? A(mn.results) : [{ name: mn.result, amount: mn.count ?? 1 }];
  if (r.autoplace && !r.autoplace.control && String(r.autoplace.probability_expression).includes(`control:${r.name}`)) res.forEach(x => home.add(x.name));
  if (!res[0]?.name) continue;
  const planets = Object.entries(d.planet).filter(([, v]) => r.name in (v.map_gen_settings?.autoplace_settings?.entity?.settings || {})).map(([k]) => k);
  recipes['mine:' + r.name] = { loc: planets.length ? planets : undefined, c: r.category || 'basic-solid', t: mn.mining_time ?? 1, p: 1, mp: 3, em: 1, i: mn.required_fluid ? [[mn.required_fluid, (mn.fluid_amount ?? 0) / 10, 1]] : [], r: res.map(x => [x.name, amt(x), fl(x)]), en: 1, mine: 1 };
}
for (const [fluid, tiles] of Object.entries(Object.values(d.tile).reduce((o, t) => t.fluid ? ((o[t.fluid] ||= new Set()).add(t.name), o) : o, {})))
  recipes['pump:' + fluid] = { c: 'pump', t: 1, p: 0, mp: 0, em: 1, i: [], r: [[fluid, 1, 1]], en: 1, mine: 1, loc: Object.entries(d.planet).filter(([, v]) => Object.keys(v.map_gen_settings?.autoplace_settings?.tile?.settings || {}).some(t => tiles.has(t))).map(([k]) => k) };
// ---- items: fuel values, subgroup -> group, everything referenced
const ids = new Set(); Object.values(recipes).forEach(r => [...r.i, ...r.r].forEach(a => ids.add(a[0])));
for (const tbl of Object.values(d)) for (const p of Object.values(tbl)) if (p && typeof p === 'object' && p.stack_size && p.fuel_value && p.fuel_category) ids.add(p.name); // all fuels, so they can be chosen
const items = {}, grp = s => d['item-subgroup']?.[s]?.group || 'intermediate-products';
for (const [type, tbl] of Object.entries(d)) for (const p of Object.values(tbl)) if (p && typeof p === 'object' && p.stack_size && ids.has(p.name)) items[p.name] = { g: grp(p.subgroup), ...(p.fuel_value ? { fv: num(p.fuel_value, 'J'), fcat: p.fuel_category, fm: p.fuel_emissions_multiplier ?? 1 } : {}) };
for (const f of Object.values(d.fluid)) if (ids.has(f.name)) items[f.name] = { g: 'fluids', fluid: 1, ...(f.fuel_value ? { fv: num(f.fuel_value, 'J'), fcat: 'chemical', fm: f.emissions_multiplier ?? 1 } : {}) };
// ---- modules, beacon, belts, inserters, techs (unlocks, inserter capacity, mining productivity)
const modules = Object.values(d.module).map(m => ({ n: m.name, cat: m.category, tier: m.tier, sp: m.effect?.speed ?? 0, pr: m.effect?.productivity ?? 0, en: m.effect?.consumption ?? 0, po: m.effect?.pollution ?? 0 }));
const b = Object.values(d.beacon)[0], beacon = { n: b.name, slots: b.module_slots, eff: b.distribution_effectivity, kw: num(b.energy_usage, 'W'), ae: allowed(b) };
const belts = Object.values(d['transport-belt']).map(x => ({ n: x.name, ips: x.speed * 480 }));
const inserters = Object.values(d.inserter).map(i => ({ n: i.name, rot: i.rotation_speed, bulk: !!i.bulk, base: i.stack_size_bonus ?? 0 }));
const techs = Object.values(d.technology).filter(t => t.enabled !== false).map(t => { const e = A(t.effects), sum = k => e.filter(x => x.type === k).reduce((a, x) => a + x.modifier, 0);
  return { n: t.name, p: A(t.prerequisites), u: A(t.unit?.ingredients).map(x => x[0]), r: e.filter(x => x.type === 'unlock-recipe').map(x => x.recipe), s: sum('inserter-stack-size-bonus'), b: sum('bulk-inserter-capacity-bonus'), mp: sum('mining-drill-productivity-bonus') }; });
const packs = ['automation', 'logistic', 'military', 'chemical', 'production', 'utility', 'space', 'metallurgic', 'electromagnetic', 'agricultural', 'cryogenic', 'promethium'].map(p => p + '-science-pack');
// Official English names come from FactorioLab's public/data/spa/data.json (optional). Icons are built by scripts/build-icons.py.
let names = {}; const lab = process.argv[3];
if (lab) {
  const L = JSON.parse(fs.readFileSync(lab, 'utf8')), want = new Set([...Object.keys(items), ...Object.keys(machines), ...modules.map(m => m.n), ...belts.map(b => b.n), ...inserters.map(i => i.n), beacon.n, ...packs]);
  for (const x of [...L.recipes, ...L.items]) if (want.has(x.id) && x.name) names[x.id] = x.name;
}
const locs = Object.keys(LOCS).map(id => ({ id, name: id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ') }));
const fuels = Object.entries(items).filter(([, v]) => v.fv && !v.fluid).sort((a, b) => a[1].fcat.localeCompare(b[1].fcat) || a[1].fv - b[1].fv).map(([k]) => k);
fs.writeFileSync(OUT, 'const D=' + JSON.stringify({ locs, fuels, names, recipes, machines, items, modules, beacon, belts, inserters, techs, packs, home: [...home] }) + ';');
console.log(`data/data.js: ${Object.keys(recipes).length} recipes, ${Object.keys(machines).length} machines, ${Object.keys(items).length} items, ${(fs.statSync(OUT).size / 1024) | 0} KB`);
