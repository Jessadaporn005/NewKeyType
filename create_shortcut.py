import os
import sys
import subprocess

def create_desktop_shortcut():
    # 1. Get current absolute directory
    current_dir = os.path.abspath(os.path.dirname(__file__))
    
    # 2. Get user Desktop path using standard Windows Shell API
    import ctypes
    from ctypes import wintypes
    
    CSIDL_DESKTOP = 0
    SHGFP_TYPE_CURRENT = 0
    buf = ctypes.create_unicode_buffer(wintypes.MAX_PATH)
    ctypes.windll.shell32.SHGetFolderPathW(None, CSIDL_DESKTOP, None, SHGFP_TYPE_CURRENT, buf)
    desktop_dir = buf.value

    # If OneDrive desktop exists, check it
    onedrive_desktop = os.path.expanduser("~/OneDrive/Desktop")
    onedrive_thai_desktop = os.path.expanduser(r"~\OneDrive\เดสก์ท็อป")
    
    target_desktops = [desktop_dir]
    if os.path.exists(onedrive_desktop):
        target_desktops.append(onedrive_desktop)
    if os.path.exists(onedrive_thai_desktop):
        target_desktops.append(onedrive_thai_desktop)

    # 3. Create VBS launcher in current directory
    vbs_path = os.path.join(current_dir, "Launch-CyberType.vbs")
    vbs_content = f'''Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "{current_dir}"
WshShell.Run "cmd.exe /c start /b python -m http.server 3000", 0, False
WScript.Sleep 500
On Error Resume Next
WshShell.Run "msedge.exe --app=http://localhost:3000 --window-size=1280,820", 1, False
If Err.Number <> 0 Then
    WshShell.Run "cmd.exe /c start http://localhost:3000", 0, False
End If
'''
    with open(vbs_path, "w", encoding="utf-8") as f:
        f.write(vbs_content)

    # 4. Create Desktop Shortcut pointing to wscript.exe
    wscript_exe = os.path.join(os.environ.get("SystemRoot", "C:\\Windows"), "System32", "wscript.exe")
    cmd_exe = os.path.join(os.environ.get("SystemRoot", "C:\\Windows"), "System32", "cmd.exe")

    # Generate helper vbs to create shortcuts cleanly
    for d in set(target_desktops):
        if not os.path.exists(d):
            continue
        shortcut_file = os.path.join(d, "CyberType CMD.lnk")
        
        # Remove old broken shortcut if exists
        if os.path.exists(shortcut_file):
            try:
                os.remove(shortcut_file)
            except Exception:
                pass

        vbs_maker = os.path.join(current_dir, "_make_shortcut.vbs")
        maker_script = f'''Set WshShell = CreateObject("WScript.Shell")
Set shortcut = WshShell.CreateShortcut("{shortcut_file}")
shortcut.TargetPath = "{wscript_exe}"
shortcut.Arguments = """{vbs_path}"""
shortcut.WorkingDirectory = "{current_dir}"
shortcut.IconLocation = "{cmd_exe},0"
shortcut.Description = "Command Prompt - CyberType Terminal"
shortcut.WindowStyle = 7
shortcut.Save()
'''
        with open(vbs_maker, "w", encoding="utf-8") as f:
            f.write(maker_script)

        subprocess.run(["cscript", "//nologo", vbs_maker], capture_output=True)
        try:
            os.remove(vbs_maker)
        except Exception:
            pass

        print(f"Created shortcut at: {shortcut_file}")

if __name__ == "__main__":
    create_desktop_shortcut()
