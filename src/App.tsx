import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { chapters } from "./data/content";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { MobileToc } from "./components/MobileToc";
import { ChapterView } from "./components/ChapterView";
import { ChapterNav } from "./components/ChapterNav";
import { SimulatorModal } from "./components/hints/SimulatorModal";
import { SimulatorHub } from "./components/SimulatorHub";
import { PythonCompiler } from "./components/PythonCompiler";

export default function App() {
  const [activeTab, setActiveTab] = useState<"guide" | "simulator">("guide");
  const [activeChapterId, setActiveChapterId] = useState<string>(chapters[0].id);
  const [modalVizId, setModalVizId] = useState<string | null>(null);
  /** Боковая (на мобильном — нижняя) панель компилятора поверх текущей страницы. */
  const [compilerOpen, setCompilerOpen] = useState(false);
  /** Ширина панели компилятора (deсктоп), растягивается ручкой — запоминаем. */
  const [compilerWidth, setCompilerWidth] = useState<number>(() => {
    const cached = typeof window !== "undefined" ? Number(window.localStorage.getItem("compilerWidth")) : NaN;
    return Number.isFinite(cached) && cached >= 380 ? cached : 560;
  });
  useEffect(() => {
    window.localStorage.setItem("compilerWidth", String(compilerWidth));
  }, [compilerWidth]);
  /** Высота терминала: null оставляет адаптивную высоту по умолчанию. */
  const [compilerHeight, setCompilerHeight] = useState<number | null>(() => {
    const cached = typeof window !== "undefined" ? Number(window.localStorage.getItem("compilerHeight")) : NaN;
    return Number.isFinite(cached) && cached >= 260 ? cached : null;
  });
  useEffect(() => {
    if (compilerHeight !== null) window.localStorage.setItem("compilerHeight", String(compilerHeight));
  }, [compilerHeight]);
  /** Содержание свернуто (по умолчанию сворачиваем само, если места мало). */
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const cached = typeof window !== "undefined" ? window.localStorage.getItem("sidebarCollapsed") : null;
    if (cached !== null) return cached === "1";
    return typeof window !== "undefined" && window.innerWidth < 1440;
  });
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((c) => {
      window.localStorage.setItem("sidebarCollapsed", c ? "0" : "1");
      return !c;
    });
  }, []);

  // Десктопный отступ контента = ширине панели компилятора; следим и за ресайзом окна.
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const apply = () => {
      const el = contentRef.current;
      if (!el) return;
      el.style.paddingRight = compilerOpen && window.innerWidth >= 1024 ? `${compilerWidth}px` : "";
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [compilerOpen, compilerWidth]);

  const index = Math.max(
    0,
    chapters.findIndex((c) => c.id === activeChapterId)
  );
  const activeChapter = chapters[index] ?? chapters[0];
  const prev = index > 0 ? chapters[index - 1] : undefined;
  const next = index < chapters.length - 1 ? chapters[index + 1] : undefined;

  const goTo = useCallback((id: string) => {
    setActiveChapterId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Открыть компилятор и подогнать визуализацию вверх: видим только её и код.
  const openCompilerWithViz = useCallback(() => {
    setCompilerOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById("chapter-viz")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }, []);

  // Стрелки ← → листают темы (как на обучающих сайтах)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight" && next) goTo(next.id);
      if (e.key === "ArrowLeft" && prev) goTo(prev.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, next, prev]);

  const progress = useMemo(() => ((index + 1) / chapters.length) * 100, [index]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        compilerOpen={compilerOpen}
        onToggleCompiler={() => setCompilerOpen((o) => !o)}
      />

      {/* При открытой панели контент сдвигается: снизу отступ на мобильном, справа — на десктопе */}
      <div ref={contentRef} className={compilerOpen ? "max-lg:pb-[58dvh]" : ""}>
        {activeTab === "guide" ? (
          <>
            <MobileToc
              selectedChapterId={activeChapterId}
              setSelectedChapterId={goTo}
              currentTitle={activeChapter.title}
              index={index}
              total={chapters.length}
            />

            <div className="flex flex-col lg:flex-row max-w-screen-2xl mx-auto items-start">
              {/* Сайдбар только на десктопе — на мобильном он в шторке; сворачивается, когда тесно */}
              <div
                className={`hidden lg:block shrink-0 border-r border-slate-800 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] relative transition-all duration-200 ${sidebarCollapsed ? "lg:w-0 overflow-hidden border-r-0" : "lg:w-80"}`}
              >
                {!sidebarCollapsed && <Sidebar selectedChapterId={activeChapterId} setSelectedChapterId={goTo} />}
              </div>
              {/* Вкладка-переключатель содержания у левого края */}
              <button
                type="button"
                onClick={toggleSidebar}
                className="hidden lg:flex items-center gap-1 sticky top-20 self-start -ml-0 mr-2 z-30 shrink-0 rounded-r-lg border border-l-0 border-slate-700 bg-slate-900/90 px-1 py-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label={sidebarCollapsed ? "Развернуть содержание" : "Свернуть содержание"}
                title={sidebarCollapsed ? "Развернуть содержание" : "Свернуть содержание"}
              >
                {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                <span className="text-[10px] font-bold [writing-mode:vertical-rl] rotate-180">содержание</span>
              </button>

              <main id="main-content" className="flex-1 min-w-0 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-5 lg:py-8">
                {/* Шапка главы с быстрыми переходами */}
                <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
                      {activeChapter.category || "Универсальное пособие"}
                    </div>
                    <h2 className="text-base sm:text-xl font-extrabold text-white leading-tight truncate">
                      {activeChapter.title}
                    </h2>
                  </div>
                  <ChapterNav prev={prev} next={next} index={index} total={chapters.length} onGo={goTo} compact />
                </div>

                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <ChapterView
                  key={activeChapter.id}
                  chapter={activeChapter}
                  prev={prev}
                  next={next}
                  index={index}
                  total={chapters.length}
                  onGo={goTo}
                  onOpenSimulator={setModalVizId}
                  onOpenCompiler={openCompilerWithViz}
                />
              </main>
            </div>
          </>
        ) : (
          <main className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-screen-2xl mx-auto">
            <SimulatorHub
              onOpen={setModalVizId}
              onGoChapter={(id) => {
                setActiveTab("guide");
                goTo(id);
              }}
            />
          </main>
        )}

        <footer className="p-8 text-center text-slate-600 text-xs border-t border-slate-900 mt-12 bg-slate-950">
          © 2026 Universal Educational Guide. Интерактивные визуализации алгоритмов.
        </footer>
      </div>

      <SimulatorModal vizId={modalVizId} onClose={() => setModalVizId(null)} />

      {compilerOpen && (
        <PythonCompiler
          chapterId={activeChapter.id}
          chapterTitle={activeChapter.title}
          width={compilerWidth}
          height={compilerHeight}
          onWidthChange={setCompilerWidth}
          onHeightChange={setCompilerHeight}
          onOpenGuide={() => setActiveTab("guide")}
          onClose={() => setCompilerOpen(false)}
        />
      )}
    </div>
  );
}
