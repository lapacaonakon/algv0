import { createContext, useContext, useEffect } from "react";

/**
 * Связь «компилятор ↔ открытая визуализация».
 *
 * Панель компилятора в режиме пошагового отладчика транслирует номер
 * текущего шага трассы вместе с id текущей главы; пошаговые демонстрации
 * главы (через useVizStepSync) подхватывают его и прыгают на тот же шаг —
 * визуализация идёт в ногу с листингом (каждая исполняемая строка шаблона
 * = очередной шаг подсветки, см. vizSync.ts).
 */

export const VizChapterContext = createContext("");

const CHANNEL = "algo:viz-step";

export interface VizStepEventDetail {
  chapterId: string;
  step: number;
}

/** Транслировать текущий шаг отладчика визуализациям текущей главы. */
export function emitVizStep(chapterId: string, step: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new window.CustomEvent<VizStepEventDetail>(CHANNEL, { detail: { chapterId, step } }));
}

/**
 * Подписка визуализации на шаги отладчика.
 * Вызывается внутри компонента демонстрации:
 *   useVizStepSync(currentStep, setCurrentStep, steps.length - 1);
 */
export function useVizStepSync(currentStep: number, goToStep: (n: number) => void, maxStep: number) {
  const chapterId = useContext(VizChapterContext);

  useEffect(() => {
    if (!chapterId) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<VizStepEventDetail>).detail;
      if (!detail || detail.chapterId !== chapterId) return;
      const target = Math.max(0, Math.min(maxStep, detail.step));
      if (target !== currentStep) goToStep(target);
    };
    window.addEventListener(CHANNEL, handler);
    return () => window.removeEventListener(CHANNEL, handler);
  }, [chapterId, currentStep, maxStep, goToStep]);
}
