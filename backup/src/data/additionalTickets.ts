import { Chapter } from "../types";

export const additionalTickets: Chapter[] = [
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
int kx = log2(R2 - R1 + 1);
int ky = log2(C2 - C1 + 1);
int ans1 = min(st[R1][C1][kx][ky], st[R1][C2 - (1 << ky) + 1][kx][ky]);
int ans2 = min(st[R2 - (1 << kx) + 1][C1][kx][ky], st[R2 - (1 << kx) + 1][C2 - (1 << ky) + 1][kx][ky]);
int minimum = min(ans1, ans2);</pre>
                </div>
            </details>
        </div>
    </div>
</section>`,
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
</section>`,
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
        </div>
    </div>
</section>`,
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
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "graph-planar-colors",
    title: "7. Графы. Планарные. Покраска",
    type: "html",
    description: "Формула Эйлера и теорема о 4 красках.",
    category: "Графы. Теория",
    content: `
<section id="graph-planar-colors" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 7</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Графы. Планарные. Покраска</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Формула Эйлера</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">V - E + F = 2 (Вершины - Рёбра + Грани = 2).<br>Теорема о 4 красках: любой планарный граф можно раскрасить 4 цветами.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🗺️ Аналогия 1: Карта мира
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Планарный граф — это обычная политическая карта мира на глобусе. Страны — грани. Границы не пересекаются в одной точке по-дурацки, они лежат на плоскости. И раскрасить такую карту, чтобы две соседние страны не сливались цветами, Всегда можно всего ТРЕМЯ-ЧЕТЫРЬМЯ банками краски!</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "top-sort",
    title: "9. Графы. Топологическая сортировка",
    type: "html",
    description: "Разложение задач по порядку выполнения",
    category: "Графы",
    content: `
<section id="top-sort" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 9</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Топологическая сортировка</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Квест-цепочка</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">DFS с сохранением вершин в стек В МОМЕНТ ВЫХОДА (post-order). Вывод: стек задом-наперед.</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🎓 Аналогия 1: Учеба в вузе
                    </div>
                    <p class="text-slate-300 text-sm mb-4">У тебя есть предметы. "Матан 2" нельзя взять, если не сдал "Матан 1". Топологическая сортировка — это расписание, которое гарантрует, что ты не встретишь предмет, пререквизиты которого ты еще не прошел.</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        💀 Ограничения: Циклы
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Не работает на графах с циклами. "Чтобы устроиться на работу нужен опыт. Чтобы получить опыт, нужна работа". Алгоритм выявит цикл и скажет, что отсортировать невозможно.</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "scc-kosaraju",
    title: "10. Графы. Компоненты сильной связности (SCC)",
    type: "html",
    description: "Разбиение орграфа на макро-вершины. Алгоритм Косарайю.",
    category: "Графы. Продвинутые",
    content: `
<section id="scc-kosaraju" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 10</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Компоненты сильной связности</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Алгоритм Косарайю</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">1. Top-sort исходного графа.<br>2. Инвертируем все ребра.<br>3. Запускаем DFS по инвертированному в порядке top-sort.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🏙️ Аналогия 1: Улицы с односторонним
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Сильная связность — это города, внутри которых можно ездить по кругу между В ЛЮБЫХ направлениях по односторонним улицам. Как будто мы сжали целые районы, внутри которых можно заблудиться, в одну супер-точку на карте.</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "graph-bridges",
    title: "11. Графы. Мосты",
    type: "html",
    description: "Рёбра, удаление которых расхреначивает граф.",
    category: "Графы. Продвинутые",
    content: `
<section id="graph-bridges" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 11</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Мосты в графах</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-rose-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-rose-400 mb-4">Критические связи</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-rose-500/30">
                <p class="text-lg text-rose-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Используем tin и fup (время входа и минимальное достижимое). Ребро (u,v) мост, если fup[v] > tin[u].</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🌉 Аналогия 1: Единственный мост
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Представь два острова с единственным мостом между ними. Если террористы взорвут этот мост, экономикой обоих кусков придет хана, связи нет. Алгоритм ищет именно такие "Слабые звенья" в сети!</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "graph-articulation",
    title: "12. Графы. Точки сочленения",
    type: "html",
    description: "Вершины, удаление которых убивает связь.",
    category: "Графы. Продвинутые",
    content: `
<section id="graph-articulation" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 12</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Точки сочленения</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-rose-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-rose-400 mb-4">Узкие горлышки сети</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-rose-500/30">
                <p class="text-lg text-rose-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Вершина u — точка сочленения, если fup[v] >= tin[u] (для корня дерева DFS: если детей > 1).</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🛑 Аналогия 1: Центральный роутер
                    </div>
                    <p class="text-slate-300 text-sm mb-4">То же самое что и мост, но на уровне городов или роутеров. Выключите из розетки правильный роутер - и два сегмента офиса больше не смогут переписываться. "Точка слабости" системы.</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "graph-euler",
    title: "13. Графы. Эйлеров цикл",
    type: "html",
    description: "Пройти по всем ребрам ровно 1 раз.",
    category: "Графы",
    content: `
<section id="graph-euler" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 13</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Эйлеров цикл</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-indigo-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-indigo-400 mb-4">Кругосветка без повторений</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-indigo-500/30">
                <p class="text-lg text-indigo-300 italic mb-2">Строгое правило / Формула (Неорграф):</p>
                <p class="text-xl font-mono text-white">Связный, все вершины четной степени. Цикл: 0 нечетных. Путь: ровно 2 нечетных.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🎨 Аналогия 1: Рисование не отрывая руки
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Классическая детская задача "нарисуй домик, не отрывая карандаш". Если в вершине сходится нечетное число линий, значит, из неё можно или только выйти, или только войти так, чтобы застрять навечно. Для цикла везде должно быть четное число (зашел-вышел).</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "pathfinding-accel",
    title: "17. Графы. Ускорения поиска",
    type: "html",
    description: "",
    category: "Графы. Пути",
    content: `
<section id="pathfinding-accel" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 17</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Ускорения (Двунаправленный BFS)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Встречный поиск</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Встречаемся на середине. Сложность O(2 * B^(d/2)) вместо O(B^d), где B-ветвление, d-длина.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🔦 Аналогия: Копаем туннель под Ла-Маншем
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Если копать туннель только из Англии во Францию, ты выкопаешь огромный круг лишней земли. Но если начать копать одновременно из Англии и из Франции навстречу друг другу, вы встретитесь посередине, проделав в 2 РАЗА меньше работы (геометрически: площади двух маленьких кругов меньше площади одного огромного).</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "mst-kruskal",
    title: "18. Графы. Остовное дерево. Краскал",
    type: "html",
    description: "",
    category: "Графы. Остовные",
    content: `
<section id="mst-kruskal" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 18</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Краскал (Kruskal)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Сортировка + DSU</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">1. Сортируем все рёбра по весу.<br>2. Берём минимальное. Если оно не замыкает цикл (проверяем через DSU) - берем в ответ.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🛠️ Аналогия: Прокладка интернет-кабеля (От дешевого к дорогому)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Мы хотим связать все города интернетом. Краскал говорит: "Давайте тупо строить с самых дешевых дорог в стране". Он строит кучу независимых кусочков по всей стране, пока в конце концов они все не сольются в единую сеть.</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "mst-prima",
    title: "19. Графы. Остовное дерево. Прима",
    type: "html",
    description: "",
    category: "Графы. Остовные",
    content: `
<section id="mst-prima" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 19</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Прима (Prim)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Растущее облако</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Поддерживаем множество посещенных. На каждом шаге "откусываем" самое легкое ребро, которое торчит из посещенных в непосещенные.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        ☣️ Аналогия: Заражение вирусом
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Если Краскал скачет по всей карте, то Прима ведет себя как ползучая грибница (или вирус). Мы стартуем из одного города, и "щупальце" всегда захватывает ближайший, самый дешевый соседний несвязанный город. Сеть растет только из одного связного куска.</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "mst-boruvka",
    title: "20. Графы. Остовное дерево. Борувка",
    type: "html",
    description: "",
    category: "Графы. Остовные",
    content: `
<section id="mst-boruvka" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 20</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Борувка (Boruvka)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Параллельное слияние</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Каждая компонента связности одновременно находит самое дешевое ребро наружу и сливается с соседом.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🤝 Аналогия: Племена
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Сначала все города - отдельные племена. В 1-й день племя шлет гонца к самому близкому племени для объединения. К вечеру племена объединились в царства (стало в 2 раза меньше компонент). На 2-й день уже царства шлют гонцов к ближайшему чужому царству. За логарифм дней образуется Федерация интернета!</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
  {
    id: "string-kmp",
    title: "21. Алгоритм Кнута-Морриса-Пратта (KMP)",
    type: "html",
    description: "",
    category: "Строки",
    content: `
<section id="string-kmp" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 21</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Алгоритм Кнута-Морриса-Пратта</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Поиск подстроки (Префикс-функция)</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Префикс-функция π[i] — это длина наибольшего собственного префикса подстроки s[0..i], который одновременно является её суффиксом.</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <!-- Аналогия 1 -->
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🪃 Аналогия 1: Бумеранг (Префикс = Суффикс)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Представь, что ты читаешь длинное слово "АБРАКАДАБРА". В самом конце ты опять видишь "АБРА". Если ты ошибешься при поиске на слове "АБРАКАДАБРА-X", тебе не нужно возвращаться в самое начало! Ты знаешь, что концовка "АБРА" совпадает с началом "АБРА". Ты просто перепрыгиваешь назад так, чтобы начало наложилось на конец, экономя время перепроверок!</p>
                </div>
            </div>
            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
vector&lt;int&gt; pi(s.length());
for (int i = 1; i &lt; s.length(); i++) {
    int j = pi[i-1];
    while (j > 0 && s[i] != s[j]) j = pi[j-1];
    if (s[i] == s[j]) j++;
    pi[i] = j;
}</pre>
                </div>
            </details>
        </div>
    </div>
</section>`,
  },
  {
    id: "string-z-func",
    title: "22. Z-функция",
    type: "html",
    description: "",
    category: "Строки",
    content: `
<section id="string-z-func" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 22</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Z-функция</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Блок совпадения префикса</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Z[i] — это длина наибольшего общего префикса (LCP) строки S и её суффикса, начинающегося с i.</p>
            </div>
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        📦 Аналогия 1: Копипаста
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Представь, что ты выделил начало текста (префикс). Z-функция для каждой позиции в тексте кричит: "Эй! Начиная с этой буквы идет ровно такой же кусок текста как в самом начале длины Z". Алгоритм поддерживает "окно" [L, R] самой дальней найденной копипасты, чтобы не сравнивать буквы заново.</p>
                </div>
            </div>
            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
int l = 0, r = 0;
for (int i = 1; i < n; i++) {
    if (i <= r) z[i] = min(r - i + 1, z[i - l]);
    while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
    if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
}</pre>
                </div>
            </details>
        </div>
    </div>
</section>`,
  },
  {
    id: "complexity-classes",
    title: "24. Классы сложности, сведение задач",
    type: "html",
    description: "",
    category: "Теория сложности",
    content: `
<section id="complexity-classes" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 24</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Классы сложности (P, NP, NP-hard)</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-purple-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-purple-400 mb-4">Границы невозможного</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-purple-500/30">
                <p class="text-lg text-purple-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">P: Можно решить быстро (полином).<br>NP: Можно БЫСТРО ПРОВЕРИТЬ готовый ответ.<br>Сведение (Reduction) A->B: Если я умею решать B, я могу конвертнуть решение в A без потери времени.</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <!-- Аналогия 1 -->
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🧩 Аналогия 1: Судоку (P vs NP)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Класс <b>P</b> — это когда алгоритм сам берет и быстро решает пустую доску (например сортировка чисел). Класс <b>NP</b> — это когда алгоритм не знает как собирать большое судоку, но если ты дашь ему заполненную сетку (ответ), он БЫСТРО (за класс P) проверит, что там нет ошибок по правилам.</p>
                </div>
                <!-- Аналогия 2 -->
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-purple-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-purple-900 text-purple-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-purple-500 shadow-md">
                        🔄 Аналогия 2: Машина-переводчик (Сведение)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Сведение A к B — это когда ты не умеешь говорить по-китайски (A), но у тебя есть отличный переводчик на английский (Сведение) и друг, болтающий по-английски (решение B). Если любая NP-задача сводится к задаче B, то B — это <b>NP-Полная</b> (сосредоточение всего зла)!</p>
                </div>
            </div>
        </div>
    </div>
</section>`,
  },
];
