export const MT5_DEMO_READINESS_SCHEMA = 'MT5_DEMO_READINESS_V1';
export const MT5_DEMO_READINESS_POLICY = 'REAL_TERMINAL_AUTHENTICATED_DEMO_OBSERVER_V1';

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
    gatewayEnabled: raw.gatewayEnabled === true,
    accessTokenConfigured: raw.accessTokenConfigured === true,
    demoAccountObserved: raw.demoAccountObserved === true,
    telemetryCertified: raw.telemetryCertified === true
  });
  let status = 'READY_FOR_DEMO_ORDER_CERTIFICATION';
  if (!checks.terminalInstalled) status = 'MT5_XDEMO_NOT_INSTALLED';
  else if (!checks.pythonBridgeDependencyAvailable || !checks.bridgeScriptPresent) status = 'MT5_PYTHON_BRIDGE_NOT_READY';
  else if (!checks.gatewayEnabled || !checks.accessTokenConfigured) status = 'AUTHENTICATED_DEMO_GATEWAY_NOT_CONFIGURED';
  else if (!checks.terminalRunning) status = 'MT5_TERMINAL_NOT_RUNNING';
  else if (!checks.demoAccountObserved) status = 'VERIFIED_DEMO_LOGIN_NOT_OBSERVED';
  else if (!checks.telemetryCertified) status = 'CONTINUOUS_TELEMETRY_CERTIFICATION_REQUIRED';
  const ready = Object.values(checks).every(Boolean);
  return deepFreeze({
    schemaVersion: MT5_DEMO_READINESS_SCHEMA,
    policy: MT5_DEMO_READINESS_POLICY,
    status,
    readyForDemoOrderCertification: ready,
    checks,
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
