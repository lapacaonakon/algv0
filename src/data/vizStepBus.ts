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

/* ── Матрицы из компилятора: СВОЯ размерность, а не демо-сетка ────────────── */

/**
 * Нормализованная матрица, пришедшая из выполненного Python-кода.
 *
 * Размерность берётся из самих данных: если пользователь написал граф на 5
 * вершин, визуализация рисует 5×5, а не подставляет его числа в демо-сетку
 * 7×7 (раньше ячейки «не той» размерности превращались в null/мусор).
 *
 * Поддерживаются все учебные способы хранения:
 *   list[list]        d = [[0, 4], [999, 0]]
 *   list[dict]        d = [{0: 0, 1: 4}, {1: 0}]
 *   dict[dict]        d = {0: {0: 0, 1: 4}}
 *   dict[(i, j)]      d = {(0, 1): 4}   — ключ после repr выглядит как "(0, 1)"
 */
export interface LiveMatrix {
  rows: number;
  cols: number;
  /** Значение ячейки; null — таких данных в коде пользователя нет. */
  at: (i: number, j: number) => number | null;
  /** Подпись размера для бейджа связи: «5×5». */
  sizeLabel: string;
  /** true, если хотя бы одна ячейка — число. */
  hasNumbers: boolean;
}

const MAX_MATRIX_SIDE = 64;

const toCellNumber = (value: DebugValue | undefined): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  // float("inf") снапшотится строкой "inf" — показываем как ∞ большим числом
  if (typeof value === "string") {
    const t = value.trim().toLowerCase();
    if (t === "inf" || t === "+inf" || t === "infinity") return Number.POSITIVE_INFINITY;
    if (t === "-inf" || t === "-infinity") return Number.NEGATIVE_INFINITY;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

/** Ключ-пара вида "(0, 3)" или "0, 3" → [0, 3]. */
const parsePairKey = (key: string): [number, number] | null => {
  const m = key.match(/^\(?\s*(-?\d+)\s*,\s*(-?\d+)\s*\)?$/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2])];
};

export function liveMatrix(value: DebugValue | undefined): LiveMatrix | null {
  if (value === undefined || value === null) return null;

  const cells = new Map<string, number>();
  let rows = 0;
  let cols = 0;
  const put = (i: number, j: number, v: DebugValue | undefined) => {
    if (!Number.isInteger(i) || !Number.isInteger(j) || i < 0 || j < 0) return;
    if (i >= MAX_MATRIX_SIDE || j >= MAX_MATRIX_SIDE) return;
    const n = toCellNumber(v);
    if (n === null) return;
    cells.set(`${i}:${j}`, n);
    rows = Math.max(rows, i + 1);
    cols = Math.max(cols, j + 1);
  };

  const asArray = vizArray(value);
  if (asArray) {
    asArray.slice(0, MAX_MATRIX_SIDE).forEach((row, i) => {
      const inner = vizArray(row);
      if (inner) {
        inner.slice(0, MAX_MATRIX_SIDE).forEach((cell, j) => put(i, j, cell));
        return;
      }
      const record = vizRecord(row);
      if (record) {
        for (const [key, cell] of Object.entries(record)) {
          const j = Number(key);
          if (Number.isInteger(j)) put(i, j, cell);
        }
      }
    });
  } else {
    const record = vizRecord(value);
    if (!record) return null;
    for (const [key, cell] of Object.entries(record)) {
      const pair = parsePairKey(key);
      if (pair) {
        put(pair[0], pair[1], cell);
        continue;
      }
      const i = Number(key);
      if (!Number.isInteger(i)) continue;
      const inner = vizArray(cell);
      if (inner) {
        inner.slice(0, MAX_MATRIX_SIDE).forEach((v, j) => put(i, j, v));
        continue;
      }
      const innerRecord = vizRecord(cell);
      if (innerRecord) {
        for (const [k2, v2] of Object.entries(innerRecord)) {
          const j = Number(k2);
          if (Number.isInteger(j)) put(i, j, v2);
        }
      }
    }
  }

  if (rows === 0 || cols === 0) return null;
  return {
    rows,
    cols,
    at: (i, j) => (i >= 0 && j >= 0 && i < rows && j < cols ? cells.get(`${i}:${j}`) ?? null : null),
    sizeLabel: `${rows}×${cols}`,
    hasNumbers: cells.size > 0,
  };
}

/** Первое имя из списка, которое реально есть в снимке переменных. */
export function pickLiveVar(
  vars: Record<string, DebugValue> | undefined,
  names: string[]
): { name: string; value: DebugValue } | null {
  if (!vars) return null;
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(vars, name)) return { name, value: vars[name] };
  }
  return null;
}

/** Индекс, ограниченный реальной размерностью данных пользователя. */
export const clampIndex = (value: number | null, size: number): number | null =>
  value === null || !Number.isFinite(value) || size <= 0
    ? null
    : Math.max(0, Math.min(size - 1, Math.trunc(value)));

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
