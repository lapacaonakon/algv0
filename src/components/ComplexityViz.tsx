import React, { useContext, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, GitMerge, ShieldCheck, TrendingUp, Boxes, Terminal } from "lucide-react";
import { VizChapterContext, emitVizDemo, useVizRuntime, vizArray, vizNumber, vizString } from "../data/vizStepBus";

/**
 * Билет 24 — «Классы сложности, сведение задач».
 *
 * Четыре вкладки:
 *  1. «Иерархия»   — P ⊆ NP ⊆ PSPACE ⊆ EXP и NP-полные на пересечении;
 *  2. «Сведение»   — A ≤p B по шагам: преобразовал вход → решил B → перевёл ответ;
 *  3. «Верификатор»— проверка сертификата для 3-SAT по дизъюнктам (NP «на пальцах»);
 *  4. «Рост»       — живой график по переменным n и ops из кода пользователя:
 *                    сколько операций насчитал твой алгоритм и на какой класс
 *                    похоже (полином или экспонента).
 *
 * Синхронизация с компилятором (PAGE_SYNC["complexity-classes"]):
 *  cls — имя класса (подсветит нужный овал), step/i — кадр сведения,
 *  k — номер проверяемого дизъюнкта, cert/assign — сертификат,
 *  n и ops — точки на графике роста, ok/ans — вердикт верификатора.
 */

type Tab = "hierarchy" | "reduce" | "verify" | "growth";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "hierarchy", label: "1 · Иерархия классов", icon: <Boxes className="w-3.5 h-3.5" /> },
  { id: "reduce", label: "2 · Сведение A ≤p B", icon: <GitMerge className="w-3.5 h-3.5" /> },
  { id: "verify", label: "3 · Верификатор (NP)", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  { id: "growth", label: "4 · Рост по n и ops", icon: <TrendingUp className="w-3.5 h-3.5" /> },
];

/* ------------------------------- Иерархия ------------------------------- */

const CLASSES = [
  { id: "EXP", label: "EXP", sub: "2^(n^k)", color: "#0ea5e9", x: 250, y: 190, rx: 232, ry: 172, tasks: ["обобщённые шахматы n × n", "QBF (кванторные формулы)"] },
  { id: "PSPACE", label: "PSPACE", sub: "полиномиальная память", color: "#a855f7", x: 250, y: 196, rx: 186, ry: 132, tasks: ["QBF", "игры с полной информацией"] },
  { id: "NP", label: "NP", sub: "сертификат проверяется за полином", color: "#f43f5e", x: 250, y: 208, rx: 140, ry: 92, tasks: ["SAT / 3-SAT", "гамильтонов цикл", "раскраска в 3 цвета", "клика / вершинное покрытие"] },
  { id: "P", label: "P", sub: "решается за O(n^k)", color: "#10b981", x: 250, y: 232, rx: 86, ry: 50, tasks: ["сортировка", "Дейкстра, Флойд", "MST", "2-SAT, двудольность"] },
];

const NPHARD_NOTE = "NP-трудные — всё, к чему сводится любая задача из NP. Пересечение «NP-трудное ∩ NP» = NP-полные: SAT, 3-SAT, клика, гамильтонов цикл. Проблема остановки NP-трудна, но в NP не лежит.";

/* ------------------------------- Сведение ------------------------------- */

const REDUCE_STEPS = [
  { title: "Дано: задача A, для которой быстрого алгоритма нет", note: "Например, 3-SAT. Мы хотим доказать, что задача B (КЛИКА) не проще — то есть B NP-трудная.", boxes: ["A"], active: 0 },
  { title: "Берём вход x задачи A", note: "x — конкретный экземпляр: формула из k дизъюнктов по 3 литерала. Размер |x| = n.", boxes: ["A", "x"], active: 1 },
  { title: "Строим f(x) = y за полиномиальное время", note: "По формуле строим граф: вершина = (номер дизъюнкта, литерал); ребро между вершинами из разных дизъюнктов, если литералы не противоречат друг другу. Это и есть сведение A ≤p B.", boxes: ["A", "x", "f", "y"], active: 2 },
  { title: "Решаем B на входе y", note: "Гипотетический быстрый решатель КЛИКИ отвечает: есть ли клика размера k. Мы его не умеем строить — но допустим, что он есть.", boxes: ["A", "x", "f", "y", "B"], active: 4 },
  { title: "Переводим ответ обратно: A(x) = B(f(x))", note: "Клика размера k существует ⇔ из каждого дизъюнкта выбран совместимый литерал ⇔ формула выполнима. Полиномиальное время сохранилось — значит A решается через B.", boxes: ["A", "x", "f", "y", "B", "ans"], active: 5 },
  { title: "Вывод: B не проще A", note: "Раз A ≤p B и A NP-полна, то B NP-трудна. Если ещё и B ∈ NP (сертификат проверяется быстро) — B NP-полна.", boxes: ["A", "x", "f", "y", "B", "ans"], active: 6 },
];

