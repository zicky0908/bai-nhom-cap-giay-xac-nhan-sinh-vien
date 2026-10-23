#!/bin/sh
# Render slide ra ảnh để soát lỗi hiển thị: LibreOffice trong Docker + font Carlito/Caladea (khớp kích thước Calibri/Cambria).
set -eu
cd "$(dirname "$0")"
docker run --rm -v "$PWD":/w -v "$PWD/.fonts":/usr/share/fonts/truetype/extra -w /w --entrypoint sh \
  lscr.io/linuxserver/libreoffice:latest -c "fc-cache -f >/dev/null && soffice --headless --convert-to pdf Slide-cap-giay-xac-nhan-sinh-vien.pptx >/dev/null"
rm -f qa/*.png && mkdir -p qa
.venv/bin/python -c "
import fitz
d = fitz.open('Slide-cap-giay-xac-nhan-sinh-vien.pdf')
for i, p in enumerate(d): p.get_pixmap(dpi=${DPI:-80}).save(f'qa/s{i + 1:02d}.png')
print(len(d), 'trang')"
