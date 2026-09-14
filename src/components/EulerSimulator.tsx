import { useContext, useEffect, useMemo, useState } from "react";
import { Undo, Terminal, Route } from "lucide-react";
import { VizChapterContext, emitVizDemo, useVizRuntime, vizArray, vizNumber, vizRecord } from "../data/vizStepBus";

const C1_NODES = [
  { id: 0, label: "A", x: 190, y: 60 },
  { id: 1, label: "B", x: 280, y: 140 },
  { id: 2, label: "C", x: 100, y: 140 },
  { id: 3, label: "D", x: 280, y: 250 },
  { id: 4, label: "E", x: 100, y: 250 }
];

const C1_EDGES = [
  { u: 0, v: 1 }, { u: 0, v: 2 },
  { u: 1, v: 3 }, { u: 2, v: 4 },
  { u: 1, v: 2 },
  { u: 3, v: 4 }
];

const ekey = (a: number, b: number) => `${Math.min(a, b)}-${Math.max(a, b)}`;
const DEG = C1_NODES.map((n) => C1_EDGES.filter((e) => e.u === n.id || e.v === n.id).length);
const ODD = C1_NODES.map((n) => n.id).filter((id) => DEG[id] % 2 === 1);

/**
 * Билет 13 — «Графы. Эйлеров цикл».
 *
 * Две части:
 *  1. игра «пройди все рёбра» кликами (Эйлер не прощает повторных рёбер);
 *  2. критерий: степени вершин и число нечётных (0 → цикл, 2 → путь, иначе нет).
 *
 * Синхронизация с Python-компилятором (PAGE_SYNC["euler-path-vs-cycle"]):
 *  path — маршрут (массив вершин) рисуется поверх графа, used — какие рёбра
 *  пройдены, deg/odd — степени и нечётные вершины, last/v — где мы сейчас,
 *  step — номер шага.
 */
