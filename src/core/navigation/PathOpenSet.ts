type Entry = { f: number; idx: number };

/** Internal A* frontier. Equal-cost entries may be visited in any order. */
export class PathOpenSet {
  private readonly entries: Entry[] = [];

  get size(): number {
    return this.entries.length;
  }

  push(entry: Entry): void {
    const entries = this.entries;
    let index = entries.length;
    entries.push(entry);
    while (index > 0) {
      const parentIndex = (index - 1) >>> 1;
      const parent = entries[parentIndex]!;
      if (parent.f <= entry.f) break;
      entries[index] = parent;
      index = parentIndex;
    }
    entries[index] = entry;
  }

  pop(): Entry | undefined {
    const entries = this.entries;
    const first = entries[0];
    const last = entries.pop();
    if (entries.length === 0 || !last) return first;
    let index = 0;
    const length = entries.length;
    while (index * 2 + 1 < length) {
      let childIndex = index * 2 + 1;
      const right = entries[childIndex + 1];
      if (right && right.f < entries[childIndex]!.f) childIndex += 1;
      const child = entries[childIndex]!;
      if (last.f <= child.f) break;
      entries[index] = child;
      index = childIndex;
    }
    entries[index] = last;
    return first;
  }
}
