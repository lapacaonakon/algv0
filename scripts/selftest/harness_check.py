#!/usr/bin/env python3
"""Прогон всех шаблонов PAGE_SYNC через настоящий харнесс дебаггера.

Ищем РЕАЛЬНЫЕ баги компилятора: ошибки исполнения, обрыв по лимиту шагов
(DEBUG_STEP_CAP), пустые трассы. Запуск (из корня репо):

  npx esbuild scripts/selftest/harness-entry.ts --bundle --platform=node \\
      --format=cjs --outfile=/tmp/harness.cjs --log-level=error
  npx esbuild scripts/selftest/harness-dump.ts --bundle --platform=node \\
      --format=cjs --outfile=/tmp/runner-dump.cjs --log-level=error
  node /tmp/runner-dump.cjs && python3 scripts/selftest/harness_check.py
"""
import json, subprocess as sp, re, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def sh(cmd):
    r = sp.run(cmd, cwd=ROOT, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr)
        sys.exit(1)

sh(['npx', 'esbuild', 'scripts/selftest/harness-dump.ts', '--bundle', '--platform=node',
    '--format=cjs', '--outfile=/tmp/runner-dump.cjs', '--log-level=error'])
sp.run(['node', '/tmp/runner-dump.cjs'], check=True, capture_output=True)
sh(['npx', 'esbuild', 'scripts/selftest/harness-entry.ts', '--bundle', '--platform=node',
    '--format=cjs', '--outfile=/tmp/harness.cjs', '--log-level=error'])
r = sp.run(['node', '-e', '''
const { buildDebugRunner } = require("/tmp/harness.cjs");
const entries = require("/tmp/pysync-harness.json").entries;
const fs = require("fs");
const out = {};
for (const [id, code] of Object.entries(entries)) out[id] = buildDebugRunner(code);
fs.writeFileSync("/tmp/harnesses.json", JSON.stringify(out));
'''], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr); sys.exit(1)

entries = json.load(open('/tmp/pysync-harness.json'))['entries']
harnesses = json.load(open('/tmp/harnesses.json'))
cap = json.load(open('/tmp/pysync-harness.json'))['cap']

def cut_init(code):
    keep = []
    for line in code.split('\n'):
        t = line.strip()
        if t == '# --- тело алгоритма ---' or re.match(r'^(for|while|def|class|if\s|elif\s|else|try|except|print\()', t):
            break
        keep.append(line)
    while keep and keep[-1].strip() == '':
        keep.pop()
    return '\n'.join(keep)

def run(harness):
    h = harness.rstrip()
    assert h.endswith('__OUT')
    open('/tmp/h2.py', 'w').write(h[:-len('__OUT')] + 'print(__OUT, file=__sys.stderr)')
    r = sp.run(['python3', '/tmp/h2.py'], capture_output=True, text=True, timeout=300)
    last = r.stderr.strip().splitlines()[-1] if r.stderr.strip() else ''
    try:
        return json.loads(last)
    except Exception:
        return {"error": f"no json rc={r.returncode} {r.stderr[-150:]!r}", "steps": [], "truncated": False}

fails = 0
for rid, harness in harnesses.items():
    variants = [('FULL', harness)]
    r = sp.run(['node', '-e', f'''
const {{ buildDebugRunner }} = require("/tmp/harness.cjs");
require("fs").writeFileSync("/tmp/h1.json", JSON.stringify(buildDebugRunner({json.dumps(cut_init(entries[rid]))})));
'''], capture_output=True, text=True)
    variants.append(('INIT', json.load(open('/tmp/h1.json'))))
    for label, h in variants:
        res = run(h)
        if res['error']:
            print(f"RUN ERROR {rid}/{label}: {res['error'].strip().splitlines()[-1]}"); fails += 1
        elif res['truncated']:
            print(f"TRUNCATED {rid}/{label} (>{cap} шагов — уменьшите демо или поднимите кап)"); fails += 1
        elif label == 'FULL' and len(res['steps']) < 2:
            print(f"NO STEPS {rid}"); fails += 1

print("HARNESS: ALL OK" if fails == 0 else f"HARNESS FAILS: {fails}")
sys.exit(1 if fails else 0)
