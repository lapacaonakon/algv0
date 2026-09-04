import React, { createContext, useContext, useEffect, useState } from "react";

/** Общие примитивы для мини-визуализаций подсказок. */
export const W = 260;
export const H = 130;

/**
 * Общий множитель скорости. Кадры были слишком короткими: глаз не успевал
 * заметить, что именно переехало, и анимация читалась как рывок.
 */
export const SPEED = 2.1;

/** Длительность переезда узлов. Должна быть заметно меньше шага, но не мгновенной. */
export const MOVE_MS = 800;
export const EASE = "cubic-bezier(.34,.01,.2,1)";
export const MOVE = `all ${MOVE_MS}ms ${EASE}`;

/** Наведение на карточку ставит анимацию на паузу — можно рассмотреть кадр. */
export const DemoPauseContext = createContext(false);

export function useLoop(steps: number, ms = 900) {
  const [step, setStep] = useState(0);
  const paused = useContext(DemoPauseContext);
  const period = Math.round(ms * SPEED);

  useEffect(() => {
    if (steps <= 1 || paused) return;
    const t = setInterval(() => setStep((s) => (s + 1) % steps), period);
    return () => clearInterval(t);
  }, [steps, period, paused]);

  return step;
}

export const C = {
  idle: "#334155",
  idleStroke: "#475569",
  text: "#e2e8f0",
  dim: "#94a3b8",
  active: "#6366f1",
  done: "#10b981",
  warn: "#f59e0b",
  bad: "#f43f5e",
  edge: "#475569",
};

export const Svg: React.FC<{ children: React.ReactNode; caption?: string }> = ({ children, caption }) => {
  const paused = useContext(DemoPauseContext);
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img">
        {children}
      </svg>
      {caption && (
        <div className="text-[10px] text-slate-400 text-center mt-1 leading-tight px-1 min-h-[2.2em] flex items-center justify-center">
          {caption}
        </div>
      )}
      <div className="text-[9px] text-slate-600 text-center leading-none">
        {paused ? "пауза — курсор на карточке" : "наведи на карточку, чтобы поставить на паузу"}
      </div>
    </div>
  );
};

export const Node: React.FC<{
  x: number;
  y: number;
  r?: number;
  fill: string;
  label?: string | number;
  stroke?: string;
}> = ({ x, y, r = 13, fill, label, stroke }) => (
  <g style={{ transition: MOVE }}>
    <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke ?? C.idleStroke} strokeWidth={1.5} style={{ transition: MOVE }} />
    {label !== undefined && (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="700" fill="#fff">
        {label}
      </text>
    )}
  </g>
);

export const Edge: React.FC<{
  a: [number, number];
  b: [number, number];
  color?: string;
  width?: number;
  dashed?: boolean;
}> = ({ a, b, color = C.edge, width = 2, dashed }) => (
  <line
    x1={a[0]}
    y1={a[1]}
    x2={b[0]}
    y2={b[1]}
    stroke={color}
    strokeWidth={width}
    strokeDasharray={dashed ? "4 3" : undefined}
    style={{ transition: MOVE }}
  />
);
