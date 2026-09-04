import React, { useEffect, useState } from "react";

/** Общие примитивы для мини-визуализаций подсказок. */
export const W = 260;
export const H = 130;

export function useLoop(steps: number, ms = 900) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (steps <= 1) return;
    const t = setInterval(() => setStep((s) => (s + 1) % steps), ms);
    return () => clearInterval(t);
  }, [steps, ms]);
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

export const Svg: React.FC<{ children: React.ReactNode; caption?: string }> = ({ children, caption }) => (
  <div className="w-full">
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img">
      {children}
    </svg>
    {caption && <div className="text-[10px] text-slate-400 text-center mt-1 leading-tight px-1">{caption}</div>}
  </div>
);

export const Node: React.FC<{
  x: number;
  y: number;
  r?: number;
  fill: string;
  label?: string | number;
  stroke?: string;
}> = ({ x, y, r = 13, fill, label, stroke }) => (
  <g style={{ transition: "all .35s ease" }}>
    <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke ?? C.idleStroke} strokeWidth={1.5} />
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
    style={{ transition: "stroke .35s ease" }}
  />
);
