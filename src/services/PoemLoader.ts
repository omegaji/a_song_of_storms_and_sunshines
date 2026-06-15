import { Poem } from '../models/Poem';

const rawPoems = import.meta.glob('/poems/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export class PoemLoader {
  static loadAll(): Poem[] {
    const entries = Object.entries(rawPoems);
    entries.sort(([a], [b]) => a.localeCompare(b));
    return entries.map(([path, raw]) => {
      const filename = path.split('/').pop() ?? path;
      return Poem.fromRawText(raw, filename);
    });
  }
}
