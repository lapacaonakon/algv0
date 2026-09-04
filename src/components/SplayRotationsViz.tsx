import React, { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

/**
 * Разбор трёх случаев операции Splay: Zig, Zig-Zig, Zig-Zag.
 *
 * Для каждого случая показывается покадровая анимация: где стоял узел x до поворота,
 * что происходит на промежуточном шаге и куда всё приезжает в конце.
 * Подсветкой отмечены x (кого поднимаем), p (родитель) и g (дед).
 */

type NodeId = "x" | "p" | "g" | "A" | "B" | "C" | "D";

interface Frame {
  /** Координаты узлов в этом кадре. */
  pos: Partial<Record<NodeId, [number, number]>>;
  /** Рёбра «родитель → ребёнок». */
  edges: [NodeId, NodeId][];
  title: string;
  text: string;
}

interface Case {
  key: "zig" | "zig-zig" | "zig-zag";
  label: string;
  when: string;
  rotations: string;
  frames: Frame[];
}

const VB = { w: 340, h: 262 };

/* ------------------------------- Zig ------------------------------- */
const ZIG: Case = {
  key: "zig",
  label: "Zig",
  when: "родитель x — уже корень (дед отсутствует)",
  rotations: "1 поворот",
  frames: [
    {
      title: "До: x — ребёнок корня",
      text: "p стоит в корне, x висит слева. Дедушки нет, поэтому хватит одного поворота.",
      pos: { p: [180, 40], x: [95, 110], C: [265, 110], A: [45, 185], B: [150, 185] },
      edges: [["p", "x"], ["p", "C"], ["x", "A"], ["x", "B"]],
    },
    {
      title: "После: x — корень",
      text: "Правый поворот вокруг p: x поднимается, p становится его правым сыном и забирает поддерево B.",
      pos: { x: [160, 40], A: [80, 110], p: [245, 110], B: [190, 185], C: [300, 185] },
      edges: [["x", "A"], ["x", "p"], ["p", "B"], ["p", "C"]],
    },
  ],
};

/* ----------------------------- Zig-Zig ----------------------------- */
const ZIGZIG: Case = {
  key: "zig-zig",
  label: "Zig-Zig",
  when: "x и p — дети с ОДНОЙ стороны (оба слева или оба справа)",
  rotations: "2 поворота, сначала верхний (g, p)",
  frames: [
    {
      title: "До: прямая линия g → p → x",
      text: "Три узла выстроились в «бамбук». Именно этот случай и разглаживает splay.",
      pos: { g: [230, 35], D: [310, 105], p: [140, 105], C: [215, 175], x: [65, 175], A: [25, 235], B: [110, 235] },
      edges: [["g", "p"], ["g", "D"], ["p", "x"], ["p", "C"], ["x", "A"], ["x", "B"]],
    },
    {
      title: "Шаг 1: поворот ВЕРХНЕЙ пары (g, p)",
      text: "Сначала крутим деда с родителем — это ключевое отличие от наивного «два раза подряд поднять x».",
      pos: { p: [150, 35], x: [70, 105], C: [195, 105], g: [265, 105], A: [30, 175], B: [115, 175], D: [305, 175] },
      edges: [["p", "x"], ["p", "g"], ["x", "A"], ["x", "B"], ["g", "C"], ["g", "D"]],
    },
    {
      title: "Шаг 2: поворот пары (p, x) — x в корне",
      text: "Бамбук превратился в куст: глубина всех узлов ветки уменьшилась примерно вдвое.",
      pos: { x: [90, 35], A: [35, 105], p: [170, 105], B: [125, 175], g: [250, 175], C: [205, 235], D: [300, 235] },
      edges: [["x", "A"], ["x", "p"], ["p", "B"], ["p", "g"], ["g", "C"], ["g", "D"]],
    },
  ],
};

/* ----------------------------- Zig-Zag ----------------------------- */
const ZIGZAG: Case = {
  key: "zig-zag",
  label: "Zig-Zag",
  when: "x и p — дети с РАЗНЫХ сторон (зигзаг)",
  rotations: "2 поворота, сначала нижний (p, x)",
  frames: [
    {
      title: "До: g → p (влево) → x (вправо)",
      text: "Узлы идут «зигзагом». Здесь порядок обратный: первым крутим нижнюю пару.",
      pos: { g: [240, 35], D: [315, 105], p: [130, 105], A: [55, 175], x: [200, 175], B: [155, 235], C: [255, 235] },
      edges: [["g", "p"], ["g", "D"], ["p", "A"], ["p", "x"], ["x", "B"], ["x", "C"]],
    },
    {
      title: "Шаг 1: поворот НИЖНЕЙ пары (p, x)",
      text: "x поднимается на место p, забирая p к себе левым сыном. Зигзаг выпрямился в линию.",
      pos: { g: [240, 35], D: [315, 105], x: [130, 105], p: [60, 175], C: [200, 175], A: [25, 235], B: [100, 235] },
      edges: [["g", "x"], ["g", "D"], ["x", "p"], ["x", "C"], ["p", "A"], ["p", "B"]],
    },
    {
      title: "Шаг 2: поворот пары (g, x) — x в корне",
      text: "Теперь p и g стали двумя детьми x, а поддеревья A, B, C, D разошлись по местам.",
      pos: { x: [170, 40], p: [80, 120], g: [265, 120], A: [30, 200], B: [130, 200], C: [220, 200], D: [315, 200] },
      edges: [["x", "p"], ["x", "g"], ["p", "A"], ["p", "B"], ["g", "C"], ["g", "D"]],
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
  const { pos, edges } = frame;
  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="w-full h-auto block" role="img" aria-label={frame.title}>
      {edges.map(([a, b], i) => {
        const pa = pos[a];
        const pb = pos[b];
        if (!pa || !pb) return null;
        return (
          <line
            key={`${a}-${b}-${i}`}
            x1={pa[0]}
            y1={pa[1]}
            x2={pb[0]}
            y2={pb[1]}
            stroke="#475569"
            strokeWidth={2}
            style={{ transition: "all .5s cubic-bezier(.4,0,.2,1)" }}
          />
        );
      })}

      {(Object.keys(pos) as NodeId[]).map((id) => {
        const p = pos[id];
        if (!p) return null;
        const c = COLOR[isSubtree(id) ? "sub" : id];
        const r = isSubtree(id) ? 15 : 19;
        return (
          <g
            key={id}
            style={{ transform: `translate(${p[0]}px, ${p[1]}px)`, transition: "transform .5s cubic-bezier(.4,0,.2,1)" }}
          >
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

  const active = CASES[caseIdx];
  const total = active.frames.length;

  useEffect(() => {
    setFrame(0);
  }, [caseIdx]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setFrame((f) => (f + 1) % total), 2000);
    return () => clearInterval(t);
  }, [playing, total]);

  const current = active.frames[Math.min(frame, total - 1)];

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

      <div className="mt-3 min-h-[64px]">
        <div className="text-sm font-bold text-white mb-1">
          {frame + 1}/{total}. {current.title}
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
            <span className="w-3 h-3 rounded-full" style={{ background: COLOR.x.fill }} /> x — поднимаем
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
