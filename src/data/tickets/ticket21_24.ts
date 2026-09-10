import { Chapter } from '../../types';

export const tickets21to24: Chapter[] = [
  {
    id: "string-kmp",
    title: "21. Префикс-функция (π) — Взгляд назад (КМП)",
    type: "html",
    category: "Строки",
    content: `
<section id="string-kmp" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 21</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Префикс-функция (π) — Взгляд назад</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Фундамент поиска КМП</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">π[i] — максимальная длина такого префикса строки, который также является её суффиксом, оканчивающимся в позиции i.</p>
            </div>
            
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <!-- Аналогия 1 -->
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🤦‍♂️ Аналогия 1: Поиск без отката
                    </div>
                    <p class="text-slate-300 text-sm mb-4">
                      Мы идём по строке слева направо. В каждой позиции <i>i</i> мы спрашиваем: «Какой самый длинный кусок из начала всей строки СЕЙЧАС закончился под моим пальцем?»<br><br>
                      Представь, ты ищешь в тексте слово <code>abacaba</code>. Ты дошел до <code>abacab</code>, и следующая буква — <code>x</code>. Тупой алгоритм начнет искать заново со второй буквы. КМП посмотрит и скажет: «Спокойно, у нас в конце было <code>cab</code>, а это начало нашего слова! Не надо перечитывать, мы уже на 3-й позиции!». Это поиск за O(N) без возвратов.
                    </p>
                </div>
                
                <!-- Аналогия 2 -->
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🤖 Аналогия 2: LLM стриминг
                    </div>
                    <p class="text-slate-300 text-sm mb-4">
                        Для LLM, которая стримит токены по одному, это крутой способ искать запрещенку, не перелопачивая весь контекст на каждом шаге. Если мы частично совпали с запрещённым словом, но потом пришёл не тот токен, π-функция мгновенно говорит нам, с какого места этого слова мы можем продолжить поиск, не возвращаясь назад в потоке!
                    </p>
                </div>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Пример вычисления (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-2">
                    <p>Тот же пример: <b>abcabcd</b></p>
                    <ul class="list-disc pl-5 space-y-2 text-slate-400">
                        <li><b>a</b>: Префиксов нет. <code class="text-indigo-300">π[0] = 0</code></li>
                        <li><b>ab</b>: Из начала ("a") ничего не совпало с концом ("b"). <code class="text-indigo-300">π[1] = 0</code></li>
                        <li><b>abc</b>: Опять мимо. <code class="text-indigo-300">π[2] = 0</code></li>
                        <li><b>abca</b>: О! Начало ("a") совпало с текущим концом ("a"). Длина — 1. <code class="text-indigo-300">π[3] = 1</code></li>
                        <li><b>abcab</b>: Начало ("ab") совпало с концом ("ab"). Длина — 2. <code class="text-indigo-300">π[4] = 2</code></li>
                        <li><b>abcabc</b>: Начало ("abc") совпало с концом ("abc"). Длина — 3. <code class="text-indigo-300">π[5] = 3</code></li>
                        <li><b>abcabcd</b>: "d" всё испортила. "abcd" из начала не совпадает с "abcd" в конце? Нет, "abcd" != "abcd" (упс, "abca" vs "abcd"). Конец "abcd" не совпадает с началом "abc...". <code class="text-indigo-300">π[6] = 0</code></li>
                    </ul>
                </div>
            </details>
            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код C++ (Скрыто)
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
</section>`
  },
  {
    id: "string-z-func",
    title: "22. Z-функция — Сдвиг и наложение",
    type: "html",
    category: "Строки",
    content: `
<section id="string-z-func" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 22</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Z-функция — Сдвиг и наложение</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-emerald-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-emerald-400 mb-4">Z-функция</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-emerald-500/30">
                <p class="text-lg text-emerald-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">Z[i] — длина наибольшего общего префикса между самой строкой (начинающейся с индекса 0) и её суффиксом, начинающимся с i.</p>
            </div>
            
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <!-- Аналогия 1 -->
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        📏 Аналогия 1: Линейка-шаблон
                    </div>
                    <p class="text-slate-300 text-sm mb-4">
                        Тут мы берём всю строку и «прикладываем» её к самой себе, начиная с каждой позиции <i>i</i>. Мы спрашиваем: «Если я начну читать строку отсюда, насколько длинный кусок совпадёт с самым началом строки?»<br><br>
                        Это самый быстрый способ найти все вхождения подстроки в строку. Ты просто пишешь <code>Pattern + "$" + Text</code>, считаешь Z-функцию, и там, где <code>Z[i]</code> равно длине <code>Pattern</code> — там и есть вхождение.
                    </p>
                </div>
                
                <!-- Аналогия 2 -->
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
                        🤯 Аналогия 2: LLM Самокопипаст
                    </div>
                    <p class="text-slate-300 text-sm mb-4">
                        В LLM Z-функция может применяться для дедупликации или детекта зацикливаний. Если во время генерации вдруг <code>Z[i]</code> (где <i>i</i> указывает назад на тот же текст) выстреливает в большое значение — значит, модель начала копипастить сама себя.
                    </p>
                </div>
            </div>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Пример вычисления (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-2">
                    <p>Тот же пример: <b>abcabcd</b></p>
                    <ul class="list-disc pl-5 space-y-2 text-slate-400">
                        <li><code>Z[0]</code> — не считается (или длина строки).</li>
                        <li><code>Z[1]</code> (<b>bcabcd</b> vs <b>abcabcd</b>): Первая буква 'b' != 'a'. <code class="text-emerald-300">Z[1] = 0</code></li>
                        <li><code>Z[2]</code> (<b>cabcd</b> vs <b>abcabcd</b>): 'c' != 'a'. <code class="text-emerald-300">Z[2] = 0</code></li>
                        <li><code>Z[3]</code> (<b>abcd</b> vs <b>abcabcd</b>): 'a'=='a', 'b'=='b', 'c'=='c', 'd'!='d' (подожди, 'd' == 'a'? Нет, в начале 'a', тут 'd'). Совпало 3 буквы. <code class="text-emerald-300">Z[3] = 3</code></li>
                        <li><code>Z[4], Z[5], Z[6]</code> — всё по нулям, 'b', 'c', 'd' не 'a'.</li>
                    </ul>
                </div>
            </details>
            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код C++ (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
int l = 0, r = 0;
for (int i = 1; i &lt; n; i++) {
    if (i &lt;= r) z[i] = min(r - i + 1, z[i - l]);
    while (i + z[i] &lt; n && s[z[i]] == s[i + z[i]]) z[i]++;
    if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
}</pre>
                </div>
            </details>
        </div>
    </div>
</section>`
  },
  {
    id: "aho-corasick",
    title: "23. Алгоритм Ахо-Корасик",
    type: "html",
    category: "Строки",
    content: `
<section id="aho-corasick" class="mb-12 scroll-mt-10">
  <div class="flex items-center mb-6 flex-wrap gap-3">
    <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 23</span>
    <h2 class="text-2xl sm:text-3xl font-bold text-white">Алгоритм Ахо-Корасик</h2>
  </div>

  <div class="space-y-8">
    <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
      <h3 class="text-xl font-bold text-blue-400 mb-4">Множественный поиск</h3>
      
      <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
        <p class="text-sm text-blue-300 italic mb-2">Основная формула:</p>
        <p class="text-lg font-mono text-white">Бор (Trie) + Суффиксные ссылки + Терминальные ссылки = Конечный автомат</p>
      </div>
      <p class="text-slate-300 text-sm">Позволяет найти <b>сразу множество</b> слов из словаря в большом тексте за время O(N) совершив всего один проход.</p>
    </div>

    <!-- Аналогии -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
        <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
          🕷️ Аналогия 1: Паутина (Бор)
        </div>
        <p class="text-slate-300 text-sm mb-4">Представь, что мы сплели паутину (Бор) из нужных нам слов. Если нужного продолжения буквы нет — мы падаем по <b>суффиксной ссылке</b> ("нити страховки") в самый длинный из известных суффиксов.</p>
      </div>
      
      <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-rose-500/50 relative pt-8">
        <div class="absolute -top-3 left-4 bg-rose-900 text-rose-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-rose-500 shadow-md">
          📦 Аналогия 2: Матёшка (Терминальные)
        </div>
        <p class="text-slate-300 text-sm mb-4">Представь, что мы ищем слова "he" и "she". Если мы прочитали "she", мы <i>одновременно</i> нашли и "he", потому что оно спрятано внутри как матрёшка! Для этого нужны терминальные ссылки.</p>
      </div>
    </div>
    
    <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
        <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
            🔍 Код (Скрыто)
        </summary>
        <div class="p-5 text-sm text-slate-300 space-y-4">
            <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">
int get_link(int v) {
    if (t[v].link == -1) {
        if (v == 0 || t[v].p == 0) t[v].link = 0;
        else t[v].link = go(get_link(t[v].p), t[v].pch);
    }
    return t[v].link;
}

int go(int v, char c) {
    if (t[v].go[c] == -1) {
        if (t[v].next[c] != -1) t[v].go[c] = t[v].next[c];
        else t[v].go[c] = v == 0 ? 0 : go(get_link(v), c);
    }
    return t[v].go[c];
}</pre>
        </div>
    </details>
  </div>
</section>`
  },
  {
    id: "complexity-classes",
    title: "24. Классы сложности, сведение задач",
    type: "html",
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
</section>`
  }
];
