import React, { useEffect, useMemo, useState } from "react";
import { Gauge, Pause, Play, RotateCcw } from "lucide-react";

/**
 * Разбор трёх случаев операции Splay: Zig, Zig-Zig, Zig-Zag.
 *
 * Что сделано ради понятности:
 *  • у узлов настоящие числа (20 / 40 / 60), а не абстрактные буквы —
 *    сразу видно, что дерево остаётся деревом поиска;
 *  • под деревом печатается обход слева направо: он ОДИНАКОВ на всех кадрах,
 *    это и есть доказательство, что поворот ничего не ломает;
 *  • кадр «прицел» ничего не двигает, только подсвечивает пару;
 *  • на кадре «результат» остаются призраки — пунктирные кружки на старых
 *    местах и стрелки «откуда → куда»;
 *  • по умолчанию анимация НЕ крутится сама: пользователь жмёт «Дальше» и
 *    идёт в своём темпе. Автопрокрутка включается кнопкой.
 */

type NodeId = "x" | "p" | "g" | "A" | "B" | "C" | "D";
type Pos = Partial<Record<NodeId, [number, number]>>;

interface Frame {
  pos: Pos;
  edges: [NodeId, NodeId][];
  kind: "start" | "aim" | "result";
  title: string;
  text: string;
  /** Пара, которую крутим на этом шаге: кадр-«прицел». */
  focus?: [NodeId, NodeId];
  /** Кто переехал на этом кадре — рисуем призрак и стрелку. */
  moved?: NodeId[];
  ms: number;
}

interface Case {
  key: "zig" | "zig-zig" | "zig-zag";
  label: string;
  when: string;
  rotations: string;
  /** Номера узлов: роль → число. */
  keys: Partial<Record<NodeId, number>>;
  /** Обход слева направо — одинаковый на всех кадрах. */
  inorder: string[];
  /** Что означают поддеревья A..D. */
  ranges: string;
  frames: Frame[];
}

const VB = { w: 360, h: 285 };
const AIM_MS = 2600;
const RESULT_MS = 3400;
const MOVE = "transform 1200ms cubic-bezier(.34,.01,.2,1), opacity 500ms ease";

/* ------------------------------- Zig ------------------------------- */
const ZIG_BEFORE = {
  pos: { p: [195, 50], x: [105, 130], C: [280, 130], A: [55, 212], B: [160, 212] },
  edges: [["p", "x"], ["p", "C"], ["x", "A"], ["x", "B"]],
} as unknown as Pick<Frame, "pos" | "edges">;

const ZIG: Case = {
  key: "zig",
  label: "Zig",
  when: "родитель x — уже корень, деда нет",
  rotations: "1 поворот",
  keys: { x: 20, p: 40 },
  inorder: ["A", "20", "B", "40", "C"],
  ranges: "A < 20 · B между 20 и 40 · C > 40",
  frames: [
    {
      ...ZIG_BEFORE,
      kind: "start",
      title: "Было: 20 висит под корнем 40",
      text: "Нам нужен ключ 20, а он на глубине 1. Дедушки нет — значит, хватит одного поворота.",
      ms: RESULT_MS,
    },
    {
      ...ZIG_BEFORE,
      kind: "aim",
      title: "Прицел: крутим ребро 40 — 20",
      text: "Ничего пока не двигается. Смотри на подсвеченное ребро: 20 поднимется на место 40, а 40 съедет вниз-вправо.",
      focus: ["p", "x"],
      ms: AIM_MS,
    },
    {
      pos: { x: [160, 50], A: [80, 130], p: [245, 130], B: [195, 212], C: [305, 212] },
      edges: [["x", "A"], ["x", "p"], ["p", "B"], ["p", "C"]],
      kind: "result",
      title: "Стало: 20 — корень",
      text: "40 стало правым сыном двадцатки. Поддерево B переехало от 20 к 40 — и правильно: его ключи между 20 и 40, а справа от 20 и слева от 40 — это одно и то же место.",
      moved: ["x", "p", "B"],
      ms: RESULT_MS,
    },
  ],
};

/* ----------------------------- Zig-Zig ----------------------------- */
const ZZ_S0 = {
  pos: { g: [255, 40], D: [325, 112], p: [160, 112], C: [235, 186], x: [80, 186], A: [32, 254], B: [122, 254] },
  edges: [["g", "p"], ["g", "D"], ["p", "x"], ["p", "C"], ["x", "A"], ["x", "B"]],
} as unknown as Pick<Frame, "pos" | "edges">;

const ZZ_S1 = {
  pos: { p: [165, 40], x: [85, 112], C: [212, 112], g: [282, 112], A: [38, 186], B: [128, 186], D: [325, 186] },
  edges: [["p", "x"], ["p", "g"], ["x", "A"], ["x", "B"], ["g", "C"], ["g", "D"]],
} as unknown as Pick<Frame, "pos" | "edges">;

