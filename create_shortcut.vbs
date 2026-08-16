Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = "C:\Users\asus\OneDrive\เดสก์ท็อป\CyberDeck OS.lnk"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "C:\Users\asus\OneDrive\เอกสาร\NewKeyType\CyberDeck_Final\CyberDeck-win32-x64\CyberDeck.exe"
oLink.WorkingDirectory = "C:\Users\asus\OneDrive\เอกสาร\NewKeyType\CyberDeck_Final\CyberDeck-win32-x64"
oLink.IconLocation = "C:\Users\asus\OneDrive\เอกสาร\NewKeyType\icon.ico"
oLink.Save
