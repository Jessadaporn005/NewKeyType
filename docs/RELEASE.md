# CyberDeck Windows release policy

## Current channel

- Windows x64 only.
- Paper-only trading. Demo and Live broker execution are disabled. The packaged XM resources are limited to a reviewed read-only observer and a non-executing Demo preflight checker.
- Releases are manual and unsigned. There is no auto-update channel yet.
- `release-manifest.json` records SHA-256 hashes and explicitly declares that code signing and auto-update are disabled.
- User data remains outside the installation directory in Electron's `userData` directory and is not deleted by the NSIS uninstaller.

## Commands

```powershell
npm run test:checkpoint
npm run build:unpacked
npm run build:installer
npm run build:portable
```

`build:unpacked` is the fast compatibility check. Build the installer and portable artifact only after that check passes.

## Release gate

`npm run verify:release` fails when Demo/Live trading is enabled, simulated broker fallback is enabled, the retired live executor becomes operational, an unreviewed MT5 resource enters the artifact, a reviewed resource hash changes, runtime files are missing, or the reviewed tool versions drift.

Before public distribution, add Authenticode code signing and a verified release provider. Do not label the developer launcher or Service Worker as an auto-updater.
