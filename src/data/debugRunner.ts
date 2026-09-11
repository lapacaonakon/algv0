/**
 * Пошаговый дебаггер поверх Pyodide: CPython выполняет код пользователя
 * под sys.settrace и на каждой строке записывает фрейм-локальные переменные —
 * как панель Variables в обычном отладчике.
 */

export interface DebugStep {
  /** Номер строки в коде пользователя (1-based). */
  line: number;
  /** Имя функции-фрейма ("<module>" — верхний уровень). */
  func: string;
  /** Локальные переменные: имя → repr (усечённый). */
  locals: Record<string, string>;
}

export interface DebugResult {
  steps: DebugStep[];
  /** Текст последней необработанной ошибки (или пустая строка). */
  error: string;
  /** true, если уперлись в лимит шагов. */
  truncated: boolean;
}

/** Лимит шагов трассы — защита от бесконечных циклов и O(n³)-развёрток. */
export const DEBUG_STEP_CAP = 500;

/**
 * Строит самодостаточный python-скрипт: выполняет userSrc под трейсером
 * и возвращает JSON с шагами (строка + func + locals) как результат
 * последнего выражения (его вернёт runPythonAsync).
 */
export function buildDebugRunner(userSrc: string): string {
  const srcLiteral = JSON.stringify(userSrc); // JSON-строка — валидный python-литерал
  return `import sys as __sys, json as __json

__src = ${srcLiteral}
__steps = []
__CAP = ${DEBUG_STEP_CAP}

def __safe(v):
    try:
        r = repr(v)
    except Exception:
        r = "<…>"
    return r if len(r) <= 80 else r[:77] + "…"

def __tracer(frame, event, arg):
    if event == "line" and frame.f_code.co_filename == "<user-code>" \
            and not (frame.f_code.co_name.startswith("<") and frame.f_code.co_name != "<module>"):
        loc = {}
        for k, v in frame.f_locals.items():
            if not k.startswith("__") and type(v).__name__ != "module":
                loc[k] = __safe(v)
        # PEP 709: с 3.12 компрехеншны встроены во фрейм модуля и шлют событие
        # на своей строке каждую итерацию (9 ложных «шагов», v протекает в локали).
        # Склеиваем ПОДРЯД идущие события одной строки в один шаг — последнее состояние.
        if __steps and __steps[-1]["line"] == frame.f_lineno and __steps[-1]["func"] == frame.f_code.co_name:
            __steps[-1]["locals"] = loc
        else:
            __steps.append({"line": frame.f_lineno, "func": frame.f_code.co_name, "locals": loc})
        if len(__steps) >= __CAP:
            __sys.settrace(None)
    return __tracer

__err = ""
try:
    __sys.settrace(__tracer)
    exec(compile(__src, "<user-code>", "exec"), {"__name__": "__main__"})
except Exception:
    import traceback as __tb
    __err = __tb.format_exc(limit=3)
finally:
    __sys.settrace(None)

__OUT = __json.dumps({
    "steps": __steps,
    "error": __err,
    "truncated": len(__steps) >= __CAP,
})
__OUT
`;
}

/**
 * Какие переменные изменились на этом шаге относительно предыдущего —
 * они подсвечиваются (как amber-подсветка изменений в отладчике).
 * Новые переменные тоже считаются изменёнными.
 */
export function changedVars(
  prev: Record<string, string> | null | undefined,
  cur: Record<string, string>
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const k of Object.keys(cur)) {
    out[k] = !prev || !(k in prev) || prev[k] !== cur[k];
  }
  return out;
}

/** Базовое имя из карточки переменной: "tin[v]" → "tin", "go(v, c)" → "go". */
export const baseVarName = (name: string): string => name.split(/[(\[]/)[0].trim();

/**
 * Порядок показа в панели переменных: сначала переменные синхронизации
 * страницы (те, что подсвечивает визуализация), остальные — по алфавиту.
 */
export function orderVars(
  cur: Record<string, string>,
  syncNames: string[]
): [string, string][] {
  const inSync = new Set(syncNames);
  const syncEntries = Object.entries(cur).filter(([k]) => inSync.has(k));
  const rest = Object.entries(cur)
    .filter(([k]) => !inSync.has(k))
    .sort(([a], [b]) => a.localeCompare(b));
  return [...syncEntries, ...rest];
}
