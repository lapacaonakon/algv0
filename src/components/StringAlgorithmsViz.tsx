import { useState, useEffect, useRef, useMemo } from "react";
import { Play, Pause, SkipForward, Undo, RefreshCw } from "lucide-react";

function generateKmpSteps(pattern: string, text: string) {
    if (!pattern) pattern = " ";
    const s = pattern + "#" + text;
    const n = s.length;
    const pi = new Array(n).fill(0);
    const steps: any[] = [];

    steps.push({ i: 0, j: 0, pi: [...pi], desc: `Начало. Символ '${s[0]}'. pi[0] = 0.` });

    for (let i = 1; i < n; i++) {
        let j = pi[i - 1];
        
        steps.push({ i, j, pi: [...pi], highlight: [i, j], desc: `Шаг i=${i}. Прошлая длина совпадения j=${j}. Сравниваем s[i] с s[j].` });

        while (j > 0 && s[i] !== s[j]) {
            steps.push({ i, j, pi: [...pi], highlight: [i, j], match: false, desc: `Символы '${s[i]}' и '${s[j]}' НЕ равны! Смотрим π-взгляд назад: откат j = pi[${j - 1}] = ${pi[j - 1]}` });
            j = pi[j - 1];
        }

        if (s[i] === s[j]) {
            steps.push({ i, j, pi: [...pi], highlight: [i, j], match: true, desc: `Совпадение! '${s[i]}' == '${s[j]}'. Длина совпавшего куска увеличивается.` });
            j++;
        } else {
            steps.push({ i, j, pi: [...pi], highlight: [i, j], match: false, desc: `Откатились до начала (j=0) и символы всё ещё разные. Совпадений нет.` });
        }

        pi[i] = j;
        steps.push({ i, j, pi: [...pi], desc: `Записываем pi[${i}] = ${j}. Это и есть та самая O(N) магия без возврата по i.` });
        
        if (j === pattern.length) {
            steps.push({ i, j, pi: [...pi], found: true, desc: `🎉 Найдено полное вхождение слова! Длина префикса равна длине слова.` });
        }
    }
    return { s, steps, patternLength: pattern.length };
}

function generateZSteps(pattern: string, text: string) {
    if (!pattern) pattern = " ";
    const s = pattern + "#" + text;
    const n = s.length;
    const z = new Array(n).fill(0);
    const steps: any[] = [];

    let l = 0, r = 0;
    steps.push({ i: 0, l, r, z: [...z], desc: `Начало. Z-box [L=0, R=0]` });

    for (let i = 1; i < n; i++) {
        steps.push({ i, l, r, z: [...z], desc: `Шаг i=${i} ('${s[i]}'). Текущее Z-окно (блок совпадения): [L=${l}, R=${r}].` });

        if (i <= r) {
            steps.push({ i, l, r, z: [...z], desc: `Внимание! i <= R (${i} <= ${r}). Нам не надо проверять всё с нуля. Накладываем линейку!` });
            z[i] = Math.min(r - i + 1, z[i - l]);
            steps.push({ i, l, r, z: [...z], desc: `Предварительное значение из копии Z[${i}] = min(рассостояние до R, Z[${i-l}]) = ${z[i]}. Копипаста сработала.` });
        }

        steps.push({ i, l, r, zTarget: z[i], zSource: i + z[i], z: [...z], desc: `Пытаемся расширить совпадение дальше...` });
        while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {
            steps.push({ i, l, r, zTarget: z[i], zSource: i + z[i], z: [...z], match: true, desc: `Символы s[${z[i]}] и s[${i + z[i]}] совпадают! Окно растёт.` });
            z[i]++;
        }
        
        if (i + z[i] < n) {
            steps.push({ i, l, r, zTarget: z[i], zSource: i + z[i], z: [...z], match: false, desc: `Упс, символы '${s[z[i]]}' и '${s[i + z[i]]}' разные. Стоп.` });
        } else {
            steps.push({ i, l, r, z: [...z], desc: `Упёрлись в конец строки.` });
        }

        steps.push({ i, l, r, z: [...z], desc: `Фиксируем Z[${i}] = ${z[i]}.` });

        if (i + z[i] - 1 > r) {
            l = i;
            r = i + z[i] - 1;
            steps.push({ i, l, r, z: [...z], desc: `👉 Обновляем границы Z-окна! Теперь [L=${l}, R=${r}]. Сдвинули линейку.` });
        }
        
        if (z[i] === pattern.length) {
             steps.push({ i, l, r, z: [...z], found: true, desc: `🎉 Найдено точное копирование паттерна (длина = ${pattern.length}).` });
        }
    }
    return { s, steps, patternLength: pattern.length };
}

