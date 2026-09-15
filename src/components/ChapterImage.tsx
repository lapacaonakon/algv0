import dijkstraImg from '../assets/dijkstra-freakazoid.jpg';
import bellmanImg from '../assets/bellman-ford-batman.jpg';
import floydImg from '../assets/floyd-network.jpg';

const imageMap: Record<string, { src: string; alt: string; caption: string; borderColor: string; captionColor: string }> = {
  dijkstra: {
    src: dijkstraImg,
    alt: 'Декстер Дуглас и Фриказоид',
    caption: '⚡ Декстер Дуглас и Фриказоид — волна вируса распространяется строго по неотрицательным весам (w ≥ 0)!',
    borderColor: 'border-blue-500/30',
    captionColor: 'text-blue-400',
  },
  'bellman-ford': {
    src: bellmanImg,
    alt: 'Бэтмен на машине Генри Форда',
    caption: '🦇 Бэтмен на машине Форда — n-1 ночей патруля всех улиц и проверка n-й ночи на отрицательный цикл!',
    borderColor: 'border-rose-500/30',
    captionColor: 'text-rose-400',
  },
  floyd: {
    src: floydImg,
    alt: 'Fortnite Все против Всех (Флойд—Уоршелл)',
    caption: '🎮 Fortnite: Все против Всех — Флойд-Уоршелл за три цикла (k, i, j) находит кратчайшие пути от всех вершин ко всем!',
    borderColor: 'border-emerald-500/30',
    captionColor: 'text-emerald-400',
  },
};

export default function ChapterImage({ vizType }: { vizType: string }) {
  const info = imageMap[vizType];
  if (!info) return null;

  return (
    <div>
      <div className={`rounded-2xl overflow-hidden border shadow-lg ${info.borderColor}`}>
        <img src={info.src} alt={info.alt} className="w-full h-56 object-cover" />
      </div>
      <p className={`text-center text-xs mt-2 font-bold ${info.captionColor}`}>{info.caption}</p>
    </div>
  );
}