const BOX_LABEL: Record<string, { t: string; c: string }> = {
  A: { t: "задача A\n(NP-полная)", c: "#f43f5e" },
  x: { t: "вход x\n|x| = n", c: "#64748b" },
  f: { t: "f: сведение\nO(poly(n))", c: "#f59e0b" },
  y: { t: "вход y\n|y| = poly(n)", c: "#64748b" },
  B: { t: "решатель B\n(гипотеза: быстрый)", c: "#6366f1" },
  ans: { t: "ответ\nA(x) = B(f(x))", c: "#10b981" },
};

/* ------------------------------ Верификатор ----------------------------- */

/** 3-SAT формула: 4 дизъюнкта по 3 литерала, переменные x1..x4. */
const CLAUSES: [number, number, number][] = [
  [1, 2, -3],
  [-1, 3, 4],
  [2, -3, -4],
  [-2, 1, 3],
];
/** Сертификат, который проверяем: x = (1, 0, 1, 0) — он удовлетворяет всем четырём дизъюнктам. */
const CERT = [1, 0, 1, 0];

const VERIFY_STEPS = CLAUSES.map((cl, i) => ({
  title: `Дизъюнкт ${i + 1}: (${cl.map((l) => (l > 0 ? `x${l}` : `¬x${-l}`)).join(" ∨ ")})`,
  note: `Подставляем сертификат x = (${CERT.join(", ")}): ${cl
    .map((l) => (l > 0 ? `x${l}=${CERT[l - 1]}` : `¬x${-l}=${1 - CERT[-l - 1]}`))
    .join(", ")}. ${cl.some((l) => (l > 0 ? CERT[l - 1] === 1 : CERT[-l - 1] === 0)) ? "Хотя бы один литерал истинен — дизъюнкт ВЫПОЛНЕН." : "Все литералы ложны — дизъюнкт НЕ выполнен."}`,
  ok: cl.some((l) => (l > 0 ? CERT[l - 1] === 1 : CERT[-l - 1] === 0)),
}));

/* -------------------------------- Рост ---------------------------------- */

interface Sample { n: number; ops: number }

const GROWTH_LINES = [
  { id: "n", label: "n", fn: (n: number) => n, color: "#10b981" },
  { id: "n log n", label: "n·log₂ n", fn: (n: number) => n * Math.log2(Math.max(2, n)), color: "#06b6d4" },
  { id: "n2", label: "n²", fn: (n: number) => n * n, color: "#f59e0b" },
  { id: "n3", label: "n³", fn: (n: number) => n * n * n, color: "#fb923c" },
  { id: "2n", label: "2ⁿ", fn: (n: number) => Math.pow(2, n), color: "#f43f5e" },
];