export function StringAlgorithmsViz({ defaultMode = "kmp" }: { defaultMode?: "kmp" | "z" }) {
    const [mode, setMode] = useState<"kmp" | "z">(defaultMode);
    const [pattern, setPattern] = useState("aba");
    const [text, setText] = useState("abacaba");
    
    // Ensure inputs are valid dynamically
    const safePattern = pattern || " ";
    const safeText = text || " ";

    const { s, steps, patternLength } = useMemo(() => {
       if (mode === "kmp") return generateKmpSteps(safePattern, safeText);
       else return generateZSteps(safePattern, safeText);
    }, [mode, safePattern, safeText]);

    const [autoPlay, setAutoPlay] = useState(false);
    const [stepIdx, setStepIdx] = useState(0);
    const timer = useRef<NodeJS.Timeout | null>(null);

    // Reset when inputs or mode change
    useEffect(() => {
       setStepIdx(0);
       setAutoPlay(false);
    }, [s, mode]);

    // Timer loop for autoPlay
    useEffect(() => {
        if (autoPlay) {
            timer.current = setInterval(() => {
                setStepIdx(prev => {
                    if (prev >= steps.length - 1) { setAutoPlay(false); return prev; }
                    return prev + 1;
                });
            }, 1200);
        }
        return () => { if (timer.current) clearInterval(timer.current); };
    }, [autoPlay, steps.length]);

    const playPause = () => setAutoPlay(!autoPlay);
    const nextStep = () => { setAutoPlay(false); setStepIdx(i => Math.min(steps.length - 1, i + 1)); };
    const prevStep = () => { setAutoPlay(false); setStepIdx(i => Math.max(0, i - 1)); };
    const reset = () => { setAutoPlay(false); setStepIdx(0); };

    const step = steps[stepIdx] || steps[0];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1.5">
                    <button onClick={() => setMode("kmp")}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${mode === "kmp" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-300"}`}>
                        КМП (π-ФУНКЦИЯ)
                    </button>
                    <button onClick={() => setMode("z")}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${mode === "z" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-300"}`}>
                        Z-ФУНКЦИЯ
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="bg-slate-800 p-1 flex rounded border border-slate-700 items-center">
                        <span className="text-[10px] text-slate-400 font-bold px-2 uppercase">Слово:</span>
                        <input value={pattern} onChange={e => setPattern(e.target.value.substring(0, 10))} className="w-20 bg-slate-950 text-white text-xs font-bold font-mono px-2 py-1 outline-none rounded border border-slate-800" />
                    </div>
                    <div className="bg-slate-800 p-1 flex rounded border border-slate-700 items-center">
                        <span className="text-[10px] text-slate-400 font-bold px-2 uppercase">Текст:</span>
                        <input value={text} onChange={e => setText(e.target.value.substring(0, 20))} className="w-32 bg-slate-950 text-white text-xs font-bold font-mono px-2 py-1 outline-none rounded border border-slate-800" />
                    </div>
                </div>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 pb-12 overflow-x-auto custom-scrollbar relative min-h-[160px] flex items-center justify-start">
                <div className="flex gap-1.5 px-4 h-full relative mt-4">
                    {s.split("").map((char, index) => {
                        const isPattern = index < patternLength;
                        const isSeparator = index === patternLength;

                        let borderColor = "border-slate-700/50";
                        let bgColor = "bg-slate-900";
                        let textColor = isSeparator ? "text-rose-500" : (isPattern ? "text-indigo-300" : "text-slate-200");

                        // KMP Logic
                        if (mode === "kmp") {
                            if (step.highlight?.includes(index)) {
                                borderColor = "border-amber-400";
                                bgColor = step.match === true ? "bg-emerald-900/50" : (step.match === false ? "bg-rose-900/50" : "bg-amber-900/40");
                            }
                        }

                        // Z Logic
                        if (mode === "z") {
                            if (index >= step.l && index <= step.r && step.l !== step.r) {
                                bgColor = "bg-emerald-900/30"; // Block
                                borderColor = "border-emerald-500/40 border-dashed";
                            }
                            if (step.zTarget === index || step.zSource === index) {
                                borderColor = "border-amber-400 border-solid";
                                bgColor = step.match === true ? "bg-emerald-900/50" : (step.match === false ? "bg-rose-900/50" : "bg-amber-900/40");
                            }
                        }

                        return (
                            <div key={index} className="flex flex-col items-center gap-1 relative min-w-[32px]">
                                {/* L/R markers for Z */}
                                {mode === "z" && step.l === index && step.l !== 0 && (
                                    <div className="absolute -top-6 text-emerald-400 text-[10px] font-bold">L↘</div>
                                )}
                                {mode === "z" && step.r === index && step.r !== 0 && (
                                    <div className="absolute -top-6 text-emerald-400 text-[10px] font-bold">↙R</div>
                                )}

                                {/* Index */}
                                <span className={`text-[9px] ${index === step.i ? 'text-white' : 'text-slate-500'}`}>{index}</span>
                                
                                {/* Char Box */}
                                <div className={`w-8 h-10 flex items-center justify-center border-2 rounded ${borderColor} ${bgColor} ${textColor} font-mono text-lg transition-colors duration-300 relative z-10`}>
                                    {char}
                                </div>

                                {/* Value array box */}
                                <div className="text-[10px] bg-slate-800 text-amber-300 w-full text-center py-[2px] rounded border border-slate-700/50 font-mono font-bold">
                                    {mode === "kmp" ? step.pi[index] : step.z[index]}
                                </div>

                                {/* KMP fingers */}
                                {mode === "kmp" && step.i === index && (
                                    <div className="absolute -bottom-8 text-indigo-400 font-bold flex flex-col items-center animate-bounce z-20">
                                        👆<span className="text-[9px]">i</span>
                                    </div>
                                )}
                                {mode === "kmp" && step.j === index && index !== step.i && (
                                    <div className="absolute -bottom-8 text-rose-400 font-bold flex flex-col items-center z-20">
                                        👆<span className="text-[9px]">j</span>
                                    </div>
                                )}
                                {mode === "kmp" && step.j === index && index === step.i && (
                                    <div className="absolute -bottom-8 text-rose-400 font-bold flex flex-col items-center translate-x-4 z-20">
                                        👆<span className="text-[9px]">j</span>
                                    </div>
                                )}

                                {/* Z fingers */}
                                {mode === "z" && step.i === index && (
                                    <div className="absolute -bottom-8 text-emerald-400 font-bold flex flex-col items-center animate-bounce z-20">
                                        👆<span className="text-[9px]">i</span>
                                    </div>
                                )}
                                {mode === "z" && step.zSource === index && step.i !== index && (
                                    <div className="absolute -bottom-8 text-indigo-400 font-bold flex flex-col items-center z-20">
                                        👆<span className="text-[9px]">src</span>
                                    </div>
                                )}
                                {mode === "z" && step.zTarget === index && step.i !== index && step.zSource !== index && (
                                    <div className="absolute -bottom-8 text-rose-400 font-bold flex flex-col items-center z-20">
                                        👆<span className="text-[9px]">таргет</span>
                                    </div>
                                )}

                                {/* Found flash effect */}
                                {step.found && mode === "kmp" && index <= step.i && index > step.i - patternLength && (
                                    <div className="absolute -inset-1 border-2 border-emerald-500 rounded-lg pointer-events-none animate-pulse z-0 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                                )}
                                {step.found && mode === "z" && index >= step.i && index < step.i + patternLength && (
                                    <div className="absolute -inset-1 border-2 border-emerald-500 rounded-lg pointer-events-none animate-pulse z-0 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                {/* Controls */}
                <div className="flex bg-slate-900 border border-slate-800 p-2 rounded-xl justify-center shadow-lg gap-1shrink-0">
                    <button onClick={prevStep} disabled={stepIdx === 0} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent">
                        <Undo strokeWidth={3} size={16} />
                    </button>
                    <button onClick={playPause} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center justify-center min-w-[80px]">
                        {autoPlay ? <><Pause size={16} className="mr-1"/> Пауза</> : <><Play size={16} className="mr-1"/> Авто</>}
                    </button>
                    <button onClick={nextStep} disabled={stepIdx === steps.length - 1} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent">
                        <SkipForward strokeWidth={3} size={16} />
                    </button>
                    <button onClick={reset} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg ml-2 border-l border-slate-800">
                        <RefreshCw strokeWidth={3} size={16} />
                    </button>
                </div>
                
                {/* Description Log */}
                <div className="flex-1 bg-slate-900/50 border border-indigo-900/40 rounded-xl p-4 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <span className="font-mono text-4xl">{mode === "kmp" ? "π" : "Z"}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold tracking-wider mb-1 uppercase">Лог выполнения [Шаг {stepIdx + 1}/{steps.length}]</div>
                    <div className="text-sm text-slate-200 font-medium leading-relaxed relative z-10">
                        {step.desc}
                    </div>
                </div>
            </div>

            {/* Why this matters card */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 flex gap-3 items-start mt-4">
                <span className="text-2xl mt-1">🪧</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                    Обрати внимание на хитрость с решёткой <code className="bg-slate-950 text-rose-400 px-1 py-0.5 rounded">#</code>. 
                    Мы пишем <b>Шаблон + # + Текст</b>. Это разделяет два мира. 
                    Когда значени {mode === 'kmp' ? "префикс-функции" : "Z-функции"} добегает до длины шаблона — это 100% сигнал, что слово было найдено! 
                    Пройди шаги вручную, посмотри, как пальцы ищут совпадения без возврата (в КМП) или используют ранее посчитанный блок для пропуска работы (в Z).
                </p>
            </div>

            {/* Code Sneak Peek */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-4">
               <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
                 <span>Код C++ ({mode === 'kmp' ? 'КМП / Префикс-функция' : 'Z-функция'})</span>
               </div>
               <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto">
{mode === 'kmp' ? `vector<int> pi(s.length());
for (int i = 1; i < s.length(); i++) {
    int j = pi[i-1];
    while (j > 0 && s[i] != s[j]) j = pi[j-1];
    if (s[i] == s[j]) j++;
    pi[i] = j;
}` : `int l = 0, r = 0;
for (int i = 1; i < n; i++) {
    if (i <= r) z[i] = min(r - i + 1, z[i - l]);
    while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
    if (i + z[i] - 1 > r) {
        l = i;
        r = i + z[i] - 1;
    }
}`}
               </pre>
            </div>
        </div>
    );
}
