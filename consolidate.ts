import { tickets1to5 } from "./tickets/ticket1_5";
import { tickets6to13 } from "./tickets/ticket6_13";
import { tickets14to20 } from "./tickets/ticket14_20";
import { tickets21to24 } from "./tickets/ticket21_24";
import fs from "fs";

const allTickets = [
    ...tickets1to5,
    ...tickets6to13,
    ...tickets14to20,
    ...tickets21to24
];

const excludeIds = ["segment-trees", "treap-segment", "graph-dfs-bfs", "dijkstra", "bellman-ford", "floyd", "aho-corasick"];

// Also filter out any that might overlap logically. 
// He has stack-dfs, queue-bfs, heap-beam-search, segment-trees, dp.
// In our generated tickets:
// ticket 1: segment-trees
// ticket 6: graph-dfs-bfs (we should drop it since he has stack-dfs, queue-bfs)
// ticket 14: dijkstra
// ticket 15: bellman-ford
// ticket 16: floyd
// ticket 23: aho-corasick

const finalTickets = allTickets.filter(t => !excludeIds.includes(t.id));

let out = `import { Chapter } from "../types";\n\nexport const additionalTickets: Chapter[] = [\n`;

finalTickets.forEach(t => {
    out += `  {
    id: ${JSON.stringify(t.id)},
    title: ${JSON.stringify(t.title)},
    type: ${JSON.stringify(t.type)},
    description: ${JSON.stringify(t.description || "")},
    category: ${JSON.stringify(t.category)},
    content: \`${t.content.replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\`
  },
`;
});

out += `];\n`;

fs.writeFileSync("src/data/additionalTickets.ts", out);
