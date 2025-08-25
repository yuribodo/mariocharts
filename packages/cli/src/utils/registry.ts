import fetch from 'node-fetch';
import { z } from 'zod';
import { RegistryIndex, RegistryItem, registryIndexSchema, registryItemSchema } from './types.js';
import { Logger } from './logger.js';

const logger = new Logger();

export const DEFAULT_REGISTRY_URL = 'https://mariocharts.com/registry';

export class RegistryClient {
  private baseUrl: string;
  private version: string;

  constructor(baseUrl = DEFAULT_REGISTRY_URL, version = 'latest') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.version = version;
  }

  async getIndex(): Promise<RegistryIndex> {
    try {
      const url = `${this.baseUrl}/index.json`;
      logger.debug(`Fetching registry index from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch registry: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return registryIndexSchema.parse(data);
    } catch (error) {
      logger.error(`Failed to fetch registry index: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async getComponent(name: string): Promise<RegistryItem> {
    try {
      const url = `${this.baseUrl}/components/${name}.json`;
      logger.debug(`Fetching component from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Component "${name}" not found in registry`);
        }
        throw new Error(`Failed to fetch component: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return registryItemSchema.parse(data);
    } catch (error) {
      logger.error(`Failed to fetch component "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async getComponentsByType(type: RegistryItem['type']): Promise<RegistryItem[]> {
    const index = await this.getIndex();
    return index.filter(item => item.type === type);
  }

  async getAllComponents(): Promise<RegistryItem[]> {
    return await this.getIndex();
  }

  async searchComponents(query: string): Promise<RegistryItem[]> {
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