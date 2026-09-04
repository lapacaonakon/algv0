import { Chapter } from '../types';

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
</section>`
  },
  {
    id: "string-z-func",
    title: "22. Z-функция",
    type: "html",
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
