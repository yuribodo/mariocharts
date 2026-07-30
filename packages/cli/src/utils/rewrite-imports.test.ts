// Imported without a `.js` extension (unlike the rest of `packages/cli/src`,
// which targets NodeNext-style ESM output) because Jest's resolver doesn't map
// `.js` specifiers back to `.ts` sources. The CLI's own `moduleResolution:
// "Node"` resolves the extensionless form fine, and this file is never part of
// the tsup bundle (entry is `src/index.ts`).
import { rewriteInternalImports } from './rewrite-imports';
import type { Config } from './types';

function makeConfig(overrides: Partial<Config['aliases']> = {}): Config {
  return {
    style: 'default',
    rsc: false,
    tsx: true,
    tailwind: {
      config: 'tailwind.config.ts',
      css: 'app/globals.css',
      baseColor: 'slate',
      cssVariables: true,
      prefix: '',
    },
    aliases: {
      components: '@/components',
      utils: '@/lib/utils',
      ui: '@/components/ui',
      charts: '@/components/charts',
      hooks: '@/hooks',
      types: '@/types',
      themes: '@/themes',
      ...overrides,
    },
  };
}

describe('rewriteInternalImports', () => {
  describe('lib imports', () => {
    it('rewrites ../../../../lib/utils to the configured utils alias', () => {
      const out = rewriteInternalImports(
        `import { cn } from '../../../../lib/utils';`,
        makeConfig()
      );
      expect(out).toBe(`import { cn } from '@/lib/utils';`);
    });

    it('rewrites ../../../../lib/hooks alongside the utils alias, not aliases.hooks', () => {
      // `init.ts` writes hooks.ts next to utils.ts, so the hooks specifier is
      // derived from dirname(aliases.utils). `aliases.hooks` points at the
      // consumer's own hooks folder and must not be used here.
      const out = rewriteInternalImports(
        `import { useIsomorphicLayoutEffect } from '../../../../lib/hooks';`,
        makeConfig({ utils: '~/source/lib/utils', hooks: '@/my-app-hooks' })
      );
      expect(out).toBe(`import { useIsomorphicLayoutEffect } from '~/source/lib/hooks';`);
      expect(out).not.toContain('my-app-hooks');
    });
  });

  describe('_shared imports', () => {
    it('rewrites a bare ../_shared import', () => {
      const out = rewriteInternalImports(
        `import { formatValue } from '../_shared';`,
        makeConfig()
      );
      expect(out).toBe(`import { formatValue } from '@/components/charts/_shared';`);
    });

    it('preserves sub-paths under ../_shared', () => {
      const out = rewriteInternalImports(
        `import type { TooltipRenderer } from '../_shared/tooltip-types';`,
        makeConfig()
      );
      expect(out).toBe(
        `import type { TooltipRenderer } from '@/components/charts/_shared/tooltip-types';`
      );
    });

    it('honours a custom charts alias', () => {
      const out = rewriteInternalImports(
        `import { formatValue } from '../_shared';`,
        makeConfig({ charts: '~/ui/viz' })
      );
      expect(out).toBe(`import { formatValue } from '~/ui/viz/_shared';`);
    });
  });

  describe('syntax coverage', () => {
    it('handles double quotes', () => {
      const out = rewriteInternalImports(
        `import { cn } from "../../../../lib/utils";`,
        makeConfig()
      );
      expect(out).toBe(`import { cn } from "@/lib/utils";`);
    });

    it('handles re-exports (export ... from)', () => {
      const out = rewriteInternalImports(
        `export { formatValue } from '../_shared';`,
        makeConfig()
      );
      expect(out).toBe(`export { formatValue } from '@/components/charts/_shared';`);
    });

    it('rewrites every occurrence in a multi-import file', () => {
      const source = [
        `import { cn } from '../../../../lib/utils';`,
        `import { useIsomorphicLayoutEffect } from '../../../../lib/hooks';`,
        `import { formatValue } from '../_shared';`,
        `import type { ChartMargin } from '../_shared/types';`,
      ].join('\n');

      expect(rewriteInternalImports(source, makeConfig())).toBe(
        [
          `import { cn } from '@/lib/utils';`,
          `import { useIsomorphicLayoutEffect } from '@/lib/hooks';`,
          `import { formatValue } from '@/components/charts/_shared';`,
          `import type { ChartMargin } from '@/components/charts/_shared/types';`,
        ].join('\n')
      );
    });
  });

  describe('does not over-match', () => {
    it('leaves bare string literals alone (not anchored to `from`)', () => {
      const source = [
        `const SHARED_DIR = '../_shared';`,
        `const label = "../../../../lib/utils";`,
      ].join('\n');
      expect(rewriteInternalImports(source, makeConfig())).toBe(source);
    });

    it('leaves sibling and deeper relative imports alone', () => {
      const source = [
        `import { computeLayout } from './layout';`,
        `import { something } from '../../_shared';`,
        `import { other } from '../../../lib/utils';`,
      ].join('\n');
      expect(rewriteInternalImports(source, makeConfig())).toBe(source);
    });

    it('leaves package and already-aliased imports alone', () => {
      const source = [
        `import * as React from 'react';`,
        `import { cn } from '@/lib/utils';`,
      ].join('\n');
      expect(rewriteInternalImports(source, makeConfig())).toBe(source);
    });

    it('is a no-op on content with no internal imports', () => {
      const source = `export const x = 1;\n`;
      expect(rewriteInternalImports(source, makeConfig())).toBe(source);
    });
  });
});
