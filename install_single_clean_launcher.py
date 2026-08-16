import os
import subprocess
import ctypes
from ctypes import wintypes

def install_single_clean_launcher():
    current_dir = os.path.abspath(os.path.dirname(__file__))
    electron_exe = os.path.join(current_dir, "node_modules", "electron", "dist", "electron.exe")
    icon_path = os.path.join(current_dir, "icon.ico")

    if not os.path.exists(electron_exe):
        print(f"Error: electron.exe not found at {electron_exe}")
        return

    # 1. Gather all potential desktop paths
    CSIDL_DESKTOP = 0
    SHGFP_TYPE_CURRENT = 0
    buf = ctypes.create_unicode_buffer(wintypes.MAX_PATH)
    ctypes.windll.shell32.SHGetFolderPathW(None, CSIDL_DESKTOP, None, SHGFP_TYPE_CURRENT, buf)
    standard_desktop = buf.value

    target_desktops = [
        standard_desktop,
        os.path.expanduser(r"~\Desktop"),
        os.path.expanduser(r"~\OneDrive\Desktop"),
        os.path.expanduser(r"~\OneDrive\เดสก์ท็อป")
    ]

    unique_desktops = list(set([os.path.abspath(d) for d in target_desktops if os.path.exists(d)]))

    # 2. Cleanup all old redundant shortcut files from Desktops
    redundant_names = [
        "CyberDeck LIVE (Auto-Update).lnk",
        "CyberDeck.bat",
        "Command Prompt - CyberType.lnk",
        "Run-CyberType.vbs",
        "CyberDeck OS.lnk",
        "CyberDeck.lnk"
    ]

    for d in unique_desktops:
        for name in redundant_names:
            file_path = os.path.join(d, name)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    print(f"Removed old shortcut: {file_path}")
                except Exception as e:
                    pass

    # 3. Create the single, official, silent, live-updating CyberDeck shortcut
    vbs_maker = os.path.join(current_dir, "_temp_shortcut_maker.vbs")

    for d in unique_desktops:
        final_shortcut_path = os.path.join(d, "CyberDeck OS.lnk")
        maker_content = f'''Set WshShell = CreateObject("WScript.Shell")
Set shortcut = WshShell.CreateShortcut("{final_shortcut_path}")
shortcut.TargetPath = "{electron_exe}"
shortcut.Arguments = "."
shortcut.WorkingDirectory = "{current_dir}"
shortcut.IconLocation = "{icon_path},0"
shortcut.Description = "CyberDeck OS - Cyberpunk Hacker Terminal & Touch Typing System"
shortcut.Save()
'''
        with open(vbs_maker, "w", encoding="utf-16le") as f:
            f.write("\ufeff" + maker_content)

        subprocess.run(["cscript", "//nologo", vbs_maker], capture_output=True)
        print(f"[SUCCESS] Created Single Official Shortcut at: {final_shortcut_path}")

    if os.path.exists(vbs_maker):
        try:
            os.remove(vbs_maker)
        except Exception:
            pass

    print("[COMPLETED] Single Clean Native Launcher installed successfully.")

if __name__ == "__main__":
    install_single_clean_launcher()
