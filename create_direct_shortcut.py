import os
import subprocess
import ctypes
from ctypes import wintypes

def create_direct_edge_app_shortcut():
    # Find Edge Path
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if not os.path.exists(edge_path):
        edge_path = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    
    cmd_icon_path = os.path.join(os.environ.get("SystemRoot", "C:\\Windows"), "System32", "cmd.exe")

    # Get Desktop directories
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

    current_dir = os.path.abspath(os.path.dirname(__file__))

    # Make shortcut via COM in python with pywin32 or vbs
    vbs_maker = os.path.join(current_dir, "_make_edge_shortcut.vbs")
    
    for d in set(target_desktops):
        if not os.path.exists(d):
            continue
        shortcut_file = os.path.join(d, "Command Prompt - CyberType.lnk")
        old_shortcut = os.path.join(d, "CyberType CMD.lnk")

        for old in [old_shortcut, shortcut_file]:
            if os.path.exists(old):
                try:
                    os.remove(old)
                except Exception:
                    pass

        maker_script = f'''Set WshShell = CreateObject("WScript.Shell")
Set shortcut = WshShell.CreateShortcut("{shortcut_file}")
shortcut.TargetPath = "{edge_path}"
shortcut.Arguments = "--app=""http://localhost:3000"" --window-size=1280,820"
shortcut.WorkingDirectory = "{current_dir}"
shortcut.IconLocation = "{cmd_icon_path},0"
shortcut.Description = "Command Prompt - CyberType Terminal Application"
shortcut.Save()
'''
        with open(vbs_maker, "w", encoding="utf-16le") as f:
            f.write("\ufeff" + maker_script)

        subprocess.run(["cscript", "//nologo", vbs_maker], capture_output=True)
        try:
            os.remove(vbs_maker)
        except Exception:
            pass

        print(f"Created standalone app shortcut at: {shortcut_file}")

if __name__ == "__main__":
    create_direct_edge_app_shortcut()
