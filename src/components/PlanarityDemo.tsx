export function PlanarityDemo() {
  return (
    <div className="space-y-4">
      <h4 className="text-base font-bold text-white">K5 vs K3,3: Демонстрация непланарности</h4>
      <p className="text-xs text-slate-400">Просто смотри на графы и запоминай — их нельзя уложить без пересечений.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* K5 */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 relative min-h-[300px]">
          <div className="absolute top-2 left-2 bg-slate-900/90 px-2 py-1 rounded text-[10px] text-rose-400 font-bold border border-rose-500/30 w-auto z-20">K5 — НЕПЛАНАРЕН</div>
          <svg className="w-full h-full absolute inset-0 z-10" viewBox="0 0 320 280" preserveAspectRatio="xMidYMid meet">
            {(() => {
              const pts = [
                {id:0,x:160,y:40},
                {id:1,x:270,y:100},
                {id:2,x:230,y:230},
                {id:3,x:90,y:230},
                {id:4,x:50,y:100}
              ];
              const edges = [
                [0,1],[0,2],[0,3],[0,4],
                [1,2],[1,3],[1,4],
                [2,3],[2,4],
                [3,4]
              ];
              function findPt(id:number) { return pts.find(p => p.id===id)!; }
              function intersect(a:number,b:number,c:number,d:number) {
                if (a===c||a===d||b===c||b===d) return false;
                const p1=findPt(a),p2=findPt(b),p3=findPt(c),p4=findPt(d);
                function ccw(ax:number,ay:number,bx:number,by:number,cx:number,cy:number) {
                  return (cy-ay)*(bx-ax)>(by-ay)*(cx-ax);
                }
                return ccw(p1.x,p1.y,p3.x,p3.y,p4.x,p4.y)!==ccw(p2.x,p2.y,p3.x,p3.y,p4.x,p4.y)
                  && ccw(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y)!==ccw(p1.x,p1.y,p2.x,p2.y,p4.x,p4.y);
              }
              const crosses: number[] = [];
              for(let i=0;i<edges.length;i++) {
                for(let j=i+1;j<edges.length;j++) {
                  if (intersect(edges[i][0],edges[i][1],edges[j][0],edges[j][1])) {
                    if (!crosses.includes(i)) crosses.push(i);
                    if (!crosses.includes(j)) crosses.push(j);
                  }
                }
              }
              const lines = []; const circles = [];
              for(let i=0;i<edges.length;i++) {
                const p1=findPt(edges[i][0]),p2=findPt(edges[i][1]);
                const xing = crosses.includes(i);
                lines.push(<line key={`l${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={xing ? "#f43f5e" : "#4f46e5"} strokeWidth={xing ? 3 : 1.5} />);
              }
              const labels = ["A","B","C","D","E"];
              for(const p of pts) {
                circles.push(<g key={`c${p.id}`}>
                  <circle cx={p.x} cy={p.y} r={8} fill="#1e293b" stroke="#4f46e5" strokeWidth={2} />
                  <text x={p.x} y={p.y+3} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">{labels[p.id]}</text>
                </g>);
              }
              return <>{lines}{circles}</>;
            })()}
          </svg>
          <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 p-2 rounded-lg text-[10px] text-center text-slate-400 font-mono z-20">
            V=5, E=10 {'>'} 3V-6 = 9 {'-->'} {'\u274C'}
          </div>
        </div>

        {/* K3,3 */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 relative min-h-[300px]">
          <div className="absolute top-2 left-2 bg-slate-900/90 px-2 py-1 rounded text-[10px] text-rose-400 font-bold border border-rose-500/30 w-auto z-20">K3,3 — НЕПЛАНАРЕН</div>
          <svg className="w-full h-full absolute inset-0 z-10" viewBox="0 0 320 280" preserveAspectRatio="xMidYMid meet">
            {(() => {
              const pts = [
                {id:0,x:60,y:60},{id:1,x:160,y:60},{id:2,x:260,y:60},
                {id:3,x:60,y:220},{id:4,x:160,y:220},{id:5,x:260,y:220}
              ];
              const edges = [
                [0,3],[0,4],[0,5],
                [1,3],[1,4],[1,5],
                [2,3],[2,4],[2,5]
              ];
              function findPt(id:number) { return pts.find(p=>p.id===id)!; }
              function intersect(a:number,b:number,c:number,d:number) {
                if (a===c||a===d||b===c||b===d) return false;
                const p1=findPt(a),p2=findPt(b),p3=findPt(c),p4=findPt(d);
                if (!p1||!p2||!p3||!p4) return false;
                function ccw(ax:number,ay:number,bx:number,by:number,cx:number,cy:number) {
                  return (cy-ay)*(bx-ax)>(by-ay)*(cx-ax);
                }
                return ccw(p1.x,p1.y,p3.x,p3.y,p4.x,p4.y)!==ccw(p2.x,p2.y,p3.x,p3.y,p4.x,p4.y)
                  && ccw(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y)!==ccw(p1.x,p1.y,p2.x,p2.y,p4.x,p4.y);
              }
              const crosses:number[]=[];
              for(let i=0;i<edges.length;i++) for(let j=i+1;j<edges.length;j++) {
                if (intersect(edges[i][0],edges[i][1],edges[j][0],edges[j][1])) {
                  if (!crosses.includes(i)) crosses.push(i);
                  if (!crosses.includes(j)) crosses.push(j);
                }
              }
              const lines = []; const circles = [];
              for(let i=0;i<edges.length;i++) {
                const p1=findPt(edges[i][0]),p2=findPt(edges[i][1]);
                const xing=crosses.includes(i);
                lines.push(<line key={`l${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={xing?"#f43f5e":"#4f46e5"} strokeWidth={xing?3:1.5}/>);
              }
              const labels = ["\u04141","\u04142","\u04143","\u041a1","\u041a2","\u041a3"];
              for(const p of pts) {
                circles.push(<g key={`c${p.id}`}>
                  <circle cx={p.x} cy={p.y} r={8} fill="#1e293b" stroke="#4f46e5" strokeWidth={2}/>
                  <text x={p.x} y={p.y+3} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">{labels[p.id]}</text>
                </g>);
              }
              return <>{lines}{circles}</>;
            })()}
          </svg>
          <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 p-2 rounded-lg text-[10px] text-center text-slate-400 font-mono z-20">
            V=6, E=9 {'>'} 2V-4 = 8 (двудольный) {'-->'} {'\u274C'}
          </div>
        </div>
      </div>

      <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-300 mt-4">
        ⚠️ Запомни: K5 и K3,3 — два кита непланарности. Если внутри твоего графа есть подграф, 
        гомеоморфный K5 или K3,3 — он непланарен. Теорема Куратовского, детка.
      </div>
    </div>
  );
}
