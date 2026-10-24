#!/bin/sh
# Render một file .pptx bất kỳ ra ảnh để soát: ./render.sh <file.pptx> <thư-mục-ảnh>
set -eu
cd "$(dirname "$0")"
SRC=$(realpath "$1"); OUT=$(realpath -m "$2"); DIR=$(dirname "$SRC"); NAME=$(basename "$SRC" .pptx)
docker run --rm -v "$DIR":/w -v "$PWD/.fonts":/usr/share/fonts/truetype/extra -w /w --entrypoint sh \
  lscr.io/linuxserver/libreoffice:latest -c "fc-cache -f >/dev/null && soffice --headless --convert-to pdf '$NAME.pptx' >/dev/null"
mkdir -p "$OUT" && rm -f "$OUT"/*.png
.venv/bin/python - "$DIR/$NAME.pdf" "$OUT" <<'PY'
import sys, fitz
from PIL import Image
d = fitz.open(sys.argv[1]); out = sys.argv[2]
for i, p in enumerate(d): p.get_pixmap(dpi=80).save(f'{out}/s{i + 1:02d}.png')
fs = [f'{out}/s{i + 1:02d}.png' for i in range(len(d))]
for k in range(0, len(fs), 4):
    ims = [Image.open(f) for f in fs[k:k + 4]]; w, h = ims[0].size
    sheet = Image.new('RGB', (2 * w + 10, 2 * h + 10), 'gray')
    for i, im in enumerate(ims): sheet.paste(im, ((i % 2) * (w + 10), (i // 2) * (h + 10)))
    sheet.save(f'{out}/sheet{k // 4 + 1}.png')
print(len(d), 'trang')
PY
