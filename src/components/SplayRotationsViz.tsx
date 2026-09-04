import React, { useEffect, useMemo, useState } from "react";
import { Gauge, Pause, Play, RotateCcw } from "lucide-react";

/**
 * Разбор трёх случаев операции Splay: Zig, Zig-Zig, Zig-Zag.
 *
 * Анимация намеренно медленная и разбита на два типа кадров:
 *  • «прицел» — пара узлов, которую сейчас будут крутить, подсвечивается, всё
 *    остальное гаснет (ничего не двигается, есть время понять, что произойдёт);
 *  • «результат» — узлы плавно переезжают на новые места.
 * Без такой паузы поворот выглядел как рывок, по которому ничего не разобрать.
 */

type NodeId = "x" | "p" | "g" | "A" | "B" | "C" | "D";

interface Frame {
  pos: Partial<Record<NodeId, [number, number]>>;
  edges: [NodeId, NodeId][];
  title: string;
  text: string;
  /** Пара, которую крутим на этом шаге: кадр-«прицел». */
  focus?: [NodeId, NodeId];
  /** Кто переехал на этом кадре — подсвечиваем кольцом. */
  moved?: NodeId[];
  ms: number;
}

interface Case {
  key: "zig" | "zig-zig" | "zig-zag";
  label: string;
  when: string;
  rotations: string;
  frames: Frame[];
}

const VB = { w: 340, h: 262 };
const FOCUS_MS = 2200;
const MOVE_MS = 3000;
const TRANSITION = "transform 1100ms cubic-bezier(.34,.01,.2,1), opacity 500ms ease";

/* ------------------------------- Zig ------------------------------- */
const ZIG_BEFORE = {
  pos: { p: [180, 45], x: [95, 120], C: [265, 120], A: [45, 195], B: [150, 195] },
  edges: [["p", "x"], ["p", "C"], ["x", "A"], ["x", "B"]],
} as const;

const ZIG: Case = {
  key: "zig",
  label: "Zig",
  when: "родитель x — уже корень, деда нет",
  rotations: "1 поворот",
  frames: [
    {
      ...(ZIG_BEFORE as unknown as Pick<Frame, "pos" | "edges">),
      title: "До: x — ребёнок корня",
      text: "p стоит в корне, x висит слева от него. Дедушки нет, поэтому хватит одного поворота.",
      ms: MOVE_MS,
    },
    {
      ...(ZIG_BEFORE as unknown as Pick<Frame, "pos" | "edges">),
      title: "Прицел: крутим пару (p, x)",
      text: "Ничего пока не двигается. Смотрим на связку p → x: сейчас x поднимется на место p, а p опустится под него.",
      focus: ["p", "x"],
      ms: FOCUS_MS,
    },
    {
      pos: { x: [160, 45], A: [80, 120], p: [245, 120], B: [190, 195], C: [300, 195] },
      edges: [["x", "A"], ["x", "p"], ["p", "B"], ["p", "C"]],
      title: "После: x — корень",
      text: "x поднялся, p стал его правым сыном. Поддерево B «перевесилось» от x к p — оно как раз между ними по значению.",
      moved: ["x", "p", "B"],
      ms: MOVE_MS,
    },
  ],
};

/* ----------------------------- Zig-Zig ----------------------------- */
const ZZ_S0 = {
  pos: { g: [230, 35], D: [310, 105], p: [140, 105], C: [215, 175], x: [65, 175], A: [25, 240], B: [110, 240] },
  edges: [["g", "p"], ["g", "D"], ["p", "x"], ["p", "C"], ["x", "A"], ["x", "B"]],
} as const;

const ZZ_S1 = {
  pos: { p: [150, 35], x: [70, 105], C: [195, 105], g: [265, 105], A: [30, 175], B: [115, 175], D: [305, 175] },
  edges: [["p", "x"], ["p", "g"], ["x", "A"], ["x", "B"], ["g", "C"], ["g", "D"]],
} as const;

