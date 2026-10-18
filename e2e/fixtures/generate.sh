#!/usr/bin/env bash
# Regenerates the e2e document fixtures. Needs LibreOffice (soffice) and python3.
# - sample.docx: a heading, a paragraph and a table, converted from HTML by LibreOffice.
# - sample.pptx: a minimal OOXML presentation container (the compare view only needs to
#   recognise it as PPTX; it is never rendered).
set -euo pipefail
cd "$(dirname "$0")"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

cat > "$tmp/sample.html" <<'HTML'
<html><body>
<h1>Quarterly Operations Summary</h1>
<p>EdgenTranslate docx fixture: this paragraph should appear in the compare view.</p>
<table border="1"><tr><th>Region</th><th>Revenue</th></tr><tr><td>North</td><td>120</td></tr><tr><td>South</td><td>95</td></tr></table>
</body></html>
HTML
soffice --headless --convert-to 'docx:MS Word 2007 XML' --outdir "$tmp" "$tmp/sample.html" >/dev/null
cp "$tmp/sample.docx" sample.docx

python3 - <<'PY'
import zipfile
files = {
    "[Content_Types].xml": '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/></Types>',
    "_rels/.rels": '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>',
    "ppt/presentation.xml": '<?xml version="1.0" encoding="UTF-8"?><p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>',
}
with zipfile.ZipFile("sample.pptx", "w", zipfile.ZIP_DEFLATED) as z:
    for name, data in files.items():
        z.writestr(name, data)
PY
