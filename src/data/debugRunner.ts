/**
 * Пошаговый дебаггер поверх Pyodide: CPython выполняет код пользователя
 * под sys.settrace и на каждой строке записывает фрейм-локальные переменные —
 * как панель Variables в обычном отладчике.
 */

export type DebugValue = null | boolean | number | string | DebugValue[] | { [key: string]: DebugValue };

export interface DebugStep {
  /** Номер строки в коде пользователя (1-based). */
  line: number;
  /** Имя функции-фрейма ("<module>" — верхний уровень). */
  func: string;
  /** Локальные переменные: имя → repr (усечённый), для панели Variables. */
  locals: Record<string, string>;
  /**
   * JSON-снимок доступных имён (globals + locals). В отличие от repr его
   * можно напрямую отдать визуализации: i/j остаются числами, st/P — массивами.
   */
  values?: Record<string, DebugValue>;
}

export interface DebugResult {
  steps: DebugStep[];
  /** Локали в момент возврата из модуля — «результат» последнего шага трассы. */
  finalLocals?: Record<string, string>;
  /** Финальный машинно-читаемый снимок для визуализации. */
  finalValues?: Record<string, DebugValue>;
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
__final = {}
__final_values = {}
__CAP = ${DEBUG_STEP_CAP}
__was_truncated = False

class __TraceLimit(Exception):
    pass

def __safe(v):
    try:
        r = repr(v)
    except Exception:
        r = "<…>"
    return r if len(r) <= 80 else r[:77] + "…"

def __snapshot(v, depth=0):
    """Небольшой JSON-снимок: UI использует его без парсинга repr."""
    if v is None or isinstance(v, (bool, int, str)):
        return v
    if isinstance(v, float):
        return v if v == v and v not in (float("inf"), float("-inf")) else __safe(v)
    if depth >= 4:
        return __safe(v)
    limit = 80 if depth < 2 else 32
    if isinstance(v, (list, tuple)):
        return [__snapshot(x, depth + 1) for x in list(v)[:limit]]
    if isinstance(v, (set, frozenset)):
        return [__snapshot(x, depth + 1) for x in list(v)[:limit]]
    if isinstance(v, dict):
        return {str(k): __snapshot(x, depth + 1) for k, x in list(v.items())[:limit]}
    # deque, heap-подобные и другие итерируемые учебные структуры
    if type(v).__name__ == "deque":
        return [__snapshot(x, depth + 1) for x in list(v)[:limit]]
    return __safe(v)

def __visible(items):
    return {
        k: v for k, v in items
        if not k.startswith("__") and type(v).__name__ != "module"
    }

def __capture(frame):
    local_values = __visible(frame.f_locals.items())
    # Внутри функции алгоритма важные структуры (memo, dist, graph) часто
    # глобальные. Локальные значения имеют приоритет над глобальными.
    scope_values = __visible(frame.f_globals.items())
    scope_values.update(local_values)
    loc = {k: __safe(v) for k, v in local_values.items()}
    values = {k: __snapshot(v) for k, v in scope_values.items()}
    return loc, values

def __tracer(frame, event, arg):
    global __was_truncated
    if event == "line" and frame.f_code.co_filename == "<user-code>" \
            and not (frame.f_code.co_name.startswith("<") and frame.f_code.co_name != "<module>"):
        loc, values = __capture(frame)
        # PEP 709: с 3.12 компрехеншны встроены во фрейм модуля и шлют событие
        # на своей строке каждую итерацию. Склеиваем подряд идущие повторы.
        if __steps and __steps[-1]["line"] == frame.f_lineno and __steps[-1]["func"] == frame.f_code.co_name:
            __steps[-1]["locals"] = loc
            __steps[-1]["values"] = values
        else:
            __steps.append({"line": frame.f_lineno, "func": frame.f_code.co_name, "locals": loc, "values": values})
        if len(__steps) >= __CAP:
            # Нельзя просто отключить trace: бесконечный пользовательский цикл
            # тогда продолжит работать вечно. Мягко прерываем только этот запуск.
            __was_truncated = True
            raise __TraceLimit()
    # Финальные локали программы (после последней строки новых событий не будет).
    if event == "return" and frame.f_code.co_filename == "<user-code>" and frame.f_code.co_name == "<module>":
        loc, values = __capture(frame)
        __final.update(loc)
        __final_values.update(values)
    return __tracer

__err = ""
try:
    __sys.settrace(__tracer)
    exec(compile(__src, "<user-code>", "exec"), {"__name__": "__main__"})
except __TraceLimit:
    pass
except Exception:
    import traceback as __tb
    __err = __tb.format_exc(limit=3)
finally:
    __sys.settrace(None)

__OUT = __json.dumps({
    "steps": __steps,
    "finalLocals": __final,
    "finalValues": __final_values,
    "error": __err,
    "truncated": __was_truncated,
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
