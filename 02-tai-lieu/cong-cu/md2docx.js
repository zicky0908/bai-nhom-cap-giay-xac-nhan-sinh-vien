// Chuyển Markdown đơn giản (tiêu đề, đoạn, **đậm**, `mã`, danh sách, checklist, bảng) sang .docx.
// Dùng: node md2docx.js <vào.md> <ra.docx>
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType,
  ShadingType, BorderStyle, LevelFormat, AlignmentType, Footer, PageNumber,
} = require("docx");

const [, , src, out] = process.argv;
const lines = fs.readFileSync(src, "utf8").split(/\r?\n/);
const PAGE_W = 11906, MARGIN = 1134, CONTENT_W = PAGE_W - 2 * MARGIN; // A4, lề 2 cm
const ACCENT = "0E4A50", LIGHT = "EEF5F4", BORDER = "C9DAD7";

function runs(text, base = {}) {
  // **đậm** và `mã`; phần còn lại giữ nguyên
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).filter(Boolean);
  return parts.map(p => {
    if (p.startsWith("**")) return new TextRun({ text: p.slice(2, -2), bold: true, ...base });
    if (p.startsWith("`")) return new TextRun({ text: p.slice(1, -1), font: "Consolas", size: 19, color: "3D5A66", ...base });
    return new TextRun({ text: p.replace(/\*([^*]+)\*/g, "$1"), ...base });
  });
}

function table(rows) {
  const cells = rows.map(r => r.replace(/^\||\|$/g, "").split("|").map(c => c.trim()));
  const body = cells.filter((_, i) => i !== 1); // bỏ dòng ---
  const n = body[0].length;
  // Sàn mỗi cột = từ dài nhất của cột (không bị bẻ giữa từ); phần còn lại chia theo lượng chữ.
  const plain = s => s.replace(/\*\*|`/g, "");
  const floor = Array.from({ length: n }, (_, j) =>
    220 + 125 * Math.min(18, Math.max(...body.map(r => Math.max(0, ...plain(r[j] || "").split(/\s+/).map(w => w.length))))));
  const len = Array.from({ length: n }, (_, j) => Math.max(...body.map(r => plain(r[j] || "").length)));
  const spare = Math.max(0, CONTENT_W - floor.reduce((a, b) => a + b, 0));
  const extra = len.map((l, j) => Math.max(0, Math.min(l, 70) * 125 + 220 - floor[j]));
  const extraSum = extra.reduce((a, b) => a + b, 0) || 1;
  const widths = floor.map((f, j) => Math.round(f + spare * extra[j] / extraSum));
  widths[n - 1] += CONTENT_W - widths.reduce((a, b) => a + b, 0);
  const border = { style: BorderStyle.SINGLE, size: 4, color: BORDER };
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths,
    rows: body.map((r, i) => new TableRow({
      tableHeader: i === 0,
      children: Array.from({ length: n }, (_, j) => new TableCell({
        width: { size: widths[j], type: WidthType.DXA },
        shading: i === 0 ? { type: ShadingType.CLEAR, fill: ACCENT, color: "auto" } : (i % 2 === 0 ? { type: ShadingType.CLEAR, fill: LIGHT, color: "auto" } : undefined),
        borders: { top: border, bottom: border, left: border, right: border },
        margins: { top: 60, bottom: 60, left: 90, right: 90 },
        children: [new Paragraph({ spacing: { after: 0 }, children: runs(r[j] || "", i === 0 ? { bold: true, color: "FFFFFF" } : {}) })],
      })),
    })),
  });
}

const children = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  if (line.startsWith("|")) {
    const block = [];
    while (i < lines.length && lines[i].startsWith("|")) block.push(lines[i++]);
    i--;
    children.push(table(block), new Paragraph({ spacing: { after: 60 }, children: [] }));
    continue;
  }
  let m;
  if ((m = line.match(/^(#{1,3}) (.*)/))) {
    const level = [HeadingLevel.TITLE, HeadingLevel.HEADING_1, HeadingLevel.HEADING_2][m[1].length - 1];
    children.push(new Paragraph({ heading: level, children: runs(m[2]) }));
  } else if ((m = line.match(/^- \[ \] (.*)/))) {
    children.push(new Paragraph({ numbering: { reference: "check", level: 0 }, children: runs(m[1]) }));
  } else if ((m = line.match(/^(\s*)- (.*)/))) {
    children.push(new Paragraph({ numbering: { reference: "bullet", level: m[1].length >= 2 ? 1 : 0 }, children: runs(m[2]) }));
  } else if ((m = line.match(/^\d+\. (.*)/))) {
    children.push(new Paragraph({ numbering: { reference: "number", level: 0 }, children: runs(m[1]) }));
  } else {
    children.push(new Paragraph({ children: runs(line) }));
  }
}

const doc = new Document({
  creator: "Nhóm 4",
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 }, paragraph: { spacing: { after: 120, line: 288 } } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", run: { font: "Cambria", size: 40, bold: true, color: ACCENT }, paragraph: { spacing: { after: 240 } } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Cambria", size: 30, bold: true, color: ACCENT }, paragraph: { spacing: { before: 320, after: 140 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Cambria", size: 26, bold: true, color: "0E7C74" }, paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullet", levels: [0, 1].map(l => ({ level: l, format: LevelFormat.BULLET, text: l ? "–" : "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540 + 360 * l, hanging: 270 } } } })) },
      { reference: "check", levels: [{ level: 0, format: LevelFormat.BULLET, text: "☐", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] },
      { reference: "number", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: ["Trang ", PageNumber.CURRENT], size: 18, color: "5B8C85" })] })] }) },
    children,
  }],
});
// docx 9.0.2 ghi word/fontTable.xml nhưng không khai báo quan hệ tới nó; Word coi đó là file hỏng.
async function addFontTableRel(buf) {
  const JSZip = require("jszip");
  const zip = await JSZip.loadAsync(buf);
  const relPath = "word/_rels/document.xml.rels";
  let rels = await zip.file(relPath).async("string");
  if (zip.file("word/fontTable.xml") && !rels.includes("fontTable.xml")) {
    rels = rels.replace("</Relationships>",
      '<Relationship Id="rIdFontTable" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/></Relationships>');
    zip.file(relPath, rels);
  }
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

Packer.toBuffer(doc).then(addFontTableRel).then(b => { fs.writeFileSync(out, b); console.log("wrote", out); });
