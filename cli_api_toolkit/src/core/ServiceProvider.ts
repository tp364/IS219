import { IServiceProvider } from '../types/index';

/**
 * Service Provider / IoC Container
 * Implements Dependency Inversion Principle
 * Manages service registration and resolution
 */
export class ServiceProvider implements IServiceProvider {
  private services: Map<string, () => unknown> = new Map();

  /**
   * Register a service factory
   */
  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory as () => unknown);
  }

  /**
   * Get a service instance
   */
  get<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service not registered: ${key}`);
    }
    return factory() as T;
  }

  /**
   * Check if service is registered
   */
  has(key: string): boolean {
    return this.services.has(key);
  }

  /**
   * Clear all services
   */
  clear(): void {
    this.services.clear();
  }
}

/**
 * Global service provider instance
 */
export const globalServiceProvider = new ServiceProvider();
