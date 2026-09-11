import { useEffect } from "react";

type Action = "step" | "play" | "pause" | "reset" | "prev";

/**
 * Позволяет боковой панели управлять демо: Шаг, Пуск, Пауза, Сброс.
 * Визуализация подписывается: useVizControl(chapterId, { onStep, onPlay, onPause, onReset })
 */
export function useVizControl(
  chapterId: string,
  handlers: {
    onStep?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onReset?: () => void;
    onPrev?: () => void;
  }
) {
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (!d) return;
      if (d.chapterId && d.chapterId !== chapterId) return;
      const action: Action = d.action;
      if (action === "step") handlers.onStep?.();
      else if (action === "play") handlers.onPlay?.();
      else if (action === "pause") handlers.onPause?.();
      else if (action === "reset") handlers.onReset?.();
      else if (action === "prev") handlers.onPrev?.();
    };
    window.addEventListener("viz:control", h as EventListener);
    return () => window.removeEventListener("viz:control", h as EventListener);
  }, [chapterId, handlers.onStep, handlers.onPlay, handlers.onPause, handlers.onReset, handlers.onPrev]);
}
