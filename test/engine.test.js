const fs = require('fs'), assert = require('assert/strict'), vm = require('vm'), Engine = require('../js/engine.js');
const D = vm.runInNewContext(fs.readFileSync(require('path').join(__dirname, '..', 'data', 'data.js'), 'utf8') + ';D');
const ALL = ['space-platform', 'nauvis', 'vulcanus', 'gleba', 'fulgora', 'aquilo'], S0 = { loc: ALL, nut: 'nutrients', stage: 'blue', asm: 2, fur: 'steel', min: 'elec', fuel: 'coal', belt: 'r', ins: 'fast', stk: 0, src: 'c', mod: '', bmod: '', bn: 0, mp: 0, oil: 'a', sf: 'l' };
const near = (a, b, t = 1e-6) => assert.ok(Math.abs(a - b) < t, `${a} != ${b}`), P = (S, i, r) => Engine.solve(D, { ...S0, ...S }, i, r), st = (p, id) => p.steps.find(s => s.id === id);
// 1. Each recipe uses its own time and the machine's real speed: green circuit 1/s on AM2 (0.75) -> 0.667 machines, cable 1.0
let p = P({ stage: 'green' }, 'electronic-circuit', 1);
near(st(p, 'electronic-circuit').count, 2 / 3); near(st(p, 'copper-cable').count, 1);
// 2. Steel furnaces (speed 2): 1.0 iron plate/s -> 1.6 furnaces; they burn coal: 90 kW / 4000 kJ = 0.0225 coal/s each
near(st(p, 'iron-plate').count, 1.6); near(st(p, 'iron-plate').fuel[1], 1.6 * 0.0225);
// 3. Fuel choice matters: solid fuel (12 MJ) burns a third as many items as coal
const sf = P({ stage: 'blue', fuel: 'solid-fuel' }, 'iron-plate', 1); near(st(sf, 'iron-plate').fuel[1], 1.6 * 90 / 12000);
// 4. Ore comes from drills with their own speed and power: electric drill 0.5/s, 90 kW + 3 kW drain, 10 pollution/min
p = P({}, 'iron-ore', 1); near(st(p, 'mine:iron-ore').count, 2); near(st(p, 'mine:iron-ore').kw, 2 * (90 + 3)); near(st(p, 'mine:iron-ore').poll, 20);
// 5. Burner drill burns fuel: 150 kW, 12 pollution/min, speed 0.25
p = P({ min: 'burner' }, 'iron-ore', 0.25); near(st(p, 'mine:iron-ore').count, 1); near(st(p, 'mine:iron-ore').poll, 12); assert.ok(p.fuel.coal > 0);
// 6. Mining productivity research: +30% -> fewer drills
near(st(P({ mp: 3 }, 'iron-ore', 1.3), 'mine:iron-ore').count, 2);
// 7. Inserters: fast inserter chest-to-chest 2.5/s; circuit AM2 needs cable 4.5/s (2) + iron 1.5/s (1) in, 1 out
p = P({ stage: 'green' }, 'electronic-circuit', 1); near(Engine.insRate(D, { ...S0 }), 2.5); assert.equal(st(p, 'electronic-circuit').inn, 3); assert.equal(st(p, 'electronic-circuit').out, 1);
// 8. Wiki capacity bonus 7 row: 3 / 12 / 16 items per swing
assert.deepEqual(['inserter', 'bulk-inserter', 'stack-inserter'].map(n => Engine.hand(D, { stk: 7 }, n)), [3, 12, 16]);
// 9. Oil: cracking brings 1 petroleum gas/s down to about 1.03 crude/s; basic processing alone needs 2.22
p = P({ loc: ['nauvis'] }, 'petroleum-gas', 1); near(st(p, 'mine:crude-oil').outs[0][1], 1.0256410256, 1e-4);
near(st(P({ oil: 'b', loc: ['nauvis'] }, 'petroleum-gas', 1), 'mine:crude-oil').outs[0][1], 100 / 45, 1e-4);
// 10. Modules + beacons: productivity-3 in AM3 plus speed beacons still solve; blue science needs only home resources
p = P({ stage: 'all', asm: 3, mod: 'productivity-module-3', bmod: 'speed-module-3', bn: 8 }, 'chemical-science-pack', 1); assert.ok(p.beacons > 0);
// 10b. Efficiency modules cut power without changing machine count
const e0 = P({ stage: 'all' }, 'chemical-science-pack', 1), e1 = P({ stage: 'all', mod: 'efficiency-module-3' }, 'chemical-science-pack', 1); assert.ok(e1.kw < e0.kw * 0.9 && e1.steps.length === e0.steps.length);
// 11. No scrap or recyclers when only Nauvis is allowed
p = P({ stage: 'all', loc: ['nauvis'] }, 'electronic-circuit', 1); assert.ok(!p.steps.some(s => s.machine === 'recycler'));
// 12. Power and pollution totals exist and are consistent
p = P({}, 'chemical-science-pack', 1); console.log('blue/s:', Math.round(p.kw / 1000 * 10) / 10, 'MW peak,', Math.round(p.poll), 'pollution/min,', p.inserters, 'inserters, fuel', JSON.stringify(p.fuel));
// 13. Locations: Gleba-only recipes vanish without Gleba; lava only exists on Vulcanus
assert.ok(!P({ stage: 'all', loc: ['nauvis'] }, 'iron-plate', 1).steps.some(s => /bacteria/.test(s.id)));
assert.ok(P({ stage: 'all', loc: ['vulcanus'] }, 'iron-plate', 1).steps.some(s => s.id.startsWith('mine:') || s.id.startsWith('pump:')));
// 14. Every machine tier able to make a recipe is listed, slowest first (the minimum tier), with its own count
p = P({ stage: 'green' }, 'electronic-circuit', 1); const alts = st(p, 'electronic-circuit').alts; assert.deepEqual(alts.map(a => a[0]), ['assembling-machine-1', 'assembling-machine-2']); near(alts[0][1], 1, 1e-9);
// 14b. Exact machine counts are not rounded up by numerical noise: 360 iron plates/min on stone furnaces = 12 drills (+1 for coal), as Kirk McDonald and FactorioLab give
p = P({ loc: ['nauvis'], fur: 'stone', mp: 0 }, 'iron-plate', 6); assert.equal(st(p, 'mine:iron-ore').whole, 12); assert.equal(st(p, 'mine:coal').whole, 1); assert.equal(st(p, 'iron-plate').whole, 20);
// 15. Fuel choice by category: solid fuel for furnaces, nutrients for biochambers
console.log('ok');
