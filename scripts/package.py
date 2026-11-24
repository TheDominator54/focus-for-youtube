"""Build a reproducible Web Store upload using the Python standard library."""
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / "manifest.json").read_text())
files = {"manifest.json", "NOTICE.md", manifest["background"]["service_worker"]}
files.update(manifest["icons"].values())
for script in manifest["content_scripts"]:
    files.update(script.get("css", []))
    files.update(script.get("js", []))

output = root / "dist" / f"focus-for-youtube-{manifest['version']}.zip"
output.parent.mkdir(exist_ok=True)
with ZipFile(output, "w") as archive:
    for name in sorted(files):
        entry = ZipInfo(name)
        entry.external_attr = 0o100644 << 16
        archive.writestr(entry, (root / name).read_bytes(), compress_type=ZIP_DEFLATED)
print(output)
