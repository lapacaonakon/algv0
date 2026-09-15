import dijkstraImg from '../assets/dijkstra-freakazoid.jpg';
import bellmanImg from '../assets/bellman-ford-batman.jpg';
import floydImg from '../assets/floyd-network.jpg';

const cards = [
  {
    img: dijkstraImg,
    alt: 'Декстер Дуглас и Фриказоид (Дейкстра)',
    title: '⚡ Фриказоид и Декстер Дуглас',
    desc: 'Декстер смотрит в CRT-монитор; синий электрический вирус Фриказоид молниеносно растекается по сети с',
    highlight: 'неотрицательными',
    highlightColor: 'text-emerald-400',
    rest: 'весами (w ≥ 0). Подсунь отрицательное ребро — фиксация сломается.',
    complexity: 'O((V+E) log V)',
    border: 'border-blue-500/30 hover:border-blue-400/60',
    titleColor: 'text-blue-400',
    badge: 'text-blue-400/70 bg-blue-950/40',
  },
  {
    img: bellmanImg,
    alt: 'Бэтмен на машине Форда (Форд-Беллман)',
    title: '🦇 Бэтмен на машине Форда',
    desc: 'Патрулирует n-1 ночей в кабине машины Генри Форда. Имеет 1 выходной в году, а на n-ю ночь ловит',
    highlight: 'отрицательные циклы',
    highlightColor: 'text-rose-400',
    rest: '(бесконечную кормушку Джокера).',
    complexity: 'O(V · E)',
    border: 'border-rose-500/30 hover:border-rose-400/60',
    titleColor: 'text-rose-400',
    badge: 'text-rose-400/70 bg-rose-950/40',
  },
  {
    img: floydImg,
    alt: 'Fortnite Все против Всех (Флойд—Уоршелл)',
    title: '🎮 Все против Всех / Fortnite (Флойд)',
    desc: 'Матрица N×N + три цикла (',
    highlight: 'k, i, j',
    highlightColor: 'text-emerald-400',
    rest: '). Все против всех — ищет кратчайшие пути от каждой вершины ко всем.',
    complexity: 'O(V³)',
    border: 'border-emerald-500/30 hover:border-emerald-400/60',
    titleColor: 'text-emerald-400',
    badge: 'text-emerald-400/70 bg-emerald-950/40',
  },
];

export default function MnemonicCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cards.map((c, i) => (
        <div key={i} className={`bg-slate-800 rounded-2xl border overflow-hidden group transition-colors ${c.border}`}>
          <div className="h-48 overflow-hidden">
            <img src={c.img} alt={c.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="p-4">
            <h3 className={`text-lg font-bold mb-1 ${c.titleColor}`}>{c.title}</h3>
            <p className="text-slate-400 text-sm">
              {c.desc} <span className={`font-bold ${c.highlightColor}`}>{c.highlight}</span> {c.rest}
            </p>
            <div className={`mt-3 text-xs font-mono px-2 py-1 rounded ${c.badge}`}>{c.complexity}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
