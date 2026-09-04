const fs = require('fs');

const code = fs.readFileSync('src/components/visualizers/SparseTableViz.tsx', 'utf-8');
const lines = code.split('\n');

const bStart = lines.findIndex(l => l.startsWith('const Viz2DBuild: React.FC = () => {'));
if (bStart === -1) {
    console.error("Viz2DBuild not found");
    process.exit(1);
}

const pre = lines.slice(0, bStart).join('\n');

const newCode = pre + '\n' + `const Viz2DBuild: React.FC = () => {
  const [k, setK] = useState(1);
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);

  const L = 1 << k;

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      <div className="flex-1 bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col items-center max-w-full overflow-hidden">
        <h3 className="text-xl font-bold text-indigo-400 mb-2">Промежуточные матрицы</h3>
        <p className="text-sm text-slate-400 mb-6 text-center max-w-[400px]">Для наглядности показываем только <b className="text-indigo-300">квадратные блоки</b>.</p>
        
        <div className="flex bg-slate-950 p-1 rounded-lg mb-8 border border-slate-800 flex-wrap justify-center overflow-x-auto w-full">
          {[0, 1, 2, 3].map(step => (
            <button
              key={step}
              onClick={() => { setK(step); setHover(null); }}
              className={\`px-4 py-2 rounded-md text-sm font-bold transition-all \${k === step ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}\`}
            >
              {step === 0 ? "Оригинал (1x1)" : \`Шаг \${step} (\${1<<step}x\${1<<step})\`}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 w-full h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {[...Array(k + 1)].map((_, i) => k - i).map((step, idx) => {
             const stepL = 1 << step;
             const stepSize = 8 - stepL + 1;
             const isCurr = step === k;
             const isPrev = step === k - 1;

             return (
               <React.Fragment key={step}>
                 {idx > 0 && <div className="text-slate-600 my-2"><ChevronDown size={24} strokeWidth={2} /></div>}
                 <div className={\`flex flex-col items-center transition-all \${isCurr ? '' : 'opacity-80 scale-95'}\`}>
                   <h4 className={\`font-bold mb-3 flex flex-col items-center text-center \${isCurr ? 'text-indigo-300' : 'text-slate-400'}\`}>
                     <span>Матрица блоков {stepL}x{stepL}</span>
                     <span className={\`text-[10px] font-mono font-normal mt-1 border px-1.5 py-0.5 rounded \${isCurr ? 'bg-indigo-900/40 border-indigo-800/40 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-500'}\`}>ST[][][{step}][{step}]</span>
                   </h4>
                   <div className={\`grid gap-[2px] p-2 rounded-lg border shadow-inner overflow-x-auto max-w-full \${isCurr ? 'bg-[#0a0f1e] border-indigo-900/40 shadow-[0_0_25px_rgba(99,102,241,0.05)]' : 'bg-slate-950 border-slate-800'}\`} style={{ gridTemplateColumns: \`repeat(\${stepSize}, 1fr)\`}}>
                     {Array.from({length: stepSize * stepSize}).map((_, idx) => {
                        const r = Math.floor(idx / stepSize);
                        const c = idx % stepSize;
                        
                        let highlightClass = isCurr ? 'bg-slate-800/80 text-slate-300 border-slate-700/50' : 'bg-slate-800 text-slate-500 border-transparent';
                        let zIndex = 'z-0';

                        if (isCurr && hover && hover.r === r && hover.c === c) {
                           highlightClass = 'bg-indigo-500 text-white font-bold scale-[1.15] shadow-xl border-indigo-300';
                           zIndex = 'z-10';
                        }

                        if (isPrev && hover) {
                           const prevL = 1 << (k - 1);
                           const isTL = r === hover.r && c === hover.c;
                           const isTR = r === hover.r && c === hover.c + prevL;
                           const isBL = r === hover.r + prevL && c === hover.c;
                           const isBR = r === hover.r + prevL && c === hover.c + prevL;
                           if (isTL) { highlightClass = 'bg-rose-500 text-white font-bold border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)] scale-110'; zIndex = 'z-10' }
                           else if (isTR) { highlightClass = 'bg-blue-500 text-white font-bold border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.4)] scale-110'; zIndex = 'z-10' }
                           else if (isBL) { highlightClass = 'bg-emerald-500 text-white font-bold border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-110'; zIndex = 'z-10' }
                           else if (isBR) { highlightClass = 'bg-amber-500 text-white font-bold border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-110'; zIndex = 'z-10' }
                        }

                        return (
                          <div 
                            key={idx}
                            onMouseEnter={() => isCurr && setHover({r, c})}
                            onMouseLeave={() => isCurr && setHover(null)}
                            className={\`flex items-center justify-center font-mono rounded transition-all duration-200 border min-w-[28px] min-h-[28px] shrink-0 \${highlightClass} \${zIndex} \${isCurr ? 'w-10 h-10 md:w-9 md:h-9 text-sm cursor-pointer hover:bg-slate-700 hover:text-white' : 'w-8 h-8 text-[11px]'}\`}
                          >
                            {ST2D[r][c][step][step]}
                          </div>
                        );
                     })}
                   </div>
                 </div>
               </React.Fragment>
             )
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 h-full flex flex-col">
          <h3 className="text-lg font-bold text-slate-300 mb-6 flex items-center gap-2">Код построения и формула</h3>
          {k === 0 ? (
             <div className="text-slate-400 text-sm leading-relaxed font-sans mt-4">
               <p className="mb-4">При <span className="font-mono text-indigo-300 bg-slate-950 px-1.5 py-0.5 rounded">k = 0</span> квадраты имеют размер <span className="font-bold text-white">1×1</span>.</p>
               <div className="bg-[#0a0f1e] rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-300 shadow-inner">
                 <span className="text-slate-500">// Базовый случай: квадрат размера 1x1 это сама ячейка</span><br/>
                 <span className="text-indigo-400">ST</span>[r][c][0][0] = matrix[r][c];
               </div>
               <p className="mt-6 italic text-indigo-400 flex items-center gap-2">
                 <Play size={14} className="fill-indigo-400" /> Выберите шаг 1, чтобы увидеть как собираются квадраты бóльшего размера.
               </p>
             </div>
          ) : (
             <div className="flex flex-col gap-4 animate-in fade-in duration-300">
               <div className="bg-[#0a0f1e] rounded-xl border border-slate-800 p-4 font-mono text-[13px] md:text-sm text-slate-300 shadow-inner overflow-x-auto">
                 <span className="text-slate-500">// Текущая длина = 2^k, предыдущая = 2^(k-1)</span><br/>
                 <span className="text-purple-400">int</span> pL = <span className="text-amber-300">1</span> &lt;&lt; (k - <span className="text-amber-300">1</span>);<br/><br/>
                 <span className="text-slate-500">// Квадрат (2^k x 2^k) состоит из 4-х квадратов (2^(k-1) x 2^(k-1))</span><br/>
                 <span className="text-indigo-400">ST</span>[r][c][k][k] = <span className="text-sky-400">min</span>({'{'}<br/>
                 &nbsp;&nbsp;<span className="text-rose-400">ST</span>[r][c][k-<span className="text-amber-300">1</span>][k-<span className="text-amber-300">1</span>],           <span className="text-slate-500">// Левый Верх</span><br/>
                 &nbsp;&nbsp;<span className="text-blue-400">ST</span>[r][<span className="text-white">c + pL</span>][k-<span className="text-amber-300">1</span>][k-<span className="text-amber-300">1</span>],      <span className="text-slate-500">// Правый Верх</span><br/>
                 &nbsp;&nbsp;<span className="text-emerald-400">ST</span>[<span className="text-white">r + pL</span>][c][k-<span className="text-amber-300">1</span>][k-<span className="text-amber-300">1</span>],      <span className="text-slate-500">// Левый Низ</span><br/>
                 &nbsp;&nbsp;<span className="text-amber-500">ST</span>[<span className="text-white">r + pL</span>][<span className="text-white">c + pL</span>][k-<span className="text-amber-300">1</span>][k-<span className="text-amber-300">1</span>]   <span className="text-slate-500">// Правый Низ</span><br/>
                 {'}'});
               </div>
               
               {hover ? (
                 <div className="bg-slate-950 p-5 rounded-xl border border-indigo-900/40 font-mono text-sm shadow-[0_4px_15px_rgba(0,0,0,0.2)] mt-2">
                    <p className="text-slate-300 mb-3 text-xs uppercase tracking-wider">Пример для выделенной ячейки:</p>
                    <p className="text-indigo-300 border-b border-slate-800 pb-3 flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-white bg-indigo-600/80 px-2 py-0.5 rounded text-xs">ST[{hover.r}][{hover.c}][{k}][{k}]</span> 
                      <span className="text-slate-400">= min(</span>
                    </p>
                    
                    <div className="space-y-2 pt-3 pl-2 text-[11px] sm:text-xs">
                        {(() => {
                           const prevL = 1 << (k - 1);
                           return (
                             <>
                               <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-2 text-rose-300"><div className="w-2 h-2 rounded-sm bg-rose-500 shadow-[0_0_8px_#f43f5e]"></div> ST[{hover.r}][{hover.c}] (ЛВ)</span>
                                  <span className="text-rose-400 font-bold bg-rose-950/40 px-2 rounded border border-rose-900/50">{ST2D[hover.r][hover.c][k-1][k-1]}</span>
                               </div>
                               <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-2 text-blue-300"><div className="w-2 h-2 rounded-sm bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div> ST[{hover.r}][{hover.c + prevL}] (ПВ)</span>
                                  <span className="text-blue-400 font-bold bg-blue-950/40 px-2 rounded border border-blue-900/50">{ST2D[hover.r][hover.c + prevL][k-1][k-1]}</span>
                               </div>
                               <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-2 text-emerald-300"><div className="w-2 h-2 rounded-sm bg-emerald-500 shadow-[0_0_8px_#10b981]"></div> ST[{hover.r + prevL}][{hover.c}] (ЛН)</span>
                                  <span className="text-emerald-400 font-bold bg-emerald-950/40 px-2 rounded border border-emerald-900/50">{ST2D[hover.r + prevL][hover.c][k-1][k-1]}</span>
                               </div>
                               <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-2 text-amber-300"><div className="w-2 h-2 rounded-sm bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div> ST[{hover.r + prevL}][{hover.c + prevL}] (ПН)</span>
                                  <span className="text-amber-400 font-bold bg-amber-950/40 px-2 rounded border border-amber-900/50">{ST2D[hover.r + prevL][hover.c + prevL][k-1][k-1]}</span>
                               </div>
                             </>
                           )
                        })()}
                    </div>
                    
                    <div className="pt-3 mt-3 border-t border-slate-800 text-center text-slate-400 text-sm">
                       ) = <span className="text-white font-bold text-base bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">{ST2D[hover.r][hover.c][k][k]}</span>
                    </div>
                 </div>
               ) : (
                 <div className="bg-slate-950/40 border-2 border-slate-800 border-dashed p-8 text-center text-slate-500 text-sm rounded-xl mt-2 flex items-center justify-center animate-pulse min-h-[150px]">
                    👈 Наведите курсор на матрицу {L}x{L}, чтобы увидеть индексы в коде
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Viz2DQuery: React.FC = () => {
    const [r1, setR1] = useState(1);
    const [c1, setC1] = useState(1);
    const [r2, setR2] = useState(5);
    const [c2, setC2] = useState(6);

    const H = r2 - r1 + 1;
    const W = c2 - c1 + 1;
    const kx = Math.floor(Math.log2(H));
    const ky = Math.floor(Math.log2(W));
    const Lx = 1 << kx;
    const Ly = 1 << ky;

    const matRows = 8 - Lx + 1;
    const matCols = 8 - Ly + 1;

    return (
        <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1 bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col xl:max-w-md h-full">
               <h3 className="text-xl font-bold text-rose-400 mb-2">Запрос на прямоугольнике</h3>
               <p className="text-slate-400 text-[13px] mb-6 border-b border-slate-800 pb-4">Изменяйте координаты поиска (r1, c1 - левой верх, r2, c2 - правый низ).</p>
               
               <div className="flex flex-col items-center justify-center flex-1">
                  <div className="grid grid-cols-[repeat(8,1fr)] gap-[2px] bg-[#0a0f1e] p-2 rounded-xl border border-slate-800 relative shadow-inner overflow-x-auto max-w-full">
                     {Array.from({length: 64}).map((_, idx) => {
                         const r = Math.floor(idx / 8);
                         const c = idx % 8;
                         const isInQuery = r >= r1 && r <= r2 && c >= c1 && c <= c2;

                         return (
                            <div key={idx} className={\`w-8 h-8 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded text-[11px] sm:text-xs font-mono transition-all duration-300 \${isInQuery ? 'bg-rose-900/40 text-rose-200 border-rose-500/50 border scale-105 z-10' : 'bg-slate-800/60 text-slate-500'}\`}>
                               {val2D[r][c]}
                            </div>
                         )
                     })}
                     
                     <div 
                        className="absolute border-[3px] border-white pointer-events-none rounded transition-all duration-300 z-20 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        style={{
                          top: \`\${(r1 / 8) * 100}%\`,
                          left: \`\${(c1 / 8) * 100}%\`,
                          width: \`\${(W / 8) * 100}%\`,
                          height: \`\${(H / 8) * 100}%\`,
                          marginTop: '8px',
                          marginLeft: '8px',
                          height: 'calc(' + (H/8*100) + '% - 16px)',
                          width: 'calc(' + (W/8*100) + '% - 16px)',
                        }}
                     />
                  </div>
                  
                  <div className="bg-slate-950 p-4 rounded-xl w-full flex flex-col gap-3 text-sm font-mono text-slate-300 mt-6 border border-slate-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                       <label className="flex items-center justify-between gap-4 w-full">
                           <span className="text-slate-400">ЛВ (r1, c1):</span>
                           <div className="flex gap-2">
                             <input type="number" min={0} max={r2} value={r1} onChange={e => setR1(+e.target.value)} className="w-12 sm:w-14 bg-slate-900 border border-slate-700 py-1 px-1 rounded accent-rose-500 font-bold text-white text-center flex-1" />
                             <input type="number" min={0} max={c2} value={c1} onChange={e => setC1(+e.target.value)} className="w-12 sm:w-14 bg-slate-900 border border-slate-700 py-1 px-1 rounded accent-rose-500 font-bold text-white text-center flex-1" />
                           </div>
                       </label>
                       <label className="flex items-center justify-between gap-4 w-full">
                           <span className="text-slate-400">ПН (r2, c2):</span>
                           <div className="flex gap-2">
                             <input type="number" min={r1} max={7} value={r2} onChange={e => setR2(+e.target.value)} className="w-12 sm:w-14 bg-slate-900 border border-slate-700 py-1 px-1 rounded accent-rose-500 font-bold text-white text-center flex-1" />
                             <input type="number" min={c1} max={7} value={c2} onChange={e => setC2(+e.target.value)} className="w-12 sm:w-14 bg-slate-900 border border-slate-700 py-1 px-1 rounded accent-rose-500 font-bold text-white text-center flex-1" />
                           </div>
                       </label>
                  </div>
               </div>
            </div>

            <div className="flex-1 bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col h-full">
               <h3 className="text-xl font-bold text-emerald-400 mb-2">Формула запроса</h3>
               <p className="text-sm font-sans text-slate-300 mb-6 border-b border-slate-800 pb-4">
                  Запрос разбивается на 4 перекрывающихся блока. Достаточно знать степени двойки для высоты и ширины. Как найти углы — видно в коде.
               </p>

               <div className="bg-[#0a0f1e] rounded-xl border border-slate-800 p-4 lg:p-5 font-mono text-[12px] sm:text-[13px] md:text-sm text-slate-300 shadow-inner overflow-x-auto w-full mb-6 relative">
                 <div className="absolute right-3 top-3 text-emerald-500/20 font-bold text-4xl hidden sm:block">O(1)</div>
                 <span className="text-slate-500">// 1. Покрывающие степени двойки</span><br/>
                 <span className="text-purple-400">int</span> kx = <span className="text-sky-400">log2</span>(r2 - r1 + <span className="text-amber-300">1</span>); <span className="text-slate-500">// {kx}</span><br/>
                 <span className="text-purple-400">int</span> ky = <span className="text-sky-400">log2</span>(c2 - c1 + <span className="text-amber-300">1</span>); <span className="text-slate-500">// {ky}</span><br/>
                 <span className="text-purple-400">int</span> Lx = <span className="text-amber-300">1</span> &lt;&lt; kx; <span className="text-slate-500">// {Lx}</span><br/>
                 <span className="text-purple-400">int</span> Ly = <span className="text-amber-300">1</span> &lt;&lt; ky; <span className="text-slate-500">// {Ly}</span><br/><br/>

                 <span className="text-slate-500">// 2. Выдвигаемся из 4-х углов исходного прямоугольника!</span><br/>
                 <span className="text-indigo-400">int</span> ans = <span className="text-sky-400">min</span>({'{'}<br/>
                 &nbsp;&nbsp;<span className="text-rose-400">ST</span>[r1][c1][kx][ky],                 <span className="text-slate-500">// Из Левого Верха</span><br/>
                 &nbsp;&nbsp;<span className="text-blue-400">ST</span>[r1][<span className="text-white">c2 - Ly + 1</span>][kx][ky],        <span className="text-slate-500">// Из Правого Верха (сдвиг влево на Ly)</span><br/>
                 &nbsp;&nbsp;<span className="text-emerald-400">ST</span>[<span className="text-white">r2 - Lx + 1</span>][c1][kx][ky],        <span className="text-slate-500">// Из Левого Низа (сдвиг вверх на Lx)</span><br/>
                 &nbsp;&nbsp;<span className="text-amber-500">ST</span>[<span className="text-white">r2 - Lx + 1</span>][<span className="text-white">c2 - Ly + 1</span>][kx][ky]   <span className="text-slate-500">// Из Правого Низа</span><br/>
                 {'}'});
               </div>
               
               <div className="w-full flex justify-center mb-6 overflow-x-auto max-w-full custom-scrollbar pb-2">
                 <div className="flex flex-col items-center">
                  <h4 className="text-slate-400 font-bold mb-3 text-sm flex flex-col items-center text-center">
                     Откуда берутся эти 4 числа: матрица ST[][][<span className="text-white mx-0.5">{kx}</span>][<span className="text-white mx-0.5">{ky}</span>]
                  </h4>
                  <div className="grid gap-[2px] p-2.5 rounded-xl bg-[#0a0f1e] border border-slate-800 shadow-inner" style={{ gridTemplateColumns: \`repeat(\${matCols}, 1fr)\`}}>
                      {Array.from({length: matRows * matCols}).map((_, idx) => {
                          const r = Math.floor(idx / matCols);
                          const c = idx % matCols;
                          let isTL = r === r1 && c === c1;
                          let isTR = r === r1 && c === c2 - Ly + 1;
                          let isBL = r === r2 - Lx + 1 && c === c1;
                          let isBR = r === r2 - Lx + 1 && c === c2 - Ly + 1;

                          let color = "bg-slate-800 text-slate-500 font-mono scale-100 z-0";
                          let txt = ST2D[r][c][kx][ky].toString();

                          let badge = null;
                          if (isTL) { color = "bg-rose-500 text-white font-bold scale-[1.15] shadow-[0_0_12px_#f43f5e] z-10 border-rose-300 border-2"; badge = "TL"; }
                          else if (isTR) { color = "bg-blue-500 text-white font-bold scale-[1.15] shadow-[0_0_12px_#3b82f6] z-10 border-blue-300 border-2"; badge = "TR"; }
                          else if (isBL) { color = "bg-emerald-500 text-white font-bold scale-[1.15] shadow-[0_0_12px_#10b981] z-10 border-emerald-300 border-2"; badge = "BL"; }
                          else if (isBR) { color = "bg-amber-500 text-white font-bold scale-[1.15] shadow-[0_0_12px_#f59e0b] z-10 border-amber-300 border-2"; badge = "BR"; }

                          return (
                             <div key={idx} className={\`w-9 h-9 flex items-center justify-center text-[11px] xl:text-[13px] rounded transition-all duration-300 relative shrink-0 \${color}\`}>
                                {txt}
                                {badge && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 border border-slate-700 text-white px-1 font-bold rounded-sm shadow-md whitespace-nowrap z-20">{badge}</div>}
                             </div>
                          )
                      })}
                  </div>
                 </div>
               </div>
               
               <div className="mt-auto bg-slate-950 font-mono p-5 rounded-xl border border-indigo-900/60 shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
                  <div className="text-center font-bold text-white text-[13px] sm:text-base overflow-x-auto custom-scrollbar whitespace-nowrap mb-5 bg-[#0a0f1e] py-3 px-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-normal">min(</span>&nbsp;
                       <span className="text-rose-400">{ST2D[r1][c1][kx][ky]}</span> <span className="text-slate-600">,</span> 
                       <span className="text-blue-400 ml-1">{ST2D[r1][c2 - Ly + 1][kx][ky]}</span> <span className="text-slate-600">,</span> 
                       <span className="text-emerald-400 ml-1">{ST2D[r2 - Lx + 1][c1][kx][ky]}</span> <span className="text-slate-600">,</span> 
                       <span className="text-amber-400 ml-1">{ST2D[r2 - Lx + 1][c2 - Ly + 1][kx][ky]}</span>
                    &nbsp;<span className="text-slate-400 font-normal">)</span> 
                    <span className="ml-3 text-emerald-400">= {Math.min(ST2D[r1][c1][kx][ky], ST2D[r1][c2 - Ly + 1][kx][ky], ST2D[r2 - Lx + 1][c1][kx][ky], ST2D[r2 - Lx + 1][c2 - Ly + 1][kx][ky])}</span>
                  </div>
               </div>

            </div>
        </div>
    )
}
`;

fs.writeFileSync('src/components/visualizers/SparseTableViz.tsx', newCode);
console.log("Successfully replaced 2D visualizers with stacked matrices and code blocks.");
