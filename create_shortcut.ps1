$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("C:\Users\asus\OneDrive\เดสก์ท็อป\CyberDeck OS.lnk")
$Shortcut.TargetPath = "C:\Users\asus\OneDrive\เอกสาร\NewKeyType\CyberDeck_Final\CyberDeck-win32-x64\CyberDeck.exe"
$Shortcut.WorkingDirectory = "C:\Users\asus\OneDrive\เอกสาร\NewKeyType\CyberDeck_Final\CyberDeck-win32-x64"
$Shortcut.IconLocation = "C:\Users\asus\OneDrive\เอกสาร\NewKeyType\icon.ico"
$Shortcut.WindowStyle = 1
$Shortcut.Save()
