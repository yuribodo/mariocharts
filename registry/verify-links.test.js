const { extractUrls } = require('./verify-links');

describe('extractUrls', () => {
  it('keeps real URLs and drops markdown placeholders and trailing punctuation', () => {
    const sample = [
      'Install any chart:',
      '',
      '```bash',
      'npx shadcn@latest add https://mariocharts.com/r/<chart-name>.json',
      '```',
      '',
      'Register the namespace:',
      '',
      '```json',
      '{',
      '  "registries": {',
      '    "@mariocharts": "https://mariocharts.com/r/{name}.json"',
      '  }',
      '}',
      '```',
      '',
      'The registry index is at https://mariocharts.com/r/registry.json.',
      'See also https://mariocharts.com/docs.',
    ].join('\n');

    expect(extractUrls(sample)).toEqual([
      'https://mariocharts.com/docs',
      'https://mariocharts.com/r/registry.json',
    ]);
  });

  it('returns an empty list when no mariocharts.com URLs are present', () => {
    expect(extractUrls('nothing to see here')).toEqual([]);
  });

  // Dropping every trailing-slash URL made the checker skip these silently,
  // reporting "all links OK" for links it never requested.
  it('keeps checkable URLs that legitimately end in a slash', () => {
    const sample = [
      'Website: https://mariocharts.com/',
      'Docs: https://mariocharts.com/docs/',
    ].join('\n');

    expect(extractUrls(sample)).toEqual([
      'https://mariocharts.com/',
      'https://mariocharts.com/docs/',
    ]);
  });

  it('still drops a placeholder prefix that ends in a slash', () => {
    expect(extractUrls('https://mariocharts.com/r/<chart-name>.json')).toEqual([]);
    expect(extractUrls('https://mariocharts.com/r/{name}.json')).toEqual([]);
  });
});
