import { Chapter } from '../types';
import { graphChapters } from "./graphContent";
import { additionalTickets } from "./additionalTickets";

export const chapters: Chapter[] = [
  {
    id: "intro-data-structures",
    title: "Введение: Зачем нужны структуры данных?",
    type: "html",
    description: "Базовые понятия о контейнерах данных и как они управляют порядком обработки в алгоритмах.",
    category: "Основы",
    content: `<section id="intro-data-structures" class="mb-20 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Глава 1</span>
        <h2 class="text-3xl font-bold text-white">Введение: Зачем нужны структуры данных?</h2>
    </div>
    
    <div class="space-y-8">
        <div id="sub-section-intro" class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">1.1 Что такое структура данных и буфер обработки</h3>
            
            <!-- Формальное определение в центре -->
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Структура данных — это программная единица, позволяющая хранить и обрабатывать множество однотипных и/или логически связанных данных в вычислительной системе для обеспечения заданного асимптотического времени доступа O(f(n)).</p>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <!-- Аналогия 1 -->
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🗂️ Аналогия 1: Органайзер (Для тупых)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Представь, что твои данные — это одежда в комнате. Если свалить всё в одну кучу на полу (обычный массив без порядка), то утром поиск чистого носка займёт полчаса. А если разложить носки в один ящик, рубашки на вешалки, а куртки в шкаф — ты мгновенно найдёшь нужное. Структуры данных — это просто правильная мебель для твоих байтов.</p>
                </div>
                
                <!-- Аналогия 2 -->
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🤖 Аналогия 2: Диспетчер задач (Техническая)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">В алгоритмах поиска (DFS, BFS, Beam Search) структура данных выступает в роли безжалостного диспетчера аэропорта. Именно от того, какую структуру ты выберешь (Стек, Очередь или Кучу), зависит, в каком порядке самолеты-задачи получат разрешение на взлет. Поменял структуру — полностью изменил поведение ИИ!</p>
                </div>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Строгое доказательство / Детали реализации (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <p>Абстрактный тип данных (АТД) определяет математическую модель и набор операций, тогда как структура данных является конкретной реализацией АТД в физической памяти компьютера. Например, АТД "Очередь" может быть реализован как связный список или как циклический буфер на массиве.</p>
                    <pre class="bg-black/50 p-3 rounded text-xs font-mono text-emerald-400 overflow-x-auto"><code>interface Container&lt;T&gt; {
    push(item: T): void;
    pop(): T | undefined;
    peek(): T | undefined;
    isEmpty(): boolean;
}</code></pre>
                </div>
            </details>
        </div>
    </div>
</section>`
  },
  {
    id: "stack-dfs",
    title: "Стек (Stack) и алгоритм DFS",
    type: "html",
    description: "Принцип LIFO (Last In, First Out). Грязные тарелки, стек вызовов и поиск в глубину (DFS).",
    category: "Линейные структуры",
    content: `<section id="stack-dfs" class="mb-20 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Глава 2</span>
        <h2 class="text-3xl font-bold text-white">Стек (Stack) и алгоритм DFS</h2>
    </div>
    
    <div class="space-y-8">
        <div id="sub-section-stack-1" class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">2.1 Принцип LIFO (Last In, First Out)</h3>
            
            <!-- Формальное определение в центре -->
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">LIFO: f_{pop}(S) = s_k, \\text{ где } k = \\max(\\{i \\mid s_i \\in S\\}). Последним пришёл — первым ушёл.</p>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <!-- Аналогия 1 -->
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🍽️ Аналогия 1: Стопка грязных тарелок
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Стек — это в точности стопка грязных тарелок после большой вечеринки. Ту тарелку, которую поставили на вершину стопки самой последней, ты возьмешь мыть самой первой! Если попытаешься выдернуть нижнюю тарелку (первую поступившую), вся конструкция с грохотом рухнет. Фишка в том, что свежие данные всегда в приоритете.</p>
                </div>
                
                <!-- Аналогия 2 -->
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🕳️ Аналогия 2: Поиск в глубину (DFS)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Именно Стек используется для алгоритма DFS (Depth-First Search — поиск в глубину). Мы идём вглубь лабиринта до самого упора, забрасывая каждый поворот в стек. Как только попадаем в тупик, берем из стека последнюю развилку и пробуем другой путь. Это как возвращаться по собственным следам!</p>
                </div>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Строгое доказательство / Детали реализации (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <p>В современных языках программирования стек может быть легко реализован на основе динамического массива (например, Array в JavaScript/TypeScript с методами <code>push()</code> и <code>pop()</code>, работающими за O(1) амортизированное время).</p>
                    <p>Ниже представлена элегантная реализация итеративного DFS на основе явного стека:</p>
                    <pre class="bg-black/50 p-3 rounded text-xs font-mono text-blue-300 overflow-x-auto"><code>function depthFirstSearch(root: Node, target: string): boolean {
    const stack: Node[] = [root];
    const visited = new Set&lt;Node&gt;();

    while (stack.length &gt; 0) {
        const current = stack.pop()!; // LIFO: берем вершину
        if (current.value === target) return true;

        visited.add(current);
        // Добавляем соседей в стек
        for (const neighbor of current.neighbors) {
            if (!visited.has(neighbor)) {
                stack.push(neighbor);
            }
        }
    }
    return false;
}</code></pre>
                </div>
            </details>
        </div>

        <div id="sub-section-stack-2" class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-rose-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-rose-400 mb-4">2.2 Опасности: Stack Overflow (Переполнение стека)</h3>
            
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-rose-500/30">
                <p class="text-lg text-rose-300 italic mb-2">Антипаттерн / Опасность:</p>
                <p class="text-xl font-mono text-white">Бесконечная рекурсия без базового случая приводит к ошибке StackOverflowError.</p>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🍔 Аналогия 1: Небоскреб из бургеров
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Если складывать котлеты в бургер без остановки, он однажды просто не влезет в комнату и развалится. Операционная система выделяет фиксированный размер памяти под стек вызовов. Если твоя рекурсия не имеет четкого условия выхода, память кончится, и программа аварийно завершится.</p>
                </div>
                
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🛡️ Аналогия 2: Явный стек вместо рекурсии
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Фишка от про-разработчиков: если дерево очень глубокое, никогда не используй системную рекурсию. Создай массив <code>const stack = []</code> и управляй им вручную. Динамический массив в куче (heap memory) может хранить миллионы элементов, в отличие от скудного системного стека вызовов!</p>
                </div>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Строгое доказательство / Детали реализации (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <p>Каждый рекурсивный вызов функции помещает в системный стек фрейм активации (стековый кадр), содержащий локальные переменные, аргументы и адрес возврата. При достижении предела вызовов (обычно около 10 000 в V8/JavaScript) генерируется исключение <code>RangeError: Maximum call stack size exceeded</code>.</p>
                </div>
            </details>
        </div>
    </div>
</section>`
  },
  {
    id: "queue-bfs",
    title: "Очередь (Queue) и алгоритм BFS",
    type: "html",
    description: "Принцип FIFO (First In, First Out). Очередь за супом, слои в ширину и кратчайшие пути (BFS).",
    category: "Линейные структуры",
    content: `<section id="queue-bfs" class="mb-20 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Глава 3</span>
        <h2 class="text-3xl font-bold text-white">Очередь (Queue) и алгоритм BFS</h2>
    </div>
    
    <div class="space-y-8">
        <div id="sub-section-queue-1" class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">3.1 Принцип FIFO (First In, First Out)</h3>
            
            <!-- Формальное определение в центре -->
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">FIFO: f_{dequeue}(Q) = q_k, \\text{ где } k = \\min(\\{i \\mid q_i \\in Q\\}). Кто первый пришел, тот первый получил.</p>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <!-- Аналогия 1 -->
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🍜 Аналогия 1: Очередь за бесплатным супом
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Очередь работает максимально справедливо. Это как классическая очередь за бесплатным супом (или за новым айфоном). Кто первый пришел и встал в очередь, тот первым получит свою порцию и уйдет. Никаких «я только спросить!» здесь не работает. Новые элементы встают строго в хвост.</p>
                </div>
                
                <!-- Аналогия 2 -->
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🌊 Аналогия 2: Поиск в ширину (BFS)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Очередь — это двигатель алгоритма BFS (Breadth-First Search — поиск в ширину). Мы исследуем граф кругами, как волны от брошенного в воду камня. Сначала проверяем всех соседей на расстоянии 1 шага (1-й слой), затем на расстоянии 2 шагов, и так далее. Это гарантирует нахождение кратчайшего пути в невзвешенном графе!</p>
                </div>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Строгое доказательство / Детали реализации (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <p>Внимание, душный мод: В языке JavaScript использование <code>array.shift()</code> для удаления первого элемента очереди работает за время <strong>O(n)</strong>, так как сдвигает все оставшиеся элементы в памяти! Для высоконагруженных систем правильнее реализовывать очередь через два указателя (head и tail) или связный список, чтобы операция <code>dequeue</code> работала за честное <strong>O(1)</strong>.</p>
                    <pre class="bg-black/50 p-3 rounded text-xs font-mono text-amber-300 overflow-x-auto"><code>function breadthFirstSearch(root: Node, target: string): boolean {
    const queue: Node[] = [root]; // В продакшене юзаем связный список или индекс head
    let head = 0;
    const visited = new Set&lt;Node&gt;([root]);

    while (head &lt; queue.length) {
        const current = queue[head++]; // FIFO: берем из головы за O(1)
        if (current.value === target) return true;

        for (const neighbor of current.neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor); // Добавляем в хвост
            }
        }
    }
    return false;
}</code></pre>
                </div>
            </details>
        </div>
    </div>
</section>`
  },
  {
    id: "heap-beam-search",
    title: "Куча (Heap) / Приоритетная очередь",
    type: "html",
    description: "Здесь не важно, кто пришел первым. Важно, кто самый «тяжелый». Куча и алгоритм Beam Search.",
    category: "Деревья и приоритеты",
    content: `<section id="heap-beam-search" class="mb-20 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Глава 4</span>
        <h2 class="text-3xl font-bold text-white">Куча (Heap) / Приоритетная очередь</h2>
    </div>
    
    <div class="space-y-8">
        <div id="sub-section-heap-1" class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">4.1 Приоритетная очередь: Важен самый «тяжелый»</h3>
            
            <!-- Формальное определение в центре -->
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Max-Heap property: P(i) \\ge A(2i+1) \\land P(i) \\ge A(2i+2). На вершине всегда находится элемент с максимальным приоритетом (весом).</p>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <!-- Аналогия 1 -->
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🚨 Аналогия 1: Пациенты в реанимации
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Здесь абсолютно не важно, кто пришел первым или последним. Важно, кто самый «тяжелый» (или важный). Если в приемный покой больницы сидит очередь с легким кашлем, а на скорой привозят пациента с инфарктом — он мгновенно отправляется на операционный стол первым. Приоритетная очередь сортирует мир по важности.</p>
                </div>
                
                <!-- Аналогия 2 -->
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🔦 Аналогия 2: Beam Search (Лучевой поиск)
                    </div>
                    <p class="text-slate-300 text-sm mb-4">В ИИ и нейросетях (например, при генерации текста в GPT) используется алгоритм Beam Search. Вместо того чтобы проверять вообще все слова (дорого) или только одно (глупо), мы храним в Приоритетной очереди ровно B самых вероятных цепочек. Нам нужны только те гипотезы, у кого вероятность выше!</p>
                </div>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Строгое доказательство / Детали реализации (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <p>Двоичная куча (Binary Heap) — это полное бинарное дерево, которое невероятно элегантно упаковывается в обычный плоский массив без указателей! Для любого узла с индексом <code>i</code> его левый потомок лежит по адресу <code>2*i + 1</code>, а правый — <code>2*i + 2</code>.</p>
                    <p>Добавление (push) и извлечение максимума (pop) работают за логарифмическое время <strong>O(log N)</strong> благодаря операциям просеивания вверх (siftUp) и вниз (siftDown).</p>
                    <pre class="bg-black/50 p-3 rounded text-xs font-mono text-emerald-300 overflow-x-auto"><code>class PriorityQueue&lt;T&gt; {
    private heap: { item: T; priority: number }[] = [];

    push(item: T, priority: number) {
        this.heap.push({ item, priority });
        this.siftUp(this.heap.length - 1);
    }

    pop(): T | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length &gt; 0) {
            this.heap[0] = last;
            this.siftDown(0);
        }
        return top.item;
    }

    private siftUp(index: number) {
        let curr = index;
        while (curr &gt; 0) {
            const parent = Math.floor((curr - 1) / 2);
            if (this.heap[curr].priority &gt; this.heap[parent].priority) {
                [this.heap[curr], this.heap[parent]] = [this.heap[parent], this.heap[curr]];
                curr = parent;
            } else break;
        }
    }

    // siftDown аналогично...
}</code></pre>
                </div>
            </details>
        </div>
    </div>
</section>`
  },
  ...graphChapters,
  {
    id: 'segment-trees',
    title: 'Деревья отрезков (Segment Trees)',
    type: 'html',
    description: 'Дерево отрезков — структура данных для запросов на отрезке за O(log n).',
    category: 'Оптимизации и Продвинутые структуры',
    content: `
<section id="segment-trees" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Новое</span>
        <h2 class="text-3xl font-bold text-white">Деревья отрезков (Segment Trees)</h2>
    </div>
    
    <div class="space-y-8">
        <div id="intro" class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Что это за зверь?</h3>
            
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Дерево отрезков — структура данных для запросов на отрезке за O(log n). Разбиение всегда идет по формуле: mid = ⌊(L + R) / 2⌋</p>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🏢 Аналогия 1: Корпорация
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Представь компанию. Генеральный директор (корень) знает общую сумму прибыли всего холдинга. Его замы знают суммы по своим департаментам, а менеджеры среднего звена — по отделам. Чтобы узнать сумму прибыли за конкретный период/отдел, не нужно опрашивать каждого сотрудника, достаточно спросить нескольких менеджеров на разных уровнях.</p>
                </div>
                
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        📦 Аналогия 2: Матрешки-коробки
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Представь массив как одну огромную коробку. Внутри неё лежат две коробки поменьше (левая и правая половины массива). В тех, в свою очередь, еще по две. Чтобы найти сумму в диапазоне, ты просто берешь несколько готовых коробок, которые идеально покрывают твой диапазон, вместо того чтобы перебирать каждую мелкую деталь.</p>
                </div>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Строгое доказательство / Детали реализации (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <p class="font-bold text-white">ФАКТ: ПОЧЕМУ [0..2] РАЗБИЛОСЬ ИМЕННО ТАК:</p>
                    <p>Алгоритм всегда делает одно и то же: <code class="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">mid = (L + R) / 2</code> (округление вниз).</p>
                    <p>Смотрим на узел <code class="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">[0..2]</code>:</p>
                    <ul class="list-disc list-inside space-y-1 text-slate-300">
                        <li><code class="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">L = 0</code>, <code class="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">R = 2</code>.</li>
                        <li><code class="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">mid = (0 + 2) / 2 = 1</code>.</li>
                        <li>Левый ребенок берет <code class="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">[L .. mid]</code> &rarr; <code class="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">[0 .. 1]</code>.</li>
                        <li>Правый ребенок берет <code class="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">[mid + 1 .. R]</code> &rarr; <code class="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">[1 + 1 .. 2]</code> &rarr; <code class="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">[2 .. 2]</code> (это лист <code class="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">[2]</code>).</li>
                    </ul>
                    <p>Всё. Машина не думает, где "красивее" объединить. Она тупо рубит по формуле.</p>

                    <p class="mt-4 font-bold text-white">ТВОЙ ВИЗУАЛ (Массив со слоями промежутков сверху):</p>
                    <p>Вот твой исходный массив A из 9 элементов. И вот как дерево накладывает свои отрезки поверх него.</p>
                    <pre class="bg-black p-4 rounded overflow-x-auto text-xs font-mono text-emerald-400 border border-slate-800">
Уровень 1: |----------------------------[0..8]-----------------------------|
Уровень 2: |---------------[0..4]---------------|          |----[5..8]-----|
Уровень 3: |-------[0..2]-------|   |---[3..4]--|          |-[5..6]-|-[7..8]-|
Уровень 4: |-[0..1]-|   |--[2]--|   |-[3]-|-[4]-|          |[5]-|[6]| [7]-|[8]|
Уровень 5: |[0]-|[1]| 
Массив A:    A[0] A[1]    A[2]       A[3]  A[4]             A[5] A[6] A[7] A[8]</pre>
                    <p>Видишь? Каждый уровень полностью покрывает весь массив. Корень знает сумму всего. Уровень ниже знает суммы половин. И так до единичных элементов.</p>

                    <p class="mt-4 font-bold text-blue-400">💻 Кусочек кода (Рекурсивное построение дерева):</p>
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
function build(node, L, R) {
    if (L === R) {
        tree[node] = A[L];
        return;
    }
    let mid = Math.floor((L + R) / 2);
    build(2 * node, L, mid);
    build(2 * node + 1, mid + 1, R);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
}</pre>
                </div>
            </details>
        </div>
    </div>
</section>
`
  },
  {
    id: 'dynamic-programming',
    title: 'Динамическое программирование (DP)',
    type: 'html',
    description: 'Использование кэширования для ускорения алгоритмов',
    category: 'Оптимизации',
    content: `
<section id="dp" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6">
        <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold mr-4">Новое</span>
        <h2 class="text-3xl font-bold text-white">Динамическое программирование (DP)</h2>
    </div>
    
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Суть метода</h3>
            
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">F(n) = F(n-1) + F(n-2). Реши подзадачу один раз и закэшируй результат (мемоизация).</p>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        📝 Аналогия 1: Заметки
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Представь, что тебя просят посчитать 1+1+1+1. Ты считаешь и говоришь "4". А потом тебя просят добавить еще одну единицу. Ты не считаешь всё заново, ты просто берешь предыдущий результат (4) и прибавляешь 1. Это и есть мемоизация.</p>
                </div>
                
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🧱 Аналогия 2: Лего
                    </div>
                    <p class="text-slate-300 text-sm mb-4">Строительство огромного замка из стандартных блоков. Ты не придумываешь каждый кирпич заново, ты используешь готовые модули (подзадачи), из которых собираешь финальную конструкцию.</p>
                </div>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Строгое доказательство / Детали реализации (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <p class="font-bold text-white">Решение задачи о рюкзаке / Лесенке:</p>
                    <p>Вместо экспоненциального перебора <code class="bg-slate-800 px-1 rounded text-emerald-300 font-mono">O(2^n)</code> мы сводим задачу к линейному или квадратичному времени <code class="bg-slate-800 px-1 rounded text-emerald-300 font-mono">O(n)</code> за счет создания таблицы <code class="bg-slate-800 px-1 rounded text-emerald-300 font-mono">dp[]</code>.</p>
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
function fibMemo(n, memo = {}) {
    if (n in memo) return memo[n];
    if (n <= 2) return 1;
    memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    return memo[n];
}</pre>
                </div>
            </details>
        </div>
    </div>
</section>
`
  },
  ...additionalTickets
];
