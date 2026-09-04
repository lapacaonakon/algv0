import { useState } from 'react';
import { chapters } from './data/content';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Simulator } from './components/Simulator';
import { KruskalSimulator } from './components/KruskalSimulator';
import { SegmentTreeVisualizer } from './components/SegmentTreeVisualizer';
import { DPVisualizer } from './components/DPVisualizer';
import { SparseTableViz } from './components/visualizers/SparseTableViz';
import MnemonicCards from './components/MnemonicCards';
import { StackViz } from './components/StackViz';
import { QueueViz } from './components/QueueViz';
import { HeapViz } from './components/HeapViz';
import { WaterfallAnimationWidget } from './components/WaterfallAnimationWidget';
import DijkstraViz from './components/DijkstraViz';
import BfsViz from './components/BfsViz';
import BellmanFordViz from './components/BellmanFordViz';
import FloydViz from './components/FloydViz';
import ChapterImage from './components/ChapterImage';
import { SalmonAutomatonWidget } from './components/SalmonAutomatonWidget';

// New simulators
import { EulerSimulator } from './components/EulerSimulator';
import { DfsBridgesSimulator } from './components/DfsBridgesSimulator';
import { ArticulationPointsViz } from './components/ArticulationPointsViz';
import { PlanarityDemo } from './components/PlanarityDemo';
import { GraphTraversalViz } from './components/GraphTraversalViz';
import { StringAlgorithmsViz } from './components/StringAlgorithmsViz';
import { JohnsonViz } from './components/JohnsonViz';
import { SplayTreeViz } from './components/SplayTreeViz';
import { KosarajuViz } from './components/KosarajuViz';
import { TopologicalSortViz } from './components/TopologicalSortViz';

export default function App() {
  const [activeTab, setActiveTab] = useState<'guide' | 'simulator'>('guide');
  const [activeChapterId, setActiveChapterId] = useState<string>(chapters[0].id);

  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === 'guide' ? (
        <div className="flex flex-col lg:flex-row max-w-screen-2xl mx-auto items-start">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0 w-full border-b lg:border-b-0 lg:border-r border-slate-800 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] overflow-y-auto">
             <Sidebar selectedChapterId={activeChapterId} setSelectedChapterId={setActiveChapterId} />
          </div>
          
          {/* Main content */}
          <main id="main-content" className="flex-1 p-4 md:p-8 lg:p-12 min-w-0 max-w-5xl mx-auto w-full">
             
             <div className="prose prose-invert max-w-none mb-8"
                  dangerouslySetInnerHTML={{ __html: activeChapter.content }} />

             {/* Specialized interactives */}
             <div className="mt-8">
               {activeChapter.id === 'euler-path-vs-cycle' && <EulerSimulator />}
               {activeChapter.id === 'bridges-code' && <DfsBridgesSimulator />}
               {activeChapter.id === 'graph-articulation' && <ArticulationPointsViz />}
               {activeChapter.id === 'planarity-euler-formula' && <PlanarityDemo />}
               {activeChapter.id === 'graph-dfs-bfs' && <GraphTraversalViz />}
               
               {activeChapter.id === 'stack-dfs' && <StackViz />}
               {activeChapter.id === 'queue-bfs' && (
                 <div className="space-y-12">
                   <QueueViz />
                   <BfsViz />
                 </div>
               )}
               {activeChapter.id === 'heap-beam-search' && <HeapViz />}
               
               {activeChapter.id === 'intro' && <MnemonicCards />}
               {activeChapter.id === 'dijkstra' && (
                 <>
                   <ChapterImage vizType="dijkstra" />
                   <DijkstraViz />
                 </>
               )}
               {activeChapter.id === 'bellman-ford' && (
                 <>
                   <ChapterImage vizType="bellman-ford" />
                   <BellmanFordViz />
                 </>
               )}
               {activeChapter.id === 'floyd' && (
                 <>
                   <ChapterImage vizType="floyd" />
                   <FloydViz />
                 </>
               )}
               {activeChapter.id === 'johnson-algo' && (
                 <JohnsonViz />
               )}
               
               {activeChapter.id === 'aho-corasick' && (
                 <div className="space-y-12">
                   <WaterfallAnimationWidget />
                   <SalmonAutomatonWidget />
                 </div>
               )}
               
               {activeChapter.id === 'mst-kruskal' && <KruskalSimulator />}
               {activeChapter.id === 'mst-prima' && <KruskalSimulator />}
               {activeChapter.id === 'mst-boruvka' && <KruskalSimulator />}
               
               {activeChapter.id === 'string-kmp' && <StringAlgorithmsViz defaultMode="kmp" />}
               {activeChapter.id === 'string-z-func' && <StringAlgorithmsViz defaultMode="z" />}
               
               {activeChapter.id === 'segment-trees' && <SegmentTreeVisualizer />}
               {activeChapter.id === 'sparse-table' && <SparseTableViz />}
               {activeChapter.id === 'dynamic-programming' && <DPVisualizer />}
               {activeChapter.id === 'splay-tree' && <SplayTreeViz />}
               {activeChapter.id === 'scc-kosaraju' && <KosarajuViz />}
               {activeChapter.id === 'top-sort' && <TopologicalSortViz />}
             </div>
             
          </main>
        </div>
      ) : (
        <main className="p-4 md:p-8 lg:p-12 max-w-5xl mx-auto">
           <Simulator />
        </main>
      )}
      
      {/* Footer */}
      <footer className="p-8 text-center text-slate-600 text-xs border-t border-slate-900 mt-12 bg-slate-950">
        © 2026 Universal Educational Guide. Интерактивные визуализации алгоритмов.
      </footer>
    </div>
  );
}
