import { Chapter } from '../../types';

export const tickets21to24: Chapter[] = [
  {
    id: "string-kmp",
    title: "21. Алгоритм Кнута-Морриса-Пратта (KMP)",
    type: "html",
    category: "Строки",
    content: `
<section id="string-kmp" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 21</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Алгоритм Кнута—Морриса—Пратта: префикс-функция и поиск без отката</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-blue-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-blue-400 mb-4">Фундамент поиска КМП</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-blue-500/30">
                <p class="text-lg text-blue-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">π[i] — максимальная длина такого префикса строки, который также является её суффиксом, оканчивающимся в позиции i.</p>
            </div>
            
            <div class="bg-slate-800/90 p-5 rounded-xl border-2 border-indigo-500/60 my-6 shadow-md">
                <h4 class="text-indigo-300 font-bold text-base mb-2">👁️ Главный секрет подглядывания в $\pi$-функции (смотрим СПЕРЕДИ / ВЛЕВО):</h4>
                <p class="text-slate-200 text-sm leading-relaxed mb-3">
                    Чтобы узнать значение <span class="font-mono text-indigo-300">π[i]</span>, мы не перебираем строки с нуля. Мы подглядываем <b>СПЕРЕДИ (в уже посчитанный префикс слева от нас)</b>:
                </p>
                <ol class="list-decimal pl-5 space-y-1.5 text-sm text-slate-300 font-medium mb-4">
                    <li>Сначала смотрим на <b>цифру $\pi$-функции для предыдущего элемента ($\pi[i-1]$)</b> — она указывает длину совпавшего префикса спереди.</li>
                    <li>Затем сравниваем символ на этой позиции с <b>НАШИМ текущим элементом ($s[i]$)</b>: если символы совпали — <span class="font-mono text-emerald-300">π[i] = π[i-1] + 1</span>. Если нет — делаем откат по значениям $\pi$ спереди!</li>
                </ol>

                <div class="bg-slate-950 p-4 rounded-lg border border-indigo-500/40 font-mono text-sm">
                    <div class="flex items-center justify-center gap-2 text-slate-200 font-bold tracking-wider flex-wrap">
                        <span class="px-2.5 py-1 bg-indigo-600/70 text-white rounded border-2 border-indigo-400 animate-pulse shadow-md">← a b c (префикс спереди)</span>
                        <span class="text-slate-500">|</span>
                        <span class="px-2.5 py-1 bg-emerald-600/80 text-white rounded border-2 border-emerald-400">a b c</span>
                        <span class="px-2.5 py-1 bg-rose-600/90 text-white rounded border-2 border-rose-400 font-black">i (НАШ)</span>
                    </div>
                    <p class="text-xs text-indigo-300 text-center mt-3 font-sans italic">
                        ⬅️ Выделение расширяется ВЛЕВО (СПЕРЕДИ): сначала читаем цифру π[i-1] спереди, затем сравниваем наш элемент $s[i]$.
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
                        <li><b>abcabcd</b>: «d» всё испортила. Пробуем длину 4: начало <b>abca</b> против конца <b>abcd</b> — не совпало (последняя буква). Длина 3: <b>abc</b> против <b>bcd</b> — мимо. Длина 1: <b>a</b> против <b>d</b> — мимо. <code class="text-indigo-300">π[6] = 0</code></li>
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

            <h3 class="text-lg font-bold text-white mt-8 mb-3">21.2 Сам поиск Кнута—Морриса—Пратта</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-4 text-center border border-blue-500/30">
                <p class="text-xl font-mono text-white">j = π[j − 1] при несовпадении · вхождение найдено, когда j == m · время O(n + m)</p>
            </div>
            <p class="text-slate-300 text-sm mb-4">Префикс-функция нужна не сама по себе: она хранит <b>«куда откатываться»</b>. Считаем π для шаблона (pattern) один раз, затем идём по тексту, поддерживая j — длину текущего совпадения шаблона с хвостом текста. Совпало — j += 1. Не совпало — откатываемся на j = π[j − 1]: мы уже знаем, что хвост совпавшей части равен началу шаблона, поэтому заново сравнивать его не нужно. Когда j достигает m — вхождение найдено; чтобы искать дальше (в том числе пересекающиеся вхождения), делаем j = π[j − 1].</p>
            <p class="text-slate-300 text-sm mb-4"><b>Почему O(n + m), а не O(n·m):</b> за один символ текста j растёт максимум на 1, а каждый откат j уменьшает. Значит суммарно откатов не больше, чем приростов, — итого O(n) проходов по тексту плюс O(m) на π. Это классическая амортизационная оценка, её любят спрашивать.</p>
            <div class="bg-slate-900/40 rounded-lg border border-slate-700/50 p-4 mt-4">
                <p class="text-slate-300 text-sm mb-2">💀 <b>Ты путаешь:</b></p>
                <p class="text-slate-400 text-sm mb-1">· <b>π[i] считается для префикса s[0..i]</b>, а не для всей строки: это длина наибольшего собственного префикса, равного суффиксу этого префикса (собственного — то есть не равного всему префиксу).</p>
                <p class="text-slate-400 text-sm mb-1">· <b>Откат — j = π[j − 1], а не j = 0</b>: обнуление превращает KMP обратно в наивный алгоритм.</p>
                <p class="text-slate-400 text-sm mb-1">· <b>KMP и Z-функция (билет 22) одинаковы по сложности</b> O(n + m), но KMP работает онлайн (символы могут приходить потоком), а Z-функция требует всю строку сразу.</p>
                <p class="text-slate-400 text-sm">· <b>Наименьший период строки</b> — это n − π[n − 1], а не π[n − 1]. Строка «ababab»: π[5] = 4, период 6 − 4 = 2 («ab»).</p>
            </div>
            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код: поиск подстроки KMP (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800">def prefix_function(s):
    n = len(s)
    pi = [0] * n
    for i in range(1, n):
        j = pi[i - 1]
        while j &gt; 0 and s[i] != s[j]:
            j = pi[j - 1]              # откат по уже посчитанным π
        if s[i] == s[j]:
            j += 1
        pi[i] = j
    return pi

def kmp_search(text, pattern):
    m = len(pattern)
    pi = prefix_function(pattern)      # O(m) один раз
    j = 0
    found = []
    for i, ch in enumerate(text):      # O(n) по тексту
        while j &gt; 0 and ch != pattern[j]:
            j = pi[j - 1]
        if ch == pattern[j]:
            j += 1
        if j == m:
            found.append(i - m + 1)    # позиция вхождения
            j = pi[j - 1]              # ищем дальше, вхождения могут пересекаться
    return found

# тот же результат одной префикс-функцией: π от pattern + "#" + text
def kmp_via_concat(text, pattern):
    s = pattern + "#" + text
    pi = prefix_function(s)
    m = len(pattern)
    return [i - 2 * m for i in range(m + 1, len(s)) if pi[i] == m]</pre>
                    <p class="text-slate-400 text-xs">Разделитель «#» обязан не входить ни в шаблон, ни в текст: иначе π «склеит» куски через границу и вхождения будут ложными.</p>
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
            
            <div class="bg-slate-800/90 p-5 rounded-xl border-2 border-emerald-500/60 my-6 shadow-md">
                <h4 class="text-emerald-300 font-bold text-base mb-2">🍑 Главный секрет Z-функции — ЗАД (ZOPA / смотрим ВПРАВО позади индекса i):</h4>
                <p class="text-slate-200 text-sm leading-relaxed mb-3">
                    Буква <b>Z</b> запоминается как <b>«Зад» / «Zopa»</b>: встаем на индекс <span class="font-mono text-emerald-300 font-bold">i</span> и смотрим <b>ПОЗАДИ (вправо)</b> от него!
                </p>
                <ol class="list-decimal pl-5 space-y-1.5 text-sm text-slate-300 font-medium mb-4">
                    <li>Встаём на индекс <span class="font-mono text-emerald-300">i</span> и смотрим на суффикс, идущий <b>СЗАДИ (ВПРАВО)</b> от этой позиции до конца строки.</li>
                    <li>Сравниваем этот "задний" подмассив <span class="font-mono text-emerald-300">s[i …]</span> с самым началом всей строки <span class="font-mono text-emerald-300">s[0 …]</span>. Выделенная рамка расширяется <b>вправо позади индекса $i$</b>!</li>
                </ol>

                <div class="bg-slate-950 p-4 rounded-lg border border-emerald-500/40 font-mono text-sm">
                    <div class="flex items-center justify-center gap-2 text-slate-200 font-bold tracking-wider flex-wrap">
                        <span class="px-2.5 py-1 bg-slate-800 text-slate-400 rounded">0 .. i-1</span>
                        <span class="px-2.5 py-1 bg-rose-600/90 text-white rounded border-2 border-rose-400 font-black">i (старт)</span>
                        <span class="text-slate-500">|</span>
                        <span class="px-2.5 py-1 bg-emerald-600/70 text-white rounded border-2 border-emerald-400 animate-pulse shadow-md">a b c d → (ЗАД / ZOPA вправо)</span>
                    </div>
                    <p class="text-xs text-emerald-300 text-center mt-3 font-sans italic">
                        ➡️ Выделение расширяется ВПРАВО (ПОЗАДИ индекса i): подглядываем в ЗАД строки.
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
                        <li><code>Z[3]</code> (<b>abcd</b> vs <b>abcabcd</b>): s[3]='a'==s[0]='a', s[4]='b'==s[1]='b', s[5]='c'==s[2]='c', а дальше s[6]='d' против s[3]='a' — мимо. Совпало 3 буквы. <code class="text-emerald-300">Z[3] = 3</code></li>
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
    description:
      "P, NP, co-NP, NP-трудные и NP-полные, PSPACE и EXP: иерархия классов, полиномиальные сведения, теорема Кука—Левина и что делать, если задача NP-полна.",
    category: "Теория сложности",
    content: `
<section id="complexity-classes" class="mb-12 scroll-mt-10">
    <div class="flex items-center mb-6 flex-wrap gap-3">
        <span class="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">Билет 24</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-white">Классы сложности и сведение задач</h2>
    </div>
    <div class="space-y-8">
        <div class="bg-slate-700/50 p-6 rounded-xl border-l-4 border-purple-500 scroll-mt-10">
            <h3 class="text-xl font-bold text-purple-400 mb-4">24.1 Границы возможного</h3>
            <div class="bg-slate-900 p-4 rounded-lg mb-6 text-center border border-purple-500/30">
                <p class="text-lg text-purple-300 italic mb-2">Строгое правило / Формула:</p>
                <p class="text-xl font-mono text-white">P — решается за полином. NP — ответ ПРОВЕРЯЕТСЯ за полином (есть короткий сертификат). Сведение A ≤p B — преобразовать вход A ко входу B за полином, так что ответ сохранится: умеешь решать B → умеешь решать A.</p>
            </div>

            <p class="text-slate-300 text-sm mb-4">Класс сложности — это множество задач, решаемых на выбранной модели вычислений (обычно машина Тьюринга) с выбранным бюджетом ресурса (время, память). Важно: классы говорят про <b>задачи</b>, а не про алгоритмы, и про <b>худший случай</b>, а не про «в среднем».</p>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                <div class="bg-slate-800 p-6 rounded-lg border border-slate-600 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-slate-700 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-emerald-500 shadow-md">
                        🧩 Аналогия 1: Судоку (P против NP)
                    </div>
                    <p class="text-slate-300 text-sm">Класс <b>P</b> — когда алгоритм сам быстро решает пустую доску (сортировка, кратчайший путь, MST). Класс <b>NP</b> — когда решать тяжело, но если тебе дадут заполненную сетку (<b>сертификат</b>), ты за полином проверишь, что там нет нарушений правил. Вопрос «P = NP?» — это вопрос «всякую ли задачу, ответ которой легко проверить, легко и решить?». Открыт с 1971 года и стоит миллион долларов в списке задач института Клэя.</p>
                </div>
                <div class="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-purple-500/50 relative pt-8">
                    <div class="absolute -top-3 left-4 bg-purple-900 text-purple-300 text-xs px-3 py-1 rounded-full font-bold uppercase border border-purple-500 shadow-md">
                        🔄 Аналогия 2: Переводчик (сведение)
                    </div>
                    <p class="text-slate-300 text-sm">Сведение A к B — ты не говоришь по-китайски (задача A), но есть переводчик на английский (сведение за полином) и друг-англичанин (решатель B). Спросил друга — перевёл ответ обратно. Вывод: <b>B не проще A</b>. Отсюда главный инструмент: если к B сводится какая-то NP-полная задача, то и B — NP-трудная, и быстрого алгоритма для неё ждать не стоит.</p>
                </div>
            </div>

            <h3 class="text-lg font-bold text-white mt-8 mb-3">24.2 Иерархия классов</h3>
            <p class="text-slate-300 text-sm mb-3">Известные включения (все, кроме отмеченных, — нестрогие; строгость хотя бы одного включения в цепочке доказывается теоремой об иерархии времени, так как P ⊊ EXP):</p>
            <div class="bg-slate-950 border border-slate-800 rounded-lg p-4 mb-4 text-center">
                <p class="font-mono text-sm sm:text-base text-slate-200 leading-relaxed">
                    P ⊆ NP ⊆ PSPACE ⊆ EXP ⊆ NEXP<br>
                    <span class="text-fuchsia-300">NP-полные = NP ∩ NP-трудные</span> &nbsp;·&nbsp; <span class="text-slate-500">P ⊊ EXP (доказано)</span>
                </p>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-xs text-left border-collapse min-w-[640px]">
                    <thead>
                        <tr class="text-slate-500 border-b border-slate-700">
                            <th class="py-2 pr-3 font-bold">Класс</th>
                            <th class="py-2 pr-3 font-bold">Определение «на пальцах»</th>
                            <th class="py-2 font-bold">Примеры задач</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-300">
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-emerald-300">P</td><td class="py-2 pr-3">детерминированно за O(n^k)</td><td class="py-2">сортировка, Дейкстра, Флойд, MST, паросочетание, 2-SAT, проверка двудольности, максимальный поток</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-purple-300">NP</td><td class="py-2 pr-3">сертификат проверяется за полином</td><td class="py-2">SAT, 3-SAT, гамильтонов цикл, раскраска в 3 цвета, рюкзак (решающая версия), коммивояжёр «есть ли тур ≤ K»</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-purple-300">co-NP</td><td class="py-2 pr-3">сертификат есть у ответа «НЕТ»</td><td class="py-2">«формула невыполнима», «число составное» (сертификат — делитель)</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-rose-300">NP-трудные</td><td class="py-2 pr-3">не проще любой задачи из NP (к ним сводится всё из NP)</td><td class="py-2">проблема остановки, раскраска графа, TSP-оптимизация (не решающая версия)</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-rose-300">NP-полные</td><td class="py-2 pr-3">NP-трудные И из NP</td><td class="py-2">SAT, 3-SAT, клика, вершинное покрытие, гамильтонов цикл, подмножество сумм</td></tr>
                        <tr class="border-b border-slate-800 align-top"><td class="py-2 pr-3 font-bold text-sky-300">PSPACE</td><td class="py-2 pr-3">полиномиальная память, время не ограничено</td><td class="py-2">QBF (кванторная формула), игры с полной информацией на полиномиальном поле</td></tr>
                        <tr class="align-top"><td class="py-2 pr-3 font-bold text-sky-300">EXP</td><td class="py-2 pr-3">детерминированно за 2^(n^k)</td><td class="py-2">обобщённые шахматы/шашки на поле n × n</td></tr>
                    </tbody>
                </table>
            </div>

            <h3 class="text-lg font-bold text-white mt-8 mb-3">24.3 Сведение: как доказывают NP-полноту</h3>
            <p class="text-slate-300 text-sm mb-3">Стандартный рецепт из двух шагов. <b>Шаг 1.</b> Показать, что задача лежит в NP: придумать сертификат полиномиального размера и проверку за полином (для гамильтонова цикла сертификат — сам порядок вершин; проверка — «все вершины по разу и каждая соседняя пара соединена ребром»). <b>Шаг 2.</b> Взять известную NP-полную задачу A и построить полиномиальное сведение A ≤p B. Тогда B — NP-трудная, а вместе с шагом 1 — NP-полная.</p>
            <p class="text-slate-300 text-sm mb-3"><b>Точка отсчёта — теорема Кука—Левина (1971/1973):</b> задача выполнимости булевых формул SAT NP-полна. Доказывается «в лоб»: вычисление машины Тьюринга на входе длины n за полиномиальное время можно записать булевой формулой размера poly(n), где переменные — состояние ленты и головки на каждом шаге, а satisfiability этой формулы равносильна принятию входа. Дальше всё катится цепочкой сведений: SAT → 3-SAT → клика / вершинное покрытие / независимое множество → гамильтонов цикл → TSP.</p>

            <div class="bg-slate-800/70 p-5 rounded-lg border border-slate-600 mt-4">
                <p class="text-sm font-bold text-white mb-2">🧭 Что делать, если задача оказалась NP-полной</p>
                <ul class="list-disc list-inside text-sm text-slate-300 space-y-1.5">
                    <li><b>Точный перебор с отсечениями</b>: O(2^n · poly) — для n до 20–40 это часто приемлемо (динамика по подмноествам, meet-in-the-middle).</li>
                    <li><b>Приближённые алгоритмы</b>: вершинное покрытие — 2-аппроксимация, метрический TSP — 3/2 (Кристофидес), жадный set cover — ln n.</li>
                    <li><b>Эвристики и метаэвристики</b>: локальный поиск, имитация отжига, генетика — без гарантий, но работают на практике.</li>
                    <li><b>Параметризованная сложность (FPT)</b>: экспонента только по параметру k, например вершинное покрытие за O(2^k · n).</li>
                    <li><b>Специальные классы входов</b>: на деревьях, двудольных или планарных графах многие NP-полные задачи становятся полиномиальными (независимое множество на дереве — динамика за O(n)).</li>
                    <li><b>Готовые решатели</b>: SAT/ILP-солверы (MiniSat, CaDiCaL, Gurobi) на реальных экземплярах часто быстрее любого своего алгоритма.</li>
                </ul>
            </div>

            <div class="bg-slate-900/40 rounded-lg border border-slate-700/50 p-4 mt-6">
                <p class="text-slate-300 text-sm mb-2">💀 <b>Ты путаешь:</b></p>
                <p class="text-slate-400 text-sm mb-1">· <b>NP — это не «не решается за полином».</b> NP = «проверяется за полином», и P ⊆ NP: любая задача из P автоматически в NP. Неразрешимых задач в NP нет.</p>
                <p class="text-slate-400 text-sm mb-1">· <b>NP-трудная ≠ NP-полная.</b> NP-трудная может вообще не лежать в NP (проблема остановки — неразрешима, зато NP-трудна). NP-полная = NP-трудная + «сама из NP».</p>
                <p class="text-slate-400 text-sm mb-1">· <b>Направление сведения.</b> Чтобы доказать NP-трудность B, сводят <b>от</b> известной трудной A <b>к</b> B (A ≤p B), а не наоборот. Сведение B ≤p A ничего не доказывает про трудность B.</p>
                <p class="text-slate-400 text-sm mb-1">· <b>«NP» ≠ «non-polynomial».</b> N — от nondeterministic, не от «не».</p>
                <p class="text-slate-400 text-sm mb-1">· <b>Экспоненциальный алгоритм не запрещён</b>: O(1.5^n) или O(2^(n/2)) часто проходит по времени на n = 40. NP-полнота запрещает только полиномиальный алгоритм при условии P ≠ NP.</p>
                <p class="text-slate-400 text-sm">· <b>Факторизация чисел</b> лежит в NP ∩ co-NP и не известна как NP-полная — на этом стоит RSA. «Раз она в NP, значит NP-полная» — неверный вывод.</p>
            </div>

            <p class="text-slate-300 text-sm mt-4"><b class="text-amber-300">Сложность — явно:</b> проверка сертификата NP-задачи <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(poly(n))</code>; наивный перебор сертификатов <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-rose-300 border border-slate-800">O(2^poly(n))</code>; сведение обязано работать за <code class="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-emerald-300 border border-slate-800">O(poly(n))</code>, иначе доказательство рассыпается.</p>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-6">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🔍 Код: верификатор сертификата и пример сведения (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-4">
                    <pre class="bg-slate-950 p-4 rounded overflow-x-auto text-xs font-mono text-slate-200 border border-slate-800"># Гамильтонов цикл NP-полон: сертификат = порядок вершин, проверка за O(n + m)
def verify_hamilton(n, edges, cert):
    if sorted(cert) != list(range(n)):          # каждая вершина ровно один раз
        return False
    allowed = {(u, v) for u, v in edges} | {(v, u) for u, v in edges}
    for i in range(n):
        a, b = cert[i], cert[(i + 1) % n]       # замыкаем цикл на старте
        if (a, b) not in allowed:
            return False
    return True

# 3-SAT ≤p КЛИКА: формула с k дизъюнктов → граф из 3k вершин, ищем клику размера k
def reduce_3sat_to_clique(clauses):
    # вершина = (номер дизъюнкта, литерал); ребро, если литералы не противоречат
    verts = [(ci, lit) for ci, cl in enumerate(clauses) for lit in cl]
    edges = []
    for i in range(len(verts)):
        for j in range(i + 1, len(verts)):
            ci, li = verts[i]; cj, lj = verts[j]
            if ci == cj:                        # из одного дизъюнкта брать нельзя
                continue
            if li.lstrip("-") == lj.lstrip("-") and (li[0] == "-") != (lj[0] == "-"):
                continue                        # x и не-x одновременно — противоречие
            edges.append((i, j))
    return verts, edges, len(clauses)           # клика размера k ⇔ формула выполнима

# Проверка задачи из P для контраста: двудольность = 2-раскраска, O(V + E)
def is_bipartite(n, graph):
    from collections import deque
    col = [-1] * n
    for s in range(n):
        if col[s] != -1:
            continue
        col[s] = 0
        dq = deque([s])
        while dq:
            v = dq.popleft()
            for to in graph[v]:
                if col[to] == -1:
                    col[to] = col[v] ^ 1
                    dq.append(to)
                elif col[to] == col[v]:
                    return False
    return True</pre>
                    <p class="text-slate-400 text-xs">Обрати внимание на разницу: для NP-полной задачи мы умеем быстро <b>проверять</b> готовый ответ, но не находить его; для задачи из P (двудольность) находим и проверяем одинаково быстро.</p>
                </div>
            </details>

            <details class="bg-slate-900/40 rounded-lg border border-slate-700/50 group cursor-pointer mt-4">
                <summary class="p-4 font-bold text-slate-400 outline-none select-none hover:text-white transition-colors group-open:border-b border-slate-700/50">
                    🎓 Вопросы, которые любят задавать (Скрыто)
                </summary>
                <div class="p-5 text-sm text-slate-300 space-y-2">
                    <p>· Дайте определение NP через верификатор и через недетерминированную машину Тьюринга — и покажите, что они эквивалентны.</p>
                    <p>· Что такое NP-полная задача и как доказать NP-полноту своей задачи? (сертификат + сведение от известной NP-полной)</p>
                    <p>· Почему первая NP-полная задача — именно SAT? (теорема Кука—Левина: моделируем машину формулой)</p>
                    <p>· Если P = NP, что станет с криптографией и с аппроксимацией? (взлом по сертификату станет полиномиальным; для многих задач исчезнет граница approximability)</p>
                    <p>· Пример задачи в NP ∩ co-NP, про которую не известно, что она в P? (факторизация / проверка простоты до 2002 года — затем AKS доказал P)</p>
                    <p>· Чем NP-трудная задача отличается от неразрешимой? (неразрешимая не решается вообще ни за какое время, например проблема остановки)</p>
                </div>
            </details>
        </div>
    </div>
</section>`
  }
];