const ZIGZIG: Case = {
  key: "zig-zig",
  label: "Zig-Zig",
  when: "x и p — дети с ОДНОЙ стороны (оба слева или оба справа)",
  rotations: "2 поворота, первым — верхний",
  frames: [
    {
      ...(ZZ_S0 as unknown as Pick<Frame, "pos" | "edges">),
      title: "До: прямая линия g → p → x",
      text: "Три узла выстроились в «бамбук» — самая неудобная форма дерева. Именно её splay и разглаживает.",
      ms: MOVE_MS,
    },
    {
      ...(ZZ_S0 as unknown as Pick<Frame, "pos" | "edges">),
      title: "Прицел 1: ВЕРХНЯЯ пара (g, p)",
      text: "Главная хитрость случая: первым крутим деда с родителем, а не x. Запомни подсвеченную пару — трогаем только её.",
      focus: ["g", "p"],
      ms: FOCUS_MS,
    },
    {
      ...(ZZ_S1 as unknown as Pick<Frame, "pos" | "edges">),
      title: "Шаг 1 выполнен: p поднялся над g",
      text: "p встал в корень, g опустился к нему в правые сыновья и забрал поддерево C. x пока так и висит слева.",
      moved: ["p", "g", "C"],
      ms: MOVE_MS,
    },
    {
      ...(ZZ_S1 as unknown as Pick<Frame, "pos" | "edges">),
      title: "Прицел 2: пара (p, x)",
      text: "Теперь обычный одиночный поворот — тот же Zig, только уже внутри перестроенного дерева.",
      focus: ["p", "x"],
      ms: FOCUS_MS,
    },
    {
      pos: { x: [90, 40], A: [35, 110], p: [170, 110], B: [125, 180], g: [250, 180], C: [205, 245], D: [300, 245] },
      edges: [["x", "A"], ["x", "p"], ["p", "B"], ["p", "g"], ["g", "C"], ["g", "D"]],
      title: "Готово: x в корне, бамбук стал кустом",
      text: "Сравни с первым кадром: раньше x был на глубине 2, а A и B — на глубине 3. Теперь вся ветка стала примерно вдвое короче.",
      moved: ["x", "p", "A", "B"],
      ms: MOVE_MS,
    },
  ],
};

/* ----------------------------- Zig-Zag ----------------------------- */
const ZG_S0 = {
  pos: { g: [240, 35], D: [315, 105], p: [130, 105], A: [55, 175], x: [200, 175], B: [155, 240], C: [255, 240] },
  edges: [["g", "p"], ["g", "D"], ["p", "A"], ["p", "x"], ["x", "B"], ["x", "C"]],
} as const;

const ZG_S1 = {
  pos: { g: [240, 35], D: [315, 105], x: [130, 105], p: [60, 175], C: [200, 175], A: [25, 240], B: [100, 240] },
  edges: [["g", "x"], ["g", "D"], ["x", "p"], ["x", "C"], ["p", "A"], ["p", "B"]],
} as const;

