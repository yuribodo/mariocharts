import { z } from 'zod';

// Configuração do projeto
export const configSchema = z.object({
  $schema: z.string().optional(),
  style: z.string().default('default'),
  rsc: z.boolean().default(false),
  tsx: z.boolean().default(true),
  tailwind: z.object({
    config: z.string(),
    css: z.string(),
    baseColor: z.string().default('slate'),
    cssVariables: z.boolean().default(true),
    prefix: z.string().default(''),
  }),
  aliases: z.object({
    components: z.string().default('@/components'),
    utils: z.string().default('@/lib/utils'),
    ui: z.string().default('@/components/ui'),
    charts: z.string().default('@/components/charts'),
    hooks: z.string().default('@/hooks'),
    types: z.string().default('@/types'),
    themes: z.string().default('@/themes'),
  }),
  registry: z.object({
    url: z.string().default('https://mariocharts.com/registry'),
    version: z.string().default('latest'),
  }).optional(),
});

export type Config = z.infer<typeof configSchema>;

// Registry de componentes
export const registryItemSchema = z.object({
  name: z.string(),
  type: z.enum(['chart', 'ui', 'layout', 'filter', 'primitive']),
  category: z.string(),
  subcategory: z.string().optional(),
  description: z.string(),
  dependencies: z.array(z.string()).default([]),
  devDependencies: z.array(z.string()).default([]),
  registryDependencies: z.array(z.string()).default([]),
  peerDependencies: z.array(z.string()).default([]),
  files: z.array(z.object({
    name: z.string(),
    content: z.string(),
  })),
  meta: z.object({
    importName: z.string().optional(),
    exportName: z.string().optional(),
    displayName: z.string().optional(),
  }).optional(),
});

export type RegistryItem = z.infer<typeof registryItemSchema>;

// Resposta da API do registry
export const registryIndexSchema = z.array(registryItemSchema);
export type RegistryIndex = z.infer<typeof registryIndexSchema>;

// Comandos CLI
export interface CLIOptions {
  cwd?: string;
  silent?: boolean;
  skipConfirm?: boolean;
}

export interface InitOptions extends CLIOptions {
  components?: string[];
  yes?: boolean;
  defaults?: boolean;
}

export interface AddOptions extends CLIOptions {
  overwrite?: boolean;
  path?: string;
  all?: boolean;
}

export interface UpdateOptions extends CLIOptions {
  all?: boolean;
}

// Estados do processo
export type ProcessState = 'idle' | 'loading' | 'success' | 'error';

// Errors
export class MarioChartsError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'MarioChartsError';
  }
}