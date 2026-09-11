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

/**
 * Перевод индекса шага трассы в номер шага визуализации ПО СОДЕРЖИМУ строк.
 * Номер шага = сколько раз к этому моменту выполнилась «помеченная» строка
 * (`markedContents`, нормализовано trim) минус один — каждое срабатывание
 * помеченной строки = очередной шаг демонстрации. Работает и для эталонного
 * шаблона, и для кода, написанного руками: совпадающие по смыслу строки двигают
 * демонстрацию, остальные — нет. Пустое множество — грубое приближение (idx).
 */
export function vizStepForTrace(
  steps: ReadonlyArray<{ line: number }>,
  idx: number,
  srcLines: readonly string[],
  markedContents?: ReadonlySet<string>
): number {
  if (!markedContents || markedContents.size === 0) return idx;
  let hits = 0;
  for (let t = 0; t <= idx && t < steps.length; t++) {
    const content = srcLines[steps[t].line - 1];
    if (content !== undefined && markedContents.has(content.trim())) hits++;
  }
  return Math.max(0, hits - 1);
}

/** Сколько шаговых («помеченных») строк успело выполниться к индексу трассы. */
export function vizHitsAtTrace(
  steps: ReadonlyArray<{ line: number }>,
  idx: number,
  srcLines: readonly string[],
  markedContents: ReadonlySet<string>
): number {
  let hits = 0;
  for (let t = 0; t <= idx && t < steps.length; t++) {
    const content = srcLines[steps[t].line - 1];
    if (content !== undefined && markedContents.has(content.trim())) hits++;
  }
  return hits;
}

/* ── Выбор демонстрации внутри страницы (вкладки 1D / 2D build / 2D query) ─ */

const DEMO_CHANNEL = "algo:viz-demo";

export interface VizDemoEventDetail {
  chapterId: string;
  /** base-запись страницы — demoId пустой; подписанные демо: "2d-build" и т.п. */
  demoId: string;
}

/** Демонстрация сообщает, какая её вкладка сейчас открыта (код компилятора следует за ней). */
export function emitVizDemo(chapterId: string, demoId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new window.CustomEvent<VizDemoEventDetail>(DEMO_CHANNEL, { detail: { chapterId, demoId } }));
}

/** Подписка: панель компилятора следует за активной вкладкой демонстрации страницы. */
export function onVizDemo(chapterId: string, cb: (demoId: string) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<VizDemoEventDetail>).detail;
    if (detail && detail.chapterId === chapterId) cb(detail.demoId);
  };
  window.addEventListener(DEMO_CHANNEL, handler);
  return () => window.removeEventListener(DEMO_CHANNEL, handler);
}
