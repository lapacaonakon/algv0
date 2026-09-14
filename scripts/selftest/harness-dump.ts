// Прогон КАЖДОГО шаблона через настоящий харнесс дебаггера (как в браузере):
// полный код и init-версия; проверяем error/truncated/шаги.
import { PAGE_SYNC } from "../../src/data/vizSync";
import { buildDebugRunner, DEBUG_STEP_CAP } from "../../src/data/debugRunner";
import { writeFileSync } from "fs";

const out: string[] = [];
for (const [id, sync] of Object.entries(PAGE_SYNC)) {
  if (!sync.code) continue;
  out.push(`### ${id}\n=====FULL\n${sync.code}\n=====INIT`);
}
writeFileSync("/tmp/pysync-harness.json", JSON.stringify({ cap: DEBUG_STEP_CAP, entries: Object.fromEntries(Object.entries(PAGE_SYNC).filter(([, s]) => s.code).map(([id, s]) => [id, s.code])) }));
console.log("dumped", Object.keys(PAGE_SYNC).length);
