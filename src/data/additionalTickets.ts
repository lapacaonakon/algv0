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
                    <p class="text-slate-300 text-sm mb-4">Split(t, x) — таможня с двумя коридорами: зелёный «все x ≤ x₀», красный «все x &gt; x₀». Спуск от корня: узел, который вместе со своим поддеревом целиком проходит по одному коридору, отправляется туда <b>без вскрытия</b> — дальше досматривается только одна ветка. Поэтому split стоит O(h), а не O(n).</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🧲 Аналогия 2: Слияние капель (Merge)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Merge(a, b) склеивает два дерева при условии «все x в a меньше всех x в b». Каждый шаг — одно сравнение: чей y у корня больше, тот и принимает колонну, а «стыковка» продолжается в одном его поддереве (том, что сохраняет порядок x). Итого O(h) сравнений y — без перестроек и поворотов.</p>
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

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Как построить: точки и линии</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Общепринятое определение:</p>
                <p class="text-xl font-mono text-white">Treap хранит пары (x; y): для ключа x — бинарное дерево поиска, для приоритета y — двоичная куча. Пара (x; y) — точка на декартовой плоскости, отсюда и название.</p>
            </div>

            <div class="bg-slate-900 p-6 rounded-lg border-2 border-rose-500/60 mb-6">
                <p class="text-2xl sm:text-3xl font-bold text-rose-300 uppercase tracking-wide text-center">Малый x — огромный y: <span class="text-white">Х!Й</span></p>
                <p class="text-lg text-slate-200 font-mono text-center mt-2">! = y = приоритет = вершина кучи</p>
            </div>
                    <p class="text-slate-300 text-sm mb-2">Вкладка <b>«Собрать»</b>: точки приходят как попало → видимая сортировка по y (попробуй обе: quicksort против counting — разница есть) → соединение линиями в <b>любом</b> порядке: по y или слева-направо, результат один. Чек-лист ✅ проверяет инварианты сам: ребро вниз по y, обход по x отсортирован, линий n−1.</p>
                    <p class="text-slate-300 text-sm">Вкладки <b>Split / Merge / Erase</b> — операции по шагам; <b>«Миф 2k/2k+1»</b> и <b>«Поиск ≠ сортировка»</b> — разбор двух граблей справа вживую.</p>
                </div>

                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        💀 Ты путаешь
                    </div>
                    <p class="text-slate-300 text-sm mb-2">· «Отсортирую бинарным поиском»: поиск не сортирует; сравнительная сортировка — не быстрее n·log n.</p>
                    <p class="text-slate-300 text-sm mb-2">· Дети «в массиве по 2k/2k+1» — только у полных деревьев; treap растёт кривым.</p>
                    <p class="text-slate-300 text-sm">· «Убрать можно только самый верхний»: произвольная точка тоже вырезается — её дети сшиваются merge за O(h).</p>
                </div>
            </div>

            <p class="text-slate-300 text-sm mt-5"><b class="text-amber-300">Сложность — явно:</b> поиск, вставка, удаление — <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(log n)</code> в среднем; построение — <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(n log n)</code>: сортировка (n·log n сравнений или O(n) counting по целым y) плюс n спусков. Худший случай — приоритеты вытянулись в цепочку: <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-rose-300 border border-slate-800">O(n)</code> на операцию, <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-rose-300 border border-slate-800">O(n²)</code> на построение.</p>

            <p class="text-slate-400 text-xs mt-4 leading-relaxed">Х!Й — расшифровка: «!» — это y (приоритет): маленький знак держит всё слово — убери, и останется набор букв, как treap без y останется обычным деревом поиска-палкой. Х — это x (ключ): место по алфавиту, левее — налево, правее — направо. Все стоят по алфавиту, но кричат по «!»: корень самый громкий, родитель всегда громче детей. Равные «!» — выше тот, кто раньше заявил заявку в списке; равные x — идут влево по уставу.</p>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код: вставка и удаление (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
def insert(root, key, pri):
    if root is None:
        return Node(key, pri)
    if key &lt;= root.key:                # равные x — влево
        root.left = insert(root.left, key, pri)
    else:
        root.right = insert(root.right, key, pri)
    return root

for key, pri in pairs_sorted_by_pri_desc:   # порядок задаёт y
    root = insert(root, key, pri)</pre>
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
def merge(a, b):                   # все x в a &lt; всех x в b
    if not a or not b: return a or b
    if a.pri &gt; b.pri:
        a.right = merge(a.right, b); return a
    b.left = merge(a, b.left); return b

def erase(root, key):              # удалить произвольную точку
    if key &lt; root.key:  root.left  = erase(root.left, key)
    elif key &gt; root.key: root.right = erase(root.right, key)
    else: root = merge(root.left, root.right)
    return root</pre>
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
    description: "Дерево поиска, которое чинит само себя прямо во время запросов.",
    category: "Продвинутые структуры",
    content: `
<section id="splay-tree" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 4</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Splay-дерево</h2>
    </div>

    <div class="space-y-8">

        <!-- 0. Определение -->
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Одной фразой</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2 text-center">Строгое правило / Формула:</p>
                <p class="text-lg sm:text-xl font-mono text-white text-center leading-relaxed">Splay-дерево — это обычное бинарное дерево поиска <span class="text-slate-500">без</span> балансировочных полей.<br>После каждого обращения к узлу v выполняется Splay(v): серия поворотов, которая поднимает v в корень.</p>
                <p class="text-sm text-slate-400 text-center mt-3">Никаких высот, цветов и приоритетов не хранится. Единственный инструмент — поворот.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
                <div class="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <p class="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Одна операция</p>
                    <p class="text-white font-bold">может стоить O(n)</p>
                    <p class="text-slate-400 text-xs mt-1">гарантии на каждый отдельный запрос нет</p>
                </div>
                <div class="bg-slate-900 rounded-lg p-4 border border-emerald-700/60">
                    <p class="text-xs uppercase tracking-wider text-emerald-500 font-bold mb-1">Любые m операций</p>
                    <p class="text-emerald-300 font-bold">стоят O(m·log n)</p>
                    <p class="text-slate-400 text-xs mt-1">то есть амортизированное O(log n) на операцию</p>
                </div>
                <div class="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <p class="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Память</p>
                    <p class="text-white font-bold">O(n), только ключ и 2 ссылки</p>
                    <p class="text-slate-400 text-xs mt-1">легче, чем AVL или красно-чёрное</p>
                </div>
            </div>
        </div>

        <!-- 1. Зачем -->
        <div class="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
            <h3 class="text-lg font-bold text-white mb-3">Шаг 1. От какой боли это лечит</h3>
            <p class="text-slate-300 text-sm mb-4">В обычном бинарном дереве поиска всё хорошо, пока оно «кустистое». Но стоит вставить ключи по возрастанию — и дерево вырождается в список, а поиск становится O(n):</p>
            <pre class="bg-slate-950 p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono text-slate-300 border border-slate-800 leading-relaxed">вставили 10, 20, 30, 40, 50 подряд:

  10
    \\
     20
       \\
        30            высота = 5, поиск 50 = 5 сравнений
          \\           это уже не дерево, а односвязный список
           40
             \\
              50</pre>
            <p class="text-slate-300 text-sm mt-4">Есть два способа с этим бороться:</p>
            <ul class="list-disc list-inside text-slate-300 text-sm space-y-1 mt-2">
                <li><span class="text-white font-bold">Профилактика.</span> AVL и красно-чёрные деревья хранят в узлах высоту/цвет и после каждой вставки чинят дерево, чтобы оно <em>никогда</em> не становилось кривым. За это платим памятью и кучей случаев в коде.</li>
                <li><span class="text-white font-bold">Лечение по факту (это и есть splay).</span> Ничего не храним и позволяем дереву временно быть кривым. Но каждый раз, когда мы по нему <em>проходим</em>, мы этот путь заодно и распрямляем. Чем чаще ходишь — тем ровнее становится.</li>
            </ul>
        </div>

        <!-- 2. Аналогии -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                    📚 Аналогия 1: стопка бумаг на столе
                </div>
                <p class="text-slate-300 text-sm">У тебя на столе стопка документов. Понадобился какой-то лист — ты роешься в стопке, вытаскиваешь его и, поработав, кладёшь <span class="text-white font-bold">сверху</span>. Никакой сортировки ты не ведёшь, но через неделю самые нужные бумаги сами собой оказываются в верхних сантиметрах стопки, а всё забытое утонуло вниз. Splay-дерево делает ровно это: «взял → положил наверх».</p>
            </div>
            <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                    🛗 Аналогия 2: тропинка через газон
                </div>
                <p class="text-slate-300 text-sm">Ты идёшь длинной кривой дорожкой до подъезда. Splay — это как если бы после каждого прохода дорожка сама укорачивалась вдвое: чем чаще ты ходишь, тем короче путь. Первый проход дорогой (шёл по всей кривой), зато он оплачивает все следующие. Пойдёшь один раз в год — сэкономить не выйдет, и это честная слабость структуры.</p>
            </div>
        </div>

        <!-- 3. Поворот -->
        <div class="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
            <h3 class="text-lg font-bold text-white mb-3">Шаг 2. Единственный кирпичик — поворот</h3>
            <p class="text-slate-300 text-sm mb-4">Поворот меняет местами узел и его родителя. Это <span class="text-white font-bold">одно движение, три перевешенные ссылки</span> и ничего больше:</p>
            <pre class="bg-slate-950 p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono text-slate-300 border border-slate-800 leading-relaxed">        40                          20
       /  \\      поворот 20        /  \\
     20    C     ------------&gt;    A    40
    /  \\         &lt;------------         /  \\
   A    B          поворот 40         B    C

обход слева направо ДО:     A 20 B 40 C
обход слева направо ПОСЛЕ:  A 20 B 40 C     ← тот же самый!</pre>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div class="bg-slate-900 rounded-lg p-4 border border-emerald-700/50">
                    <p class="text-emerald-400 font-bold text-sm mb-1">Что сохраняется</p>
                    <p class="text-slate-300 text-xs">Порядок ключей слева направо. Поэтому дерево остаётся деревом поиска после любого числа поворотов — сломать его поворотами невозможно.</p>
                </div>
                <div class="bg-slate-900 rounded-lg p-4 border border-amber-700/50">
                    <p class="text-amber-400 font-bold text-sm mb-1">Куда девается «средний» подвес</p>
                    <p class="text-slate-300 text-xs">Поддерево B висело справа от 20 и слева от 40 — то есть его ключи между 20 и 40. Это одно и то же место, поэтому B просто перевешивается с одного на другое. Только оно и меняет хозяина.</p>
                </div>
            </div>
        </div>

        <!-- 4. Три случая -->
        <div class="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
            <h3 class="text-lg font-bold text-white mb-3">Шаг 3. Splay(x) = крутим, пока x не станет корнем</h3>
            <p class="text-slate-300 text-sm mb-4">Обозначения на всю оставшуюся главу: <span class="font-mono text-indigo-300">x</span> — узел, который поднимаем, <span class="font-mono text-sky-300">p</span> — его родитель, <span class="font-mono text-amber-300">g</span> — дед (родитель родителя). Смотрим на эту тройку и выбираем один из трёх случаев:</p>

            <div class="overflow-x-auto -mx-2 px-2">
                <table class="w-full text-xs sm:text-sm border-collapse min-w-[520px]">
                    <thead>
                        <tr class="text-left text-slate-400 border-b border-slate-600">
                            <th class="py-2 pr-3 font-bold">Случай</th>
                            <th class="py-2 pr-3 font-bold">Как узнать</th>
                            <th class="py-2 pr-3 font-bold">Что крутим ПЕРВЫМ</th>
                            <th class="py-2 font-bold">Итог</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-300">
                        <tr class="border-b border-slate-700/60">
                            <td class="py-3 pr-3 font-bold text-indigo-300">Zig</td>
                            <td class="py-3 pr-3">деда нет, p — корень</td>
                            <td class="py-3 pr-3">сам x (один поворот)</td>
                            <td class="py-3">x стал корнем, конец</td>
                        </tr>
                        <tr class="border-b border-slate-700/60">
                            <td class="py-3 pr-3 font-bold text-indigo-300">Zig-Zig</td>
                            <td class="py-3 pr-3">x и p — дети с <span class="text-white font-bold">одной</span> стороны (лево-лево или право-право)</td>
                            <td class="py-3 pr-3"><span class="text-amber-300 font-bold">родителя p</span> вокруг деда, потом x</td>
                            <td class="py-3">x поднялся на 2 уровня, ветка укоротилась вдвое</td>
                        </tr>
                        <tr>
                            <td class="py-3 pr-3 font-bold text-indigo-300">Zig-Zag</td>
                            <td class="py-3 pr-3">x и p — дети с <span class="text-white font-bold">разных</span> сторон («змейка»)</td>
                            <td class="py-3 pr-3"><span class="text-amber-300 font-bold">сам x</span> вокруг p, потом x вокруг g</td>
                            <td class="py-3">p и g стали двумя детьми x</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p class="text-slate-300 text-sm mt-4">И так по кругу: определили случай → сделали 1–2 поворота → x поднялся ближе к корню → снова смотрим на тройку. Zig может случиться только один раз — самым последним, если до корня остался ровно один шаг.</p>
            <p class="text-slate-400 text-xs mt-3">👇 Ниже на этой странице стоит пошаговая анимация всех трёх случаев и песочница, где повороты можно поделать руками.</p>
        </div>

        <!-- 5. Главная ловушка -->
        <div class="bg-rose-950/30 p-6 rounded-xl border border-rose-800/60">
            <h3 class="text-lg font-bold text-rose-300 mb-3">⚠️ Шаг 4. Почему Zig-Zig — это НЕ «два раза Zig»</h3>
            <p class="text-slate-300 text-sm mb-4">Это любимый вопрос на экзамене. Возьмём бамбук 60 → 40 → 20 и поднимем 20 двумя способами.</p>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="bg-slate-950 rounded-lg p-4 border border-rose-800/60">
                    <p class="text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">❌ Наивно: два раза поднимаем x</p>
                    <pre class="overflow-x-auto text-[11px] sm:text-xs font-mono text-slate-300 leading-relaxed">    60          60             20
    /           /              \\
  40    →     20        →       60
  /             \\              /
20              40           40

было: бамбук влево
стало: бамбук вправо
глубина никого не сократилась!</pre>
                    <p class="text-slate-400 text-xs mt-2">Дерево просто «перевернулось». Следующий запрос снова пройдёт O(n), и никакой амортизации не получится.</p>
                </div>
                <div class="bg-slate-950 rounded-lg p-4 border border-emerald-800/60">
                    <p class="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">✅ Zig-Zig: сначала верхняя пара</p>
                    <pre class="overflow-x-auto text-[11px] sm:text-xs font-mono text-slate-300 leading-relaxed">    60          40             20
    /           /  \\           /  \\
  40    →     20    60   →   A     40
  /           /                      \\
20          A                         60

было: линия из 3 узлов
стало: кустик высоты 2
глубина ветки упала вдвое!</pre>
                    <p class="text-slate-400 text-xs mt-2">Тот самый эффект «дорожка укоротилась вдвое». Именно он и даёт O(log n) в среднем.</p>
                </div>
            </div>
            <p class="text-slate-300 text-sm mt-4"><span class="text-white font-bold">Мнемоника:</span> линия (zig-zig) — крути СВЕРХУ вниз, змейка (zig-zag) — крути СНИЗУ вверх.</p>
        </div>

        <!-- 6. Полный пример -->
        <div class="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
            <h3 class="text-lg font-bold text-white mb-3">Шаг 5. Полный прогон: ищем 10 в бамбуке</h3>
            <p class="text-slate-300 text-sm mb-4">Дерево 40 → 30 → 20 → 10 (каждый следующий — левый сын). Ищем 10: спускаемся до него за 3 шага, а потом делаем Splay(10).</p>
            <pre class="bg-slate-950 p-4 rounded-lg overflow-x-auto text-[11px] sm:text-xs font-mono text-slate-300 border border-slate-800 leading-relaxed">старт           после Zig-Zig(10)     после Zig-Zig(10)
                глубина 3 → 1          10 в корне

   40                 30                   10
   /                 /  \\                   \\
 30               10     40                  30
 /                  \\                       /  \\
20                   20                   20    40
/
10

итог: было 4 узла в линию (высота 4) → стало высота 3,
      а сама десятка теперь в корне: следующий запрос к ней = 0 сравнений</pre>
            <p class="text-slate-300 text-sm mt-4">Обрати внимание: мы не только достали ключ, но и <span class="text-white font-bold">починили дерево по пути</span>. Все узлы, мимо которых мы проходили, тоже стали ближе к корню — примерно вдвое.</p>
        </div>

        <!-- 7. Амортизация -->
        <div class="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
            <h3 class="text-lg font-bold text-white mb-3">Шаг 6. Откуда берётся амортизированное O(log n)</h3>
            <p class="text-slate-300 text-sm mb-3">Строгое доказательство — через метод потенциала: потенциалом считают сумму log(размер поддерева) по всем узлам, и Zig-Zig/Zig-Zag устроены так, что заплаченные повороты компенсируются падением потенциала. На пальцах идея такая:</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div class="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <p class="text-white font-bold mb-1">Дорогой запрос</p>
                    <p class="text-slate-400 text-xs">спустились на глубину d — заплатили d</p>
                </div>
                <div class="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <p class="text-white font-bold mb-1">…сам себя чинит</p>
                    <p class="text-slate-400 text-xs">но заодно укоротил весь этот путь примерно вдвое</p>
                </div>
                <div class="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <p class="text-white font-bold mb-1">Дважды не разоришься</p>
                    <p class="text-slate-400 text-xs">длинный путь нельзя пройти много раз подряд — он кончается</p>
                </div>
            </div>
            <p class="text-slate-400 text-xs mt-4">Отсюда же «теорема о статической оптимальности»: на любой фиксированной последовательности запросов splay-дерево не хуже (с точностью до константы), чем идеально подобранное под эту последовательность статическое дерево. Оно как бы само подстраивается под то, что у тебя спрашивают.</p>
        </div>

        <!-- 8. Операции -->
        <div class="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
            <h3 class="text-lg font-bold text-white mb-3">Шаг 7. Все операции — через один Splay</h3>
            <p class="text-slate-300 text-sm mb-4">Красота структуры в том, что отдельной логики почти нет: сделал Splay — и дальше всё делается в корне.</p>
            <div class="space-y-2 text-sm">
                <div class="bg-slate-900 rounded-lg p-3 border border-slate-700"><span class="font-mono text-indigo-300 font-bold">find(k)</span> <span class="text-slate-400">— спустились как в обычном дереве поиска, затем Splay(найденного). Если ключа нет — поднимаем последний узел на пути (соседний по значению).</span></div>
                <div class="bg-slate-900 rounded-lg p-3 border border-slate-700"><span class="font-mono text-indigo-300 font-bold">split(k)</span> <span class="text-slate-400">— Splay(k), после чего k в корне: левое поддерево = всё меньше k, правое = всё больше. Просто отрезаем ссылки.</span></div>
                <div class="bg-slate-900 rounded-lg p-3 border border-slate-700"><span class="font-mono text-indigo-300 font-bold">insert(k)</span> <span class="text-slate-400">— split по k, новый узел делаем корнем, а две половинки подвешиваем ему детьми.</span></div>
                <div class="bg-slate-900 rounded-lg p-3 border border-slate-700"><span class="font-mono text-indigo-300 font-bold">erase(k)</span> <span class="text-slate-400">— Splay(k), выкидываем корень, остаются два дерева L и R. Делаем Splay максимума в L: у него не будет правого сына — туда и вешаем R.</span></div>
            </div>
        </div>

        <!-- 9. Код -->
        <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group">
            <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors cursor-pointer group-open:border-b border-slate-700/50">
                💻 Код: rotate + splay + find (нажми, чтобы раскрыть)
            </summary>
            <div class="p-5 text-sm text-slate-300 space-y-4">
                <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800 leading-relaxed">// узел: { key, left, right, parent }

// один поворот: x встаёт на место своего родителя
function rotate(x) {
  const p = x.parent, g = p.parent;

  if (p.left === x) {          // правый поворот
    p.left = x.right;
    if (x.right) x.right.parent = p;
    x.right = p;
  } else {                     // левый поворот (зеркально)
    p.right = x.left;
    if (x.left) x.left.parent = p;
    x.left = p;
  }

  p.parent = x;                // родитель уехал вниз
  x.parent = g;                // x занял его место
  if (g) { if (g.left === p) g.left = x; else g.right = x; }
}

// поднимаем x в корень
function splay(x) {
  while (x.parent) {
    const p = x.parent, g = p.parent;

    if (!g) {                            // ZIG: деда нет
      rotate(x);
    } else if ((g.left === p) === (p.left === x)) {
      rotate(p);                         // ZIG-ZIG: сначала ВЕРХНЯЯ пара!
      rotate(x);
    } else {
      rotate(x);                         // ZIG-ZAG: сначала НИЖНЯЯ пара
      rotate(x);
    }
  }
  return x;                              // теперь x — корень
}

// поиск: спустились и подняли найденное наверх
function find(root, key) {
  let cur = root, last = null;
  while (cur) {
    last = cur;
    if (key === cur.key) break;
    cur = key &lt; cur.key ? cur.left : cur.right;
  }
  return last ? splay(last) : null;      // splay делаем ВСЕГДА
}</pre>
                <p class="text-xs text-slate-400">Вся разница между тремя случаями — это <span class="font-mono text-white">rotate(p); rotate(x);</span> против <span class="font-mono text-white">rotate(x); rotate(x);</span>. Одна строчка, а без неё структура теряет свою оценку.</p>
            </div>
        </details>

        <!-- 10. Плюсы/минусы -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-emerald-950/30 rounded-xl p-5 border border-emerald-800/50">
                <p class="text-emerald-300 font-bold mb-2">Сильные стороны</p>
                <ul class="list-disc list-inside text-slate-300 text-sm space-y-1">
                    <li>Простой код: нет высот, цветов, балансировочных случаев</li>
                    <li>Меньше памяти, чем у AVL и красно-чёрного</li>
                    <li>Сам подстраивается под «горячие» ключи (кеш-эффект)</li>
                    <li>split / merge получаются почти бесплатно</li>
                </ul>
            </div>
            <div class="bg-rose-950/30 rounded-xl p-5 border border-rose-800/50">
                <p class="text-rose-300 font-bold mb-2">Слабые стороны</p>
                <ul class="list-disc list-inside text-slate-300 text-sm space-y-1">
                    <li>Нет гарантии на <em>отдельную</em> операцию — она может стоить O(n)</li>
                    <li>Не годится для реального времени (медицина, авионика)</li>
                    <li>Дерево меняется даже при чтении → плохо для многопоточности</li>
                    <li>Постоянные записи в память при чисто читающей нагрузке</li>
                </ul>
            </div>
        </div>

        <!-- 11. Вопросы -->
        <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group">
            <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors cursor-pointer group-open:border-b border-slate-700/50">
                🎓 Вопросы, которые задают на экзамене (сначала ответь сам)
            </summary>
            <div class="p-5 text-sm text-slate-300 space-y-4">
                <div>
                    <strong class="text-white block mb-1">1. Ищем ключ, которого в дереве нет. Что окажется в корне?</strong>
                    <p class="text-slate-400">Последний узел, до которого дошёл спуск, — то есть ближайший сосед искомого ключа (предшественник или преемник). Splay делают всегда, даже при неудачном поиске: иначе неудачные поиски по длинной ветке ничего не чинили бы, и амортизация сломалась бы.</p>
                </div>
                <div>
                    <strong class="text-white block mb-1">2. Почему в Zig-Zig первым крутят родителя, а не x?</strong>
                    <p class="text-slate-400">Потому что только такой порядок укорачивает всю ветку вдвое. Два подъёма самого x просто переворачивают бамбук в другую сторону (см. блок выше) и оценка O(log n) перестаёт работать.</p>
                </div>
                <div>
                    <strong class="text-white block mb-1">3. Какая последовательность запросов «убивает» splay-дерево?</strong>
                    <p class="text-slate-400">Чередование двух ключей с противоположных концов — минимума и максимума. Каждый Splay вытягивает один из них в корень, превращая дерево в бамбук для другого. Но даже это остаётся O(log n) амортизированно; катастрофа наступает только для <em>одной</em> конкретной операции, которая может обойтись в O(n).</p>
                </div>
                <div>
                    <strong class="text-white block mb-1">4. Чем splay отличается от Treap?</strong>
                    <p class="text-slate-400">Treap держит баланс случайным приоритетом (в среднем по монетке) и не меняется при чтении. Splay не хранит вообще ничего и держит баланс детерминированно — за счёт того, что перестраивает дерево при каждом обращении.</p>
                </div>
            </div>
        </details>

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
