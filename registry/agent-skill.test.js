const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const { CHARTS, ROOT_DIR } = require('./manifest');

const skill = fs.readFileSync(path.join(ROOT_DIR, 'skills/mario-charts/SKILL.md'), 'utf8');
const guide = fs.readFileSync(path.join(ROOT_DIR, 'content/agent-md/docs/ai-agents.md'), 'utf8');

describe('Mario Charts agent integration', () => {
  it('routes every chart task to an available registry item', () => {
    const names = [...skill.matchAll(/^\| .+ \| `([a-z-]+)` \|$/gm)].map((match) => match[1]);
    expect(names.sort()).toEqual(CHARTS.map((chart) => chart.name).sort());
  });

  it.each([['skill', skill], ['guide', guide]])('%s examples compile against the shipped chart API', (_name, content) => {
    const examples = [...content.matchAll(/```tsx\n([\s\S]*?)```/g)];
    expect(examples.length).toBeGreaterThan(0);
    const configFile = ts.readConfigFile(path.join(ROOT_DIR, 'tsconfig.json'), ts.sys.readFile);
    const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, ROOT_DIR);
    const options = {
      ...config.options,
      incremental: false,
      paths: { ...config.options.paths, '@/components/charts/*': ['./src/components/charts/*'] },
    };

    for (const [, source] of examples) {
      const filename = path.join(ROOT_DIR, '__agent_example__.tsx');
      const host = ts.createCompilerHost(options);
      const getSourceFile = host.getSourceFile.bind(host);
      host.getSourceFile = (file, languageVersion, onError, shouldCreateNewSourceFile) =>
        file === filename
          ? ts.createSourceFile(filename, source, languageVersion, true, ts.ScriptKind.TSX)
          : getSourceFile(file, languageVersion, onError, shouldCreateNewSourceFile);
      const program = ts.createProgram([filename], options, host);
      const errors = ts.getPreEmitDiagnostics(program).map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      );
      expect(errors).toEqual([]);
    }
  });
});