export function EulerSimulator() {
  const chapterId = useContext(VizChapterContext);
  const runtime = useVizRuntime();
  const vars = runtime?.variables;

  const [c1Path, setC1Path] = useState<number[]>([]);
  const [c1VisitedEdges, setC1VisitedEdges] = useState<string[]>([]);
  const [c1Msg, setC1Msg] = useState("Кликни на вершину, чтобы начать обход.");
  const [c1Done, setC1Done] = useState(false);

  useEffect(() => {
    if (chapterId) emitVizDemo(chapterId, "walk");
  }, [chapterId]);

  const resetC1 = () => {
    setC1Path([]); setC1VisitedEdges([]); setC1Msg("Кликни на вершину, чтобы начать обход."); setC1Done(false);
  };

  const clickC1 = (vId: number) => {
    if (c1Done && c1Path.length > 0) return;
    if (c1Path.length === 0) {
      setC1Path([vId]);
      setC1Msg("Старт! Кликай соседние вершины, чтобы пройти по рёбрам.");
      return;
    }
    const last = c1Path[c1Path.length - 1];
    const edge = C1_EDGES.find(e => (e.u === last && e.v === vId) || (e.u === vId && e.v === last));
    if (!edge) {
      setC1Msg("Нет ребра между этими вершинами! Выбери соседа.");
      return;
    }
    const key = ekey(last, vId);
    if (c1VisitedEdges.includes(key)) {
      setC1Msg("Это ребро уже пройдено! Эйлер не прощает повторных хождений. Сбрось!");
      setC1Done(true); return;
    }
    const nextEdges = [...c1VisitedEdges, key];
    const nextPath = [...c1Path, vId];
    setC1VisitedEdges(nextEdges);
    setC1Path(nextPath);

    if (nextEdges.length === C1_EDGES.length) {
      if (nextPath[0] === vId) {
        setC1Msg("🎉 ЭЙЛЕРОВ ЦИКЛ! Все рёбра пройдены, финиш = старт! Чётные степени рулят!");
      } else {
        setC1Msg(`🎉 ЭЙЛЕРОВ ПУТЬ! Все рёбра пройдены! Старт (${C1_NODES[nextPath[0]].label}) ≠ Финиш (${C1_NODES[vId].label}) — это путь, не цикл.`);
      }
      setC1Done(true);
    } else {
      setC1Msg(`Пройдено рёбер: ${nextEdges.length} / ${C1_EDGES.length}`);
    }
  };

  /* ── что говорит компилятор ── */
  const live = useMemo(() => {
    if (!vars) return null;
    const rawPath = vizArray(vars.path) ?? vizArray(vars.route) ?? vizArray(vars.cycle);
    const path = (rawPath ?? [])
      .map((x) => (typeof x === "number" ? x : vizNumber(x)))
      .filter((x): x is number => x !== null && Number.isInteger(x) && x >= 0 && x < C1_NODES.length);
    const usedRaw = vizArray(vars.used) ?? vizArray(vars.visited);
    const usedFlags = (usedRaw ?? []).map((x) => Boolean(typeof x === "boolean" ? x : vizNumber(x)));
    const degRec = vizRecord(vars.deg) ?? vizRecord(vars.degree);
    const deg = degRec
      ? C1_NODES.map((n) => {
          const val = degRec[String(n.id)] ?? degRec[n.label];
          const num = typeof val === "number" ? val : vizNumber(val);
          return num ?? DEG[n.id];
        })
      : null;
    const oddRaw = vizArray(vars.odd);
    const odd = oddRaw ? oddRaw.map((x) => (typeof x === "number" ? x : vizNumber(x))).filter((x): x is number => x !== null) : null;
    const last = vizNumber(vars.last) ?? vizNumber(vars.v);
    const step = vizNumber(vars.step) ?? vizNumber(vars.i);
    if (path.length === 0 && usedFlags.length === 0 && !deg && last === null) return null;
    // рёбра маршрута: пары соседних вершин
    const keys: string[] = [];
    for (let i = 0; i + 1 < path.length; i++) keys.push(ekey(path[i], path[i + 1]));
    usedFlags.forEach((f, i) => {
      if (f && C1_EDGES[i]) keys.push(ekey(C1_EDGES[i].u, C1_EDGES[i].v));
    });
    return {
      path,
      keys: Array.from(new Set(keys)),
      deg,
      odd,
      last: last !== null && last >= 0 && last < C1_NODES.length ? last : path.length ? path[path.length - 1] : null,
      step,
      complete: keys.length >= C1_EDGES.length,
    };
  }, [vars]);

  const path = live && live.path.length ? live.path : c1Path;
  const visitedKeys = live ? live.keys : c1VisitedEdges;
  const deg = live?.deg ?? DEG;
  const odd = live?.odd ?? ODD;
  const lastId = live ? live.last : path.length ? path[path.length - 1] : null;
  const done = live ? live.complete : c1Done && visitedKeys.length === C1_EDGES.length;
  const msg = live
    ? live.complete
      ? `🎉 Компилятор прошёл все ${C1_EDGES.length} рёбер: маршрут ${live.path.map((id) => C1_NODES[id].label).join(" → ")}. Нечётных вершин ${odd.length} → это ${odd.length === 0 ? "цикл (старт = финиш)" : "путь (старт ≠ финиш)"}.`
      : `Маршрут из кода: ${live.path.length ? live.path.map((id) => C1_NODES[id].label).join(" → ") : "пусто"} · пройдено рёбер ${live.keys.length}/${C1_EDGES.length}`
    : c1Msg;

  const verdict =
    odd.length === 0
      ? { text: "0 нечётных → ЭЙЛЕРОВ ЦИКЛ есть (старт в любой вершине)", cls: "bg-emerald-950/40 border-emerald-500/30 text-emerald-300" }
      : odd.length === 2
      ? { text: `2 нечётные (${odd.map((id) => C1_NODES[id].label).join(" и ")}) → есть только ЭЙЛЕРОВ ПУТЬ: старт в одной нечётной, финиш в другой`, cls: "bg-amber-950/40 border-amber-500/30 text-amber-200" }
      : { text: `${odd.length} нечётных → эйлерова маршрута нет`, cls: "bg-rose-950/40 border-rose-500/30 text-rose-300" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h4 className="text-base font-bold text-white flex items-center gap-2"><Route className="w-4 h-4 text-indigo-400" /> Эйлер: пройди все рёбра ровно по одному разу</h4>
        <button onClick={resetC1} className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 transition-all">
          <Undo className="h-3.5 w-3.5" /> Сброс
        </button>
      </div>

      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex items-center justify-center relative min-h-[280px] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
        <svg className="w-full h-[260px] z-10 relative" viewBox="0 0 380 310">
          {C1_EDGES.map((e, i) => {
            const u = C1_NODES.find(n => n.id === e.u)!;
            const v = C1_NODES.find(n => n.id === e.v)!;
            const key = ekey(e.u, e.v);
            const used = visitedKeys.includes(key);
            // номер этого ребра в маршруте — подписываем порядок прохождения
            const order = path.length > 1 ? (() => {
              for (let s = 0; s + 1 < path.length; s++) if (ekey(path[s], path[s + 1]) === key) return s + 1;
              return null;
            })() : null;
            const isLastEdge = order !== null && order === path.length - 1;
            return <g key={i}>
              <line x1={u.x} y1={u.y} x2={v.x} y2={v.y}
                stroke={isLastEdge ? "#a5b4fc" : used ? "#6366f1" : "#475569"}
                strokeWidth={isLastEdge ? 5 : used ? 4 : 2}
                className="transition-all duration-300" />
              {order !== null && (
                <text x={(u.x + v.x) / 2} y={(u.y + v.y) / 2 - 4} textAnchor="middle" fill="#c7d2fe" fontSize="9" fontWeight="bold">{order}</text>
              )}
            </g>;
          })}
          {C1_NODES.map(n => {
            const isLast = lastId === n.id;
            const visited = path.includes(n.id);
            const isOdd = odd.includes(n.id);
            return <g key={n.id} className="cursor-pointer" onClick={() => clickC1(n.id)}>
              {isLast && <circle cx={n.x} cy={n.y} r={17} fill="none" stroke="#6366f1" strokeWidth={2} className="animate-pulse" />}
              <circle cx={n.x} cy={n.y} r={11}
                fill={isLast ? "#6366f1" : visited ? "#1e293b" : "#0f172a"}
                stroke={isLast ? "#fff" : visited ? "#6366f1" : isOdd ? "#f59e0b" : "#475569"}
                strokeWidth={2.5}
                className="transition-all duration-200 hover:scale-110" />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold" className="pointer-events-none">{n.label}</text>
              <text x={n.x} y={n.y - 16} textAnchor="middle" fill={isOdd ? "#fbbf24" : "#64748b"} fontSize="8" className="pointer-events-none">deg {deg[n.id]}{isOdd ? " · нечёт" : ""}</text>
            </g>;
          })}
        </svg>
        <div className="absolute top-2 left-2 bg-slate-900/90 border border-slate-700/60 px-2 py-1 rounded-md text-[10px] text-slate-300">
          Ребёр: {visitedKeys.length}/{C1_EDGES.length}
        </div>
      </div>

      <div className={`p-3 rounded-xl border text-sm ${
        done && visitedKeys.length === C1_EDGES.length
          ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
          : c1Done && !live
          ? "bg-rose-950/40 border-rose-500/30 text-rose-300"
          : "bg-slate-900/50 border-slate-700 text-slate-300"
      }`}>
        {msg}
      </div>

      {/* Критерий Эйлера */}
      <div className={`p-3 rounded-xl border text-xs font-bold ${verdict.cls}`}>
        Критерий Эйлера (для связного графа): {verdict.text}
        <span className="block font-normal opacity-80 mt-1">
          Степени: {C1_NODES.map((n) => `${n.label}=${deg[n.id]}`).join(", ")}. Эйлеров цикл существует ⇔ все степени чётны; путь ⇔ ровно две нечётны. Алгоритм Иера строит маршрут за O(V + E).
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> из компилятора:</span>
        {live ? (
          <>
            <span className="text-[11px] font-mono bg-slate-950 border border-indigo-700/40 text-indigo-300 rounded-md px-2 py-1">path = [{live.path.map((id) => C1_NODES[id].label).join(", ")}]</span>
            <span className="text-[11px] font-mono bg-slate-950 border border-indigo-700/40 text-indigo-300 rounded-md px-2 py-1">рёбер пройдено: {live.keys.length}/{C1_EDGES.length}</span>
            <span className="text-[11px] font-mono bg-slate-950 border border-amber-700/40 text-amber-300 rounded-md px-2 py-1">нечётных: {odd.length}</span>
            {live.step !== null && <span className="text-[11px] font-mono bg-slate-950 border border-slate-700 text-slate-300 rounded-md px-2 py-1">step = {live.step}</span>}
          </>
        ) : (
          <span className="text-[11px] text-slate-500">
            открой панель Python и запусти код: массив <code className="font-mono text-indigo-300">path</code> нарисует маршрут прямо на этом графе, а <code className="font-mono text-indigo-300">deg</code>/<code className="font-mono text-indigo-300">odd</code> пересчитают критерий
          </span>
        )}
      </div>
    </div>
  );
}
