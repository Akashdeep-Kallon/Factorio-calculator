/* Calculation engine. All game numbers come from data.js (Factorio's own data-raw-dump); the only hand-written numbers are the wiki's
   measured inserter swing times and belt-pickup tables, which are empirical and not in the game data. */
const Engine = (() => {
  const cl = x => Math.ceil(x - 1e-6 * Math.max(1, Math.abs(x))); // the LP carries ~1e-8 of numerical noise, so 12.00000023 machines must not become 13
  const STAGES = { red: 1, green: 2, blue: 4, purple: 6, space: 7, all: 99 };
  const NAME = { burner: 'burner-inserter', basic: 'inserter', long: 'long-handed-inserter', fast: 'fast-inserter', bulk: 'bulk-inserter', stack: 'stack-inserter' };
  const TICKS = { 'burner-inserter': 76, inserter: 70, 'long-handed-inserter': 48, 'fast-inserter': 24, 'bulk-inserter': 24, 'stack-inserter': 24 }; // wiki, measured
  const q4 = x => [x, x, x, x];
  const BC = { burner: [q4(.78), q4(1.57), [2.15, 2.25, 2.3, 2.3], [2.6, 2.87, 2.93, 3]], basic: [q4(.85), q4(1.7), [2.3, 2.45, 2.5, 2.5], [2.8, 3.07, 3.2, 3.27]], long: [q4(1.2), q4(2.33), [3.1, 3.35, 3.45, 3.45], [3.65, 4.13, 4.33, 4.47]], fast: [q4(2.5), q4(4.8), [5.62, 6.42, 6.9, 6.9], [6, 7.5, 8.27, 8.58]], bulk: [q4(4.8), [6, 7.5, 8.27, 8.58], [6.93, 11.23, 14.4, 16.4], [6.93, 11.12, 14.4, 16.4]] }; // wiki belt -> chest, columns = belt yellow/red/blue/turbo
  const BELT = { y: 'transport-belt', r: 'fast-transport-belt', b: 'express-transport-belt', t: 'turbo-transport-belt' };
  const FUR = { stone: 'stone-furnace', steel: 'steel-furnace', elec: 'electric-furnace' }, DRL = { burner: 'burner-mining-drill', elec: 'electric-mining-drill', big: 'big-mining-drill' };

  function simplex(A, b, c) { // minimise c.x s.t. Ax=b, x>=0, b>=0. Two phases (feasibility first, then cost); Bland's rule while degenerate pivots repeat
    const m = A.length, n = c.length, w = n + m + 1;
    const T = A.map((row, i) => { const t = new Float64Array(w); t.set(row); t[n + i] = 1; t[w - 1] = b[i]; return t });
    const basis = Array.from({ length: m }, (_, i) => n + i);
    const pivot = (l, e) => { const p = T[l][e]; for (let j = 0; j < w; j++) T[l][j] /= p; for (let i = 0; i < m; i++) if (i !== l) { const f = T[i][e]; if (Math.abs(f) > 1e-12) for (let j = 0; j < w; j++) T[i][j] -= f * T[l][j] } basis[l] = e };
    const run = (cost, lim) => { let stall = 0;
      for (let it = 0; it < 20000; it++) {
        let e = -1, best = -1e-9;
        for (let j = 0; j < lim; j++) { let z = cost[j]; for (let i = 0; i < m; i++) z -= cost[basis[i]] * T[i][j]; if (z < best) { best = z; e = j; if (stall > 25) break } }
        if (e < 0) return true;
        let l = -1, q0 = Infinity;
        for (let i = 0; i < m; i++) if (T[i][e] > 1e-9) { const q = T[i][w - 1] / T[i][e]; if (q < q0 - 1e-10 || (Math.abs(q - q0) <= 1e-10 && basis[i] < basis[l])) { q0 = q; l = i } }
        if (l < 0) { simplex.why = 'unbounded'; return false }
        stall = q0 < 1e-6 ? stall + 1 : 0; pivot(l, e);
      }
      simplex.why = 'iterations'; return false };
    const c1 = new Float64Array(n + m); c1.fill(1, n);
    if (!run(c1, n)) return null;
    for (let i = 0; i < m; i++) if (basis[i] >= n && T[i][w - 1] > 1e-7) { simplex.why = 'infeasible'; simplex.row = i; return null }
    for (let i = 0; i < m; i++) if (basis[i] >= n) { const j = T[i].findIndex((v, k) => k < n && Math.abs(v) > 1e-9); if (j >= 0) pivot(i, j) } // drive artificials out
    const c2 = new Float64Array(n + m); c2.set(c);
    if (!run(c2, n)) return null;
    const x = new Array(n).fill(0); for (let i = 0; i < m; i++) if (basis[i] < n) x[basis[i]] = T[i][w - 1];
    return x;
  }

  /* what is unlocked: every technology needing only the chosen science packs (and not behind a planet) counts as researched */
  const pg = {};
  function progress(D, stage) {
    if (pg[stage]) return pg[stage];
    const A = new Set(D.packs.slice(0, STAGES[stage])), by = new Map(D.techs.map(t => [t.n, t])), ok = new Map(), pl = new Map();
    const planetary = n => { let v = pl.get(n); if (v !== undefined) return v; pl.set(n, false); v = n.startsWith('planet-discovery-') || (by.get(n)?.p || []).some(planetary); pl.set(n, v); return v };
    const good = n => { let v = ok.get(n); if (v !== undefined) return v; ok.set(n, false); const t = by.get(n); v = !!t && t.u.every(p => A.has(p)) && t.p.every(p => !by.has(p) || good(p)); ok.set(n, v); return v };
    const rec = new Set(); D.techs.forEach(t => { if (good(t.n)) t.r.forEach(r => rec.add(r)) });
    return pg[stage] = rec;
  }
  const usable = (D, stage, n) => !D.recipes[n] || D.recipes[n].en || progress(D, stage).has(n);
  const has = (D, S, n) => { const st = typeof S === 'string' ? S : S.stage, L = typeof S === 'string' ? null : S.loc, m = D.machines[n]; return usable(D, st, n) && !(L && m && m.loc && !m.loc.some(l => L.includes(l))) };

  /* inserter capacity: techs up to the chosen level (bulk inserter research always counts) */
  function hand(D, S, name) {
    const lv = S.stk === 's' ? 7 : +S.stk; let s = 0, b = 0;
    for (const t of D.techs) { const m = /^inserter-capacity-bonus-(\d)$/.exec(t.n); if (t.n === 'bulk-inserter' || (m && +m[1] <= lv) || (S.stk === 's' && (t.s || t.b))) { s += t.s; b += t.b } }
    const i = D.inserters.find(x => x.n === name); return 1 + i.base + (i.bulk ? b : s);
  }
  function insRate(D, S) { // items/s one inserter moves
    const key = Object.keys(NAME).find(k => NAME[k] === NAME[S.ins]) || 'basic', name = NAME[S.ins] || 'inserter', h = hand(D, S, name);
    if (S.src === 'b') { const bk = BC[key === 'stack' ? 'bulk' : key], c = { 0: 0, 2: 1, 7: 2, s: 3 }[S.stk]; return bk[c]['yrbt'.indexOf(S.belt)] }
    return 60 / TICKS[name] * h;
  }

  function solve(D, S, item, rate) {
    const L = S.loc || D.locs.map(l => l.id), locOK = loc => !loc || loc.some(l => L.includes(l));
    const ok = n => usable(D, S.stage, n), mOK = n => ok(n) && locOK(D.machines[n] && D.machines[n].loc);
    const avail = Object.entries(D.machines).filter(([n]) => mOK(n));
    const asm = 'assembling-machine-' + S.asm, prefs = [asm, FUR[S.fur], DRL[S.min]];
    const pick = cat => {
      const c = avail.filter(([, m]) => m.c.includes(cat)); if (!c.length) return null;
      const p = prefs.map(n => c.find(([k]) => k === n)).find(Boolean); if (p) return p;
      const ams = c.filter(([k]) => k.startsWith('assembling-machine-')).sort((a, b) => a[1].s - b[1].s);
      if (ams.length) return ams.find(([, m]) => m.s >= D.machines[asm].s) || ams[ams.length - 1];
      return c.sort((a, b) => b[1].s - a[1].s)[0];
    };
    const modOf = n => D.modules.find(m => m.n === n && ok(m.n)) || null, sm = modOf(S.mod), bm = S.bn ? modOf(S.bmod) : null;
    const fits = (md, m, r, bc) => md && (bc || m.ms) && (!md.sp || m.ae.includes('speed')) && (!md.pr || (m.ae.includes('productivity') && r.p && !bc)) && (!md.en || m.ae.includes('consumption')) && (!md.po || m.ae.includes('pollution'));
    const mpb = D.techs.filter(t => /^mining-productivity-\d$/.test(t.n) && +t.n.slice(-1) <= S.mp).reduce((a, t) => a + t.mp, 0);
    const fuelFor = m => [S.fuel, S.nut].find(f => D.items[f] && m.fc.includes(D.items[f].fcat)) || D.fuels.find(f => m.fc.includes(D.items[f].fcat));
    const fx = (m, r) => { // what modules and beacons do to this machine for this recipe
      const uS = fits(sm, m, r) ? m.ms : 0, bn = m.k !== 'p' && fits(bm, m, r, true) ? S.bn : 0, bf = bn ? Math.sqrt(bn) * D.beacon.slots * D.beacon.eff : 0;
      return { uS, bn, spd: m.s * Math.max(.2, 1 + uS * (sm?.sp || 0) + bf * (bm?.sp || 0)), cons: Math.max(.2, 1 + uS * (sm?.en || 0) + bf * (bm?.en || 0)), pol: Math.max(.2, 1 + uS * (sm?.po || 0) + bf * (bm?.po || 0)),
        prod: r.mine ? Math.min(r.mp, mpb + uS * (sm?.pr || 0)) : r.p ? Math.min(r.mp, uS * (sm?.pr || 0) + m.bp) : 0 };
    };
    // ---- usable recipes (researched, and possible on at least one chosen location), each with its machine and effects
    const off = new Set(); if (S.oil === 'b') off.add('advanced-oil-processing').add('coal-liquefaction');
    ['l', 'g', 'h'].forEach(k => { if (S.sf && S.sf !== k) off.add({ l: 'solid-fuel-from-light-oil', g: 'solid-fuel-from-petroleum-gas', h: 'solid-fuel-from-heavy-oil' }[k]) });
    const R = [];
    for (const [id, r] of Object.entries(D.recipes)) {
      if (off.has(id) || !locOK(r.loc)) continue;
      if (r.mine) { if (id.startsWith('pump:') && !ok('offshore-pump')) continue } else if (!ok(id)) continue;
      const me = pick(r.c); if (!me) continue;
      const [mn, m] = me, e = fx(m, r), tr = r.t / e.spd, kwUse = m.kw * e.cons, fi = m.fc.length ? fuelFor(m) : null, fv = fi ? D.items[fi].fv : 0;
      R.push({ id, r, mn, m, tr, kwUse, pol: e.pol, prod: e.prod, bn: e.bn, uS: e.uS, fi, fpr: fi && fv ? kwUse * tr / (fv * m.ef) : 0, fm: fi ? D.items[fi].fm : 1 });
    }

    // ---- the relevant sub-network: walk back from the goal through every usable recipe
    const prodOf = {}; R.forEach(e => e.r.r.forEach(o => (prodOf[o[0]] ||= []).push(e)));
    const items = [item], idx = { [item]: 0 }, rs = [], seen = new Set(), add = k => { if (!(k in idx)) { idx[k] = items.length; items.push(k) } };
    for (let k = 0; k < items.length; k++) for (const e of prodOf[items[k]] || []) if (!seen.has(e.id)) { seen.add(e.id); rs.push(e); e.r.i.forEach(a => add(a[0])); e.r.r.forEach(o => add(o[0])); if (e.fi) add(e.fi) }
    // an item is only craftable if its inputs can ultimately come from raw materials; dead ends (asteroid chunks, rocket launches) become raw inputs
    const can = new Set(items.filter(i => !prodOf[i])); for (let ch = true; ch;) { ch = false; for (const e of rs) if (e.r.i.every(a => can.has(a[0])) && (!e.fi || can.has(e.fi)) && !e.r.r.every(o => can.has(o[0]))) { e.r.r.forEach(o => can.add(o[0])); ch = true } }
    const raws = items.filter(i => !prodOf[i] || !can.has(i)), isFl = i => !!D.items[i]?.fluid;
    const n = rs.length + raws.length + items.length, A = items.map(() => new Array(n).fill(0)), c = new Array(n).fill(0);
    rs.forEach((e, j) => {
      e.r.i.forEach(a => A[idx[a[0]]][j] -= a[1]); e.r.r.forEach(o => A[idx[o[0]]][j] += o[1] * (1 + e.prod)); if (e.fi) A[idx[e.fi]][j] -= e.fpr;
      const unit = o => e.id.startsWith('pump:') ? .001 : isFl(o[0]) ? .05 : 1, far = e.r.loc && !e.r.loc.includes('nauvis') ? 1.3 : 1; // a little less keen on other planets
      c[j] = .01 * e.tr + (e.r.mine ? far * e.r.r.reduce((t, o) => t + o[1] * (1 + e.prod) * unit(o), 0) : 0);
    });
    raws.forEach((i, j) => { A[idx[i]][rs.length + j] = 1; c[rs.length + j] = 1000 });
    items.forEach((i, j) => { A[j][rs.length + raws.length + j] = -1; c[rs.length + raws.length + j] = isFl(i) ? .01 : .1 });
    let x = null; // a tiny, irregular perturbation keeps the simplex from cycling; if it still stalls, retry with another one
    for (let k = 0; k < 4 && !x; k++) {
      const rhs = items.map((_, i) => i ? 1e-8 * Math.pow(10, k) * (1 + ((Math.sin((i + 7 * k) * 12.9898) * 43758.5453) % 1 + 1) % 1) : 1);
      x = simplex(A, rhs, c); if (!x && simplex.why !== 'iterations') break;
    }
    if (!x) { solve.bad = items[simplex.row]; return null }
    // ---- turn the LP answer into machines, power, fuel, pollution, inserters and belts
    const ir = insRate(D, S), belt = D.belts.filter(b => ok(b.n)).find(b => b.n === BELT[S.belt]) || D.belts.filter(b => ok(b.n)).sort((a, b) => b.ips - a.ips)[0];
    const steps = [];
    rs.forEach((e, j) => {
      const runs = x[j] * rate; if (runs < 1e-5 * rate) return;
      const count = runs * e.tr, whole = Math.max(1, cl(count)), crafted = !e.r.mine, cps = 1 / e.tr;
      const ins = e.r.i.map(a => [a[0], a[1] * runs]), outs = e.r.r.map(o => [o[0], o[1] * (1 + e.prod) * runs]); if (e.fi) ins.push([e.fi, e.fpr * runs]);
      const inn = crafted ? e.r.i.filter(a => !a[2]).reduce((t, a) => t + cl(a[1] * cps / ir), 0) + (e.fi ? cl(e.fpr * cps / ir) : 0) : 0;
      const out = crafted ? cl(e.r.r.filter(o => !o[2]).reduce((t, o) => t + o[1] * (1 + e.prod), 0) * cps / ir) : 0;
      const moved = (ins.filter(a => !isFl(a[0])).reduce((t, a) => t + a[1], 0) + outs.filter(a => !isFl(a[0])).reduce((t, a) => t + a[1], 0)) / Math.max(whole, 1);
      const main = (outs.find(o => o[0] === item) || outs[0])[0], solidOut = outs.filter(o => !isFl(o[0])).reduce((t, o) => t + o[1], 0);
      steps.push({ id: e.id, item: main, rate: outs.find(o => o[0] === main)[1], machine: e.mn, count, whole, mine: !!e.r.mine, kind: e.m.k, time: e.r.t, tr: e.tr,
        kw: e.m.e ? whole * (e.kwUse + e.m.dr) : 0, kwAvg: e.m.e ? count * e.kwUse + whole * e.m.dr : 0, heat: e.m.e ? 0 : count * e.kwUse,
        fuel: e.fi ? [e.fi, e.fpr * runs] : null, poll: count * e.m.em * e.pol * e.fm * (e.r.em ?? 1), beacons: e.bn * whole, prod: e.prod,
        mod: sm && e.uS ? sm.n : null, modN: e.uS, bmod: bm ? bm.n : null, alts: avail.filter(([, m]) => m.k === e.m.k && m.c.includes(e.r.c)).sort((a, b) => a[1].s - b[1].s).map(([n, m]) => { const t = runs * e.r.t / fx(m, e.r).spd; return [n, t, cl(t)] }),
        inn, out, ir, util: inn + out ? moved / ((inn + out) * ir) : 0, belts: solidOut / belt.ips, fluid: outs.every(o => isFl(o[0])), ins, outs });
    });
    // ---- graph for the diagram: producers -> consumers, split in proportion to what each producer makes
    const made = {}; steps.forEach(s => s.outs.forEach(([k, v]) => (made[k] ||= []).push([s.id, v])));
    const edges = {}, rawOut = [], side = [];
    steps.forEach(s => s.ins.forEach(([k, q]) => { const m = made[k] || [], tot = m.reduce((a, y) => a + y[1], 0); m.forEach(([p, v]) => { if (p !== s.id && tot) edges[p + '>' + s.id + '|' + k] = (edges[p + '>' + s.id + '|' + k] || 0) + q * v / tot }) }));
    raws.forEach((i, j) => { const q = x[rs.length + j] * rate; if (q > 1e-5 * rate) rawOut.push([i, q]) });
    items.forEach((i, j) => { const q = x[rs.length + raws.length + j] * rate; if (q > 1e-5 * rate && i !== item) side.push([i, q]) });
    const cons = {}; Object.keys(edges).forEach(k => { const [a, b] = k.split('|')[0].split('>'); (cons[a] ||= new Set()).add(b) });
    const dep = {}, vis = new Set(); // longest path from the goal; edges that close a loop are ignored
    const depth = n => { if (n in dep) return dep[n]; vis.add(n); let d = 0; for (const c of cons[n] || []) if (!vis.has(c)) d = Math.max(d, depth(c) + 1); vis.delete(n); return dep[n] = d };
    steps.forEach(s => depth(s.id));
    const lvl = {}; steps.forEach(s => lvl[s.id] = Math.max(...Object.values(dep)) - dep[s.id]); steps.sort((a, b) => lvl[a.id] - lvl[b.id] || a.id.localeCompare(b.id));
    const sum = k => steps.reduce((t, s) => t + (s[k] || 0), 0), by = {}; steps.forEach(s => by[s.machine] = (by[s.machine] || 0) + s.whole);
    const fuel = {}; steps.forEach(s => { if (s.fuel) fuel[s.fuel[0]] = (fuel[s.fuel[0]] || 0) + s.fuel[1] });
    const beacons = sum('beacons');
    return { steps, edges, dep, raw: rawOut, side, belt, ir, by, fuel, beacons, bm, sm,
      kw: sum('kw') + beacons * D.beacon.kw, kwAvg: sum('kwAvg') + beacons * D.beacon.kw, heat: sum('heat'), poll: sum('poll'), inserters: steps.reduce((t, s) => t + s.whole * (s.inn + s.out), 0) };
  }

  const craftable = (D, S) => { const L = S.loc || D.locs.map(l => l.id), o = new Set(); for (const [id, r] of Object.entries(D.recipes)) if (usable(D, S.stage, id) && (!r.loc || r.loc.some(l => L.includes(l)))) r.r.forEach(a => o.add(a[0])); return [...o] };
  return { why: () => simplex.why, solve, craftable, has, insRate, hand, simplex, progress, NAME, BELT, FUR, DRL, cl };
})();
if (typeof module !== 'undefined') module.exports = Engine;
