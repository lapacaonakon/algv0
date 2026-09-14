/**
 * Зонд состояния панели Python во времени: что происходит после ввода кода.
 * Запуск: node tmp/harness/run-probe.mjs
 */
import { act } from "react";
import { createRoot } from "react-dom/client";
import App from "../../src/App";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function settle(ms = 40) {
  await act(async () => {
    await sleep(ms);
  });
}
function panel(): HTMLElement | null {
  return document.querySelector<HTMLElement>('aside[aria-label="Python-компилятор"]');
}
function editor(): HTMLTextAreaElement | undefined {
  return panel()?.querySelector<HTMLTextAreaElement>("textarea") ?? undefined;
}
function footer(): string {
  const divs = Array.from(panel()?.querySelectorAll("div") ?? []);
  const f = divs.find((d) => d.className.includes("text-slate-500") && d.className.includes("truncate"));
  return (f?.textContent ?? "").replace(/\s+/g, " ").slice(0, 130);
}
function state(tag: string) {
  const p = panel();
  const ed = editor();
  const txt = (p?.textContent ?? "").replace(/\s+/g, " ");
  const step = txt.match(/шаг[^ ]*\s*\d+\s*\/\s*\d+/i) ?? txt.match(/(\d+)\s*\/\s*(\d+)/);
  process.stdout.write(
    `  [${tag.padEnd(9)}] редактор: ${ed ? "ДА" : "нет (листинг)"} | значение: ${JSON.stringify((ed?.value ?? "").slice(0, 46))} | шаг: ${step ? step[0] : "—"} | футер: ${footer()}\n`
  );
  process.stdout.write(`             бейдж страницы: ${/данные из компилятора/.test(document.body.textContent ?? "") ? "из компилятора" : /встроенное демо/.test(document.body.textContent ?? "") ? "встроенное демо" : "—"}\n`);
}
function typeInto(ta: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set!;
  act(() => {
    setter.call(ta, value);
    ta.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
}
async function click(el: Element | null | undefined, label: string) {
  if (!el) throw new Error(`нет кнопки: ${label}`);
  await act(async () => {
    el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    await sleep(20);
  });
}
function findButton(match: RegExp): HTMLButtonElement | undefined {
  return Array.from(document.querySelectorAll("button")).find((b) =>
    match.test([b.getAttribute("aria-label"), b.getAttribute("title"), b.textContent].filter(Boolean).join(" | "))
  ) as HTMLButtonElement | undefined;
}

export async function probe() {
  const host = document.createElement("div");
  document.body.appendChild(host);
  window.history.replaceState({}, "", "/?topic=dijkstra");
  const root = createRoot(host);
  await act(async () => {
    root.render(<App />);
  });
  await settle(80);

  process.stdout.write("\n=== 1. открыли панель, ждём автозапуск инициализации ===\n");
  await click(findButton(/Боковая панель Python/), "панель");
  state("t=0");
  for (const t of [300, 1000, 3000, 8000]) {
    await settle(t - (t === 300 ? 0 : 0));
    state(`t+${t}`);
    if (/Трасса готова|Нет шагов|Пустой код|Ошибка/.test(footer())) break;
  }

  process.stdout.write("\n=== 2. вводим код ТОЛЬКО с комментариями ===\n");
  const ed = editor();
  if (!ed) {
    process.stdout.write("  редактора нет — жмём Esc и пробуем снова\n");
    await act(async () => {
      document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await sleep(30);
    });
  }
  const ed2 = editor();
  if (!ed2) throw new Error("редактор так и не появился");
  typeInto(ed2, "# только комментарий\n# и ещё\n");
  state("ввели");
  for (const t of [200, 800, 2000, 6000]) {
    await settle(t);
    state(`t+${t}`);
  }

  process.stdout.write("\n=== 3. вводим рабочий код x=41; x+=1; print(x) ===\n");
  const ed3 = editor();
  if (!ed3) throw new Error("редактор пропал после комментариев");
  typeInto(ed3, "x = 41\nx += 1\nprint(x)\n");
  state("ввели");
  for (const t of [200, 800, 2000, 6000]) {
    await settle(t);
    state(`t+${t}`);
  }

  process.stdout.write("\n=== 4. очищаем редактор полностью ===\n");
  const ed4 = editor();
  if (ed4) {
    typeInto(ed4, "");
    state("очистили");
    for (const t of [200, 800, 2000]) {
      await settle(t);
      state(`t+${t}`);
    }
  } else {
    process.stdout.write("  редактора нет (листинг) — жмём Esc\n");
    await act(async () => {
      document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await sleep(30);
    });
    state("после Esc");
  }
}
