import { useCallback, useEffect, useMemo, useState } from "react";
import { chapters } from "./data/content";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { MobileToc } from "./components/MobileToc";
import { ChapterView } from "./components/ChapterView";
import { ChapterNav } from "./components/ChapterNav";
import { PythonCompiler } from "./components/PythonCompiler";
import { SideCompilerDrawer } from "./components/SideCompilerDrawer";
import { CompilerPanelContent } from "./components/CompilerPanelContent";
import { Terminal } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"guide" | "compiler">("guide");
  const [activeChapterId, setActiveChapterId] = useState<string>(chapters[0].id);
  const [sideOpen, setSideOpen] = useState(false);

  const index = Math.max(0, chapters.findIndex((c) => c.id === activeChapterId));
  const activeChapter = chapters[index] ?? chapters[0];
  const prev = index > 0 ? chapters[index - 1] : undefined;
  const next = index < chapters.length - 1 ? chapters[index + 1] : undefined;

  const goTo = useCallback((id: string) => {
    setActiveChapterId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    setSideOpen(false);
  }, [activeChapterId, activeTab]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (sideOpen) return;
      if (e.key === "ArrowRight" && next) goTo(next.id);
      if (e.key === "ArrowLeft" && prev) goTo(prev.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, next, prev, sideOpen]);

  const progress = useMemo(() => ((index + 1) / chapters.length) * 100, [index]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

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
            <div className="hidden lg:block lg:w-80 shrink-0 border-r border-slate-800 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]">
              <Sidebar selectedChapterId={activeChapterId} setSelectedChapterId={goTo} />
            </div>

            <div className={`flex flex-1 min-w-0 w-full ${sideOpen ? "flex-col lg:flex-row" : ""}`}>
              <main id="main-content" className={`flex-1 min-w-0 w-full mx-auto px-4 sm:px-6 lg:px-10 py-5 lg:py-8 ${sideOpen ? "lg:w-1/2 lg:max-w-none lg:border-r lg:border-slate-800" : "max-w-4xl"}`}>
                <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
                      {activeChapter.category || "Универсальное пособие"}
                    </div>
                    <h2 className="text-base sm:text-xl font-extrabold text-white leading-tight truncate">{activeChapter.title}</h2>
                  </div>
                  <ChapterNav prev={prev} next={next} index={index} total={chapters.length} onGo={goTo} compact />
                </div>

                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>

                <ChapterView
                  key={activeChapter.id}
                  chapter={activeChapter}
                  prev={prev}
                  next={next}
                  index={index}
                  total={chapters.length}
                  onGo={goTo}
                  onOpenCompiler={() => setSideOpen(true)}
                />
              </main>

              {sideOpen && (
                <aside className="w-full lg:w-1/2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
                  <CompilerPanelContent
                    chapterId={activeChapter.id}
                    onClose={() => setSideOpen(false)}
                    onOpenFull={() => {
                      setSideOpen(false);
                      setActiveTab("compiler");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </aside>
              )}
            </div>

            {!sideOpen && (
              <div className="hidden xl:flex fixed right-0 top-1/2 -translate-y-1/2 z-40">
                <button
                  onClick={() => setSideOpen(true)}
                  className="writing-vertical bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-6 rounded-l-xl shadow-xl shadow-emerald-900/30 flex flex-col items-center gap-2 transition-colors border-y border-l border-emerald-500"
                  style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                  title="Открыть компилятор 50/50 — слева демо, справа код"
                >
                  <Terminal className="w-4 h-4 rotate-90" />
                  <span className="tracking-widest">КОМПИЛЯТОР</span>
                  <span className="text-[10px] opacity-80">50/50</span>
                </button>
              </div>
            )}
          </div>

          {!sideOpen && (
            <button
              onClick={() => setSideOpen(true)}
              className="lg:hidden fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-xl shadow-emerald-900/30 transition-colors"
              title="Открыть компилятор"
            >
              <Terminal className="w-6 h-6" />
            </button>
          )}

          <div className="lg:hidden">
            <SideCompilerDrawer
              chapterId={activeChapter.id}
              open={sideOpen}
              onClose={() => setSideOpen(false)}
              onOpenFull={() => {
                setSideOpen(false);
                setActiveTab("compiler");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </>
      ) : (
        <PythonCompiler chapterId={activeChapter.id} />
      )}

      <footer className="p-8 text-center text-slate-600 text-xs border-t border-slate-900 mt-12 bg-slate-950">
        © 2026 Universal Educational Guide. Интерактивные визуализации алгоритмов.
      </footer>
    </div>
  );
}
