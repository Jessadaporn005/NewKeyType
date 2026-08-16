$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$CurrentDir = Get-Location
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\CyberDeck LIVE (Auto-Update).lnk")
$Shortcut.TargetPath = "$CurrentDir\CyberDeck-Live-Updater.bat"
$Shortcut.WorkingDirectory = "$CurrentDir"
$Shortcut.IconLocation = "$CurrentDir\icon.ico"
$Shortcut.WindowStyle = 1
$Shortcut.Save()
