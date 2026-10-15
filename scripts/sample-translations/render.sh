#!/usr/bin/env bash
# Render the hand-translated sample documents to PDF for the landing page examples.
#
#   scripts/sample-translations/<sample>/<lang>.html
#     -> public/files/<sample>/<sample>_translated_<lang>.pdf
#
# After adding a language, also list it in SAMPLE_TRANSLATIONS (lib/sample-files.ts),
# otherwise the hero page reports it as unavailable.
#
# Usage: scripts/sample-translations/render.sh [sample/lang ...]   (default: all)
# Needs a headless Chrome/Chromium; override with CHROME=/path/to/chrome.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"
chrome="${CHROME:-$(command -v google-chrome || command -v chromium || command -v chromium-browser || true)}"
[ -n "$chrome" ] || { echo "No Chrome/Chromium found; set CHROME=/path/to/chrome" >&2; exit 1; }

if [ "$#" -gt 0 ]; then
  sources=("$@")
else
  sources=()
  for f in "$here"/*/*.html; do
    rel="${f#"$here"/}"
    sources+=("${rel%.html}")
  done
fi

for src in "${sources[@]}"; do
  sample="${src%%/*}"
  lang="${src#*/}"
  in="$here/$sample/$lang.html"
  out="$root/public/files/$sample/${sample}_translated_${lang}.pdf"
  [ -f "$in" ] || { echo "Missing source: $in" >&2; exit 1; }
  "$chrome" --headless=new --disable-gpu --no-sandbox --no-pdf-header-footer \
    --print-to-pdf="$out" "file://$in" >/dev/null 2>&1
  echo "rendered $out"
done
