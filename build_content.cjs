const fs = require('fs');

const tickets14_20 = fs.readFileSync("backup/src/data/tickets/ticket14_20.ts", "utf8");
const tickets21_24 = fs.readFileSync("backup/src/data/tickets/ticket21_24.ts", "utf8");

const t1_match = tickets14_20.match(/export const tickets14to20: Chapter\\[\\] = \\[(.*)\\];/s);
const t2_match = tickets21_24.match(/export const tickets21to24: Chapter\\[\\] = \\[(.*)\\];/s);

const add_match = fs.readFileSync("backup/src/data/additionalTickets.ts", "utf8").match(/export const additionalTickets: Chapter\\[\\] = \\[(.*)\\];/s);
const graph_match = fs.readFileSync("backup/src/data/graphContent.ts", "utf8").match(/export const graphChapters: Chapter\\[\\] = \\[(.*)\\];/s);

const new_match = fs.readFileSync("src/data/content.ts", "utf8").match(/export const chapters: Chapter\\[\\] = \\[(.*)\\];/s);

let allContentStr = \`import { Chapter } from "../types";

export const chapters: Chapter[] = [
  \${graph_match[1]},
  \${add_match[1]},
  \${t1_match[1]},
  \${t2_match[1]}
];
\`;

// Replace euler-path-vs-cycle, bridges-code, planarity-euler-formula
// By overwriting their IDs inside the string? No, they have different contents.

fs.writeFileSync("src/data/content_merged.ts", allContentStr);
console.log("Written!");
