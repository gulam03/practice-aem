/* eslint-disable @stencil/strict-boolean-conditions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/**
 * This is a legacy config from Helix Web Components version 1.
 * @todo update linting on this file.
 */
// import { version } from './helix-version';
// import { ScrollLockManager, getScrollLockManager } from '../controllers/scroll-lock-manager';
export interface HelixConfiguration {
  iconsFolder?: string;
}

/**
 * Initializes configuration options on the window.
 *
 * @param config Configuration to set on Helix
 */
export function initHelix(config: HelixConfiguration = {}, context?: any) {
  const baseConfig = {};

  const ctx: any = context || window;

  // const scrollLockManager: ScrollLockManager = getScrollLockManager();

  ctx.Helix = { ...baseConfig, ...config }; // version, scrollLockManager
}

/**
 * Retrieve an initialised HelixConfig object.
 *
 * This handles the most common use case where you just need
 * the object for querying and are not trying to create a
 * new instance with defaults.
 */
export function getHelixConfig(context?: any) {
  const ctx: any = context || window;
  const helixConfig = HelixConfig.singleton(ctx);

  // Since version is added as part of init we use it as a test.
  if (!ctx.Helix || !ctx.Helix.version) {
    initHelix({}, ctx);
  }

  return helixConfig;
}

/**
 * Helper class to help access the global window config.
 *
 * "Why don't you just store the config as a local variable inside of the
 * singleton?", you might be asking.
 *
 * Two reasons: First, I wanted the config to be accessible even if you're
 * not benefiting from the compiled config object (namely it'd be difficult
 * to get at the HelixConfig object in a non-TS context).
 *
 * Second, it follows the pattern of Ionic, which binds to a given context and just sticks
 * there.
 *
 * So, the value on the window is the canonical value, you can change it and anything
 * using the singleton should still be able to see it.
 */
export class HelixConfig {
  private static instance: HelixConfig;

  private configPath = '/.well-known/public_data.json';
  private configLoader: Promise<any> = null;

  /**
   * Singleton method. Passing the ctx will set the context
   * for all subsequent calls on a page / application.
   *
   * @param ctx Context on which the config is bound.
   * This is usually the window object.
   */
  public static singleton(ctx: any = window, forceReload = false) {
    if (!HelixConfig.instance || forceReload) {
      HelixConfig.instance = new HelixConfig(ctx);
    }

    return HelixConfig.instance;
  }

  constructor(private ctx: any = window) {
    if (!ctx.Helix) {
      ctx.Helix = {};
    }
  }

  /**
   * Fetches a value from the config object.
   *
   * This method is not aware of any configuration loading, so
   * values needing to be loaded from the remote configuration
   * file will only be available after that process has completed.
   * Until then they would return the default.
   */
  public fetch(name: string, defaultValue: any) {
    if (!this.ctx || !this.ctx.Helix) {
      return defaultValue;
    }

    let context = this.ctx.Helix;

    const nameParts = name.split('.');
    const finalPart = nameParts.pop();

    for (const part of nameParts) {
      try {
        if (typeof context[part] !== 'undefined') {
          context = context[part];
        } else {
          return defaultValue;
        }
      } catch (e) {
        return defaultValue;
      }
    }

    return typeof context[finalPart] !== 'undefined' ? context[finalPart] : defaultValue;
  }

  /**
   * Fetches a value from the config object.
   *
   * This method is aware of the configuration loading process
   * and will only perform the lookup after the data has been
   * fully loaded.
   */
  public async get(name: string, defaultValue?: any) {
    const getValue = () => this.fetch(name, defaultValue);

    return this.loadConfig().then(getValue, getValue);
  }

  /**
   * Sets a value in the config object.
   *
   * This method is aware of the configuration loading process
   * and will only perform the update after the data has been
   * fully loaded. This ensures it does not get overwritten.
   */
  public async set(name: string, value: any): Promise<HelixConfig> {
    const putValue = () => this.put(name, value);

    return this.loadConfig().then(putValue, putValue);
  }

  /**
   * Loads the configuration from a remote source.
   *
   * The loader promise is returned since once it has resolved
   * the first time it will be resolved for subsequent uses.
   * This means we do not need to actually store the state within
   * this code and can rely on the promise to handle that for us.
   */
  protected async loadConfig() {
    if (!this.ctx || !this.ctx.Helix) {
      Promise.reject(new Error('No Helix context is available'));
    }

    if (this.configLoader) {
      return this.configLoader;
    }

    this.configLoader = fetch(this.configPath)
      .then(response => response.json())
      .then(data => {
        // Now write the data into the local store.
        Object.assign(this.ctx.Helix, data);
      })
      .catch(() => {
        /* Do nothing */
      });

    return this.configLoader;
  }

  /**
   * Sets a value in the config singleton.
   *
   * This method is not aware of any configuration loading, so
   * if the remote configuration file has the same entries
   * then they will be overwritten if that completes after this is called.
   */
  public put(name: string, value: any): HelixConfig {
    if (!this.ctx || !this.ctx.Helix) {
      throw new Error('HelixConfig not properly initialized. Unable to set value.');
    }

    let context = this.ctx.Helix;

    const nameParts = name.split('.');
    const finalPart = nameParts.pop();

    for (const part of nameParts) {
      if (typeof context[part] === 'undefined') {
        context[part] = {};
      }

      context = context[part];
    }

    context[finalPart] = value;

    return this;
  }
}
