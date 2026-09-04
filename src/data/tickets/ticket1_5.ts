import { Chapter } from '../types';

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
            </div>
        </div>
    </div>
</section>`
  }
];
