/**
 * Браузерное окружение для проверок: jsdom + те API, которых в нём нет.
 * Создаётся ПОСЛЕ загрузки Pyodide (иначе pyodide решит, что он в браузере).
 */
import { JSDOM, VirtualConsole } from "jsdom";

const OBSERVER_STUB = class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};

export function createDom({ url = "http://localhost/?topic=segment-trees", onError } = {}) {
  const virtualConsole = new VirtualConsole();
  const jsdomErrors = [];
  virtualConsole.on("jsdomError", (error) => {
    jsdomErrors.push(error?.message || String(error));
    onError?.(error);
  });
  // console.error/warn приложения собираем отдельно — это детектор багов React
  const consoleErrors = [];
  virtualConsole.on("error", (...args) => consoleErrors.push(args.map(String).join(" ")));
  virtualConsole.on("warn", () => {});

  const dom = new JSDOM(
    `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>har</title></head>
     <body><div id="root"></div></body></html>`,
    { url, pretendToBeVisual: true, runScripts: "outside-only", virtualConsole }
  );
  const { window } = dom;

  window.ResizeObserver = window.ResizeObserver ?? OBSERVER_STUB;
  window.IntersectionObserver = window.IntersectionObserver ?? OBSERVER_STUB;
  window.matchMedia =
    window.matchMedia ??
    ((media) => ({
      matches: false,
      media,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent: () => false,
    }));
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.HTMLElement.prototype.focus = window.HTMLElement.prototype.focus ?? function () {};
  window.URL.createObjectURL = window.URL.createObjectURL ?? (() => "blob:stub");
  window.URL.revokeObjectURL = window.URL.revokeObjectURL ?? (() => {});
  Object.defineProperty(window, "innerWidth", { value: 1600, configurable: true, writable: true });
  Object.defineProperty(window, "innerHeight", { value: 1000, configurable: true, writable: true });
  Object.defineProperty(window, "devicePixelRatio", { value: 1, configurable: true, writable: true });
  window.Element.prototype.getBoundingClientRect = function () {
    return { x: 0, y: 0, top: 0, left: 0, right: 400, bottom: 200, width: 400, height: 200, toJSON() {} };
  };

  const copy = [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "HTMLInputElement",
    "HTMLTextAreaElement",
    "HTMLButtonElement",
    "HTMLAnchorElement",
    "HTMLDivElement",
    "HTMLSelectElement",
    "Element",
    "Node",
    "Event",
    "CustomEvent",
    "MouseEvent",
    "KeyboardEvent",
    "InputEvent",
    "getComputedStyle",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "DOMParser",
    "SVGElement",
    "Text",
    "DocumentFragment",
    "NodeList",
    "HTMLCollection",
    "Range",
    "MutationObserver",
    "localStorage",
    "sessionStorage",
    "Blob",
    "File",
    "FileReader",
  ];
  for (const key of copy) {
    try {
      Object.defineProperty(globalThis, key, { value: window[key], configurable: true, writable: true });
    } catch {
      /* read-only в Node — не критично */
    }
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  return { dom, window, document: window.document, consoleErrors, jsdomErrors };
}
