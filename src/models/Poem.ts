export class Poem {
  constructor(
    readonly title: string,
    readonly body: string[],
    readonly slug: string,
  ) {}

  static fromRawText(raw: string, filename: string): Poem {
    const slug = filename.replace(/\.txt$/i, '').replace(/^\d+-/, '');
    const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');

    let titleIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().length > 0) {
        titleIdx = i;
        break;
      }
    }
    if (titleIdx === -1) {
      return new Poem('Untitled', [], slug);
    }

    const title = lines[titleIdx].trim();
    const bodyLines = lines.slice(titleIdx + 1);

    while (bodyLines.length && bodyLines[0].trim() === '') bodyLines.shift();
    while (bodyLines.length && bodyLines[bodyLines.length - 1].trim() === '') bodyLines.pop();

    return new Poem(title, bodyLines, slug);
  }
}
