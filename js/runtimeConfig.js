/**
 * Runtime capability gates.
 *
 * Only the manually confirmed, one-shot 0.01-lot Demo canary route is enabled.
 * Autonomous and Live execution remain unavailable.
 */
export const RUNTIME_CAPABILITIES = Object.freeze({
  demoTradingEnabled: true,
  liveTradingEnabled: false,
  allowSimulatedBrokerFallback: false
});

export function resolveRuntimeCapabilities(overrides = {}) {
  const requested = overrides && typeof overrides === 'object' ? overrides : {};
  return Object.freeze({
    ...requested,
    // Financial capabilities cannot be enabled by renderer-provided overrides.
    demoTradingEnabled: RUNTIME_CAPABILITIES.demoTradingEnabled === true && requested.demoTradingEnabled === true,
    liveTradingEnabled: RUNTIME_CAPABILITIES.liveTradingEnabled === true && requested.liveTradingEnabled === true,
    allowSimulatedBrokerFallback: false
  });
}
