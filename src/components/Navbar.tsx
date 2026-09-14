import React, { useState } from 'react';
import { Sparkles, FileDown, FileText, Code2, Loader2, Terminal, BookOpen } from 'lucide-react';
import { chapters } from '../data/content';
import { downloadBookHtml } from '../utils/exportHtml';

interface NavbarProps {
  /** Открыта ли боковая панель компилятора. */
  compilerOpen: boolean;
  onToggleCompiler: () => void;
}

/**
 * Шапка приложения.
 *
 * Кнопка «Скачать PDF» всегда на самом видном месте во главе панели выгрузок.
 */
export const Navbar: React.FC<NavbarProps> = ({ compilerOpen, onToggleCompiler }) => {
  const [busy, setBusy] = useState(false);

  const saveBook = async () => {
    setBusy(true);
    try {
      await downloadBookHtml(chapters);
    } finally {
      setBusy(false);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 lg:py-0 lg:h-16 flex flex-col lg:flex-row items-center justify-between gap-2.5 lg:gap-0">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30 text-white shrink-0">
            <Sparkles className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg lg:text-xl font-extrabold text-white tracking-tight truncate">
              Универсальное пособие
            </h1>
            <p className="text-xs text-indigo-400 font-medium truncate">
              Подготовка к экзаменам: Алгоритмы, Структуры данных, Билеты 1–24
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap sm:flex-nowrap w-full lg:w-auto gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 whitespace-nowrap">
            <BookOpen className="w-4 h-4" /> Учебное пособие
          </span>

          <button
            id="tab-compiler-btn"
            onClick={onToggleCompiler}
            aria-pressed={compilerOpen}
            title="Боковая панель Python-компилятора (на мобильном — снизу)"
            aria-label={compilerOpen ? "Скрыть панель Python-компилятора" : "Открыть панель Python-компилятора"}
            className={`shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap ${
              compilerOpen
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" /> Python
          </button>

          <div id="download-menu" className="flex items-center gap-2 flex-1 sm:flex-none">
            <a
              id="download-guide-pdf-btn"
              href={`${import.meta.env.BASE_URL}export/guide_lite.pdf`}
              download="guide_lite.pdf"
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/50 shadow-md shadow-indigo-600/20 transition-all duration-200 whitespace-nowrap"
              title="Скачать PDF пособия: компактный конспект всех 24 билетов с текстом, формулами и визуализациями без кода компилятора"
            >
              <FileDown className="w-4 h-4 text-indigo-200" /> Скачать PDF
            </a>

            <details className="relative shrink-0">
              <summary
                className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white bg-slate-700/60 border border-slate-600 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden"
                title="Ещё форматы: PDF с кодом, TXT и автономный HTML"
              >
                <span>Ещё</span>
              </summary>
              <div className="absolute right-0 top-full mt-1 z-50 flex flex-col gap-1 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-xl shadow-black/50 min-w-[170px]">
                <a
                  id="download-pdf-btn"
                  href={`${import.meta.env.BASE_URL}export/full_code_all_pages.pdf`}
                  download="full_code_all_pages.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-emerald-400 hover:text-white hover:bg-emerald-600/20 border border-emerald-500/30 transition-all duration-200 whitespace-nowrap"
                  title="Полный PDF-дамп исходного кода проекта (370+ страниц)"
                >
                  <FileDown className="w-3.5 h-3.5" /> PDF (код проекта)
                </a>
                <a
                  id="download-txt-btn"
                  href={`${import.meta.env.BASE_URL}export/full_code_all_pages.txt`}
                  download="full_code_all_pages.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-sky-400 hover:text-white hover:bg-sky-600/20 border border-sky-500/30 transition-all duration-200 whitespace-nowrap"
                  title="Скачать полный TXT файл со всем кодом"
                >
                  <FileText className="w-3.5 h-3.5" /> TXT (код проекта)
                </a>
                <button
                  id="download-html-btn"
                  onClick={saveBook}
                  disabled={busy}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-amber-400 hover:text-white hover:bg-amber-600/20 border border-amber-500/30 disabled:opacity-60 transition-all duration-200 whitespace-nowrap cursor-pointer"
                  title="Скачать всё пособие одним автономным HTML-файлом"
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Code2 className="w-3.5 h-3.5" />} Автономный HTML
                </button>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
};
