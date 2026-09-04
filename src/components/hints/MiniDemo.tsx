import React from "react";
import { ArticulationDemo, BfsDemo, BridgeDemo, DfsDemo, MstDemo, RelaxDemo, SccDemo, ToposortDemo } from "./demosGraph";
import {
  AmortizedDemo, DsuDemo, HeapDemo, NpDemo, PrefixSumDemo, QueueDemo, SegmentTreeDemo,
  SparseTableDemo, StackDemo, SuffixLinkDemo, TrieBfsDemo, TrieDemo, PrefixFunctionDemo, DpDemo,
} from "./demosStruct";
import {
  ComponentsDemo, CoordCompressDemo, FloydDemo, GraphBasicsDemo,
  ZigDemo, ZigZagDemo, ZigZigDemo,
} from "./demosExtra";

export type DemoKind =
  | "bfs" | "dfs" | "heap" | "stack" | "queue" | "dsu" | "trie" | "trie-bfs"
  | "suffix-link" | "toposort" | "relax" | "prefix-sum" | "sparse-table"
  | "segment-tree" | "bridge" | "articulation" | "mst" | "amortized" | "np" | "scc"
  | "prefix-function" | "dp" | "floyd" | "components" | "graph" | "coord-compress"
  | "zig" | "zig-zig" | "zig-zag";

const REGISTRY: Record<DemoKind, React.FC> = {
  bfs: BfsDemo,
  dfs: DfsDemo,
  heap: HeapDemo,
  stack: StackDemo,
  queue: QueueDemo,
  dsu: DsuDemo,
  trie: TrieDemo,
  "trie-bfs": TrieBfsDemo,
  "suffix-link": SuffixLinkDemo,
  toposort: ToposortDemo,
  relax: RelaxDemo,
  "prefix-sum": PrefixSumDemo,
  "sparse-table": SparseTableDemo,
  "segment-tree": SegmentTreeDemo,
  bridge: BridgeDemo,
  articulation: ArticulationDemo,
  mst: MstDemo,
  amortized: AmortizedDemo,
  np: NpDemo,
  scc: SccDemo,
  "prefix-function": PrefixFunctionDemo,
  dp: DpDemo,
  floyd: FloydDemo,
  components: ComponentsDemo,
  graph: GraphBasicsDemo,
  "coord-compress": CoordCompressDemo,
  zig: ZigDemo,
  "zig-zig": ZigZigDemo,
  "zig-zag": ZigZagDemo,
};

export const MiniDemo: React.FC<{ kind: DemoKind }> = ({ kind }) => {
  const Cmp = REGISTRY[kind];
  if (!Cmp) return null;
  return (
    <div className="bg-slate-950/70 rounded-lg border border-slate-800 p-2">
      <Cmp />
    </div>
  );
};
