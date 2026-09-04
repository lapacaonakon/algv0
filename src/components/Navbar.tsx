import React from 'react';
import { BookOpen, Cpu, Sparkles, FileDown, FileText } from 'lucide-react';

interface NavbarProps {
  activeTab: 'guide' | 'simulator';
  setActiveTab: (tab: 'guide' | 'simulator') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-0 lg:h-16 flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-0">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30 text-white shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight truncate">
              Универсальное пособие
            </h1>
            <p className="text-xs text-indigo-400 font-medium truncate">
              Подготовка к экзаменам: Алгоритмы, Структуры данных, Билеты 1–24
            </p>
          </div>
        </div>

        <div className="flex items-center w-full lg:w-auto gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 overflow-x-auto">
          <button
            id="tab-guide-btn"
            onClick={() => setActiveTab('guide')}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Учебное пособие
          </button>
          <button
            id="tab-simulator-btn"
            onClick={() => setActiveTab('simulator')}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" /> Тренажёры
          </button>
          <a
            id="download-pdf-btn"
            href="/export/full_code_all_pages.pdf"
            download="full_code_all_pages.pdf"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-emerald-400 hover:text-white hover:bg-emerald-600/20 border border-emerald-500/30 transition-all duration-200 whitespace-nowrap"
            title="Скачать полный PDF сборник всех страниц и кода (370+ страниц)"
          >
            <FileDown className="w-4 h-4" /> Скачать PDF
          </a>
          <a
            id="download-txt-btn"
            href="/export/full_code_all_pages.txt"
            download="full_code_all_pages.txt"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-sky-400 hover:text-white hover:bg-sky-600/20 border border-sky-500/30 transition-all duration-200 whitespace-nowrap"
            title="Скачать полный TXT файл со всем кодом"
          >
            <FileText className="w-4 h-4" /> TXT
          </a>
        </div>
      </div>
    </header>
  );
};
