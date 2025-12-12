import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs-extra';
// Removed unused 'z' import
import { RegistryIndex, RegistryItem, registryIndexSchema, registryItemSchema } from './types.js';
import { Logger } from './logger.js';
import { FALLBACK_COMPONENTS, FALLBACK_REGISTRY_INDEX } from './fallback-generated.js';

const logger = new Logger();

export const DEFAULT_REGISTRY_URL = 'https://mariocharts.com/registry';

// Fallback registry data embedded in the CLI
// Generated at build time by scripts/generate-fallback-registry.js

// Find registry path by looking for it in common locations
function findLocalRegistryPath(): string | null {
  const possiblePaths = [
    path.resolve(__dirname, '../../../registry'),
    path.resolve(process.cwd(), 'packages/registry'),
    path.resolve(process.cwd(), '../registry'),
    path.resolve(process.cwd(), 'registry'),
  ];

  for (const registryPath of possiblePaths) {
    if (fs.existsSync(path.join(registryPath, 'index.json'))) {
      return registryPath;
    }
  }
  
  return null;
}

export class RegistryClient {
  private baseUrl: string;
  private useLocal: boolean;
  private localPath: string;

  constructor(baseUrl = DEFAULT_REGISTRY_URL, useLocal = false) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    
    const localPath = findLocalRegistryPath();
    this.useLocal = useLocal || (localPath !== null);
    this.localPath = localPath || '';
    
    if (this.useLocal && localPath) {
      logger.debug(`Using local registry at: ${localPath}`);
    }
  }

  async getIndex(): Promise<RegistryIndex> {
    try {
      // Try local first if available
      if (this.useLocal) {
        const indexPath = path.join(this.localPath, 'index.json');
        logger.debug(`Fetching registry index from local file: ${indexPath}`);
        
        if (await fs.pathExists(indexPath)) {
          const data = await fs.readJSON(indexPath);
          return registryIndexSchema.parse(data);
        }
      }

      // Try remote
      const url = `${this.baseUrl}/index.json`;
      logger.debug(`Fetching registry index from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        // If remote fails, use fallback
        logger.debug('Remote registry not available, using embedded components');
        return registryIndexSchema.parse(FALLBACK_REGISTRY_INDEX);
      }

      const data = await response.json();
      return registryIndexSchema.parse(data);
    } catch (error) {
      // Always fallback to embedded components
      logger.debug('Using embedded components as fallback');
      return registryIndexSchema.parse(FALLBACK_REGISTRY_INDEX);
    }
  }

  async getComponent(name: string): Promise<RegistryItem> {
    try {
      // Try local first if available
      if (this.useLocal) {
        const componentPath = path.join(this.localPath, 'components', `${name}.json`);
        logger.debug(`Fetching component from local file: ${componentPath}`);
        
        if (await fs.pathExists(componentPath)) {
          const data = await fs.readJSON(componentPath);
          return registryItemSchema.parse(data);
        }
      }

      // Try remote
      const url = `${this.baseUrl}/components/${name}.json`;
      logger.debug(`Fetching component from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        // If remote fails, check fallback
        if (FALLBACK_COMPONENTS[name]) {
          logger.debug(`Using embedded component: ${name}`);
          return registryItemSchema.parse(FALLBACK_COMPONENTS[name]);
        }
        throw new Error(`Component "${name}" not found in registry`);
      }

      const data = await response.json();
      return registryItemSchema.parse(data);
    } catch (error) {
      // Try fallback before failing
      if (FALLBACK_COMPONENTS[name]) {
        logger.debug(`Using embedded component as fallback: ${name}`);
        return registryItemSchema.parse(FALLBACK_COMPONENTS[name]);
      }
      
      logger.error(`Failed to fetch component "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async getComponentsByType(type: RegistryItem['type']): Promise<RegistryIndex> {
    const index = await this.getIndex();
    return index.filter(item => item.type === type);
  }

  async getAllComponents(): Promise<RegistryIndex> {
    return await this.getIndex();
  }

  async searchComponents(query: string): Promise<RegistryIndex> {
    const index = await this.getIndex();
    const lowercaseQuery = query.toLowerCase();
    
    return index.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.description.toLowerCase().includes(lowercaseQuery) ||
      item.category.toLowerCase().includes(lowercaseQuery) ||
      (item.subcategory && item.subcategory.toLowerCase().includes(lowercaseQuery))
    );
  }

  async resolveDependencies(components: string[]): Promise<{
    resolved: RegistryItem[];
    npmDependencies: string[];
    registryDependencies: string[];
  }> {
    const resolved: RegistryItem[] = [];
    const npmDependencies = new Set<string>();
    const registryDependencies = new Set<string>();
    const processed = new Set<string>();

    const processComponent = async (name: string): Promise<void> => {
      if (processed.has(name)) return;
      processed.add(name);

      try {
        const component = await this.getComponent(name);
        resolved.push(component);

        // Adicionar dependências npm
        component.dependencies.forEach(dep => npmDependencies.add(dep));
        component.devDependencies.forEach(dep => npmDependencies.add(dep));
        component.peerDependencies.forEach(dep => npmDependencies.add(dep));

        // Processar dependências de registry recursivamente
        for (const dep of component.registryDependencies) {
          registryDependencies.add(dep);
          await processComponent(dep);
        }
      } catch (error) {
        logger.warn(`Could not resolve component dependency: ${name}`);
      }
    };

    // Processar todos os componentes solicitados
    for (const component of components) {
      await processComponent(component);
    }

    return {
      resolved,
      npmDependencies: Array.from(npmDependencies),
      registryDependencies: Array.from(registryDependencies),
    };
  }
}

// Instância padrão do cliente
export const defaultRegistry = new RegistryClient();
