import React, { useEffect, useState } from "react";
import { List, X } from "lucide-react";
import { Sidebar } from "./Sidebar";

interface Props {
  selectedChapterId: string;
  setSelectedChapterId: (id: string) => void;
  /** Заголовок текущей темы — показываем в кнопке, чтобы было видно, где ты. */
  currentTitle: string;
  index: number;
  total: number;
}

/**
 * Мобильное содержание: липкая панель снизу-сверху + выдвижная шторка.
 * На десктопе не рендерится (там обычный сайдбар).
 */
export const MobileToc: React.FC<Props> = ({ selectedChapterId, setSelectedChapterId, currentTitle, index, total }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="lg:hidden sticky top-[57px] z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left"
          aria-label="Открыть содержание"
        >
          <span className="p-1.5 rounded-lg bg-indigo-600/20 border border-indigo-600/40 text-indigo-300 shrink-0">
            <List className="w-4 h-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] uppercase tracking-wider text-slate-500 leading-tight">
              Содержание · {index + 1} из {total}
            </span>
            <span className="block text-[13px] font-bold text-slate-200 truncate leading-snug">{currentTitle}</span>
          </span>
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-[90]">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col animate-[tocIn_.18s_ease-out]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
              <span className="font-bold text-white text-sm">Содержание</span>
              <button
                onClick={() => setOpen(false)}
                className="p-2 -mr-2 text-slate-400 hover:text-white"
                aria-label="Закрыть содержание"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <Sidebar
                selectedChapterId={selectedChapterId}
                setSelectedChapterId={setSelectedChapterId}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
