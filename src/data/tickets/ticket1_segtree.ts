import { Chapter } from '../../types';

/**
 * Билет 1 — «Дерево отрезков с операциями на отрезках».
 *
 * Страница написана по канону остальных билетов (эталон — KMP/Z и Treap):
 * одна главная секция, строгое правило по центру, аналогии-пиллы, «💀 Ты путаешь»,
 * явная строка сложности, весь код спрятан в <details>.
 *
 * Визуализация — src/components/SegmentTreeVisualizer.tsx (вкладки:
 * построение / запросы / теория), синхронизация с компилятором — PAGE_SYNC["segment-trees"]
 * (переменные n, i, v, l, r, m) и её подрежимы #build / #query / #lazy.
 */
export const ticket1Segtree: Chapter[] = [
  {
    id: "segment-trees",
    title: "1. Дерево отрезков с операциями на отрезках",
    type: "html",
    description:
      "Структура для запросов на отрезке и обновлений за O(log n), массовые обновления через lazy propagation.",
    category: "Продвинутые структуры",
    content: `
<section id="segment-trees" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 1</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Дерево отрезков с операциями на отрезках</h2>
    </div>

    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Одной фразой</h3>

            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Каждая вершина v хранит агрегат своего отрезка [l, r]: tree[v] = merge(tree[2v], tree[2v+1]), где m = (l + r) / 2. Запрос и обновление — O(log n), память — 4n.</p>
            </div>

            <p class="text-slate-300 text-sm mb-4">Массив из n чисел накрывают двоичным деревом: <b>корень</b> отвечает за весь отрезок <span class="font-mono text-emerald-300">[0, n−1]</span>, каждый внутренний узел делит свой отрезок пополам и отдаёт половины детям <span class="font-mono text-emerald-300">2v</span> и <span class="font-mono text-emerald-300">2v+1</span>, а <b>листья</b> — это одиночные элементы массива. В узле лежит не «кусок массива», а <b>ответ</b> на нём: сумма, минимум, максимум, НОД, количество единиц, И/ИЛИ — любая операция, которая умеет склеивать два соседних ответа в один (<span class="font-mono">merge</span>).</p>

            <p class="text-slate-300 text-sm mb-4">Отсюда всё остальное. <b>Запрос</b> «сколько на отрезке [L, R]» спускается от корня и на каждом уровне встречает один из трёх случаев: отрезок узла целиком внутри запроса — забираем tree[v] и не спускаемся; совсем не пересекается — возвращаем нейтральный элемент (0 для суммы, +∞ для минимума); пересекается частично — идём в обоих детей и склеиваем. Частичных пересечений на уровне бывает не больше двух, поэтому посещаем <b>O(log n)</b> вершин. <b>Обновление</b> одного элемента — спуск к листу и пересчёт всех предков на пути обратно (ровно height + 1 узлов).</p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 text-center">
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Высота</p>
                    <p class="font-mono text-emerald-300 text-sm">⌈log₂ n⌉ + 1</p>
                </div>
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Запрос / обновление</p>
                    <p class="font-mono text-emerald-300 text-sm">O(log n)</p>
                </div>
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Память (рекурсивное)</p>
                    <p class="font-mono text-emerald-300 text-sm">4n</p>
                </div>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🏢 Аналогия 1: Корпоративная премия (lazy)
                    </div>
                    <p class="text-slate-300 text-sm">Босс выписывает премию всем 10 000 сотрудников. Вместо 10 000 писем он пишет начальникам департаментов: «внутри всем +5 %». Начальник не пересчитывает ведомость сразу — он кладёт бумажку в ящик (<span class="font-mono text-emerald-300">lazy[v]</span>) и живёт дальше. Пересчёт случится ровно тогда, когда кто-то снизу придёт спрашивать свой баланс. Это и есть <b>отложенное обновление</b>: «+5 ко всему отрезку» стоит O(log n), а не O(n).</p>
                </div>

                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        📦 Аналогия 2: Матрёшки-коробки
                    </div>
                    <p class="text-slate-300 text-sm">Массив — огромная коробка, внутри две поменьше, и так далее до коробочек-элементов. Нужно покрасить половину массива в синий? Не красим каждый элемент — лепим стикер «внутри всё синее» на большую коробку. Внутрь спускаемся только тогда, когда нас спросили про конкретную маленькую коробочку, и по дороге <b>проталкиваем</b> стикеры вниз (push).</p>
                </div>
            </div>

            <div class="bg-slate-800/70 p-5 rounded-lg border border-slate-600 mt-6">
                <p class="text-sm font-bold text-white mb-2">🎚️ Операции на отрезках (массовое обновление)</p>
                <p class="text-slate-300 text-sm mb-3">«Прибавь x ко всем на [L, R]», «присвой всем на [L, R] значение c», «переверни биты на [L, R]» — всё это делается одним спуском: на полностью покрытых узлах обновляем tree[v] сразу (для «+x» к сумме: <span class="font-mono text-emerald-300">tree[v] += x · (r − l + 1)</span>), а детям оставляем обещание в lazy[v]. Главное — <b>порядок</b>: перед любым спуском в детей вызываем push(v), иначе дети считают ответ по устаревшим данным.</p>
                <table class="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr class="text-slate-500 border-b border-slate-700">
                            <th class="py-1.5 pr-2 font-bold">Обновление</th>
                            <th class="py-1.5 pr-2 font-bold">Как меняем tree[v]</th>
                            <th class="py-1.5 font-bold">Как копим lazy[v]</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-300 font-mono">
                        <tr class="border-b border-slate-800"><td class="py-1.5 pr-2">+x на отрезке</td><td class="py-1.5 pr-2">tree[v] += x · len</td><td class="py-1.5">lazy[v] += x</td></tr>
                        <tr class="border-b border-slate-800"><td class="py-1.5 pr-2">= c на отрезке</td><td class="py-1.5 pr-2">tree[v] = c · len</td><td class="py-1.5">lazy[v] = c (перезапись, не сумма)</td></tr>
                        <tr class="border-b border-slate-800"><td class="py-1.5 pr-2">инверсия битов</td><td class="py-1.5 pr-2">tree[v] = len − tree[v]</td><td class="py-1.5">lazy[v] ^= 1</td></tr>
                        <tr><td class="py-1.5 pr-2">min на отрезке</td><td class="py-1.5 pr-2">tree[v] = min(tree[v], c)</td><td class="py-1.5">lazy[v] = min(lazy[v], c)</td></tr>
                    </tbody>
                </table>
                <p class="text-slate-500 text-xs mt-3">Если обновлений два разных типа («присвой» и «прибавь»), lazy хранят парой и проталкивают в строгом порядке: сначала присваивание, потом прибавление.</p>
            </div>

            <div class="bg-slate-900/40 rounded-lg border border-slate-700/50 p-4 mt-4">
                <p class="text-slate-300 text-sm mb-2">💀 <b>Ты путаешь:</b></p>
                <p class="text-slate-400 text-sm mb-1">· <b>Дерево отрезков и префиксные суммы</b> (билет 5): префиксы отвечают на запрос за O(1), но строются один раз и умирают при первом обновлении элемента. Дерево отрезков платит O(log n) и живёт под обновлениями.</p>
                <p class="text-slate-400 text-sm mb-1">· <b>Дерево отрезков и разреженная таблица</b> (билет 2): sparse table даёт O(1) на идемпотентные запросы (min, gcd, И) по статическому массиву; сумма — не идемпотентна, там только дерево отрезков.</p>
                <p class="text-slate-400 text-sm mb-1">· <b>4n и 2n</b>: рекурсивное дерево на отрезке [0, n−1] с произвольным n требует 4n ячеек (не 2n!) — иначе на n = 6 поймать переполнение. Ровно 2n хватает только у итеративной версии, где листья лежат в tree[n … 2n−1] и n — степень двойки (или используется схема «снизу вверх» для любого n).</p>
                <p class="text-slate-400 text-sm">· <b>lazy не «применяется к детям сразу»</b>: push нужен ровно перед спуском. Проталкивать лень во всё дерево — это O(n) и весь смысл теряется.</p>
            </div>

            <p class="text-slate-300 text-sm mt-4"><b class="text-amber-300">Сложность — явно:</b> построение <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(n)</code> (не O(n log n): каждый узел посещается один раз), запрос на отрезке <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(log n)</code>, одиночное обновление <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(log n)</code>, массовое обновление с lazy <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(log n)</code>, память <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(n)</code>. На n запросов — <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(n log n)</code> против O(n²) у наивного пересчёта.</p>

            <p class="text-slate-500 text-xs mt-3 leading-relaxed">Где живёт в реальности: счётчики и статистика по диапазону дат, RMQ/RSQ в редакторах и базах, сжатие координат + «сколько точек в прямоугольнике», задачи на «отрезок покрасить / перевернуть / присвоить», дерево отрезков по дереву (HLD), персистентные версии. Если запрос звучит как «на отрезке» и данные меняются — это оно.</p>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код: построение и запрос суммы (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">const int MAXN = 100005;
int tree[4 * MAXN];        // 4n — обязательно, 2n не хватит
int a[MAXN];

void build(int v, int l, int r) {
    if (l == r) { tree[v] = a[l]; return; }   // лист
    int m = (l + r) / 2;
    build(2 * v, l, m);                        // левая половина
    build(2 * v + 1, m + 1, r);                // правая половина
    tree[v] = tree[2 * v] + tree[2 * v + 1];   // merge детей
}

int sum(int v, int l, int r, int L, int R) {   // сумма на [L, R]
    if (r &lt; L || R &lt; l) return 0;              // не пересекается → нейтральный
    if (L &lt;= l && r &lt;= R) return tree[v];      // покрыт целиком → забрали
    int m = (l + r) / 2;
    return sum(2 * v, l, m, L, R)              // частично → в обоих детей
         + sum(2 * v + 1, m + 1, r, L, R);
}

void update(int v, int l, int r, int i, int x) { // a[i] += x
    if (l == r) { tree[v] += x; return; }
    int m = (l + r) / 2;
    if (i &lt;= m) update(2 * v, l, m, i, x);
    else        update(2 * v + 1, m + 1, r, i, x);
    tree[v] = tree[2 * v] + tree[2 * v + 1];   // пересчёт предков
}</pre>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код: массовое обновление, lazy propagation (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">int lazy[4 * MAXN];        // «обещание»: прибавить к детям

void push(int v, int l, int r) {
    if (lazy[v] == 0) return;
    int m = (l + r) / 2;
    tree[2 * v]     += lazy[v] * (m - l + 1);      // применяем к левому
    lazy[2 * v]     += lazy[v];
    tree[2 * v + 1] += lazy[v] * (r - m);          // и к правому
    lazy[2 * v + 1] += lazy[v];
    lazy[v] = 0;                                   // обещание выполнено
}

void add(int v, int l, int r, int L, int R, int x) {  // +x на [L, R]
    if (r &lt; L || R &lt; l) return;
    if (L &lt;= l && r &lt;= R) {                        // покрыт целиком
        tree[v] += x * (r - l + 1);
        lazy[v] += x;                              // детям — обещание
        return;
    }
    push(v, l, r);                                 // ОБЯЗАТЕЛЬНО до спуска
    int m = (l + r) / 2;
    add(2 * v, l, m, L, R, x);
    add(2 * v + 1, m + 1, r, L, R, x);
    tree[v] = tree[2 * v] + tree[2 * v + 1];
}</pre>
                    <p class="text-slate-400 text-xs">Правило push: вызываем его <b>перед</b> уходом в детей в любом месте, где lazy[v] мог накопиться. Забыл push — получил правильный ответ на маленьких тестах и Wrong Answer на больших.</p>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код: итеративное дерево (2n, снизу вверх) (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">n = 8                                # для удобства — степень двойки
tree = [0] * (2 * n)
for i in range(n):                   # листья: tree[n + i] = a[i]
    tree[n + i] = a[i]
for v in range(n - 1, 0, -1):        # предки снизу вверх
    tree[v] = tree[2 * v] + tree[2 * v + 1]

def query(l, r):                     # сумма на полуинтервале [l, r)
    res = 0
    l += n; r += n
    while l &lt; r:
        if l & 1: res += tree[l]; l += 1     # l — правый сын → берём и шагаем
        if r & 1: r -= 1; res += tree[r]     # r — правый сын → берём его слева
        l //= 2; r //= 2
    return res</pre>
                    <p class="text-slate-400 text-xs">Итеративная версия короче и быстрее (нет рекурсии), но массовые обновления с lazy в ней заметно хитрее — на экзамене безопаснее показывать рекурсивную.</p>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🎓 Вопросы, которые любят задавать (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-2">
                    <p>· Почему 4n, а не 2n? — при n, не являющемся степенью двойки, дерево несбалансировано: номера узлов доходят до 4n (пример: n = 6).</p>
                    <p>· Сколько вершин посещает запрос? — не больше 4·log₂ n: на каждом уровне «частично пересекающихся» узлов максимум два.</p>
                    <p>· Почему построение O(n), а не O(n log n)? — узлов в дереве 2n − 1, каждый посещается ровно один раз.</p>
                    <p>· Какие операции подходят? — любые ассоциативные с нейтральным элементом (сумма, min, max, gcd, И, ИЛИ, XOR). Для «количество различных на отрезке» обычное дерево отрезков не годится — там идут в offline-подходы.</p>
                    <p>· Зачем push в запросе, если ничего не обновляли? — на пути могли остаться чужие lazy от прошлых массовых обновлений; push делает данные детей достоверными.</p>
                </div>
            </details>
        </div>
    </div>
</section>
`,
  },
];
