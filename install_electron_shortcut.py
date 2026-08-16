import os
import subprocess
import ctypes
from ctypes import wintypes

def install_native_electron_shortcut():
    current_dir = os.path.abspath(os.path.dirname(__file__))
    
    # 1. Create a quiet VBS runner in current dir
    vbs_runner = os.path.join(current_dir, "Run-CyberType.vbs")
    vbs_content = f'''Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "{current_dir}"
WshShell.Run "cmd.exe /c npx electron .", 0, False
'''
    with open(vbs_runner, "w", encoding="utf-8") as f:
        f.write(vbs_content)

    # 2. Get Desktop folders
    CSIDL_DESKTOP = 0
    SHGFP_TYPE_CURRENT = 0
    buf = ctypes.create_unicode_buffer(wintypes.MAX_PATH)
    ctypes.windll.shell32.SHGetFolderPathW(None, CSIDL_DESKTOP, None, SHGFP_TYPE_CURRENT, buf)
    desktop_dir = buf.value

    target_desktops = [desktop_dir]
    onedrive_desktop = os.path.expanduser("~/OneDrive/Desktop")
    onedrive_thai_desktop = os.path.expanduser(r"~\OneDrive\เดสก์ท็อป")
    if os.path.exists(onedrive_desktop):
        target_desktops.append(onedrive_desktop)
    if os.path.exists(onedrive_thai_desktop):
        target_desktops.append(onedrive_thai_desktop)

    wscript_exe = os.path.join(os.environ.get("SystemRoot", "C:\\Windows"), "System32", "wscript.exe")
    cmd_icon_path = os.path.join(os.environ.get("SystemRoot", "C:\\Windows"), "System32", "cmd.exe")

    for d in set(target_desktops):
        if not os.path.exists(d):
            continue
        shortcut_file = os.path.join(d, "Command Prompt - CyberType.lnk")
        
        # Remove old shortcut if exists
        if os.path.exists(shortcut_file):
            try:
                os.remove(shortcut_file)
            except Exception:
                pass

        vbs_maker = os.path.join(current_dir, "_make_app_shortcut.vbs")
        maker_script = f'''Set WshShell = CreateObject("WScript.Shell")
Set shortcut = WshShell.CreateShortcut("{shortcut_file}")
shortcut.TargetPath = "{wscript_exe}"
shortcut.Arguments = """{vbs_runner}"""
shortcut.WorkingDirectory = "{current_dir}"
shortcut.IconLocation = "{cmd_icon_path},0"
shortcut.Description = "CyberType - Windows 11 Native Touch Typing & Hacker Desktop Application"
shortcut.Save()
'''
        with open(vbs_maker, "w", encoding="utf-16le") as f:
            f.write("\ufeff" + maker_script)

        subprocess.run(["cscript", "//nologo", vbs_maker], capture_output=True)
        try:
            os.remove(vbs_maker)
        except Exception:
            pass

        print(f"Created Native Electron App Desktop Shortcut at: {shortcut_file}")

if __name__ == "__main__":
    install_native_electron_shortcut()
