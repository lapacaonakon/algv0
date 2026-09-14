// Самотест lazy-вкладки дерева отрезков: пять массовых обновлений.
// Корень после обновления и query(ul,ur) = base(ul,ur) + add·длина.
import { genLazySteps, buildTreeFull } from "../../src/components/SegmentTreeVisualizer";

const base = [5, 8, 3, 12, 7, 2];
const sum = (l: number, r: number) => base.slice(l, r + 1).reduce((a, b) => a + b, 0);

const cases: [number, number, number][] = [
  [1, 3, 10], [0, 5, 1], [2, 2, 7], [0, 5, 100], [4, 5, -3],
];

// query по дереву с обещаниями: pending накапливается при спуске
function q(step: { treeState: Record<number, number>; lazyState: Record<number, number> },
           v: number, l: number, r: number, ql: number, qr: number, pending: number): number {
  if (qr < l || r < ql) return 0;
  // Собственный lazy[v] уже учтён в tree[v] (обещание детям); в ответ вершины
  // добавляем только накопленные обещания предков (pending).
  if (ql <= l && r <= qr) return (step.treeState[v] ?? 0) + pending * (r - l + 1);
  const m = (l + r) >> 1;
  const d = pending + (step.lazyState[v] ?? 0);
  return q(step, 2 * v, l, m, ql, qr, d) + q(step, 2 * v + 1, m + 1, r, ql, qr, d);
}

let fails = 0;
for (const [uL, uR, add] of cases) {
  const steps = genLazySteps(base, uL, uR, add);
  const last = steps[steps.length - 1];
  const wantRoot = sum(0, 5) + add * (uR - uL + 1);
  const wantQ = sum(uL, uR) + add * (uR - uL + 1);
  const gotRoot = last.treeState[1];
  const gotQ = q(last, 1, 0, 5, uL, uR, 0);
  const okR = gotRoot === wantRoot, okQ = gotQ === wantQ;
  console.log(`(ul,ur,add)=(${uL},${uR},${add}) root=${gotRoot}/${wantRoot} ${okR ? "OK" : "FAIL"} | query=${gotQ}/${wantQ} ${okQ ? "OK" : "FAIL"} | шагов=${steps.length}`);
  if (!okR || !okQ) fails++;
}
// query без обновлений = обычная сумма
const q0 = q({ treeState: buildTreeFull(base), lazyState: {} }, 1, 0, 5, 1, 3, 0);
console.log("query(1,3) без обновлений =", q0, q0 === 23 ? "OK" : "FAIL");
if (q0 !== 23) fails++;
console.log(fails === 0 ? "LAZY SELFTEST: ALL OK" : `LAZY SELFTEST: ${fails} FAILS`);
process.exit(fails === 0 ? 0 : 1);
