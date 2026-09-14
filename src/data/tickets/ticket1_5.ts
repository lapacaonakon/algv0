import { Chapter } from '../../types';
import waffleImg from "../../assets/waffle-grid.jpg";

export const tickets1to5: Chapter[] = [
  {
    id: "segment-trees",
    title: "1. Дерево отрезков с операциями на отрезках",
    type: "html",
    description: "Дерево отрезков — структура данных для запросов на отрезке за O(log n).",
    category: "Оптимизации и Продвинутые структуры",
    content: `
<section id="segment-trees" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 1</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Дерево отрезков с операциями на отрезках</h2>
    </div>
    
    <div class="space-y-8">
        <div id="intro" class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Массовое обновление (Lazy Propagation)</h3>
            
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Не обновляй детей, пока к ним не обратятся. Храни "обещание" обновить в массиве promise (lazy).</p>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🏢 Аналогия 1: Корпоративная премия
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Босс решает выписать премию всем 10 000 сотрудникам компании. Вместо того, чтобы рассылать 10 000 писем, он пишет одно письмо начальникам департаментов (обещание). Начальники департаментов обновят суммы на счетах сотрудников только тогда, когда сотрудник придет в бухгалтерию спросить свой баланс. Это и есть Lazy Propagation (отложенное обновление).</p>
                </div>
                
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        📦 Аналогия 2: Матрешки-коробки
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Представь массив как одну огромную коробку. Внутри неё лежат две коробки поменьше, и так далее. Если нам нужно покрасить половину массива в синий цвет, мы не красим каждый элемент. Мы просто лепим стикер "Внутри всё синее!" на большую коробку. Опускаемся внутрь только при острой необходимости.</p>
                </div>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Строгое доказательство / Код (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
function push(node) {
    if (lazy[node] !== 0) {
        lazy[2 * node] += lazy[node];
        tree[2 * node] += lazy[node];
        lazy[2 * node + 1] += lazy[node];
        tree[2 * node + 1] += lazy[node];
        lazy[node] = 0;
    }
}</pre>
                </div>
            </details>
        </div>
    </div>
</section>
`
  },
  {
    id: "sparse-table",
    title: "2. Двумерная разреженная матрица (Sparse Table)",
    type: "html",
    description: "Разреженная таблица для идемпотентных запросов RMQ.",
    category: "Продвинутые структуры",
    content: `
<section id="sparse-table" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 2</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Двумерная разреженная таблица</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">RMQ за O(1)</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">ST[i][j] = min(ST[i][j-1], ST[i + 2^(j-1)][j-1]). Ответ берется как пересечение двух отрезков: min(ST[L][k], ST[R - 2^k + 1][k]).</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        📏 Аналогия 1: Школьные линейки
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Для идемпотентных операций (когда x O x = x, например, минимум). Тебе дают отрезок длины 7. Ты берешь две заготовленные заранее линейки длины 4 (степень двойки) и накладываешь их так, чтобы они покрыли весь отрезок длины 7 (перекрывая друг друга посередине). Минимум из этих двух линеек и будет минимумом на всём отрезке! Не нужно ничего складывать, просто пересекаем куски.</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🧱 Аналогия 2: Ступени
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Предварительно мы считаем ответы для всех отрезков длин 1, 2, 4, 8... И когда нужно покрыть отрезок, мы берем две самые большие ступени, которые в него влезают.</p>
                </div>
            </div>
            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
int k = log2(R - L + 1);
int minimum = min(st[L][k], st[R - (1 << k) + 1][k]);</pre>
                </div>
            </details>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-amber-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-amber-400 mb-4">⚖️ Префиксная vs Разреженная: вафли против тортика</h3>
            <p class="text-slate-300 text-sm mb-5">Частая ошибка: «разреженная таблица — как префиксные суммы, только чуть меньше памяти за ту же скорость». <b class="text-rose-300">Наоборот. Ровно наоборот.</b> Это не конкуренты: префиксная — маленькая сетка <b>только для суммы</b>, разреженная — огромный тортик для min/max/gcd. Сумму нельзя считать через sparse (перекрывающиеся линейки посчитают клетки дважды), минимум нельзя через префиксную (нет обратной операции).</p>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-5 rounded-lg border border-emerald-600/40 relative pt-9">
                    <div class="absolute -top-3 left-4 bg-emerald-700 text-emerald-100 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🧇 Сетка из вафельных трубочек — префиксные суммы (билет 5)
                    </div>
                    <img src="${waffleImg}" alt="Сетка вафельных трубочек: прямоугольник вынимается, пустые слоты пунктиром" class="w-full max-w-[420px] mx-auto rounded-lg border border-slate-700 my-3" />
                    <p class="text-slate-300 text-sm mb-2">Каждая трубочка = сумма всего прямоугольника от угла (0,0). Нужный кусок <b>вынимается</b> по включениям-исключениям — как палочки на картинке: вынули четыре — получили любой прямоугольник.</p>
                    <p class="text-slate-300 text-sm">И палочки можно не только вынимать, но и <b class="text-emerald-300">вставлять обратно</b>: у суммы есть вычитание. Поэтому хватает одной сетки.</p>
                </div>
                <div class="bg-slate-900 p-5 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-9">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🎂 Торт уровней — sparse table (этот билет)
                    </div>
                    <div class="flex flex-col items-center gap-1.5 my-3 font-mono">
                    <div class="flex flex-col items-center gap-1">
                        <div class="flex gap-1"><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-rose-500 border border-rose-300 text-white text-[11px] sm:text-xs font-bold shadow-sm">1</div></div>
                        <div class="text-[9px] sm:text-[10px] text-slate-500 font-sans">j=3 · куски длины 8 · таких кусков 8−8+1 = 1</div>
                    </div>
                    <div class="flex flex-col items-center gap-1">
                        <div class="flex gap-1"><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">2</div><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">3</div><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">3</div><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">1</div><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">1</div></div>
                        <div class="text-[9px] sm:text-[10px] text-slate-500 font-sans">j=2 · куски длины 4 · таких кусков 8−4+1 = 5</div>
                    </div>
                    <div class="flex flex-col items-center gap-1">
                        <div class="flex gap-1"><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">2</div><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">3</div><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">5</div><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">3</div><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">3</div><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">1</div><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">1</div></div>
                        <div class="text-[9px] sm:text-[10px] text-slate-500 font-sans">j=1 · куски длины 2 · таких кусков 8−2+1 = 7</div>
                    </div>
                    <div class="flex flex-col items-center gap-1">
                        <div class="flex gap-1"><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">2</div><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">3</div><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">5</div><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">62</div><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">3</div><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">21</div><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">1</div><div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded bg-amber-100/90 border border-rose-400/60 text-slate-900 text-[11px] sm:text-xs font-bold shadow-sm">4</div></div>
                        <div class="text-[9px] sm:text-[10px] text-slate-500 font-sans">j=0 · куски длины 1 · их ровно 8 — сам массив</div>
                    </div>
                    </div>
                    <p class="text-slate-300 text-sm mb-2">Каждый слой — строка <span class="font-mono text-rose-300">st[·][j]</span> из демо 1D выше (массив 2, 3, 5, 62, 3, 21, 1, 4): слой j отвечает «минимум на куске длины 2^j, начинающемся в позиции i». Кусков длины 2^j в массиве из 8 элементов ровно 8−2^j+1, поэтому торт сужается: <b class="text-rose-300">8 → 7 → 5 → 1</b> клеток, всего 21 против 8 в исходном массиве. В 2D уровни заводятся по обеим осям: N·M·log N·log M клеток — для 1000×1000 это ≈ в 100 раз больше исходной матрицы.</p>
                    <p class="text-slate-300 text-sm">А вот главное отличие от вафель. Сумма умеет вычитание: <b class="text-emerald-300 font-mono">2 − 2 = 0</b> — прибавил кусок, вычел кусок, вернул исход. У минимума обратной операции нет: <span class="font-mono text-rose-300">min(2, 2) = 2</span> — а сколько кусков склеили и что в них было, назад не узнать. Поэтому торт нельзя «разлепить» — его печём заранее и целиком.</p>
                </div>
            </div>
            <div class="overflow-x-auto mt-6">
                <table class="w-full text-sm text-slate-300 border-collapse">
                    <thead>
                        <tr class="text-left text-[11px] uppercase tracking-wider text-slate-500">
                            <th class="py-2 pr-4 font-bold"></th>
                            <th class="py-2 pr-4 font-bold text-emerald-400">🧇 Префиксная (вафли)</th>
                            <th class="py-2 font-bold text-rose-400">🎂 Sparse (тортик)</th>
                        </tr>
                    </thead>
                    <tbody class="align-top">
                        <tr class="border-t border-slate-700/60">
                            <td class="py-2 pr-4 text-slate-500">Память</td>
                            <td class="py-2 pr-4 font-mono text-xs text-emerald-300">O(N·M) — одна сетка</td>
                            <td class="py-2 font-mono text-xs text-rose-300">O(N·M·log N·log M) — ≈100 копий</td>
                        </tr>
                        <tr class="border-t border-slate-700/60">
                            <td class="py-2 pr-4 text-slate-500">Построение</td>
                            <td class="py-2 pr-4 font-mono text-xs text-emerald-300">O(N·M)</td>
                            <td class="py-2 font-mono text-xs text-rose-300">O(N·M·log N·log M) — печь долго</td>
                        </tr>
                        <tr class="border-t border-slate-700/60">
                            <td class="py-2 pr-4 text-slate-500">Запрос</td>
                            <td class="py-2 pr-4 font-mono text-xs text-emerald-300">O(1)</td>
                            <td class="py-2 font-mono text-xs text-rose-300">O(1)</td>
                        </tr>
                        <tr class="border-t border-slate-700/60">
                            <td class="py-2 pr-4 text-slate-500">Умеет</td>
                            <td class="py-2 pr-4">только <b>сумму</b> — есть вычитание</td>
                            <td class="py-2"><b>min / max / gcd</b> — перекрытие не мешает (x O x = x)</td>
                        </tr>
                        <tr class="border-t border-slate-700/60">
                            <td class="py-2 pr-4 text-slate-500">Обратная операция</td>
                            <td class="py-2 pr-4 text-emerald-300">есть: палочки можно вставить назад</td>
                            <td class="py-2 text-rose-300">нет: крем обратно не запихнёшь</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="bg-slate-900/40 rounded-lg border border-slate-700/50 p-4 mt-5">
                <p class="text-slate-300 text-sm mb-1">💀 <b>Ты путаешь:</b></p>
                <p class="text-slate-400 text-sm mb-1">· «Сумму посчитаю через sparse table» — нельзя: перекрывающиеся линейки посчитают клетки дважды. Сумма ≠ идемпотентна.</p>
                <p class="text-slate-400 text-sm mb-1">· «Минимум посчитаю префиксными суммами» — нельзя: нет вычитания, нет обратной операции.</p>
                <p class="text-slate-400 text-sm">· Выбирай не «что круче», а «какой запрос на входе»: сумма — вафли, минимум — тортик.</p>
            </div>
        </div>
    </div>
</section>`
  },
  {
    id: "treap",
    title: "3. Декартово дерево (Treap)",
    type: "html",
    description: "Дерево поиска по ключу и Куча по приоритету.",
    category: "Продвинутые структуры",
    content: `
<section id="treap" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 3</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Декартово дерево (Treap)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Tree + Heap = Treap</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Бинарное дерево поиска по ключу (X) и бинарная куча по приоритету (Y). Два базовых метода: Split и Merge.</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🗡️ Аналогия 1: Удар катаной (Split)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Split — это удар самурайского меча, который разрезает дерево на две части ровно по значению X. Все, кто меньше X улетают влево, остальные — вправо. Разрез идет сверху вниз, спускаясь по веткам.</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🧲 Аналогия 2: Слияние капель (Merge)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Merge — это склеивание двух деревьев (где все элементы левого строго меньше правого). Мы просто смотрим на корни: у кого Y (приоритет) больше, тот и становится общим корнем, а второй прилипает к нему сбоку как потомок.</p>
                </div>
            </div>
            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
pair&lt;Node*, Node*&gt; split(Node* t, int x) {
    if (!t) return {nullptr, nullptr};
    if (t->val &lt;= x) {
        auto [L, R] = split(t->right, x);
        t->right = L;
        return {t, R};
    } else {
        auto [L, R] = split(t->left, x);
        t->left = R;
        return {L, t};
    }
}</pre>
                </div>
            </details>
        </div>
    </div>
</section>`
  },
  {
    id: "splay-tree",
    title: "4. Splay-дерево",
    type: "html",
    description: "Дерево поиска, которое самобалансируется при запросах.",
    category: "Продвинутые структуры",
    content: `
<section id="splay-tree" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 4</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Splay-дерево</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Всплытие наверх</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Операция Splay(v) поднимает узел v в самый корень дерева с помощью серий вращений (Zig, Zig-Zig, Zig-Zag), гарантируя амортизированное время O(log n).</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🛗 Аналогия 1: VIP-лифт
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Каждый раз, когда ты обращаешься к элементу базы данных, он поднимается и становится корнем дерева (VIP-статус). Если ты часто запрашиваешь одни и те же узлы, они скапливаются на самом верху, и для их поиска почти не требуется времени!</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🔄 Аналогия 2: Балансировка через боль
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Вместо поддержания строгих правил как в AVL-дереве, Splay-дерево может временами становиться кривым как бамбук. Но как только по нему проходят поиском, операция всплытия сама разглаживает структуру дерева.</p>
                </div>
            </div>
            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
// Zig, Zag
function rotate(x) {
    let p = x.parent;
    if (p.left === x) { // Right rotate
        p.left = x.right;
        x.right = p;
    } else { // Left rotate
        p.right = x.left;
        x.left = p;
    }
}</pre>
                </div>
            </details>

            <div class="bg-indigo-950/60 p-6 rounded-xl border-l-4 border-indigo-500 mt-6 space-y-4">
                <h4 class="text-lg font-bold text-indigo-400">🧠 Повороты сознания: Вопросы на подумать (Без права на нытьё)</h4>
                
                <div class="space-y-4 text-sm text-slate-300">
                    <div>
                        <strong class="text-white block mb-1">1. Если ты ищешь элемент, которого нет в дереве, что Splay-дерево вытащит в корень?</strong>
                        <p>Оно поднимет узел, на котором поиск <strong>"споткнулся"</strong>. Это последний посещенный лист в процессе поиска. За счет сдвига этого листа в корень, дерево адаптирует свою структуру под диапазон поиска, даже если искомого ключа нет.</p>
                    </div>

                    <div>
                        <strong class="text-white block mb-1">2. Эффект качелей (Swing Effect) для LLM-агента (кэш контекста):</strong>
                        <p>Если агент постоянно переключается между двумя противоположными темами (например, ключи $x_{min}$ и $x_{max}$), находящимися на разных концах дерева, его производительность рухнет! Каждая операция Splay будет вытаскивать один ключ, превращая дерево в вытянутый бамбук для другого. Следующий запрос ко второму ключу пройдет полный путь $O(n)$ и сделает то же самое. Постоянное свинг-переключение превратит производительность в чистое <strong class="text-rose-400">O(n)</strong>.</p>
                    </div>

                    <div>
                        <strong class="text-white block mb-1">3. Амортизированная сложность $O(\log n)$ при худшем поиске $O(n)$:</strong>
                        <p>Хотя один поиск может стоить $O(n)$ по вытянутой ветке, вращения <code>Zig-Zig</code> при амортизированных подъемах обладают прекрасным свойством: они не просто поднимают цель, но и <strong>уполовинивают глубину</strong> для всех предков по пути. "Палочное" дерево прессуется в сбалансированное. Дороговизна одной операции окупает десятки последующих дешевых запросов.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>`
  },
  {
    id: "prefix-sums-2d",
    title: "5. Двумерная матрица префиксных сумм",
    type: "html",
    description: "Сжатие суммы подматрицы за O(1)",
    category: "Алгоритмы матрицы",
    content: `
<section id="prefix-sums-2d" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 5</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Двумерная матрица префиксных сумм</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Формула включений-исключений</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">P[i][j] = P[i-1][j] + P[i][j-1] - P[i-1][j-1] + M[i][j]<br>Сумма Rectangle(x1...x2, y1...y2) = P[x2][y2] - P[x1-1][y2] - P[x2][y1-1] + P[x1-1][y1-1]</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        ✂️ Аналогия 1: Вырезание прямоугольников
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Представь большой лист картона (площадь от (0,0) до (x2, y2)). Чтобы вырезать из него маленький целевой прямоугольник в центре, тебе нужно отрезать кусок слева и кусок сверху. Но когда ты отрезаешь их, левый верхний угол отрезается дважды! Поэтому его площадь нужно прибавить обратно.</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-sky-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-sky-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-sky-500 shadow-md">
                        🧇 Аналогия 2: Сетка из вафельных трубочек (аккумулятор)
                    </div>
                    <img src="${waffleImg}" alt="Сетка вафельных трубочек: прямоугольник вынимается по включениям-исключениям" class="w-full max-w-[380px] mx-auto rounded-lg border border-slate-700 my-3" />
                    <p class="text-slate-300 text-sm mb-3">Каждая трубочка «аккумулирует» — несёт сумму всего прямоугольника от угла (0,0). Любой кусок <b>вынимается</b> по включениям-исключениям (пунктирные слоты на картинке), а главное — палочки можно <b class="text-emerald-300">вставлять обратно</b>: у суммы есть вычитание. У минимума обратной операции нет (min(2, 2) = 2 — назад не развернёшь), поэтому там (билет 2) печут торт уровней: в 2D это N·M·log N·log M клеток — для 1000×1000 ≈ в 100 раз больше одной сетки O(N·M).</p>
                    <p class="text-xs font-mono text-slate-400 border-t border-slate-700/60 pt-2">память O(N·M) · построение O(N·M) · запрос O(1) · только сумма</p>
                </div>
            </div>
            <div class="bg-slate-900/40 rounded-lg border border-slate-700/50 p-4 mt-4">
                <p class="text-slate-400 text-sm">🤝 <b class="text-slate-200">Не конкуренты:</b> префиксные суммы — маленькая таблица для <b class="text-emerald-300">суммы</b>; разреженная таблица (билет 2) — огромная, зато для <b class="text-rose-300">min/max/gcd</b>. Сумму через sparse table считать нельзя (перекрытие посчитает клетки дважды), минимум через префиксную — тоже (нет обратной операции).</p>
            </div>
        </div>
    </div>
</section>`
  }
];
