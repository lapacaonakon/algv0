import { createContext, useContext, useEffect, useState } from "react";
import type { DebugValue } from "./debugRunner";

/**
 * Прямая связь «компилятор ↔ открытая визуализация».
 *
 * Компилятор передаёт не «магический номер строки эталона», а снимок реально
 * выполненного Python-кода. Визуализация читает захардкоженные учебные имена
 * (i, j, k, v, dist, P, st…) и подсвечивает соответствующий объект. Поэтому
 * любой пользовательский код работает, если в нём используются имена темы.
 */

export const VizChapterContext = createContext("");

const CHANNEL = "algo:viz-state";

export interface VizStateEventDetail {
  chapterId: string;
  /** Строка и функция реально выполненного пользовательского кода. */
  line?: number;
  func?: string;
  /** Машинно-читаемые globals + locals: числа остаются числами, массивы — массивами. */
  variables?: Record<string, DebugValue>;
  /** Имена, изменённые выделенной строкой. */
  changed?: string[];
}

/** Последний снимок хранится, чтобы поздно смонтированная вкладка тоже сразу его увидела. */
const latestByChapter = new Map<string, VizStateEventDetail>();

/** Транслировать реальные переменные визуализациям текущей главы. */
export function emitVizState(
  chapterId: string,
  snapshot: Omit<VizStateEventDetail, "chapterId">
) {
  if (typeof window === "undefined") return;
  const detail: VizStateEventDetail = { chapterId, ...snapshot };
  latestByChapter.set(chapterId, detail);
  window.dispatchEvent(new window.CustomEvent<VizStateEventDetail>(CHANNEL, { detail }));
}

/** Вернуть демонстрацию в ручной режим при закрытии/редактировании компилятора. */
export function clearVizState(chapterId: string) {
  if (typeof window === "undefined") return;
  latestByChapter.delete(chapterId);
  window.dispatchEvent(new window.CustomEvent<VizStateEventDetail>(CHANNEL, { detail: { chapterId } }));
}

/** Текущий снимок компилятора для прямой отрисовки массивов/индексов. */
export function useVizRuntime(): VizStateEventDetail | null {
  const chapterId = useContext(VizChapterContext);
  const [runtime, setRuntime] = useState<VizStateEventDetail | null>(() =>
    chapterId ? latestByChapter.get(chapterId) ?? null : null
  );

  useEffect(() => {
    setRuntime(chapterId ? latestByChapter.get(chapterId) ?? null : null);
    if (!chapterId) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<VizStateEventDetail>).detail;
      if (detail?.chapterId === chapterId) {
        setRuntime(detail.variables || detail.line !== undefined ? detail : null);
      }
    };
    window.addEventListener(CHANNEL, handler);
    return () => window.removeEventListener(CHANNEL, handler);
  }, [chapterId]);

  return runtime;
}

export type VizStepSelector = (variables: Record<string, DebugValue>) => number | null;

/**
 * Подписка старых покадровых демонстраций. Если передан selectByVariables,
 * номер кадра выбирается по именам/значениям переменных, а не по позиции строки.
 */
export function useVizStepSync(
  currentStep: number,
  goToStep: (n: number) => void,
  maxStep: number,
  selectByVariables?: VizStepSelector
) {
  const chapterId = useContext(VizChapterContext);

  useEffect(() => {
    if (!chapterId) return;

    const apply = (detail?: VizStateEventDetail) => {
      if (!detail || detail.chapterId !== chapterId) return;
      // Без явного селектора компонент либо рисует useVizRuntime() напрямую,
      // либо остаётся ручным. Номер Python-строки никогда не становится кадром.
      const requested =
        selectByVariables && detail.variables ? selectByVariables(detail.variables) : null;
      // null означает: компонент рисует runtime-переменные напрямую или пока
      // не увидел знакомых захардкоженных имён.
      if (requested === null || !Number.isFinite(requested)) return;
      const target = Math.max(0, Math.min(Math.max(0, maxStep), requested));
      if (target !== currentStep) goToStep(target);
    };

    apply(latestByChapter.get(chapterId));
    const handler = (e: Event) => apply((e as CustomEvent<VizStateEventDetail>).detail);
    window.addEventListener(CHANNEL, handler);
    return () => window.removeEventListener(CHANNEL, handler);
  }, [chapterId, currentStep, maxStep, goToStep, selectByVariables]);
}

/** Утилиты без небезопасных cast-ов для визуализаторов. */
export const vizNumber = (value: DebugValue | undefined): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export const vizString = (value: DebugValue | undefined): string | null =>
  typeof value === "string" ? value : null;

export const vizArray = (value: DebugValue | undefined): DebugValue[] | null =>
  Array.isArray(value) ? value : null;

export const vizRecord = (value: DebugValue | undefined): Record<string, DebugValue> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, DebugValue>)
    : null;

/* ── Выбор демонстрации внутри страницы (вкладки 1D / 2D build / 2D query) ─ */

const DEMO_CHANNEL = "algo:viz-demo";
const latestDemoByChapter = new Map<string, string>();

export interface VizDemoEventDetail {
  chapterId: string;
  /** base-запись страницы — demoId пустой; подписанные демо: "2d-build" и т.п. */
  demoId: string;
}

/** Демонстрация сообщает, какая её вкладка сейчас открыта (код компилятора следует за ней). */
export function emitVizDemo(chapterId: string, demoId: string) {
  if (typeof window === "undefined") return;
  latestDemoByChapter.set(chapterId, demoId);
  window.dispatchEvent(new window.CustomEvent<VizDemoEventDetail>(DEMO_CHANNEL, { detail: { chapterId, demoId } }));
}

/**
 * Подписка: панель компилятора следует за активной вкладкой демонстрации.
 * Сразу отдаём последнее значение: компилятор часто открывают уже ПОСЛЕ того,
 * как пользователь переключился с 1D на 2D.
 */
export function onVizDemo(chapterId: string, cb: (demoId: string) => void) {
  if (typeof window === "undefined") return () => {};
  const latest = latestDemoByChapter.get(chapterId);
  if (latest !== undefined) cb(latest);
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<VizDemoEventDetail>).detail;
    if (detail && detail.chapterId === chapterId) cb(detail.demoId);
  };
  window.addEventListener(DEMO_CHANNEL, handler);
  return () => window.removeEventListener(DEMO_CHANNEL, handler);
}
