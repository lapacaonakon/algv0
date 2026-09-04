import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X } from "lucide-react";
import { GLOSSARY_BY_ID } from "../../data/glossary";
import { MiniDemo } from "./MiniDemo";
import { getViz } from "../vizRegistry";

export interface HintAnchor {
  termId: string;
  rect: DOMRect;
}

interface Props {
  anchor: HintAnchor | null;
  onClose: () => void;
  onOpenSimulator: (vizId: string) => void;
  onCardEnter: () => void;
  onCardLeave: () => void;
}

const CARD_W = 320;
const GAP = 10;

export const TermPopover: React.FC<Props> = ({ anchor, onClose, onOpenSimulator, onCardEnter, onCardLeave }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; below: boolean } | null>(null);

  useLayoutEffect(() => {
    if (!anchor) {
      setPos(null);
      return;
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(CARD_W, vw - 16);
    const height = cardRef.current?.offsetHeight ?? 300;

    let left = anchor.rect.left + anchor.rect.width / 2 - width / 2;
    left = Math.max(8, Math.min(left, vw - width - 8));

    const below = anchor.rect.top < height + GAP + 8;
    const top = below ? anchor.rect.bottom + GAP : anchor.rect.top - height - GAP;

    setPos({ top: Math.max(8, Math.min(top, vh - height - 8)), left, below });
  }, [anchor]);

  useEffect(() => {
    if (!anchor) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onClose, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onClose, true);
    };
  }, [anchor, onClose]);

  if (!anchor) return null;
  const entry = GLOSSARY_BY_ID.get(anchor.termId);
  if (!entry) return null;
  const viz = getViz(entry.simulator);
  const simulatorId = entry.simulator;

  return createPortal(
    <div
      ref={cardRef}
      onMouseEnter={onCardEnter}
      onMouseLeave={onCardLeave}
      className="fixed z-[100] term-popover"
      style={{
        top: pos ? pos.top : -9999,
        left: pos ? pos.left : -9999,
        width: Math.min(CARD_W, typeof window !== "undefined" ? window.innerWidth - 16 : CARD_W),
        visibility: pos ? "visible" : "hidden",
      }}
      role="dialog"
    >
      <div className="bg-slate-900 border border-indigo-500/40 rounded-xl shadow-2xl shadow-indigo-950/60 overflow-hidden">
        <div className="flex items-start gap-2 px-3 pt-2.5 pb-2 border-b border-slate-800">
          <h4 className="text-sm font-bold text-indigo-300 leading-snug flex-1">{entry.title}</h4>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white shrink-0 -mt-0.5 p-1 rounded"
            aria-label="Закрыть подсказку"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 space-y-2.5 max-h-[60vh] overflow-y-auto overscroll-contain">
          <p className="text-[13px] leading-relaxed text-slate-200">{entry.short}</p>

          {entry.demo && <MiniDemo kind={entry.demo} />}

          {entry.formal && (
            <p className="text-[11.5px] leading-relaxed text-slate-400 border-l-2 border-slate-700 pl-2">
              {entry.formal}
            </p>
          )}

          {entry.complexity && (
            <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 rounded px-2 py-1">
              Сложность: {entry.complexity}
            </div>
          )}

          {viz && simulatorId && (
            <button
              onClick={() => onOpenSimulator(simulatorId)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2 transition-colors"
            >
              <Play className="w-3.5 h-3.5" /> Показать: {viz.title}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
