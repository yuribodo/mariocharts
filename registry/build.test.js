const fs = require('fs');
const os = require('os');
const path = require('path');
const { buildAll, removeOrphans, MANAGED_DIRS } = require('./build');

describe('removeOrphans', () => {
  let dir;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-build-'));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('deletes a file the current manifest no longer produces', () => {
    const kept = path.join(dir, 'bar-chart.json');
    const orphan = path.join(dir, 'kpi-card.json');
    fs.writeFileSync(kept, '{}');
    fs.writeFileSync(orphan, '{}');

    const removed = removeOrphans([{ path: kept, content: '{}' }], [dir]);

    expect(fs.existsSync(kept)).toBe(true);
    expect(fs.existsSync(orphan)).toBe(false);
    expect(removed).toHaveLength(1);
  });

  it('removes nothing when every file is still generated', () => {
    const file = path.join(dir, 'bar-chart.json');
    fs.writeFileSync(file, '{}');

    expect(removeOrphans([{ path: file, content: '{}' }], [dir])).toEqual([]);
    expect(fs.existsSync(file)).toBe(true);
  });

  it('tolerates a managed directory that does not exist yet', () => {
    expect(removeOrphans([], [path.join(dir, 'missing')])).toEqual([]);
  });
});

// Read-only counterpart to removeOrphans: asserts the invariant it relies on,
// without deleting anything from the real tree. If this fails, the committed
// registry is serving a file the manifest stopped producing.
describe('managed directories', () => {
  it('contain only files the current manifest generates', () => {
    const expected = new Set(buildAll().map((o) => path.resolve(o.path)));
    const strays = [];
    for (const dir of MANAGED_DIRS) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isFile()) continue;
        const full = path.resolve(dir, entry.name);
        if (!expected.has(full)) strays.push(full);
      }
    }
    expect(strays).toEqual([]);
  });
});
