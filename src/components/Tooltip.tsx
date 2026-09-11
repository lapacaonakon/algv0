import React, { useState } from "react";

interface TooltipProps {
  /** Содержимое подсказки (можно JSX). */
  content: React.ReactNode;
  /** Элемент, на который наводят курсор / фокус. */
  children: React.ReactNode;
  /** С какой стороны показывать. По умолчанию — сверху. */
  side?: "top" | "bottom";
  className?: string;
}

/**
 * Всплывающая подсказка (как title="", только красивая и многострочная).
 * Появляется по наведению курсора и по фокусу с клавиатуры.
 */
export const Tooltip: React.FC<TooltipProps> = ({ content, children, side = "top", className }) => {
  const [open, setOpen] = useState(false);

  const hiddenShift = side === "top" ? "translate-y-1" : "-translate-y-1";

  return (
    <span
      className={`relative inline-flex ${className ?? ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-[80] w-56 max-w-[70vw] -translate-x-1/2 rounded-lg border border-indigo-500/40 bg-slate-900 px-3 py-2 text-left text-[11px] font-normal leading-relaxed text-slate-200 shadow-xl shadow-black/50 transition-all duration-150 ${
          side === "top" ? "bottom-full mb-2" : "top-full mt-2"
        } ${open ? "visible translate-y-0 opacity-100" : `invisible ${hiddenShift} opacity-0`}`}
      >
        {content}
        <span
          className={`absolute left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-indigo-500/40 bg-slate-900 ${
            side === "top" ? "-bottom-[5px] border-b border-r" : "-top-[5px] border-l border-t"
          }`}
        />
      </span>
    </span>
  );
};