const ZIGZAG: Case = {
  key: "zig-zag",
  label: "Zig-Zag",
  when: "x и p — дети с РАЗНЫХ сторон (змейка)",
  rotations: "2 поворота, первым — нижний",
  frames: [
    {
      ...(ZG_S0 as unknown as Pick<Frame, "pos" | "edges">),
      title: "До: g → p влево, p → x вправо",
      text: "Узлы идут «змейкой». Здесь порядок обратный к Zig-Zig: первой крутим НИЖНЮЮ пару.",
      ms: MOVE_MS,
    },
    {
      ...(ZG_S0 as unknown as Pick<Frame, "pos" | "edges">),
      title: "Прицел 1: НИЖНЯЯ пара (p, x)",
      text: "Дед g пока стоит на месте и не участвует. Крутим только подсвеченную связку p → x.",
      focus: ["p", "x"],
      ms: FOCUS_MS,
    },
    {
      ...(ZG_S1 as unknown as Pick<Frame, "pos" | "edges">),
      title: "Шаг 1 выполнен: змейка выпрямилась",
      text: "x занял место p и забрал его к себе левым сыном. Теперь g → x → p идут в одну сторону — получилась обычная линия.",
      moved: ["x", "p", "C"],
      ms: MOVE_MS,
    },
    {
      ...(ZG_S1 as unknown as Pick<Frame, "pos" | "edges">),
      title: "Прицел 2: пара (g, x)",
      text: "Остался одиночный поворот вокруг деда — и x окажется наверху.",
      focus: ["g", "x"],
      ms: FOCUS_MS,
    },
    {
      pos: { x: [170, 45], p: [80, 125], g: [265, 125], A: [30, 200], B: [130, 200], C: [220, 200], D: [315, 200] },
      edges: [["x", "p"], ["x", "g"], ["p", "A"], ["p", "B"], ["g", "C"], ["g", "D"]],
      title: "Готово: p и g — два ребёнка x",
      text: "Дерево стало симметричным: все четыре поддерева A, B, C, D оказались на одной глубине.",
      moved: ["x", "p", "g", "C"],
      ms: MOVE_MS,
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

const isSubtree = (id: NodeId) => id === "A" || id === "B" || id === "C" || id === "D";

const Tree: React.FC<{ frame: Frame }> = ({ frame }) => {
  const { pos, edges, focus, moved } = frame;
  const dim = (id: NodeId) => (focus ? !focus.includes(id) : false);

  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="w-full h-auto block" role="img" aria-label={frame.title}>
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
            style={{ transition: "all 1100ms cubic-bezier(.34,.01,.2,1)" }}
          />
        );
      })}

      {(Object.keys(pos) as NodeId[]).map((id) => {
        const p = pos[id];
        if (!p) return null;
        const c = COLOR[isSubtree(id) ? "sub" : id];
        const r = isSubtree(id) ? 15 : 19;
        const hot = Boolean(focus && focus.includes(id));
        const justMoved = Boolean(moved?.includes(id));
        return (
          <g
            key={id}
            style={{
              transform: `translate(${p[0]}px, ${p[1]}px)`,
              transition: TRANSITION,
              opacity: dim(id) ? 0.3 : 1,
            }}
          >
            {(hot || justMoved) && (
              <circle
                r={r + 7}
                fill="none"
                stroke={hot ? "#fbbf24" : "#a5b4fc"}
                strokeWidth={2}
                strokeDasharray="4 4"
                opacity={0.9}
              />
            )}
            <circle r={r} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isSubtree(id) ? 12 : 14}
              fontWeight="700"
              fill={isSubtree(id) ? "#94a3b8" : "#fff"}
            >
              {id}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const SplayRotationsViz: React.FC = () => {
  const [caseIdx, setCaseIdx] = useState(0);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [slow, setSlow] = useState(false);

  const active = CASES[caseIdx];
  const total = active.frames.length;
  const current = active.frames[Math.min(frame, total - 1)];
  const duration = useMemo(() => Math.round(current.ms * (slow ? 1.8 : 1)), [current.ms, slow]);

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

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-2 sm:p-4">
        <Tree frame={current} />
      </div>

      {/* индикатор: сколько осталось до следующего кадра */}
      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-3">
        <div
          key={`${caseIdx}-${frame}-${playing}-${slow}`}
          className="h-full bg-indigo-500"
          style={
            playing
              ? { animation: `demoProgress ${duration}ms linear forwards` }
              : { width: "100%", background: "#475569" }
          }
        />
      </div>

      <div className="mt-3 min-h-[76px]">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              current.focus ? "bg-amber-500/20 text-amber-300" : "bg-indigo-500/20 text-indigo-300"
            }`}
          >
            {current.focus ? "прицел" : "результат"}
          </span>
          <span className="text-sm font-bold text-white">
            {frame + 1}/{total}. {current.title}
          </span>
        </div>
        <p className="text-[13px] text-slate-400 leading-relaxed">{current.text}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
        >
          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {playing ? "Пауза" : "Играть"}
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setFrame((f) => (f - 1 + total) % total);
          }}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
        >
          ← Шаг назад
        </button>
        <button
          onClick={() => {
            setPlaying(false);
            setFrame((f) => (f + 1) % total);
          }}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
        >
          Шаг вперёд →
        </button>
        <button
          onClick={() => setSlow((s) => !s)}
          title="Ещё медленнее"
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
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: COLOR.x.fill }} /> x
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: COLOR.p.fill }} /> p — родитель
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: COLOR.g.fill }} /> g — дед
          </span>
        </div>
      </div>
    </div>
  );
};
