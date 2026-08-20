/**
 * Runtime capability gates.
 *
 * Financial execution stays disabled until the broker gateway, reconciliation,
 * and independent risk controls have passed the Demo certification phase.
 */
export const RUNTIME_CAPABILITIES = Object.freeze({
  demoTradingEnabled: false,
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
