$desktopPath = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath "CyberType CMD.lnk"
$targetScript = "c:\Users\asus\OneDrive\เอกสาร\NewKeyType\Start-CyberType.bat"
$workingDir = "c:\Users\asus\OneDrive\เอกสาร\NewKeyType"

$wscript = New-Object -ComObject WScript.Shell
$shortcut = $wscript.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetScript
$shortcut.WorkingDirectory = $workingDir
$shortcut.WindowStyle = 7 # Minimized launch
$shortcut.IconLocation = "$env:SystemRoot\System32\cmd.exe,0"
$shortcut.Description = "CyberType - Windows 11 Command Prompt Touch Typing & Hacker Terminal"
$shortcut.Save()

Write-Host "Desktop shortcut created successfully at: $shortcutPath"