const ZIGZIG: Case = {
  key: "zig-zig",
  label: "Zig-Zig",
  when: "x и p — дети с ОДНОЙ стороны (оба слева или оба справа)",
  rotations: "2 поворота, первым — верхний",
  keys: { x: 20, p: 40, g: 60 },
  inorder: ["A", "20", "B", "40", "C", "60", "D"],
  ranges: "A < 20 · B: 20–40 · C: 40–60 · D > 60",
  frames: [
    {
      ...ZZ_S0,
      kind: "start",
      title: "Было: прямая линия 60 → 40 → 20",
      text: "Три узла выстроились в «бамбук»: каждый следующий — левый сын предыдущего. Самая неудобная форма дерева, именно её splay и разглаживает.",
      ms: RESULT_MS,
    },
    {
      ...ZZ_S0,
      kind: "aim",
      title: "Прицел 1: ВЕРХНЕЕ ребро 60 — 40",
      text: "Главная хитрость этого случая: первым крутим деда с родителем, а не искомый узел. Двадцатку пока не трогаем вообще.",
      focus: ["g", "p"],
      ms: AIM_MS,
    },
    {
      ...ZZ_S1,
      kind: "result",
      title: "Поворот 1: 40 поднялось над 60",
      text: "40 встало в корень, 60 опустилось к нему правым сыном и забрало поддерево C. Двадцатка так и висит слева, но теперь она на глубине 1, а не 2.",
      moved: ["p", "g", "C"],
      ms: RESULT_MS,
    },
    {
      ...ZZ_S1,
      kind: "aim",
      title: "Прицел 2: ребро 40 — 20",
      text: "А теперь обычный одиночный поворот — тот же самый Zig, только внутри уже перестроенного дерева.",
      focus: ["p", "x"],
      ms: AIM_MS,
    },
    {
      pos: { x: [100, 45], A: [45, 118], p: [188, 118], B: [140, 190], g: [265, 190], C: [220, 258], D: [318, 258] },
      edges: [["x", "A"], ["x", "p"], ["p", "B"], ["p", "g"], ["g", "C"], ["g", "D"]],
      kind: "result",
      title: "Стало: 20 в корне, бамбук стал кустом",
      text: "Сравни с первым кадром: A и B были на глубине 3, стали на глубине 2 и 3, а вся левая ветка укоротилась вдвое. Так splay чинит дерево, а не только достаёт ключ.",
      moved: ["x", "p", "A", "B"],
      ms: RESULT_MS,
    },
  ],
};

/* ----------------------------- Zig-Zag ----------------------------- */
const ZG_S0 = {
  pos: { g: [258, 40], D: [328, 112], p: [148, 112], A: [65, 186], x: [220, 186], B: [172, 254], C: [272, 254] },
  edges: [["g", "p"], ["g", "D"], ["p", "A"], ["p", "x"], ["x", "B"], ["x", "C"]],
} as unknown as Pick<Frame, "pos" | "edges">;

const ZG_S1 = {
  pos: { g: [258, 40], D: [328, 112], x: [148, 112], p: [72, 186], C: [215, 186], A: [30, 254], B: [112, 254] },
  edges: [["g", "x"], ["g", "D"], ["x", "p"], ["x", "C"], ["p", "A"], ["p", "B"]],
} as unknown as Pick<Frame, "pos" | "edges">;