export const ComplexityViz: React.FC = () => {
  const chapterId = useContext(VizChapterContext);
  const runtime = useVizRuntime();
  const vars = runtime?.variables;
  const [tab, setTab] = useState<Tab>("hierarchy");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [samples, setSamples] = useState<Sample[]>([]);

  useEffect(() => {
    if (chapterId) emitVizDemo(chapterId, tab);
  }, [chapterId, tab]);

  const maxStep = tab === "reduce" ? REDUCE_STEPS.length - 1 : VERIFY_STEPS.length; // у verify есть финальный кадр
  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [tab]);

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      setStep((s) => {
        if (s >= maxStep) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1400);
    return () => window.clearInterval(t);
  }, [playing, maxStep]);

  /* живые переменные компилятора */
  const liveStep = vars ? (vizNumber(vars.step) ?? vizNumber(vars.i)) : null;
  useEffect(() => {
    if (liveStep === null || !Number.isFinite(liveStep)) return;
    setStep(Math.max(0, Math.min(maxStep, liveStep)));
  }, [liveStep, maxStep]);

  const liveCls = vars ? vizString(vars.cls) : null;
  const liveK = vars ? vizNumber(vars.k) : null;
  const liveCert = vars ? vizArray(vars.cert) ?? vizArray(vars.assign) : null;
  const liveOk = vars ? (vars.ok === undefined ? null : Boolean(vars.ok)) : null;
  const liveN = vars ? vizNumber(vars.n) : null;
  const liveOps = vars ? (vizNumber(vars.ops) ?? vizNumber(vars.steps) ?? vizNumber(vars.cnt)) : null;

  /** Копим точки (n, ops): код пользователя крутит цикл по n — график растёт сам. */
  useEffect(() => {
    if (liveN === null || liveOps === null) return;
    if (!Number.isFinite(liveN) || !Number.isFinite(liveOps) || liveN < 1) return;
    setSamples((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.n === liveN && last.ops === liveOps) return prev;
      const withoutN = prev.filter((s) => s.n !== liveN);
      return [...withoutN, { n: liveN, ops: liveOps }].sort((a, b) => a.n - b.n).slice(-60);
    });
  }, [liveN, liveOps]);

  /** Оценка показателя роста по последним точкам (лог-лог наклон). */
  const verdict = useMemo(() => {
    const pts = samples.filter((s) => s.ops > 0 && s.n > 0);
    if (pts.length < 3) return null;
    const xs = pts.map((p) => Math.log(p.n));
    const ys = pts.map((p) => Math.log(p.ops));
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
    const my = ys.reduce((a, b) => a + b, 0) / ys.length;
    let num = 0;
    let den = 0;
    for (let i = 0; i < xs.length; i++) {
      num += (xs[i] - mx) * (ys[i] - my);
      den += (xs[i] - mx) ** 2;
    }
    const slope = den === 0 ? 0 : num / den;
    // экспонента на лог-лог растёт неограниченно: сравниваем наклон на halves
    const half = Math.floor(pts.length / 2);
    const slopeTail = (() => {
      const q = pts.slice(half);
      if (q.length < 2) return slope;
      const lx = q.map((p) => Math.log(p.n));
      const ly = q.map((p) => Math.log(p.ops));
      const ax = lx.reduce((a, b) => a + b, 0) / lx.length;
      const ay = ly.reduce((a, b) => a + b, 0) / ly.length;
      let nn = 0;
      let dd = 0;
      for (let i = 0; i < lx.length; i++) {
        nn += (lx[i] - ax) * (ly[i] - ay);
        dd += (lx[i] - ax) ** 2;
      }
      return dd === 0 ? slope : nn / dd;
    })();
    const cls =
      slopeTail > slope + 0.8 || slopeTail > 4.5
        ? { name: "экспонента / суперполином", color: "#f43f5e", hint: "наклон лог-лог растёт — так выглядит полный перебор NP-полной задачи" }
        : slope <= 1.25
        ? { name: "≈ линейный, O(n)", color: "#10b981", hint: "класс P: один проход по входу" }
        : slope <= 1.8
        ? { name: "≈ O(n log n)", color: "#06b6d4", hint: "класс P: сортировки и кучи" }
        : slope <= 2.4
        ? { name: "≈ квадратичный, O(n²)", color: "#f59e0b", hint: "класс P: вложенные циклы (Флойд, наивная Дейкстра)" }
        : slope <= 3.4
        ? { name: "≈ кубический, O(n³)", color: "#fb923c", hint: "класс P: Флойд—Уоршелл" }
        : { name: "полином высокой степени", color: "#f59e0b", hint: "всё ещё P, но на практике уже тяжело" };
    return { slope, slopeTail, ...cls };
  }, [samples]);

  const reduceFrame = REDUCE_STEPS[Math.min(step, REDUCE_STEPS.length - 1)];
  const verifyIdx = Math.min(step, VERIFY_STEPS.length);
  const verifyDone = verifyIdx >= VERIFY_STEPS.length;
  const allOk = VERIFY_STEPS.every((s) => s.ok);

  return (
    <div className="bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-700 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-600/20">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Классы сложности и сведения</h3>
            <p className="text-xs text-purple-300">P · NP · NP-полные · PSPACE · EXP — и как это проверяют</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={"flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-colors " + (tab === t.id ? "bg-purple-600 text-white" : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-700")}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {(tab === "reduce" || tab === "verify") && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button onClick={() => { setStep(0); setPlaying(false); }} className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"><RotateCcw className="w-4 h-4" /></button>
          <button onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }} disabled={step === 0} className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => setPlaying((p) => !p)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-500">
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} {playing ? "Пауза" : "Запустить"}
          </button>
          <button onClick={() => { setPlaying(false); setStep((s) => Math.min(maxStep, s + 1)); }} disabled={step >= maxStep} className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
          <span className="text-[11px] text-slate-500 ml-1">кадр {step + 1} / {maxStep + 1}</span>
        </div>
      )}

      {/* ─────────────────────────── ИЕРАРХИЯ ─────────────────────────── */}
      {tab === "hierarchy" && (
        <div className="space-y-4">
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
            <svg viewBox="0 0 500 380" className="w-full h-auto" style={{ maxHeight: 400 }}>
              {CLASSES.map((c) => {
                const on = liveCls ? liveCls.toUpperCase().includes(c.id) : false;
                return (
                  <g key={c.id}>
                    <ellipse cx={c.x} cy={c.y} rx={c.rx} ry={c.ry} fill={c.color} opacity={on ? 0.32 : 0.13} stroke={c.color} strokeWidth={on ? 3 : 1.5} strokeDasharray={on ? undefined : "5 4"} className="transition-all duration-300" />
                    <text x={c.x} y={c.y - c.ry + 18} textAnchor="middle" fill={c.color} fontSize="13" fontWeight="bold">{c.label}</text>
                    <text x={c.x} y={c.y - c.ry + 32} textAnchor="middle" fill="#94a3b8" fontSize="8">{c.sub}</text>
                  </g>
                );
              })}
              {/* примеры задач — внутри своих овалов */}
              {CLASSES.map((c) =>
                c.tasks.map((t, i) => (
                  <text key={t} x={c.x} y={c.y + (c.id === "P" ? -18 : c.id === "NP" ? -40 : c.id === "PSPACE" ? -74 : -118) + i * 13} textAnchor="middle" fill="#e2e8f0" fontSize="8.5" opacity={0.9}>
                    · {t}
                  </text>
                ))
              )}
              {/* NP-полные = пересечение */}
              <text x={250} y={352} textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="bold">NP-полные = NP-трудные ∩ NP</text>
              <text x={250} y={368} textAnchor="middle" fill="#64748b" fontSize="9">P ⊆ NP ⊆ PSPACE ⊆ EXP, причём P ⊊ EXP (теорема об иерархии времени)</text>
            </svg>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 border border-slate-700 rounded-xl p-3.5">{NPHARD_NOTE}</p>
          <p className="text-[11px] text-slate-500">
            Подсказка: выполни в компиляторе <code className="font-mono text-purple-300">cls = "NP"</code> — нужный овал подсветится.
          </p>
        </div>
      )}

      {/* ─────────────────────────── СВЕДЕНИЕ ─────────────────────────── */}
      {tab === "reduce" && (
        <div className="space-y-3">
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {reduceFrame.boxes.map((b, i) => {
                const meta = BOX_LABEL[b];
                const active = i === reduceFrame.active || reduceFrame.active === 6;
                return (
                  <React.Fragment key={b + i}>
                    <div
                      className="rounded-lg border px-3 py-2 text-center transition-all duration-300 whitespace-pre-line"
                      style={{
                        borderColor: active ? meta.c : "#334155",
                        background: active ? meta.c + "22" : "#0f172a",
                        opacity: active ? 1 : 0.45,
                        boxShadow: active ? `0 0 18px ${meta.c}44` : undefined,
                        minWidth: 96,
                      }}
                    >
                      <span className="text-[11px] font-bold leading-tight" style={{ color: active ? meta.c : "#94a3b8" }}>{meta.t}</span>
                    </div>
                    {i < reduceFrame.boxes.length - 1 && <span className="text-slate-600 text-lg">→</span>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-3.5">
            <p className="text-sm font-bold text-white mb-1 flex items-center gap-2">{runtime && vars && <Terminal className="w-3.5 h-3.5 text-purple-400" />}{reduceFrame.title}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{reduceFrame.note}</p>
          </div>
        </div>
      )}

      {/* ────────────────────────── ВЕРИФИКАТОР ───────────────────────── */}
      {tab === "verify" && (
        <div className="space-y-3">
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">3-SAT: формула и сертификат (переменные x1…x4)</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {CERT.map((v, i) => (
                <span key={i} className={"font-mono text-xs px-2.5 py-1.5 rounded-lg border " + (v === 1 ? "bg-emerald-950/50 border-emerald-600/50 text-emerald-300" : "bg-slate-900 border-slate-700 text-slate-400")}>
                  x{i + 1} = {liveCert && typeof liveCert[i] === "number" ? liveCert[i] : v}
                </span>
              ))}
              {liveCert && <span className="font-mono text-xs px-2.5 py-1.5 rounded-lg border border-purple-600/50 text-purple-300 bg-purple-950/40">cert из кода</span>}
            </div>
            <div className="space-y-2">
              {CLAUSES.map((cl, i) => {
                const checked = liveK !== null ? i < liveK : i < verifyIdx;
                const current = liveK !== null ? i === liveK : i === verifyIdx;
                const st = VERIFY_STEPS[i];
                return (
                  <div
                    key={i}
                    className={"flex items-center gap-3 rounded-lg border px-3 py-2 transition-all " + (current ? "border-amber-500/60 bg-amber-950/20" : checked ? (st.ok ? "border-emerald-600/40 bg-emerald-950/20" : "border-rose-600/40 bg-rose-950/20") : "border-slate-800 bg-slate-900/40")}
                  >
                    <span className="text-[10px] font-bold text-slate-500 w-4">{i + 1}</span>
                    <span className="font-mono text-xs text-slate-200 flex-1">{cl.map((l) => (l > 0 ? `x${l}` : `¬x${-l}`)).join(" ∨ ")}</span>
                    <span className="font-mono text-[10px] text-slate-500">{cl.map((l) => (l > 0 ? CERT[l - 1] : 1 - CERT[-l - 1])).join(" ")}</span>
                    <span className={"text-[11px] font-bold " + (checked ? (st.ok ? "text-emerald-400" : "text-rose-400") : "text-slate-600")}>
                      {checked ? (st.ok ? "✓ истинно" : "✗ ложно") : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
            {(verifyDone || liveOk !== null) && (
              <div className={"mt-3 rounded-lg border p-3 text-xs font-bold " + ((liveOk ?? allOk) ? "border-emerald-600/40 bg-emerald-950/30 text-emerald-300" : "border-rose-600/40 bg-rose-950/30 text-rose-300")}>
                {(liveOk ?? allOk) ? "Сертификат принят за O(n): вот почему задача в NP — проверить легко, найти сложно." : "Сертификат отвергнут: хотя бы один дизъюнкт ложен."}
              </div>
            )}
          </div>
          <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-3.5">
            <p className="text-sm font-bold text-white mb-1">{verifyDone ? "Проверка завершена" : VERIFY_STEPS[verifyIdx].title}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{verifyDone ? "Все 4 дизъюнкта проверены за линейное время — это и есть определение NP: короткий сертификат + быстрая проверка." : VERIFY_STEPS[verifyIdx].note}</p>
          </div>
        </div>
      )}

      {/* ──────────────────────────── РОСТ ───────────────────────────── */}
      {tab === "growth" && (
        <div className="space-y-3">
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">сейчас в коде:</span>
              <span className="font-mono text-xs bg-slate-900 border border-purple-700/40 text-purple-300 rounded-md px-2 py-1">n = {liveN ?? "—"}</span>
              <span className="font-mono text-xs bg-slate-900 border border-purple-700/40 text-purple-300 rounded-md px-2 py-1">ops = {liveOps ?? "—"}</span>
              <button onClick={() => setSamples([])} className="ml-auto text-[11px] text-slate-500 hover:text-white border border-slate-700 rounded-lg px-2 py-1">очистить график</button>
            </div>
            <svg viewBox="0 0 500 240" className="w-full h-auto">
              {/* оси в лог-лог */}
              <line x1={44} y1={200} x2={486} y2={200} stroke="#334155" strokeWidth={1} />
              <line x1={44} y1={14} x2={44} y2={200} stroke="#334155" strokeWidth={1} />
              <text x={265} y={222} textAnchor="middle" fill="#64748b" fontSize="9">n (лог)</text>
              <text x={16} y={110} fill="#64748b" fontSize="9" transform="rotate(-90 16 110)" textAnchor="middle">операций (лог)</text>
              {GROWTH_LINES.map((g) => {
                const pts: string[] = [];
                for (let i = 0; i <= 20; i++) {
                  const n = 1 + i * 0.8;
                  const v = g.fn(n);
                  const x = 44 + (Math.log(n) / Math.log(17)) * 442;
                  const y = 200 - (Math.log(Math.max(1, v)) / Math.log(1e5)) * 186;
                  pts.push(`${x.toFixed(1)},${Math.max(10, Math.min(200, y)).toFixed(1)}`);
                }
                return <polyline key={g.id} points={pts.join(" ")} fill="none" stroke={g.color} strokeWidth={1.2} strokeDasharray="4 4" opacity={0.55} />;
              })}
              {samples.map((s) => {
                const x = 44 + (Math.log(Math.max(1, s.n)) / Math.log(17)) * 442;
                const y = 200 - (Math.log(Math.max(1, s.ops)) / Math.log(1e5)) * 186;
                return <circle key={`${s.n}`} cx={Math.min(486, x)} cy={Math.max(10, Math.min(200, y))} r={3} fill="#fff" stroke="#a855f7" strokeWidth={2} />;
              })}
              {GROWTH_LINES.map((g, i) => (
                <g key={g.id + "l"}>
                  <rect x={330 + (i % 3) * 58} y={16 + Math.floor(i / 3) * 16} width={9} height={9} fill={g.color} opacity={0.7} rx={2} />
                  <text x={343 + (i % 3) * 58} y={24 + Math.floor(i / 3) * 16} fill="#94a3b8" fontSize="8.5">{g.label}</text>
                </g>
              ))}
            </svg>
            {samples.length === 0 && (
              <p className="text-xs text-slate-500 text-center -mt-2">
                Пусто. Запусти в компиляторе код с переменными <code className="font-mono text-purple-300">n</code> и <code className="font-mono text-purple-300">ops</code> — например, полный перебор 3-SAT — и график построится сам, по шагам трассировки.
              </p>
            )}
          </div>
          <div className={"rounded-xl border p-3.5 " + (verdict ? "border-purple-600/40 bg-purple-950/20" : "border-slate-700 bg-slate-900/60")}>
            <p className="text-sm font-bold text-white mb-1">
              {verdict ? `Похоже на ${verdict.name}` : "Ждём точки (n, ops) из кода"}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {verdict
                ? `Наклон в лог-лог координатах ≈ ${verdict.slope.toFixed(2)}${verdict.slopeTail > verdict.slope + 0.2 ? ` (в хвосте ${verdict.slopeTail.toFixed(2)} — кривая загибается вверх)` : ""}. ${verdict.hint}. Точек собрано: ${samples.length}.`
                : "Как только в коде появятся n и ops, сюда попадёт оценка: полином (наклон постоянен) или экспонента (наклон растёт вместе с n)."}
            </p>
          </div>
        </div>
      )}

      {/* живые переменные */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">из компилятора:</span>
        {vars ? (
          ["n", "ops", "cls", "k", "cert", "ok"].map((name) =>
            vars[name] === undefined ? null : (
              <span key={name} className="text-[11px] font-mono bg-slate-950 border border-purple-700/40 text-purple-300 rounded-md px-2 py-1">
                {name} = {JSON.stringify(vars[name]).slice(0, 40)}
              </span>
            )
          )
        ) : (
          <span className="text-[11px] text-slate-500">
            открой панель Python: переменные <code className="font-mono text-purple-300">cls</code>, <code className="font-mono text-purple-300">k</code>, <code className="font-mono text-purple-300">n</code>, <code className="font-mono text-purple-300">ops</code> управляют этой демонстрацией
          </span>
        )}
      </div>
    </div>
  );
};

export default ComplexityViz;
