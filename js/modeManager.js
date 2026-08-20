/**
 * Centralized lifecycle coordinator for workstation views.
 * A mode may own timers, animation frames, audio, media, or polling. Those
 * resources must be paused before another mode becomes active.
 */
export class ModeLifecycleManager {
  constructor({ onError } = {}) {
    this.activeMode = null;
    this.hooks = new Map();
    this.onError = typeof onError === 'function' ? onError : null;
  }

  register(mode, hooks = {}) {
    if (!mode) throw new Error('A mode name is required');
    this.hooks.set(mode, {
      enter: typeof hooks.enter === 'function' ? hooks.enter : null,
      exit: typeof hooks.exit === 'function' ? hooks.exit : null,
      destroy: typeof hooks.destroy === 'function' ? hooks.destroy : null
    });
    return this;
  }

  enter(mode, context = {}) {
    if (!mode) return false;
    if (this.activeMode === mode) return true;

    this.exitActive({ ...context, nextMode: mode });
    this.activeMode = mode;
    this.runHook(mode, 'enter', context);
    return true;
  }

  exit(mode = this.activeMode, context = {}) {
    if (!mode) return false;
    this.runHook(mode, 'exit', context);
    if (this.activeMode === mode) this.activeMode = null;
    return true;
  }

  exitActive(context = {}) {
    return this.exit(this.activeMode, context);
  }

  destroyAll(context = {}) {
    this.exitActive(context);
    for (const mode of this.hooks.keys()) {
      this.runHook(mode, 'destroy', context);
    }
    this.hooks.clear();
  }

  runHook(mode, hookName, context) {
    const hook = this.hooks.get(mode)?.[hookName];
    if (!hook) return;
    try {
      hook(context);
    } catch (error) {
      if (this.onError) this.onError({ mode, hook: hookName, error });
      else console.error(`[ModeLifecycle] ${mode}.${hookName} failed`, error);
    }
  }
}
