import os
import subprocess
import ctypes
from ctypes import wintypes

def install_official_exe_shortcut():
    current_dir = os.path.abspath(os.path.dirname(__file__))
    exe_path = os.path.join(current_dir, "CyberDeck-win32-x64", "CyberDeck.exe")
    exe_dir = os.path.join(current_dir, "CyberDeck-win32-x64")

    if not os.path.exists(exe_path):
        print(f"Error: {exe_path} not found!")
        return

    # Desktop paths
    CSIDL_DESKTOP = 0
    SHGFP_TYPE_CURRENT = 0
    buf = ctypes.create_unicode_buffer(wintypes.MAX_PATH)
    ctypes.windll.shell32.SHGetFolderPathW(None, CSIDL_DESKTOP, None, SHGFP_TYPE_CURRENT, buf)
    desktop_dir = buf.value

    onedrive_desktop = os.path.expanduser("~/OneDrive/Desktop")
    onedrive_thai_desktop = os.path.expanduser(r"~\OneDrive\เดสก์ท็อป")

    target_desktops = [desktop_dir]
    if os.path.exists(onedrive_desktop):
        target_desktops.append(onedrive_desktop)
    if os.path.exists(onedrive_thai_desktop):
        target_desktops.append(onedrive_thai_desktop)

    cmd_icon_path = os.path.join(os.environ.get("SystemRoot", "C:\\Windows"), "System32", "cmd.exe")

    # Clean up old broken files in current directory
    for old_file in ["Run-CyberType.vbs", "Launch-CyberType.vbs", "Start-CyberType.bat", "_make_edge_shortcut.vbs", "_make_shortcut.vbs", "_make_app_shortcut.vbs"]:
        p = os.path.join(current_dir, old_file)
        if os.path.exists(p):
            try:
                os.remove(p)
            except Exception:
                pass

    # Create official Desktop shortcut pointing directly to CyberType.exe
    for d in set(target_desktops):
        if not os.path.exists(d):
            continue

        # Remove all old shortcuts
        for old_lnk in ["Command Prompt - CyberType.lnk", "CyberType CMD.lnk", "CyberType.lnk"]:
            lnk_p = os.path.join(d, old_lnk)
            if os.path.exists(lnk_p):
                try:
                    os.remove(lnk_p)
                except Exception:
                    pass

        shortcut_file = os.path.join(d, "CyberDeck.lnk")
        vbs_maker = os.path.join(current_dir, "_make_official_shortcut.vbs")

        maker_script = f'''Set WshShell = CreateObject("WScript.Shell")
Set shortcut = WshShell.CreateShortcut("{shortcut_file}")
shortcut.TargetPath = "{exe_path}"
shortcut.WorkingDirectory = "{exe_dir}"
shortcut.IconLocation = "{exe_path},0"
shortcut.Description = "CyberDeck - Quantum Touch Typing & Hacker Terminal Native Application"
shortcut.Save()
'''
        with open(vbs_maker, "w", encoding="utf-16le") as f:
            f.write("\ufeff" + maker_script)

        subprocess.run(["cscript", "//nologo", vbs_maker], capture_output=True)
        try:
            os.remove(vbs_maker)
        except Exception:
            pass

        print(f"Official Desktop Shortcut created at: {shortcut_file}")

if __name__ == "__main__":
    install_official_exe_shortcut()
