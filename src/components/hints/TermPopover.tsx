import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X, Lightbulb } from "lucide-react";
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

const CARD_W = 340;
const GAP = 10;

export const TermPopover: React.FC<Props> = ({ anchor, onClose, onOpenSimulator, onCardEnter, onCardLeave }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; below: boolean } | null>(null);

  const recompute = React.useCallback(() => {
    if (!anchor || !cardRef.current) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(CARD_W, vw - 16);
    const height = cardRef.current.offsetHeight || 280;

    let left = anchor.rect.left + anchor.rect.width / 2 - width / 2;
    left = Math.max(8, Math.min(left, vw - width - 8));

    // Prefer placing below if near top, above if near bottom
    const spaceBelow = vh - anchor.rect.bottom;
    const spaceAbove = anchor.rect.top;
    const below = spaceBelow > spaceAbove ? true : anchor.rect.top < height + GAP + 8;

    let top: number;
    if (below) {
      top = anchor.rect.bottom + GAP;
      // if not enough space below, clamp
      if (top + height > vh - 8) top = Math.max(8, vh - height - 8);
    } else {
      top = anchor.rect.top - height - GAP;
      if (top < 8) top = anchor.rect.bottom + GAP;
    }

    top = Math.max(8, Math.min(top, vh - height - 8));
    setPos({ top, left, below });
  }, [anchor]);

  useLayoutEffect(() => {
    if (!anchor) {
      setPos(null);
      return;
    }
    // Measure after paint; use rAF to ensure height is correct
    const id = requestAnimationFrame(() => {
      recompute();
      // second tick for accurate height after content loads
      requestAnimationFrame(recompute);
    });
    return () => cancelAnimationFrame(id);
  }, [anchor, recompute]);

  useEffect(() => {
    if (!anchor) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onScroll = () => {
      // Recompute instead of close for better UX; close only if target scrolled far
      recompute();
      // If anchor element is no longer in viewport, close
      if (anchor.rect.top < -100 || anchor.rect.top > window.innerHeight + 100) onClose();
    };
    const onResize = () => recompute();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [anchor, onClose, recompute]);

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
      aria-label={entry.title}
    >
      <div className="bg-slate-900 border border-indigo-500/40 rounded-xl shadow-2xl shadow-indigo-950/60 overflow-hidden">
        <div className="flex items-start gap-2 px-3 pt-2.5 pb-2 border-b border-slate-800">
          <div className="bg-indigo-600 p-1 rounded-md shrink-0 mt-0.5">
            <Lightbulb className="w-3.5 h-3.5 text-white" />
          </div>
          <h4 className="text-sm font-bold text-indigo-200 leading-snug flex-1">{entry.title}</h4>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white shrink-0 -mt-0.5 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Закрыть подсказку"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 space-y-2.5 max-h-[60vh] overflow-y-auto overscroll-contain">
          <p className="text-[13px] leading-relaxed text-slate-200">{entry.short}</p>

          {entry.demo && <MiniDemo kind={entry.demo} />}

          {entry.formal && (
            <p className="text-[11.5px] leading-relaxed text-slate-400 border-l-2 border-indigo-600/50 pl-2.5 bg-indigo-950/20 py-1.5 rounded-r">
              {entry.formal}
            </p>
          )}

          {entry.complexity && (
            <div className="text-[11px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Сложность: {entry.complexity}
            </div>
          )}

          {viz && simulatorId && (
            <button
              onClick={() => onOpenSimulator(simulatorId)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 transition-colors shadow-md shadow-indigo-900/30"
            >
              <Play className="w-3.5 h-3.5" /> Показать: {viz.title}
            </button>
          )}
          <div className="text-[10px] text-slate-500 text-center pt-1">
            Нажми Esc или кликни вне, чтобы закрыть · тап на термин — закрепить
          </div>
        </div>
      </div>
      {/* стрелочка */}
      {pos && (
        <div
          className="absolute w-3 h-3 bg-slate-900 border-l border-t border-indigo-500/40 rotate-45 hidden sm:block"
          style={{
            left: anchor.rect.left + anchor.rect.width / 2 - pos.left - 6,
            top: pos.below ? -6 : undefined,
            bottom: !pos.below ? -6 : undefined,
          }}
        />
      )}
    </div>,
    document.body
  );
};
