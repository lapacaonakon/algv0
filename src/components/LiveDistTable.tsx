import type { DebugValue } from "../data/debugRunner";

interface LiveDistTableProps {
  /** dist из кода пользователя: имя вершины → расстояние. */
  dist: Record<string, DebugValue> | null;
  /** prev/p — предок на кратчайшем пути (необязательно). */
  prev?: Record<string, DebugValue> | null;
  /** done/visited — зафиксированные вершины (необязательно). */
  done?: DebugValue[] | null;
  /** Идентификаторы вершин, нарисованных на схеме демо-графа. */
  demoIds: string[];
  /** Подпись таблицы (по умолчанию «Ваши расстояния»). */
  title?: string;
}

const fmt = (value: DebugValue | undefined): string => {
  if (value === undefined || value === null) return "—";
  if (typeof value === "number") {
    if (value === Number.POSITIVE_INFINITY) return "∞";
    if (value === Number.NEGATIVE_INFINITY) return "−∞";
    return String(value);
  }
  if (typeof value === "string") {
    const t = value.trim().toLowerCase();
    if (t === "inf" || t === "infinity") return "∞";
    if (t === "-inf" || t === "-infinity") return "−∞";
    return value;
  }
  return String(value);
};

/**
 * Таблица «ваших» расстояний, когда имена вершин в коде не совпали с демо-графом.
 *
 * Схема демонстрации нарисована на фиксированном наборе вершин (A…G у Дейкстры,
 * S…F у Форда—Беллмана). Если в коде пользователя вершины называются иначе
 * (0…6, v1…v9), картинка физически не может их показать — раньше значения
 * просто пропадали, и казалось, что визуализация живёт своей жизнью. Теперь они
 * выводятся рядом, а подсказка объясняет, как связать их со схемой.
 */
export function LiveDistTable({ dist, prev, done, demoIds, title = "Ваши расстояния из кода" }: LiveDistTableProps) {
  if (!dist) return null;

  const keys = Object.keys(dist);
  if (keys.length === 0) return null;

  const demoSet = new Set(demoIds);
  const unknown = keys.filter((key) => !demoSet.has(key));
  // Все вершины совпали со схемой — таблица не нужна, картинка и так их рисует.
  if (unknown.length === 0) return null;

  const doneSet = new Set((done ?? []).map((value) => String(value)));
  const shown = keys.slice(0, 64);

  return (
    <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/5 p-3 sm:p-4">
      <p className="text-[11px] leading-relaxed text-amber-200">
        <b>{title}.</b> В вашем коде вершины{" "}
        <span className="font-mono">
          {unknown.slice(0, 8).join(", ")}
          {unknown.length > 8 ? " …" : ""}
        </span>
        , а на схеме демо-графа нарисованы{" "}
        <span className="font-mono">{demoIds.join(", ")}</span>. Схема остаётся демонстрационной, поэтому значения
        показаны отдельной таблицей. Чтобы они управляли картинкой, назовите вершины так же, как в эталонном коде
        (кнопка-«глаз» в панели Python подставляет его целиком).
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {shown.map((key) => {
          const parent = prev ? fmt(prev[key]) : null;
          const fixed = doneSet.has(key);
          return (
            <span
              key={key}
              className={`inline-flex items-baseline gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[11px] ${
                fixed
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : "border-slate-700 bg-slate-900/70 text-slate-200"
              }`}
              title={fixed ? "вершина зафиксирована (done/visited)" : undefined}
            >
              <b className={fixed ? "text-emerald-300" : "text-indigo-300"}>{key}</b>
              <span className="text-slate-500">=</span>
              <span>{fmt(dist[key])}</span>
              {parent && parent !== "—" ? <span className="text-slate-500">← {parent}</span> : null}
              {fixed ? <span className="text-emerald-400">✓</span> : null}
            </span>
          );
        })}
        {keys.length > shown.length ? (
          <span className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900/70 px-1.5 py-0.5 text-[11px] text-slate-400">
            +{keys.length - shown.length} ещё
          </span>
        ) : null}
      </div>
    </div>
  );
}
