import React, { useMemo, useState } from "react";
import { ChevronRight, Compass, Search, Sparkles, X } from "lucide-react";
import { chapters, SECTIONS, sectionOf } from "../data/content";
import { VIZ_REGISTRY } from "./vizRegistry";

interface SidebarProps {
  selectedChapterId: string;
  setSelectedChapterId: (id: string) => void;
  /** Мобильный режим: список живёт в выдвижной панели и закрывается после выбора. */
  onNavigate?: () => void;
  /** Узкий режим: номер билета и название в одну строку, без поиска и подсказок. */
  compact?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ selectedChapterId, setSelectedChapterId, onNavigate, compact }) => {
  const [query, setQuery] = useState("");

  /**
   * Группы — это разделы пособия (SECTIONS), а не случайные `category`:
   * связанные темы стоят рядом, порядок разделов не зависит от того, какая
   * страница встретилась первой.
   */
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? chapters.filter((c) => c.title.toLowerCase().includes(q)) : chapters;
    return SECTIONS.map((section) => ({
      section,
      items: filtered.filter((c) => sectionOf(c.id).id === section.id),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  return (
    <aside className="w-full bg-slate-900/80 lg:bg-transparent flex flex-col h-full">
      <div className={compact ? "p-2 pb-1.5 shrink-0" : "p-3 pb-2 shrink-0"}>
        {compact && (
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-indigo-400" /> {chapters.length} тем
          </h3>
        )}
        <h3 className={`text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2 ${compact ? "hidden" : ""}`}>
          <Compass className="w-4 h-4 text-indigo-400" /> Содержание · {chapters.length} тем
        </h3>
        {!compact && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по темам…"
            className="w-full bg-slate-800/70 border border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white"
              aria-label="Очистить поиск"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        )}
        {!compact && (
          <span className="text-[10px] text-slate-500 italic block mt-1.5 px-1">
            Порядок чтения: билеты 1 → 24
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4 overscroll-contain">
        {groups.length === 0 && <p className="text-sm text-slate-500 px-2 py-6 text-center">Ничего не найдено</p>}

        {groups.map(({ section, items }) => (
          <div key={section.id}>
            <div className="flex items-baseline gap-1.5 px-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{section.title}</span>
              {section.from > 0 && (
                <span className="text-[10px] text-slate-600">билеты {section.from}–{section.to}</span>
              )}
            </div>
            <div className="space-y-1">
              {items.map((chapter) => {
                const isSelected = chapter.id === selectedChapterId;
                const hasViz = Boolean(VIZ_REGISTRY[chapter.id]);
                // «18–20. Графы. Остовное дерево…» → значок «18–20» + короткое название
                const num = chapter.title.match(/^(\d+(?:[–—-]\d+)?)\.\s*/);
                const label = num ? chapter.title.slice(num[0].length) : chapter.title;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => {
                      setSelectedChapterId(chapter.id);
                      onNavigate?.();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    title={chapter.title}
                    aria-current={isSelected ? "page" : undefined}
                    className={`w-full text-left rounded-lg border transition-colors flex items-start gap-2 group ${compact ? "px-1.5 py-1" : "px-2 py-1.5"} ${
                      isSelected
                        ? "bg-indigo-600/15 border-indigo-500 text-white"
                        : "bg-slate-800/40 border-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span className="shrink-0 mt-px rounded-md border border-slate-700 bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-300">
                      {num ? num[1] : "•"}
                    </span>
                    <span className={`font-semibold leading-snug flex-1 min-w-0 ${compact ? "text-[11px] truncate" : "text-[13px]"}`}>
                      {label}
                      {hasViz && (
                        <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle" title="Есть интерактивная визуализация" />
                      )}
                    </span>
                    {!compact && (
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 mt-0.5 transition-transform ${
                          isSelected ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-400"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
