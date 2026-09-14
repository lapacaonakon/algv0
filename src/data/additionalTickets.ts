import { Chapter } from "../types";

export const additionalTickets: Chapter[] = [
  {
    id: "sparse-table",
    title: "2. Двумерная разреженная матрица (Sparse Table)",
    type: "html",
    description: "Разреженная таблица для идемпотентных запросов RMQ: 1D и 2D, цена памяти и сравнение с префиксными суммами.",
    category: "Продвинутые структуры",
    content: `
<section id="sparse-table" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 2</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Двумерная разреженная таблица</h2>
    </div>

    <div class="space-y-8">

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Суть: заранее посчитать ответы на всех блоках-степенях двойки</h3>

            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула (1D — основа всего):</p>
                <p class="text-xl font-mono text-white">st[i][j] = op(st[i][j−1], st[i + 2^(j−1)][j−1])</p>
                <p class="text-sm font-mono text-slate-300 mt-2">Запрос [l, r]: k = ⌊log₂(r − l + 1)⌋, ответ = op(st[l][k], st[r − 2^k + 1][k])</p>
            </div>

            <p class="text-slate-300 text-sm mb-4">Ячейка <span class="font-mono text-emerald-300">st[i][j]</span> хранит ответ на блоке длины <span class="font-mono text-emerald-300">2^j</span>, который начинается в позиции <span class="font-mono text-emerald-300">i</span>. Любой отрезок накрывается <b>двумя</b> такими блоками — даже если они перекрываются. Перекрытие не мешает, когда операция <b>идемпотентна</b>: <span class="font-mono text-emerald-300">op(x, x) = x</span>. Это <span class="font-mono text-emerald-300">min</span>, <span class="font-mono text-emerald-300">max</span>, <span class="font-mono text-emerald-300">gcd</span>, побитовые И и ИЛИ.</p>

            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-indigo-500/30">
                <p class="text-lg text-indigo-300 italic mb-2">Двумерный вариант — то, что спрашивают в билете:</p>
                <p class="text-xl font-mono text-white">st[r][c][kx][ky] = op из четырёх квадрантов 2^(kx−1) × 2^(ky−1)</p>
                <p class="text-sm font-mono text-slate-300 mt-2">Запрос (r1,c1)…(r2,c2): kx = ⌊log₂(r2−r1+1)⌋, ky = ⌊log₂(c2−c1+1)⌋,<br>ответ = op из четырёх блоков kx × ky, накрывающих прямоугольник</p>
            </div>

            <p class="text-slate-300 text-sm mb-4">Двумерная таблица — это та же одномерная, применённая дважды: сначала по строкам, потом по столбцам. Отсюда и цена: уровней становится <span class="font-mono text-emerald-300">log N × log M</span>, а не <span class="font-mono text-emerald-300">log N</span>.</p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 text-center">
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Память</p>
                    <p class="font-mono text-rose-300 text-sm">O(N·M·log N·log M)</p>
                    <p class="text-[11px] text-slate-500 mt-1">десятки копий матрицы</p>
                </div>
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Запрос</p>
                    <p class="font-mono text-emerald-300 text-sm">O(1)</p>
                    <p class="text-[11px] text-slate-500 mt-1">4 обращения к таблице</p>
                </div>
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Обновление элемента</p>
                    <p class="font-mono text-rose-300 text-sm">нет</p>
                    <p class="text-[11px] text-slate-500 mt-1">только полная перестройка</p>
                </div>
            </div>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Аналогии</h3>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        Аналогия 1: Сетка из вафельных трубочек
                    </div>
                    <p class="text-slate-300 text-sm mb-4">🧇 Префиксная матрица — сетка, где в каждой клетке лежит «сколько трубочек всего накопилось от угла (0,0) до меня». Хочешь посчитать трубочки в прямоугольнике посередине — вычти лишние полосы слева и сверху и верни дважды отрезанный угол. Вычитание работает, потому что у суммы есть обратная операция: трубочки можно не только докладывать, но и убирать обратно. Поэтому хранить копии не нужно: одна тонкая сетка размеров оригинала.</p>
                    <div class="rounded-lg bg-slate-950/70 border border-slate-700 p-3 text-[12px] font-mono space-y-1">
                        <div><span class="text-slate-500">время:</span> <span class="text-emerald-300">построение O(N·M), запрос суммы O(1)</span></div>
                        <div><span class="text-slate-500">память:</span> <span class="text-emerald-300">N×M — как оригинал, тонкая</span></div>
                    </div>
                    <p class="text-[12px] text-slate-400 mt-2">Почему тонкая: каждая клетка аккумулирует весь прямоугольник от угла (0,0). Работает ТОЛЬКО для суммы: менять элементы нельзя (полный пересчёт), а минимум так не накопишь — обратной операции нет.</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        Аналогия 2: Торт-пирамидка
                    </div>
                    <p class="text-slate-300 text-sm mb-4">🍰 Разреженная таблица минимумов — торт, жирный по памяти и по времени построения, зато красивый, как пирамидка: каждый из logN×logM уровней — почти полная копия матрицы (уровень (kx, ky) хранит минимумы всех блоков 2^kx × 2^ky), и ответ на запрос собирается из четырёх готовых блоков за O(1). Торт пекут только тогда, когда обратной операции нет: крем обратно в торт не запихнёшь — «вычесть» минимум из минимума нельзя. Зато перекрытие блоков не мешает (min(x, x) = x), и цена O(1) — сто коржей вместо одной матрицы.</p>
                    <div class="rounded-lg bg-slate-950/70 border border-slate-700 p-3 text-[12px] font-mono space-y-1">
                        <div><span class="text-slate-500">время:</span> <span class="text-rose-300">построение O(N·M·logN·logM), запрос min O(1)</span></div>
                        <div><span class="text-slate-500">память:</span> <span class="text-rose-300">N×M×logN×logM — для 1000×1000 ≈ 10×10 = 100 копий матрицы</span></div>
                    </div>
                    <p class="text-[12px] text-slate-400 mt-2">Когда нужен: min, max, gcd — операции без обратной (перекрытие блоков не мешает). Менять элементы тоже нельзя. Сумму через такой торт считать НЕЛЬЗЯ: перекрытие посчитает элементы дважды.</p>
                </div>
            </div>
            <p class="text-slate-400 text-sm mt-4">Порядок чтения демонстрации ниже: вкладка <b>1D</b> (как строится таблица по одному измерению) → <b>2D: построение</b> (уровни <span class="font-mono text-emerald-300">k</span> из четырёх квадрантов) → <b>2D: запрос</b> (прямоугольник раскладывается на четыре блока).</p>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-rose-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-rose-400 mb-4">Префиксная против разреженной: кто жирнее</h3>
            <p class="text-slate-300 text-sm mb-4">Эти две структуры путают чаще всего, потому что обе отвечают на запрос о прямоугольнике за <span class="font-mono text-emerald-300">O(1)</span>. Но по памяти они различаются на порядки, и <b>они не конкуренты</b>: они решают разные задачи.</p>

            <div class="bg-slate-800/70 p-5 rounded-lg border border-slate-600 mt-6">
                <p class="text-sm font-bold text-white mb-2">Сравнение: двумерная префиксная сумма и двумерная разреженная таблица</p>
                <p class="text-slate-300 text-sm mb-3">Размер указан для матрицы N × M; у префиксной суммы это ровно размер исходной матрицы, у разреженной таблицы — размер, умноженный на число уровней.</p>
                <table class="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr class="text-slate-500 border-b border-slate-700">
                            <th class="py-1.5 pr-2 font-bold">Свойство</th>
                            <th class="py-1.5 pr-2 font-bold">Префиксная сумма 2D (билет 5)</th>
                            <th class="py-1.5 pr-2 font-bold">Разреженная таблица 2D (этот билет)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-b border-slate-800 align-top">
                            <td class="py-2 pr-3 font-bold">Память</td>
                            <td class="py-2 pr-3 font-mono text-emerald-300">N × M — как сама матрица</td>
                            <td class="py-2 pr-3 font-mono text-rose-300">N × M × log N × log M — десятки копий</td>
                        </tr>
                        <tr class="border-b border-slate-800 align-top">
                            <td class="py-2 pr-3 font-bold">Запрос на прямоугольнике</td>
                            <td class="py-2 pr-3 font-mono">O(1): четыре угла, включения-исключения</td>
                            <td class="py-2 pr-3 font-mono">O(1): четыре блока степеней двойки</td>
                        </tr>
                        <tr class="border-b border-slate-800 align-top">
                            <td class="py-2 pr-3 font-bold">Какие операции</td>
                            <td class="py-2 pr-3">только сумма: у неё есть обратная операция (вычитание)</td>
                            <td class="py-2 pr-3">min, max, gcd, И, ИЛИ: идемпотентные, перекрытие не мешает</td>
                        </tr>
                        <tr class="border-b border-slate-800 align-top">
                            <td class="py-2 pr-3 font-bold">Изменить элемент</td>
                            <td class="py-2 pr-3">нельзя — пересчёт всей матрицы O(N·M)</td>
                            <td class="py-2 pr-3">нельзя — пересчёт O(N·M·log N·log M)</td>
                        </tr>
                        <tr class="align-top">
                            <td class="py-2 pr-3 font-bold">Когда брать</td>
                            <td class="py-2 pr-3">«сумма на прямоугольнике», матрица не меняется</td>
                            <td class="py-2 pr-3">«минимум/максимум на прямоугольнике», запросов очень много</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        Почему префиксная тонкая
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Одна матрица того же размера. Сумма <b>накапливается</b>: каждая клетка <span class="font-mono text-emerald-300">P[i][j]</span> уже содержит информацию обо всём прямоугольнике от угла (0,0) до неё. Любой другой прямоугольник выражается через четыре таких угла — прибавить два, вычесть два. Больше хранить нечего.</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        Почему разреженная жирная
                    </div>
                    <p class="text-slate-300 text-sm mb-4">У минимума обратной операции нет: зная минимум на большом прямоугольнике, минимум на его части не вычислишь. Приходится хранить готовый ответ для каждого размера блока, а размеров <span class="font-mono text-emerald-300">log N × log M</span>. На каждом уровне — почти полная копия матрицы, поэтому память растёт в десятки раз.</p>
                </div>
            </div>

            <p class="text-slate-300 text-sm mt-4">Вывод, который стоит сказать на экзамене: <b>сумму нельзя считать через разреженную таблицу</b> — перекрывающиеся блоки посчитают общие клетки дважды, а вычесть их нечем. <b>Минимум нельзя считать через префиксную</b> — у минимума нет обратной операции. Структуры не заменяют друг друга, они закрывают разные запросы.</p>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-amber-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-amber-400 mb-4">Где обычно теряют баллы</h3>
            <div class="bg-rose-950/30 p-5 rounded-lg border border-rose-700/40 mt-2">
                <ul class="list-disc pl-5 space-y-2 text-sm text-slate-300">
                    <li><b>Сумма через разреженную таблицу.</b> Блоки перекрываются, а вычитать нечем — ответ завышен. Для суммы берите префиксные (билет 5).</li>
                    <li><b>Память.</b> N = M = 1000 даёт 10 × 10 × 10⁶ = 10⁸ ячеек. Это предел по памяти на большинстве контестов: сначала считайте ячейки, потом пишите код.</li>
                    <li><b>Один log вместо двух.</b> В 2D уровней <span class="font-mono text-emerald-300">log N × log M</span>; таблица <span class="font-mono text-emerald-300">st[i][j][k]</span> с тремя индексами — это 1D по одному измерению и не решает задачу.</li>
                    <li><b>Выход за границу в запросе.</b> Вторые блоки начинаются в <span class="font-mono text-emerald-300">r2 − 2^kx + 1</span> и <span class="font-mono text-emerald-300">c2 − 2^ky + 1</span>: если перепутать знак, индекс уедет за матрицу.</li>
                    <li><b>Нужны обновления.</b> Разреженная таблица статична. Если элемент меняется между запросами — это дерево отрезков (билет 1), а не она.</li>
                </ul>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    Код: построение 1D (тот же, что выполняет панель Python)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800"><code>a = [2, 3, 5, 62, 3, 21, 1, 4]
n, LOG = 8, 4
st = []
for row in a:
    st.append([row] + [None] * (LOG - 1))     # уровень 0 = сам массив

for j in range(1, LOG):                        # уровень j строится из j-1
    for i in range(n - (1 &lt;&lt; j) + 1):
        st[i][j] = min(st[i][j - 1], st[i + (1 &lt;&lt; (j - 1))][j - 1])</code></pre>
                    <p class="text-slate-300 text-sm">Запрос: <span class="font-mono text-emerald-300">k = log2(r - l + 1)</span>, ответ <span class="font-mono text-emerald-300">min(st[l][k], st[r - 2^k + 1][k])</span>. Ровно эти переменные (<span class="font-mono text-emerald-300">a, n, LOG, st, i, j</span>) читает демонстрация внизу страницы.</p>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    Код: построение и запрос в 2D (C++-стиль, четыре квадранта)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800"><code>// построение: st[r][c][kx][ky] из четырёх квадрантов предыдущих уровней
for (int kx = 0; (1 &lt;&lt; kx) &lt;= N; ++kx)
  for (int ky = 0; (1 &lt;&lt; ky) &lt;= M; ++ky)
    for (int r = 0; r + (1 &lt;&lt; kx) - 1 &lt; N; ++r)
      for (int c = 0; c + (1 &lt;&lt; ky) - 1 &lt; M; ++c) {
        if (kx == 0 &amp;&amp; ky == 0) st[r][c][0][0] = a[r][c];
        else if (ky == 0)       st[r][c][kx][0] = min(st[r][c][kx-1][0], st[r + (1 &lt;&lt; (kx-1))][c][kx-1][0]);
        else                    st[r][c][kx][ky] = min(st[r][c][kx][ky-1], st[r][c + (1 &lt;&lt; (ky-1))][kx][ky-1]);
      }

// запрос минимума на прямоугольнике (R1,C1)..(R2,C2)
int kx = log2(R2 - R1 + 1);
int ky = log2(C2 - C1 + 1);
int ans1 = min(st[R1][C1][kx][ky], st[R1][C2 - (1 &lt;&lt; ky) + 1][kx][ky]);
int ans2 = min(st[R2 - (1 &lt;&lt; kx) + 1][C1][kx][ky], st[R2 - (1 &lt;&lt; kx) + 1][C2 - (1 &lt;&lt; ky) + 1][kx][ky]);
int minimum = min(ans1, ans2);</code></pre>
                    <p class="text-slate-300 text-sm">Четыре блока размера <span class="font-mono text-emerald-300">2^kx × 2^ky</span> прижимаются к четырём углам запроса и вместе накрывают его целиком; середина посчитана несколько раз, но для минимума это безвредно.</p>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    Сколько это памяти в числах
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <ul class="list-disc pl-5 space-y-1 text-sm text-slate-300">
                        <li>100 × 100: уровни 7 × 7 ≈ 49 копий → около 490 000 ячеек вместо 10 000.</li>
                        <li>1000 × 1000: уровни 10 × 10 = 100 копий → 10⁸ ячеек; по 4 байта это 400 МБ — обычно уже нельзя.</li>
                        <li>Префиксная сумма для той же 1000 × 1000 — 10⁶ ячеек, 4 МБ.</li>
                    </ul>
                    <p class="text-slate-300 text-sm">Практический вывод: 2D разреженную таблицу строят, когда матрица небольшая (до нескольких сотен на сторону), а запросов очень много и все они про минимум или максимум.</p>
                </div>
            </details>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-indigo-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-indigo-400 mb-4">Читается вместе с этим билетом</h3>
            <ul class="list-disc pl-5 space-y-2 text-sm text-slate-300">
                <li><a class="ticket-link" data-goto="prefix-sums-2d" href="?topic=prefix-sums-2d">Билет 5, двумерная матрица префиксных сумм</a> — вторая половина этого сравнения: та же скорость запроса, но в десятки раз меньше памяти и только для суммы.</li>
                <li><a class="ticket-link" data-goto="segment-trees" href="?topic=segment-trees">Билет 1, дерево отрезков</a> — когда между запросами меняются элементы: O(log N) на запрос и на обновление, без сотни копий матрицы.</li>
                <li><a class="ticket-link" data-goto="floyd" href="?topic=floyd">Билет 16, Флойд</a> — тоже таблица, заполняемая по уровням, но там уровни означают «разрешённые промежуточные вершины», а не размер блока.</li>
            </ul>
        </div>

    </div>
</section>`,
  },  {
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
                <p class="text-xl font-mono text-white">Treap хранит пары (x; y): для ключа x — бинарное дерево поиска, для приоритета y — двоичная куча. Пара — точка на декартовой плоскости, отсюда и название. Два базовых метода: Split и Merge.</p>
            </div>

            <p class="text-slate-300 text-sm mb-4">Построение видно глазами: точки приходят <b>как попало</b> → сортировка по y (quicksort платит ≈ n·log n сравнений, counting по маленьким целым y — O(n) без сравнений: разница есть, дерево получится одно) → каждая точка вставляется спуском от корня: x ≤ узла — влево, иначе вправо. Порядок рисования линий не важен: точки прибиты, дерево единственно. Весь процесс — в симуляторе под текстом: <b>Собрать</b> (сортировка на выбор, свои точки, чек-лист ✅) или <b>игра 🎮 «соединить сам»</b> — кликаешь две точки, линия проводится, а проверка мгновенно объясняет, почему нельзя: «у точки уже есть родитель», «получился бы цикл», «равные „!“ не определены». Плюс <b>Split / Merge / Erase</b> по шагам и разборы граблей <b>«Миф 2k/2k+1»</b> и <b>«Поиск ≠ сортировка»</b>: бинарный поиск находит готовый элемент в уже отсортированном массиве за O(log n) и ничего не сортирует, поэтому заменить им сортировку по y при построении дерева нельзя. Или включи <b>Игру 🖱️</b>: соедини точки сам, а судья-инварианты объяснит каждый запрещённый ход.</p>

            <div class="text-center my-6">
                <p class="text-slate-400 text-xs uppercase tracking-[0.3em]">малый x — огромный y</p>
                <p class="my-1 font-bold leading-none">
                    <span class="text-2xl text-slate-300">Х</span><span class="text-7xl text-rose-300 align-middle">!</span><span class="text-2xl text-slate-300">Й</span>
                </p>
                <p class="text-slate-300 font-mono text-sm">! = y = приоритет = вершина кучи</p>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🗡️ Аналогия 1: Split — таможня
                    </div>
                    <p class="text-slate-300 text-sm">Split(t, x₀) — таможня с двумя коридорами: зелёный «все x ≤ x₀», красный «все x &gt; x₀». Спуск от корня: узел, который вместе со своим поддеревом целиком проходит по одному коридору, отправляется туда <b>без вскрытия</b> — досматривается только одна ветка. Поэтому split — O(h), а не O(n).</p>
                </div>

                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🧲 Аналогия 2: Merge — стыковка колонн
                    </div>
                    <p class="text-slate-300 text-sm">Merge(a, b) склеивает два дерева при условии «все x в a меньше всех x в b». Каждый шаг — одно сравнение: чей y у корня больше, тот и принимает колонну, а «стыковка» продолжается в одном его поддереве (том, что сохраняет порядок x). Итого O(h) сравнений y — без перестроек и поворотов.</p>
                </div>
            </div>

            <div class="bg-slate-900/40 rounded-lg border border-slate-700/50 p-4 mt-4">
                <p class="text-slate-300 text-sm mb-2">💀 <b>Ты путаешь:</b></p>
                <p class="text-slate-400 text-sm mb-1">· «Отсортирую бинарным поиском»: поиск не сортирует; сравнительная сортировка — не быстрее n·log n.</p>
                <p class="text-slate-400 text-sm mb-1">· Дети «в массиве по 2k/2k+1» — только у полных деревьев; treap растёт кривым.</p>
                <p class="text-slate-400 text-sm">· «Убрать можно только самый верхний»: произвольная точка тоже вырезается — её дети сшиваются merge за O(h).</p>
            </div>

            <p class="text-slate-300 text-sm mt-4"><b class="text-amber-300">Сложность — явно:</b> поиск, вставка, удаление — <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(log n)</code> в среднем; построение — <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(n log n)</code> (сортировка + n спусков). Худший случай — приоритеты вытянулись в цепочку: <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-rose-300 border border-slate-800">O(n)</code> на операцию, <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-rose-300 border border-slate-800">O(n²)</code> на построение.</p>

            <p class="text-slate-500 text-xs mt-3 leading-relaxed">Расшифровка Х!Й: «!» — это y: маленький знак держит всё слово — убери, и останется набор букв, как treap без y останется деревом поиска-палкой. Х — это x: место по алфавиту. Все стоят по алфавиту, но кричат по «!»: корень самый громкий, родитель всегда громче детей. Равные «!» — выше тот, кто раньше заявил заявку в списке; равные x — идут влево по уставу.</p>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код: split (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
pair&lt;Node*, Node*&gt; split(Node* t, int x) {
    if (!t) return {nullptr, nullptr};
    if (t-&gt;val &lt;= x) {
        auto [L, R] = split(t-&gt;right, x);
        t-&gt;right = L;
        return {t, R};
    } else {
        auto [L, R] = split(t-&gt;left, x);
        t-&gt;left = R;
        return {L, t};
    }
}</pre>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код: вставка, merge, erase (Скрыто)
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
    description: "Самонастраивающееся дерево: поднимаем тронутый ключ в корень.",
    category: "Продвинутые структуры",
    content: `
<section id="splay-tree" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 4</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Splay-дерево</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Одной фразой</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Обычное BST без полей балансировки. После каждого обращения — Splay(x): серия поворотов поднимает x в корень. Единственный инструмент — поворот.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-6">
                <div class="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <p class="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Одна операция</p>
                    <p class="text-white font-bold">может стоить O(n)</p>
                    <p class="text-slate-400 text-xs mt-1">гарантии на отдельный запрос нет</p>
                </div>
                <div class="bg-slate-900 rounded-lg p-4 border border-emerald-700/60">
                    <p class="text-xs uppercase tracking-wider text-emerald-500 font-bold mb-1">Любые m операций</p>
                    <p class="text-emerald-300 font-bold">стоят O(m·log n)</p>
                    <p class="text-slate-400 text-xs mt-1">амортизированное O(log n) на операцию</p>
                </div>
                <div class="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <p class="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Память</p>
                    <p class="text-white font-bold">O(n): ключ + 2 ссылки</p>
                    <p class="text-slate-400 text-xs mt-1">легче AVL и красно-чёрного</p>
                </div>
            </div>

            <p class="text-slate-300 text-sm mb-4">От какой боли лечит: вставь ключи по возрастанию — и BST выродится в список, поиск станет O(n). AVL и красно-чёрные выбирают <b>профилактику</b>: хранят высоту/цвет и чинят дерево сразу. Splay выбирает <b>лечение по факту</b>: ничего не хранит, дереву разрешено временно быть кривым — но каждый пройденный путь заодно распрямляется.</p>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        📚 Аналогия 1: Стопка бумаг
                    </div>
                    <p class="text-slate-300 text-sm">Стопка документов: понадобился лист — вытаскиваешь и, поработав, кладёшь сверху. Сортировку не ведёшь, но через неделю самое нужное само оказывается в верхних сантиметрах, а забытое утонуло. «Взял → положил наверх».</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🥾 Аналогия 2: Тропинка через газон
                    </div>
                    <p class="text-slate-300 text-sm">Идёшь длинной кривой дорожкой — и после каждого прохода она сама укорачивается примерно вдвое. Первый проход дорогой, зато оплачивает следующие. Раз в год не ходишь — экономии нет; это честная слабость структуры.</p>
                </div>
            </div>

            <h4 class="text-lg font-bold text-white mt-8 mb-3">Единственный кирпичик — поворот</h4>
            <p class="text-slate-300 text-sm mb-3">Поворот меняет местами узел x и его родителя p. Одно движение, три перевешенные ссылки. Среднее поддерево β (между x и p) — единственный «груз», который меняет хозяина: его диапазон ключей одинаково влезает и под x, и под p.</p>
            <pre class="bg-slate-950 p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono text-slate-300 border border-slate-800 leading-relaxed">        p                    x
       /  \\      x выше     /  \\
      x    γ    -------->  α    p
     / \\     p выше            / \\
    α    β    <--------       β    γ</pre>
            <p class="text-slate-300 text-sm mt-3">Обход слева-направо ДО: α, x, β, p, γ. ПОСЛЕ: α, x, β, p, γ — <b>тот же</b>. Поэтому сломать дерево поиска поворотами невозможно в принципе. В симуляторе ниже каждый поворот разложен на кадры, β подсвечивается в момент «отстёжки», а врезка «Механика одного поворота» держит эту схему перед глазами.</p>

            <h4 class="text-lg font-bold text-white mt-8 mb-3">Splay(x): крутим, пока x не станет корнем</h4>
            <p class="text-slate-300 text-sm mb-3">Смотрим на тройку x (поднимаем), p (родитель), g (дед) и выбираем случай:</p>
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
                            <td class="py-3">x — корень, конец</td>
                        </tr>
                        <tr class="border-b border-slate-700/60">
                            <td class="py-3 pr-3 font-bold text-indigo-300">Zig-Zig</td>
                            <td class="py-3 pr-3">x и p с <span class="text-white font-bold">одной</span> стороны (линия)</td>
                            <td class="py-3 pr-3"><span class="text-amber-300 font-bold">p вокруг g</span>, потом x</td>
                            <td class="py-3">ветка укоротилась вдвое</td>
                        </tr>
                        <tr>
                            <td class="py-3 pr-3 font-bold text-indigo-300">Zig-Zag</td>
                            <td class="py-3 pr-3">x и p с <span class="text-white font-bold">разных</span> сторон (змейка)</td>
                            <td class="py-3 pr-3"><span class="text-amber-300 font-bold">x вокруг p</span>, потом x вокруг g</td>
                            <td class="py-3">p и g стали двумя детьми x</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p class="text-slate-300 text-sm mt-3">И по кругу: определили случай → 1–2 поворота → x ближе к корню → снова смотрим на тройку. Zig случается только последним.</p>

            <div class="bg-rose-950/30 rounded-xl border border-rose-800/60 p-4 mt-6">
                <p class="text-rose-300 font-bold text-sm mb-2">⚠️ Любимый вопрос на экзамене: Zig-Zig — это НЕ «два раза Zig»</p>
                <pre class="bg-slate-950 p-4 rounded-lg overflow-x-auto text-[11px] sm:text-xs font-mono text-slate-300 leading-relaxed">бамбук из 8 узлов 8→7→6→5→4→3→2→1, ищем 1 (числа — реальный прогон):
наивно (x, потом x):   3 × «два зига» + Zig → высота 8 → 8, бамбук остался бамбуком (перевёрнутым)
Zig-Zig (p, потом x):  3 × Zig-Zig   + Zig → высота 8 → 6, x в корне, ветка распалась на куст
бамбук из 16 узлов:    наивно 16 → 16, Zig-Zig 16 → 10</pre>
                <p class="text-slate-300 text-sm mt-3">Мнемоника: <b>линия — крути СВЕРХУ вниз, змейка — СНИЗУ вверх</b>. Вся разница в коде: <code class="bg-slate-950 px-2 py-0.5 rounded font-mono text-xs text-white">rotate(p); rotate(x);</code> против <code class="bg-slate-950 px-2 py-0.5 rounded font-mono text-xs text-white">rotate(x); rotate(x);</code> — одна строчка, а без неё амортизации не будет.</p>
            </div>

            <p class="text-slate-300 text-sm mt-6">Полный прогон: бамбук 8 → 7 → 6 → 5 → 4 → 3 → 2 → 1 (каждый следующий — левый сын), ищем 1. Спуск 8 узлов, затем <b>три Zig-Zig подряд и один Zig</b> (Zig всегда последний): 1 становится корнем, а высота падает с 8 до 6 — линия перестала быть линией. Наивные «два зига» на том же бамбуке дали бы высоту 8: форма осталась бы цепочкой, только перевёрнутой. Важно не врать себе: на коротком бамбуке из 3–4 узлов высота может и не измениться (4 → 4) — выигрыш гарантирован не на одном запросе, а в сумме. Следующий запрос к 1 — ноль сравнений: мы не только достали ключ, но и <b>починили дерево по пути</b>. Отсюда амортизация: дорогой запрос нельзя пройти много раз подряд — путь кончается, и удешевляется (строго — методом потенциала: потенциал Φ = сумма по узлам log₂ размера их поддерева, и на каждый поворот Φ падает достаточно, чтобы оплатить его; отсюда же теорема о статической оптимальности — splay не хуже идеального статического дерева под твою последовательность запросов).</p>

            <div class="bg-slate-900/40 rounded-lg border border-slate-700/50 p-4 mt-4">
                <p class="text-slate-300 text-sm mb-2">💀 <b>Ты путаешь:</b></p>
                <p class="text-slate-400 text-sm mb-1">· Zig-Zig ≠ Zig+Zig: порядок (верхнее ребро первым) сплющивает линию вдвое, «два зига» — просто переворот.</p>
                <p class="text-slate-400 text-sm mb-1">· «При повороте между A и B ничего нет» — есть: среднее поддерево β переезжает от низа к верху; в симуляторе оно подсвечивается в кадре «отстёжка».</p>
                <p class="text-slate-400 text-sm">· «Splay всегда балансирует» — одиночная операция может УВЕЛИЧИТЬ высоту; гарантия только амортизированная.</p>
            </div>

            <p class="text-slate-300 text-sm mt-4"><b class="text-amber-300">Сложность — явно:</b> поиск/вставка/удаление — амортизированное <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(log n)</code>; одиночная операция — до <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-rose-300 border border-slate-800">O(n)</code>; n вставок подряд — амортизированное <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(n log n)</code>.</p>

            <p class="text-slate-300 text-sm mt-4">Все операции — через один splay: <b>find</b> — спуск + splay найденного (нет ключа — splay последнего на пути); <b>insert</b> — BST-вставка + splay нового; <b>erase</b> — splay удаляемого, корень выкинули, у максимума левой половины не будет правого сына — туда вешаем правую. Сильные стороны: простейший код, минимум памяти, самоподстройка под «горячие» ключи, дешёвые split/merge. Слабые: нет гарантии на отдельную операцию, не годится для реального времени, дерево меняется даже при чтении (плохо для многопоточности).</p>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код: rotate + splay + find (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
# узел: { key, left, right, parent }

def rotate_up(x):                    # x встаёт на место родителя
    p = x.parent
    g = p.parent
    if p.left is x:                  # правый поворот
        p.left = x.right
        if x.right: x.right.parent = p
        x.right = p
    else:                            # левый (зеркально)
        p.right = x.left
        if x.left: x.left.parent = p
        x.left = p
    p.parent = x
    x.parent = g
    if g:
        if g.left is p: g.left = x
        else: g.right = x

def splay(x):                        # поднять x в корень
    while x.parent:
        p, g = x.parent, x.parent.parent
        if g is None:                # ZIG
            rotate_up(x)
        elif (g.left is p) == (p.left is x):   # ZIG-ZIG: ВЕРХНЯЯ пара первой
            rotate_up(p)
            rotate_up(x)
        else:                        # ZIG-ZAG: НИЖНЯЯ пара первой
            rotate_up(x)
            rotate_up(x)
    return x

def find(root, key):                 # поиск: спуск + splay ВСЕГДА
    cur, last = root, None
    while cur:
        last = cur
        if key == cur.key: break
        cur = cur.left if key &lt; cur.key else cur.right
    return splay(last) if last else None</pre>
                    <p class="text-xs text-slate-400">Вся разница между случаями — «rotate(p); rotate(x);» против «rotate(x); rotate(x);». Одна строчка — и вся амортизация.</p>
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
    description: "Сумма подматрицы за O(1): 1D и 2D, две системы индексации, память и сравнение с разреженной таблицей.",
    category: "Алгоритмы матрицы",
    content: `
<section id="prefix-sums-2d" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 5</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Двумерная матрица префиксных сумм</h2>
    </div>

    <div class="space-y-8">

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Суть: одна клетка знает сумму всего прямоугольника от угла</h3>

            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула (1D — основа всего):</p>
                <p class="text-xl font-mono text-white">P[0] = 0, P[i] = P[i−1] + a[i−1]</p>
                <p class="text-sm font-mono text-slate-300 mt-2">Сумма a[l…r] = P[r+1] − P[l]</p>
            </div>

            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Двумерный вариант — включения-исключения:</p>
                <p class="text-xl font-mono text-white">S[i][j] = S[i−1][j] + S[i][j−1] − S[i−1][j−1] + A[i−1][j−1]</p>
                <p class="text-sm font-mono text-slate-300 mt-2">Сумма (r1,c1)…(r2,c2) = S[r2+1][c2+1] − S[r1][c2+1] − S[r2+1][c1] + S[r1][c1]</p>
            </div>

            <p class="text-slate-300 text-sm mb-4">Здесь <span class="font-mono text-emerald-300">S[i][j]</span> — сумма прямоугольника от угла <span class="font-mono text-emerald-300">(0,0)</span> до <span class="font-mono text-emerald-300">(i−1, j−1)</span>, а нулевая строка и нулевой столбец — рамка из нулей. Именно так считает демонстрация внизу страницы, поэтому в коде везде <span class="font-mono text-emerald-300">+1</span>.</p>

            <div class="bg-slate-800/70 p-5 rounded-lg border border-slate-600 mt-2 mb-6">
                <p class="text-sm font-bold text-white mb-2">Две системы индексации — не путайте их на экзамене</p>
                <table class="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr class="text-slate-500 border-b border-slate-700">
                            <th class="py-1.5 pr-2 font-bold">Запись</th>
                            <th class="py-1.5 pr-2 font-bold">Что хранит P</th>
                            <th class="py-1.5 pr-2 font-bold">Запрос суммы</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-b border-slate-800 align-top">
                            <td class="py-2 pr-3 font-bold">С рамкой из нулей (демонстрация, код ниже)</td>
                            <td class="py-2 pr-3 font-mono">P[i] = a[0] + … + a[i−1], размер n + 1</td>
                            <td class="py-2 pr-3 font-mono">P[r+1] − P[l]</td>
                        </tr>
                        <tr class="align-top">
                            <td class="py-2 pr-3 font-bold">Без рамки, размер n</td>
                            <td class="py-2 pr-3 font-mono">P[i] = a[0] + … + a[i], размер n</td>
                            <td class="py-2 pr-3 font-mono">P[r] − P[l−1], при l = 0 нужно особое ветвление</td>
                        </tr>
                    </tbody>
                </table>
                <p class="text-slate-400 text-xs mt-2">Рамка из нулей стоит одной лишней строки и столбца, зато убирает все проверки на «вышли за границу» — поэтому в 2D почти всегда пишут именно так.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 text-center">
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Память</p>
                    <p class="font-mono text-emerald-300 text-sm">O(N·M)</p>
                    <p class="text-[11px] text-slate-500 mt-1">столько же, сколько сама матрица</p>
                </div>
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Запрос</p>
                    <p class="font-mono text-emerald-300 text-sm">O(1)</p>
                    <p class="text-[11px] text-slate-500 mt-1">четыре обращения к таблице</p>
                </div>
                <div class="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Обновление элемента</p>
                    <p class="font-mono text-rose-300 text-sm">нет</p>
                    <p class="text-[11px] text-slate-500 mt-1">пересчёт всей таблицы O(N·M)</p>
                </div>
            </div>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Аналогии</h3>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        Аналогия 1: Сетка из вафельных трубочек
                    </div>
                    <p class="text-slate-300 text-sm mb-4">🧇 Префиксная матрица — сетка, где в каждой клетке лежит «сколько трубочек всего накопилось от угла (0,0) до меня». Хочешь посчитать трубочки в прямоугольнике посередине — вычти лишние полосы слева и сверху и верни дважды отрезанный угол. Вычитание работает, потому что у суммы есть обратная операция: трубочки можно не только докладывать, но и убирать обратно. Поэтому хранить копии не нужно: одна тонкая сетка размеров оригинала.</p>
                    <div class="rounded-lg bg-slate-950/70 border border-slate-700 p-3 text-[12px] font-mono space-y-1">
                        <div><span class="text-slate-500">время:</span> <span class="text-emerald-300">построение O(N·M), запрос суммы O(1)</span></div>
                        <div><span class="text-slate-500">память:</span> <span class="text-emerald-300">N×M — как оригинал, тонкая</span></div>
                    </div>
                    <p class="text-[12px] text-slate-400 mt-2">Почему тонкая: каждая клетка аккумулирует весь прямоугольник от угла (0,0). Работает ТОЛЬКО для суммы: менять элементы нельзя (полный пересчёт), а минимум так не накопишь — обратной операции нет.</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        Аналогия 2: Торт-пирамидка
                    </div>
                    <p class="text-slate-300 text-sm mb-4">🍰 Разреженная таблица минимумов — торт, жирный по памяти и по времени построения, зато красивый, как пирамидка: каждый из logN×logM уровней — почти полная копия матрицы (уровень (kx, ky) хранит минимумы всех блоков 2^kx × 2^ky), и ответ на запрос собирается из четырёх готовых блоков за O(1). Торт пекут только тогда, когда обратной операции нет: крем обратно в торт не запихнёшь — «вычесть» минимум из минимума нельзя. Зато перекрытие блоков не мешает (min(x, x) = x), и цена O(1) — сто коржей вместо одной матрицы.</p>
                    <div class="rounded-lg bg-slate-950/70 border border-slate-700 p-3 text-[12px] font-mono space-y-1">
                        <div><span class="text-slate-500">время:</span> <span class="text-rose-300">построение O(N·M·logN·logM), запрос min O(1)</span></div>
                        <div><span class="text-slate-500">память:</span> <span class="text-rose-300">N×M×logN×logM — для 1000×1000 ≈ 10×10 = 100 копий матрицы</span></div>
                    </div>
                    <p class="text-[12px] text-slate-400 mt-2">Когда нужен: min, max, gcd — операции без обратной (перекрытие блоков не мешает). Менять элементы тоже нельзя. Сумму через такой торт считать НЕЛЬЗЯ: перекрытие посчитает элементы дважды.</p>
                </div>
            </div>
            <p class="text-slate-400 text-sm mt-4">Порядок чтения демонстрации ниже: сначала <b>1D</b> (лента с нарастающим итогом, переменные <span class="font-mono text-emerald-300">a, n, P, i</span>), затем <b>2D</b> (матрица, рамка из нулей, подсветка четырёх углов запроса — переменные <span class="font-mono text-emerald-300">i, j, S, r1, c1, r2, c2</span>).</p>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-rose-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-rose-400 mb-4">Почему она тонкая и чего она не умеет</h3>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        Тонкая: одна матрица
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Память — ровно <span class="font-mono text-emerald-300">N × M</span>, как у исходной матрицы (плюс рамка из нулей). Никаких копий и уровней: сумма накапливается, и каждая клетка уже хранит ответ для своего прямоугольника от угла. Всё остальное получается вычитанием.</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        Не умеет: всё, что нельзя вычесть
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Приём работает только потому, что у суммы есть обратная операция. Для минимума, максимума или gcd вычитания не существует: зная минимум на большом прямоугольнике, минимум на его части не восстановить. Такие запросы — это <a class="ticket-link" data-goto="sparse-table" href="?topic=sparse-table">билет 2, разреженная таблица</a>, и платит она за это памятью <span class="font-mono text-rose-300">N × M × log N × log M</span>.</p>
                </div>
            </div>

            <div class="bg-slate-800/70 p-5 rounded-lg border border-slate-600 mt-6">
                <p class="text-sm font-bold text-white mb-2">Короткое сравнение (полная таблица — в билете 2)</p>
                <table class="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr class="text-slate-500 border-b border-slate-700">
                            <th class="py-1.5 pr-2 font-bold"></th>
                            <th class="py-1.5 pr-2 font-bold">Префиксная сумма 2D (этот билет)</th>
                            <th class="py-1.5 pr-2 font-bold">Разреженная таблица 2D (билет 2)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-b border-slate-800 align-top">
                            <td class="py-2 pr-3 font-bold">Память</td>
                            <td class="py-2 pr-3 font-mono text-emerald-300">N × M</td>
                            <td class="py-2 pr-3 font-mono text-rose-300">N × M × log N × log M</td>
                        </tr>
                        <tr class="border-b border-slate-800 align-top">
                            <td class="py-2 pr-3 font-bold">Запрос</td>
                            <td class="py-2 pr-3 font-mono">O(1)</td>
                            <td class="py-2 pr-3 font-mono">O(1)</td>
                        </tr>
                        <tr class="border-b border-slate-800 align-top">
                            <td class="py-2 pr-3 font-bold">Операция</td>
                            <td class="py-2 pr-3">сумма (обратимая)</td>
                            <td class="py-2 pr-3">min, max, gcd (идемпотентные)</td>
                        </tr>
                        <tr class="align-top">
                            <td class="py-2 pr-3 font-bold">Обновление элемента</td>
                            <td class="py-2 pr-3">нет</td>
                            <td class="py-2 pr-3">нет</td>
                        </tr>
                    </tbody>
                </table>
                <p class="text-slate-400 text-xs mt-2">Скорость запроса одинаковая, цена памяти — разная на порядки. Это не две версии одного решения, а решения двух разных задач.</p>
            </div>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-amber-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-amber-400 mb-4">Где обычно теряют баллы</h3>
            <div class="bg-rose-950/30 p-5 rounded-lg border border-rose-700/40 mt-2">
                <ul class="list-disc pl-5 space-y-2 text-sm text-slate-300">
                    <li><b>Смешали индексации.</b> В формуле с рамкой нулей запрос — это <span class="font-mono text-emerald-300">S[r2+1][c2+1] − S[r1][c2+1] − S[r2+1][c1] + S[r1][c1]</span>; записанный без <span class="font-mono text-emerald-300">+1</span> он даёт ответ со сдвигом на клетку.</li>
                    <li><b>Переполнение.</b> Суммы до 10⁹ элементов по 10⁹ — это 10¹⁸: нужен 64-битный тип. В Python он из коробки, в C++ — <span class="font-mono text-emerald-300">long long</span>.</li>
                    <li><b>Минимум через префиксные.</b> Не работает: обратной операции нет. Нужна разреженная таблица (билет 2).</li>
                    <li><b>Обновления между запросами.</b> Префиксная матрица статична; при одном изменённом элементе пересчёт стоит O(N·M). С обновлениями — дерево отрезков (билет 1).</li>
                    <li><b>Знак угла.</b> Левый верхний угол вычитается дважды, поэтому его прибавляют один раз. Потерянное <span class="font-mono text-emerald-300">+ S[r1][c1]</span> занижает каждый ответ.</li>
                </ul>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    Код: 1D (тот же, что выполняет панель Python)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800"><code>a = [3, 1, 4, 1, 5, 9, 2, 6]   # исходный массив
n = len(a)                     # префиксов будет n + 1
P = [0]                        # P[0] = 0 — пустой префикс
for i in range(1, n + 1):
    P.append(P[i - 1] + a[i - 1])
print("n =", n, "| P =", P)</code></pre>
                    <p class="text-slate-300 text-sm">Переменные <span class="font-mono text-emerald-300">a, n, P, i</span> — их читает 1D-часть демонстрации: лента подсвечивает, из чего сложилась текущая клетка.</p>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    Код: 2D — построение и запрос прямоугольника
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800"><code>A = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 1, 2, 3], [4, 5, 6, 7]]
n, m = 4, 4

S = []                                  # рамка из нулей + рабочие клетки
for rr in range(n + 1):
    S.append([0] + [0] * m)
for i in range(1, n + 1):
    for j in range(1, m + 1):
        S[i][j] = A[i-1][j-1] + S[i-1][j] + S[i][j-1] - S[i-1][j-1]

r1, c1, r2, c2 = 1, 1, 2, 2             # прямоугольник включительно
ans = S[r2+1][c2+1] - S[r1][c2+1] - S[r2+1][c1] + S[r1][c1]
print("итого:", ans)</code></pre>
                    <p class="text-slate-300 text-sm">Переменные <span class="font-mono text-emerald-300">i, j, S, r1, c1, r2, c2</span> двигают 2D-вкладку демонстрации: при построении пересчитывается клетка <span class="font-mono text-emerald-300">S[i][j]</span>, при запросе подсвечиваются четыре угла формулы.</p>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    Почему формула верна (доказательство в две строки)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <p class="text-slate-300 text-sm">Пусть <span class="font-mono text-emerald-300">S(i, j)</span> — сумма прямоугольника от (0,0) до (i−1, j−1). Тогда прямоугольник от (0,0) до (i−1, j−1) распадается на четыре непересекающиеся части: клетка <span class="font-mono text-emerald-300">A[i−1][j−1]</span>, полоса сверху <span class="font-mono text-emerald-300">S(i−1, j) − S(i−1, j−1)</span>, полоса слева <span class="font-mono text-emerald-300">S(i, j−1) − S(i−1, j−1)</span> и их общий угол. Складывая, получаем <span class="font-mono text-emerald-300">S(i, j) = S(i−1, j) + S(i, j−1) − S(i−1, j−1) + A[i−1][j−1]</span>: угол <span class="font-mono text-emerald-300">S(i−1, j−1)</span> вошёл в обе полосы, поэтому вычитается один раз.</p>
                    <p class="text-slate-300 text-sm">Запрос — та же логика наоборот: большой прямоугольник минус две полосы плюс дважды вычтенный угол.</p>
                </div>
            </details>
        </div>

        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-indigo-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-indigo-400 mb-4">Читается вместе с этим билетом</h3>
            <ul class="list-disc pl-5 space-y-2 text-sm text-slate-300">
                <li><a class="ticket-link" data-goto="sparse-table" href="?topic=sparse-table">Билет 2, двумерная разреженная таблица</a> — та же скорость запроса, но в десятки раз больше памяти и другие операции (min, max, gcd). Полное сравнение там.</li>
                <li><a class="ticket-link" data-goto="segment-trees" href="?topic=segment-trees">Билет 1, дерево отрезков</a> — если элемент матрицы меняется между запросами: O(log N·log M) на запрос и на обновление вместо пересчёта всей таблицы.</li>
                <li><a class="ticket-link" data-goto="floyd" href="?topic=floyd">Билет 16, Флойд</a> — тоже таблица, заполняемая клетка за клеткой по соседям; отличается тем, что там каждый проход меняет смысл таблицы, а не накапливает сумму.</li>
            </ul>
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
