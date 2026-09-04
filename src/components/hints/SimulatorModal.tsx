import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { getViz } from "../vizRegistry";

interface Props {
  vizId: string | null;
  onClose: () => void;
}

/** Модальное окно с полноценным симулятором — вызывается прямо из текста главы. */
export const SimulatorModal: React.FC<Props> = ({ vizId, onClose }) => {
  useEffect(() => {
    if (!vizId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [vizId, onClose]);

  const viz = getViz(vizId ?? undefined);
  if (!vizId || !viz) return null;
  const Component = viz.Component;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-5xl max-h-[92vh] sm:max-h-[88vh] bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white text-sm sm:text-base truncate">{viz.title}</h3>
            {viz.hint && <p className="text-[11px] text-slate-400 truncate">{viz.hint}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
            aria-label="Закрыть симулятор"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain p-3 sm:p-5">
          <Component />
        </div>
      </div>
    </div>,
    document.body
  );
};