const ZIGZAG: Case = {
  key: "zig-zag",
  label: "Zig-Zag",
  when: "x и p — дети с РАЗНЫХ сторон (змейка)",
  rotations: "2 поворота, первым — нижний",
  keys: { x: 40, p: 20, g: 60 },
  inorder: ["A", "20", "B", "40", "C", "60", "D"],
  ranges: "A < 20 · B: 20–40 · C: 40–60 · D > 60",
  frames: [
    {
      ...ZG_S0,
      kind: "start",
      title: "Было: 60 → влево на 20 → вправо на 40",
      text: "Узлы идут «змейкой»: сначала шаг влево, потом вправо. Порядок поворотов здесь ОБРАТНЫЙ к Zig-Zig — первой крутим нижнюю пару.",
      ms: RESULT_MS,
    },
    {
      ...ZG_S0,
      kind: "aim",
      title: "Прицел 1: НИЖНЕЕ ребро 20 — 40",
      text: "Дед (60) стоит на месте и в этом повороте не участвует вообще. Крутим только подсвеченную связку.",
      focus: ["p", "x"],
      ms: AIM_MS,
    },
    {
      ...ZG_S1,
      kind: "result",
      title: "Поворот 1: змейка выпрямилась",
      text: "40 заняло место 20 и забрало его к себе левым сыном. Теперь 60 → 40 → 20 идут в одну сторону — получилась обычная линия.",
      moved: ["x", "p", "C"],
      ms: RESULT_MS,
    },
    {
      ...ZG_S1,
      kind: "aim",
      title: "Прицел 2: ребро 60 — 40",
      text: "Остался одиночный поворот вокруг деда — и сорок окажется наверху.",
      focus: ["g", "x"],
      ms: AIM_MS,
    },
    {
      pos: { x: [180, 50], p: [90, 130], g: [275, 130], A: [40, 208], B: [140, 208], C: [230, 208], D: [325, 208] },
      edges: [["x", "p"], ["x", "g"], ["p", "A"], ["p", "B"], ["g", "C"], ["g", "D"]],
      kind: "result",
      title: "Стало: 20 и 60 — два сына сорока",
      text: "Дерево стало идеально симметричным: все четыре поддерева A, B, C, D оказались на одной глубине. Зиг-заг всегда даёт такую «ёлочку».",
      moved: ["x", "p", "g", "C"],
      ms: RESULT_MS,
    },
  ],
};

const CASES: Case[] = [ZIG, ZIGZIG, ZIGZAG];

const COLOR: Record<string, { fill: string; stroke: string }> = {
  x: { fill: "#6366f1", stroke: "#a5b4fc" },
  p: { fill: "#0ea5e9", stroke: "#7dd3fc" },
  g: { fill: "#f59e0b", stroke: "#fcd34d" },
  sub: { fill: "#1e293b", stroke: "#475569" },
};

const ROLE_RU: Partial<Record<NodeId, string>> = {
  x: "x — ищем его",
  p: "p — родитель",
  g: "g — дед",
};

const isSubtree = (id: NodeId) => id === "A" || id === "B" || id === "C" || id === "D";

