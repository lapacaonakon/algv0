import React, { useState } from "react";
import { SplayRotationsViz } from "./SplayRotationsViz";
import SplayWalkViz from "./SplayWalkViz";
import { SplayRotationSandbox } from "./SplayRotationSandbox";

/**
 * Страница splay — три вкладки по нарастанию сложности:
 *  1. «Механика» — покадровый разбор Zig / Zig-Zig / Zig-Zag в своём темпе
 *     (прицел → поворот, призраки старых позиций, обход слева-направо как доказательство).
 *  2. «Большое дерево» — те же случаи внутри настоящего дерева: каждый одиночный
 *     поворот — кадры «прицел → отстёгиваем среднее поддерево → поворот».
 *  3. «Собери сам» — песочница: подними узел кликами, порядок сверится со splay.
 */
type Tab = "cases" | "big" | "play";

export const SplayPlayground: React.FC<{ defaultTab?: Tab }> = ({ defaultTab = "cases" }) => {
  const [tab, setTab] = useState<Tab>(defaultTab);

  return (
    <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 shadow-xl max-w-6xl mx-auto my-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30">
            <span className="text-2xl">🩹</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Интерактивное Splay-дерево</h3>
            <p className="text-sm text-indigo-300">Один кирпичик — поворот «a–b–c: поднять за середину». Остальное — комбинации</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {([
          { id: "cases" as Tab, label: "1 · Механика: Zig / Zig-Zig / Zig-Zag" },
          { id: "big" as Tab, label: "2 · Большое дерево, по кадрам" },
          { id: "play" as Tab, label: "3 · Собери сам 🎮" },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              tab === t.id ? "bg-indigo-600 text-white" : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "cases" && <SplayRotationsViz />}
      {tab === "big" && <SplayWalkViz />}
      {tab === "play" && <SplayRotationSandbox />}

      {tab === "play" && (
        <p className="text-xs text-slate-500 mt-3">
          Порядок поворотов в песочнице сверяется с правилами выше: Zig-Zig — верхняя пара первой, Zig-Zag — нижняя.
        </p>
      )}
    </div>
  );
};

export default SplayPlayground;
