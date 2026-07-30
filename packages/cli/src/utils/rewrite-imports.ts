import path from 'path';
import type { Config } from './types.js';

/**
 * Internal source imports (e.g. `../_shared`, `../../../../lib/utils`) only
 * resolve inside this monorepo. Rewrite them to the consumer's configured
 * aliases on install — the way shadcn's CLI does — so components compile
 * standalone. See #61.
 *
 * Lives in its own module (rather than inside `add.ts`) so it can be unit
 * tested without pulling in the command's ESM-only dependencies.
 */
export function rewriteInternalImports(content: string, config: Config): string {
  const utilsAlias = config.aliases.utils; // e.g. '@/lib/utils'
  const libDir = path.posix.dirname(utilsAlias); // e.g. '@/lib'
  // Deliberately derived from `utilsAlias`, NOT from `config.aliases.hooks`:
  // `init.ts` physically writes `hooks.ts` next to `utils.ts`, so the two files
  // always share a directory. `config.aliases.hooks` points at the consumer's
  // own hooks folder and is unrelated to where we put ours.
  const hooksAlias = path.posix.join(libDir, 'hooks'); // e.g. '@/lib/hooks'
  const sharedAlias = `${config.aliases.charts}/_shared`;

  // Anchored to `from "..."` (covers both `import ... from` and
  // `export ... from`) so a bare string elsewhere in the file that happens
  // to match one of these literals — a comment, an unrelated string — isn't
  // rewritten.
  return content
    .replace(/(from\s+)(['"])\.\.\/\.\.\/\.\.\/\.\.\/lib\/utils\2/g, `$1$2${utilsAlias}$2`)
    .replace(/(from\s+)(['"])\.\.\/\.\.\/\.\.\/\.\.\/lib\/hooks\2/g, `$1$2${hooksAlias}$2`)
    .replace(/(from\s+)(['"])\.\.\/_shared((?:\/[^'"]*)?)\2/g, `$1$2${sharedAlias}$3$2`);
}
