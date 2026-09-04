import React from 'react';
import { chapters } from '../data/content';
import { ChevronRight, Compass } from 'lucide-react';

interface SidebarProps {
  selectedChapterId: string;
  setSelectedChapterId: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ selectedChapterId, setSelectedChapterId }) => {
  return (
    <aside className="w-full lg:w-80 bg-slate-900/80 border-r border-slate-800 p-6 flex flex-col gap-6 lg:min-h-[calc(100vh-4rem)]">
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-400" /> Навигация по пособию
        </h3>
        <div className="space-y-2">
          {chapters.map((chapter) => {
            const isSelected = chapter.id === selectedChapterId;
            return (
              <button
                key={chapter.id}
                onClick={() => setSelectedChapterId(chapter.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
                  isSelected
                    ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600 hover:text-white'
                }`}
              >
                <span className="font-bold text-sm tracking-tight">{chapter.title}</span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-2xl border border-slate-700/60 shadow-inner text-xs text-slate-300 space-y-3">
        <div className="font-bold text-indigo-400 flex items-center gap-1.5 text-sm">
          <span>🎯 Главная фишка пособия</span>
        </div>
        <p className="leading-relaxed">
          Каждая глава разделена на две колонки: слева простые жизненные аналогии (пицца, фура, сплетни), справа — строгая техническая суть.
        </p>
        <p className="text-slate-400 font-medium italic">
          💡 Душные детали, формулы и код спрятаны в спойлеры. Кликните, чтобы развернуть!
        </p>
      </div>
    </aside>
  );
};