const Tree: React.FC<{ frame: Frame; prev: Pos; keys: Case["keys"] }> = ({ frame, prev, keys }) => {
  const { pos, edges, focus, moved } = frame;
  const dim = (id: NodeId) => (focus ? !focus.includes(id) : false);
  const ghosts = frame.kind === "result" ? (moved ?? []).filter((id) => prev[id] && pos[id]) : [];

  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="w-full h-auto block" role="img" aria-label={frame.title}>
      <defs>
        <marker id="splay-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#a5b4fc" />
        </marker>
      </defs>

      {/* призраки: где узел стоял до поворота */}
      {ghosts.map((id) => {
        const from = prev[id]!;
        const to = pos[id]!;
        const r = isSubtree(id) ? 15 : 20;
        const dx = to[0] - from[0];
        const dy = to[1] - from[1];
        const len = Math.hypot(dx, dy) || 1;
        const pad = r + 8;
        return (
          <g key={`ghost-${id}`} opacity={0.55}>
            <circle cx={from[0]} cy={from[1]} r={r} fill="none" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 4" />
            {len > pad * 2 + 6 && (
              <line
                x1={from[0] + (dx / len) * pad}
                y1={from[1] + (dy / len) * pad}
                x2={to[0] - (dx / len) * pad}
                y2={to[1] - (dy / len) * pad}
                stroke="#a5b4fc"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                markerEnd="url(#splay-arrow)"
              />
            )}
          </g>
        );
      })}

      {edges.map(([a, b], i) => {
        const pa = pos[a];
        const pb = pos[b];
        if (!pa || !pb) return null;
        const hot = Boolean(focus && focus.includes(a) && focus.includes(b));
        return (
          <line
            key={`${a}-${b}-${i}`}
            x1={pa[0]}
            y1={pa[1]}
            x2={pb[0]}
            y2={pb[1]}
            stroke={hot ? "#fbbf24" : "#475569"}
            strokeWidth={hot ? 5 : 2}
            opacity={focus && !hot ? 0.25 : 1}
            style={{ transition: "all 1200ms cubic-bezier(.34,.01,.2,1)" }}
          />
        );
      })}

      {(Object.keys(pos) as NodeId[]).map((id) => {
        const p = pos[id];
        if (!p) return null;
        const sub = isSubtree(id);
        const c = COLOR[sub ? "sub" : id];
        const r = sub ? 15 : 20;
        const hot = Boolean(focus && focus.includes(id));
        return (
          <g
            key={id}
            style={{
              transform: `translate(${p[0]}px, ${p[1]}px)`,
              transition: MOVE,
              opacity: dim(id) ? 0.28 : 1,
            }}
          >
            {hot && <circle r={r + 7} fill="none" stroke="#fbbf24" strokeWidth={2} strokeDasharray="4 4" />}
            <circle r={r} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={sub ? 12 : 15}
              fontWeight="700"
              fill={sub ? "#94a3b8" : "#fff"}
            >
              {sub ? id : keys[id]}
            </text>
            {!sub && (
              <text textAnchor="middle" y={-r - 7} fontSize={11} fontWeight="700" fill={c.stroke}>
                {id}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export const SplayRotationsViz: React.FC = () => {
  const [caseIdx, setCaseIdx] = useState(0);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [slow, setSlow] = useState(false);

  const active = CASES[caseIdx];
  const total = active.frames.length;
  const idx = Math.min(frame, total - 1);
  const current = active.frames[idx];
  const prevPos = active.frames[Math.max(idx - 1, 0)].pos;
  const duration = useMemo(() => Math.round(current.ms * (slow ? 1.8 : 1)), [current.ms, slow]);
  const last = idx === total - 1;

  useEffect(() => {
    setFrame(0);
  }, [caseIdx]);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setFrame((f) => (f + 1) % total), duration);
    return () => clearTimeout(t);
  }, [playing, frame, duration, total]);

  return (
    <div className="w-full bg-slate-950 rounded-2xl border border-slate-800 p-3 sm:p-5 shadow-xl">
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {CASES.map((c, i) => (
          <button
            key={c.key}
            onClick={() => setCaseIdx(i)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              i === caseIdx ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mb-3 text-xs sm:text-[13px] text-slate-300 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
        <span className="font-bold text-indigo-300">Когда применяется:</span> {active.when}.{" "}
        <span className="text-slate-500">({active.rotations})</span>
      </div>

      {/* шаг + пояснение стоят НАД картинкой: сначала читаем, потом смотрим */}
      <div className="mb-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 min-h-[92px]">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              current.kind === "aim"
                ? "bg-amber-500/20 text-amber-300"
                : current.kind === "start"
                  ? "bg-slate-700 text-slate-300"
                  : "bg-indigo-500/20 text-indigo-300"
            }`}
          >
            {current.kind === "aim" ? "прицел" : current.kind === "start" ? "начало" : "поворот сделан"}
          </span>
          <span className="text-sm font-bold text-white">
            Шаг {idx + 1} из {total}. {current.title}
          </span>
        </div>
        <p className="text-[13px] text-slate-400 leading-relaxed">{current.text}</p>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-2 sm:p-4">
        <Tree frame={current} prev={prevPos} keys={active.keys} />

        {/* обход слева направо — одинаковый на всех кадрах */}
        <div className="mt-2 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
            <span className="text-slate-500 mr-1">Обход слева направо:</span>
            {active.inorder.map((t, i) => (
              <span
                key={i}
                className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                  /\d/.test(t) ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-800 text-slate-400"
                }`}
              >
                {t}
              </span>
            ))}
            <span className="text-emerald-400/80 ml-1">— не меняется ни на одном кадре</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">{active.ranges}</p>
        </div>
      </div>

      {/* индикатор автопрокрутки */}
      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-3">
        <div
          key={`${caseIdx}-${frame}-${playing}-${slow}`}
          className="h-full bg-indigo-500"
          style={
            playing
              ? { animation: `demoProgress ${duration}ms linear forwards` }
              : { width: "100%", background: "#334155" }
          }
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800">
        <button
          onClick={() => {
            setPlaying(false);
            setFrame((f) => (f - 1 + total) % total);
          }}
          disabled={idx === 0}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 text-xs font-bold transition-colors"
        >
          ← Назад
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setFrame((f) => (f + 1) % total);
          }}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-lg shadow-indigo-900/40"
        >
          {last ? "↻ Сначала" : "Дальше →"}
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
        >
          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {playing ? "Стоп" : "Авто"}
        </button>
        <button
          onClick={() => setSlow((s) => !s)}
          title="Автопрокрутка ещё медленнее"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
            slow
              ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
          }`}
        >
          <Gauge className="w-3.5 h-3.5" /> {slow ? "0.5×" : "1×"}
        </button>
        <button
          onClick={() => {
            setFrame(0);
            setPlaying(false);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Сброс
        </button>

        <div className="flex items-center gap-3 ml-auto text-[11px] text-slate-400">
          {(["x", "p", "g"] as const).map((id) =>
            active.keys[id] === undefined ? null : (
              <span key={id} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ background: COLOR[id].fill }} /> {ROLE_RU[id]}
              </span>
            )
          )}
        </div>
      </div>

      <p className="mt-2 text-[11px] text-slate-500">
        Листай кнопкой «Дальше» в своём темпе — кадры не убегут. «Авто» включает автопрокрутку, «0.5×» замедляет её вдвое.
      </p>
    </div>
  );
};
