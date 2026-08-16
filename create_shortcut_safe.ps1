$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$CurrentDir = Get-Location
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\CyberDeck OS.lnk")
$Shortcut.TargetPath = "$CurrentDir\CyberDeck_Final\CyberDeck-win32-x64\CyberDeck.exe"
$Shortcut.WorkingDirectory = "$CurrentDir\CyberDeck_Final\CyberDeck-win32-x64"
$Shortcut.IconLocation = "$CurrentDir\icon.ico"
$Shortcut.WindowStyle = 1
$Shortcut.Save()
