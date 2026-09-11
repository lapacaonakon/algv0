import { useEffect } from "react";

/**
 * Хелпер для синхронизации визуализации с боковым компилятором.
 * Хардкод i,k,j,n,m — визуализация пушит текущие значения,
 * а SideCompilerDrawer их ловит и подсвечивает.
 *
 * Использование в компоненте визуализации:
 *   useVizSync(chapterId, { n, m, i, j, k })
 *
 * Или событие: window.dispatchEvent(new CustomEvent('viz:sync', {detail:{chapterId, vars:{...}}}))
 */
export function useVizSync(
  chapterId: string,
  vars: Record<string, string | number | null | undefined>,
  line?: number
) {
  useEffect(() => {
    const clean: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(vars)) {
      if (v !== null && v !== undefined && v !== "") clean[k] = v as string | number;
    }
    // @ts-ignore
    window.__liveVizVars = clean;
    // @ts-ignore
    if (typeof window !== "undefined" && (window as unknown as { __compilerSyncHook?: (v: Record<string, string | number>) => void }).__compilerSyncHook) {
      try {
        (window as unknown as { __compilerSyncHook: (v: Record<string, string | number>) => void }).__compilerSyncHook(clean);
      } catch {}
    }
    window.dispatchEvent(
      new CustomEvent("viz:sync", {
        detail: { chapterId, vars: clean, line },
      })
    );
  }, [chapterId, JSON.stringify(vars), line]);
}
