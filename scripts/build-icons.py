"""Builds data/icons.webp + data/icons.js from the icons-factorio repo (64x64 PNGs named by game id).
Usage: python scripts/build-icons.py <path to icons-factorio-main/factorio-icons>   (run after npm run data)"""
import sys, os, json, re
DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')  # always data/, whatever the working directory
from PIL import Image
root = sys.argv[1]
D = json.loads(open(os.path.join(DATA, 'data.js'), encoding='utf8').read()[len('const D='):].rstrip(';'))
ids = set(D['items']) | set(D['machines']) | {m['n'] for m in D['modules']} | {b['n'] for b in D['belts']} | {i['n'] for i in D['inserters']} | {D['beacon']['n']} | set(D['packs'])
idx = {}  # id -> png path (vanilla first, then space-age; plain icons before fluid icons)
for mod in ['base', 'space-age', 'quality', 'elevated-rails']:
    top = os.path.join(root, mod, 'icons')
    for dp, _, fs_ in sorted(os.walk(top), key=lambda x: x[0].count(os.sep)):  # plain icons first, then sub-folders (fluid/, barreling/...)
        for f in fs_:
            if f.endswith('.png') and 'mask' not in f: idx.setdefault(f[:-4], os.path.join(dp, f))
ALIAS = {'defender-capsule': 'defender', 'distractor-capsule': 'distractor', 'destroyer-capsule': 'destroyer', 'capture-robot-rocket': 'capture-bot', 'stone-wall': 'wall', 'raw-fish': 'fish', 'barrel': 'empty-barrel', 'heat-exchanger': 'heat-boiler'}
for k, v in ALIAS.items():
    if v in idx: idx.setdefault(k, idx[v])
for k in list(ids):
    if k.endswith('-barrel') and k not in idx:
        for cand in ('barrel-' + k[:-7], k[:-7] + '-barrel'):
            if cand in idx: idx[k] = idx[cand]
want = {i: idx.get(i) for i in sorted(ids)}
for l in D['locs']: want['loc:' + l['id']] = idx.get('space-platform-foundation' if l['id'] == 'space-platform' else l['id'])
GROUP = {'combat': 'base/item-group/military.png', 'space': 'space-age/item-group/space.png', 'all': 'core/item-group/unsorted.png'}
for g in {v['g'] for v in D['items'].values()} | {'all'}:
    p = GROUP.get(g) or f'base/item-group/{g}.png'
    for cand in (p, f'core/item-group/{g}.png'):
        if os.path.exists(os.path.join(root, cand)): want['g:' + g] = os.path.join(root, cand); break
    else: want['g:' + g] = None
have = {k: v for k, v in want.items() if v}
cols = 24; rows = -(-len(have) // cols); sheet = Image.new('RGBA', (cols * 64, rows * 64), (0, 0, 0, 0)); pos = {}
for n, (k, path) in enumerate(have.items()):
    im = Image.open(path).convert('RGBA').resize((64, 64)); x, y = (n % cols) * 64, (n // cols) * 64; sheet.paste(im, (x, y))
    px = [p for p in im.getdata() if p[3] > 128]; c = [sum(p[i] for p in px) // max(len(px), 1) for i in range(3)] if px else [136, 136, 136]
    pos[k] = [x, y, '#%02x%02x%02x' % tuple(c)]
sheet.save(os.path.join(DATA, 'icons.webp'), lossless=True, method=6)
open(os.path.join(DATA, 'icons.js'), 'w').write('const ICON=' + json.dumps({'sheet': [cols * 64, rows * 64], 'pos': pos}) + ';')
print(f'icons.webp: {len(have)} icons, {os.path.getsize(os.path.join(DATA, "icons.webp")) // 1024} KB; missing: {[k for k, v in want.items() if not v]}')
