export const MT5_DEMO_READINESS_SCHEMA = 'MT5_DEMO_READINESS_V2';
export const MT5_DEMO_READINESS_POLICY = 'MANAGED_REAL_TERMINAL_AUTHENTICATED_DEMO_OBSERVER_V2';

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

export function assessMT5DemoReadiness(raw = {}) {
  const checks = Object.freeze({
    terminalInstalled: raw.terminalInstalled === true,
    terminalRunning: raw.terminalRunning === true,
    pythonBridgeDependencyAvailable: raw.pythonBridgeDependencyAvailable === true,
    bridgeScriptPresent: raw.bridgeScriptPresent === true,
    scriptIntegrityVerified: raw.scriptIntegrityVerified === true,
    observerEnabled: raw.observerEnabled === true,
    observerProcessRunning: raw.observerProcessRunning === true,
    gatewayEnabled: raw.gatewayEnabled === true,
    accessTokenConfigured: raw.accessTokenConfigured === true,
    demoAccountObserved: raw.demoAccountObserved === true,
    telemetryCertified: raw.telemetryCertified === true
  });
  let status = 'READY_FOR_DEMO_ORDER_CERTIFICATION';
  if (!checks.terminalInstalled) status = 'MT5_XDEMO_NOT_INSTALLED';
  else if (!checks.pythonBridgeDependencyAvailable || !checks.bridgeScriptPresent || !checks.scriptIntegrityVerified) status = 'MT5_PYTHON_BRIDGE_NOT_READY';
  else if (!checks.observerEnabled) status = 'MT5_DEMO_OBSERVER_DISABLED';
  else if (!checks.terminalRunning) status = 'MT5_TERMINAL_NOT_RUNNING';
  else if (!checks.observerProcessRunning) status = 'MT5_DEMO_OBSERVER_STARTING';
  else if (!checks.gatewayEnabled || !checks.accessTokenConfigured) status = 'AUTHENTICATED_DEMO_GATEWAY_NOT_CONFIGURED';
  else if (!checks.demoAccountObserved) status = 'VERIFIED_DEMO_LOGIN_NOT_OBSERVED';
  else if (!checks.telemetryCertified) status = 'CONTINUOUS_TELEMETRY_CERTIFICATION_REQUIRED';
  const ready = Object.values(checks).every(Boolean);
  return deepFreeze({
    schemaVersion: MT5_DEMO_READINESS_SCHEMA,
    policy: MT5_DEMO_READINESS_POLICY,
    status,
    readyForDemoOrderCertification: ready,
    checks,
    telemetry: {
      packetCount: Number.isSafeInteger(Number(raw.telemetry?.packetCount)) ? Math.max(0, Number(raw.telemetry.packetCount)) : 0,
      validatedPacketCount: Number.isSafeInteger(Number(raw.telemetry?.validatedPacketCount)) ? Math.max(0, Number(raw.telemetry.validatedPacketCount)) : 0,
      durationMs: Number.isFinite(Number(raw.telemetry?.durationMs)) ? Math.max(0, Number(raw.telemetry.durationMs)) : 0,
      maximumObservedGapMs: Number.isFinite(Number(raw.telemetry?.maximumObservedGapMs)) ? Math.max(0, Number(raw.telemetry.maximumObservedGapMs)) : 0,
      reasons: Array.isArray(raw.telemetry?.reasons)
        ? raw.telemetry.reasons.slice(0, 5).map(reason => String(reason).slice(0, 160))
        : []
    },
    observerError: typeof raw.observerError === 'string' ? raw.observerError.slice(0, 160) : null,
    account: checks.demoAccountObserved && raw.account?.tradeMode === 'DEMO'
      ? {
          server: typeof raw.account.server === 'string' ? raw.account.server.slice(0, 120) : null,
          loginSuffix: typeof raw.account.loginSuffix === 'string' ? raw.account.loginSuffix.slice(-4) : null,
          tradeMode: 'DEMO'
        }
      : null,
    authority: {
      observerOnly: true,
      decisionInfluence: false,
      executionInfluence: false,
      liveEligible: false
    }
  });
}
