export type Milestone = { id: string; scenarios: string[]; note: string; manual: string };

/** `S-H01~S-H08` style ranges and single IDs, in order. */
function scenarioIds(text: string): string[] {
  const ids: string[] = [];
  for (const [, from, to] of text.matchAll(/(S-[HB]\d\d)(?:~(S-[HB]\d\d))?/g)) {
    const prefix = from!.slice(0, 3);
    const start = Number(from!.slice(3));
    const end = to ? Number(to.slice(3)) : start;
    for (let index = start; index <= end; index++) ids.push(`${prefix}${String(index).padStart(2, '0')}`);
  }
  return ids;
}

/** Milestone table of prd/01-verification.md section 6: the scenarios that must be green and the manual check. */
export function parseMilestones(markdown: string): Milestone[] {
  const section = markdown.slice(markdown.indexOf('## 6.'), markdown.indexOf('## 7.'));
  return [...section.matchAll(/^\| (M\d) \| ([^|]+) \| ([^|]+) \|$/gm)].map(([, id, green, manual]) => ({
    id: id!, scenarios: scenarioIds(green!), note: green!.trim(), manual: manual!.trim(),
  }));
}
