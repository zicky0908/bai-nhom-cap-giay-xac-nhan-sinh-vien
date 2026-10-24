const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');

// Ensure output directory exists
const outDir = path.join(__dirname, 'output');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const pres = new PptxGenJS();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 inches
pres.author = 'Antigravity';
pres.company = 'Nhóm Nghiên cứu Học thuật';
pres.subject = 'Phân tích và tự động hóa quy trình cấp giấy xác nhận sinh viên tại trường cao đẳng Y Dược';
pres.title = 'Phân tích & Tự động hóa Quy trình Cấp Giấy Xác nhận Sinh viên';

// Color Palette (Medical/Academic Teal & Slate, no '#' prefix)
const C = {
  bg: 'F8FAFC',         // Crisp light slate background
  white: 'FFFFFF',
  navy: '0F172A',       // Deep slate/navy for titles & dark cards
  navyMid: '1E293B',    // Secondary dark
  teal: '0F766E',       // Primary medical/academic teal
  tealLight: 'CCFBF1',  // Soft teal tint
  tealBg: 'F0FDFA',     // Very light teal card background
  blue: '1D4ED8',       // Accent blue for TO-BE / analytics
  blueBg: 'EFF6FF',     // Very light blue background
  amber: 'B45309',      // Warning / candidate bottleneck
  amberBg: 'FEF3C7',    // Soft amber background
  amberBorder: 'F59E0B',
  red: 'B91C1C',        // Confirmed bottleneck / critical
  redBg: 'FEE2E2',      // Soft red background
  redBorder: 'EF4444',
  green: '15803D',      // Pass / verified
  greenBg: 'DCFCE7',
  text: '1E293B',       // Main body text
  muted: '475569',      // Secondary text
  border: 'CBD5E1',     // Subtle border
  borderLight: 'E2E8F0',
  altRow: 'F1F5F9'      // Table alternating row
};

const FONT = 'Arial';

// Read PNG pixel dimensions directly from IHDR chunk to preserve exact aspect ratio
function getPngDimensions(relPath) {
  const fullPath = path.join(__dirname, relPath);
  const buf = fs.readFileSync(fullPath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height, path: relPath };
}

// Add an image fitted & centered inside a bounding box (x, y, maxW, maxH)
function addImageFitted(slide, relPath, x, y, maxW, maxH, withFrame = true) {
  const info = getPngDimensions(relPath);
  const ratio = info.width / info.height;
  const pad = withFrame ? 0.08 : 0;
  if (withFrame) {
    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y,
      w: maxW,
      h: maxH,
      rectRadius: 0.06,
      fill: { color: C.white },
      line: { color: C.border, width: 1 }
    });
  }
  const innerMaxW = maxW - pad * 2;
  const innerMaxH = maxH - pad * 2;
  let drawW = innerMaxW;
  let drawH = drawW / ratio;
  if (drawH > innerMaxH) {
    drawH = innerMaxH;
    drawW = drawH * ratio;
  }
  const drawX = x + pad + (innerMaxW - drawW) / 2;
  const drawY = y + pad + (innerMaxH - drawH) / 2;

  slide.addImage({
    path: relPath,
    x: drawX,
    y: drawY,
    w: drawW,
    h: drawH
  });
}

// Standard slide header + message banner + optional badge + footer
function createBaseSlide(opts) {
  const {
    num,
    total = 14,
    section,
    title,
    message,
    simBadge = null,
    notes = ''
  } = opts;

  const slide = pres.addSlide();
  slide.background = { color: C.bg };

  // Top accent bar
  slide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.08,
    fill: { color: C.teal },
    line: { color: C.teal, width: 0 }
  });

  // Section pill
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.45,
    y: 0.2,
    w: 2.7,
    h: 0.34,
    rectRadius: 0.05,
    fill: { color: C.tealLight },
    line: { color: C.teal, width: 0.5 }
  });
  slide.addText(section.toUpperCase(), {
    x: 0.45,
    y: 0.2,
    w: 2.7,
    h: 0.34,
    fontFace: FONT,
    fontSize: 14,
    bold: true,
    color: C.teal,
    align: 'center',
    valign: 'middle',
    margin: 0
  });

  // Simulation badge if required
  const titleMaxW = simBadge ? 9.3 : 12.4;
  if (simBadge) {
    const badgeW = simBadge.length > 20 ? 3.5 : 2.55;
    const badgeX = 13.333 - 0.45 - badgeW;
    slide.addShape(pres.ShapeType.roundRect, {
      x: badgeX,
      y: 0.2,
      w: badgeW,
      h: 0.38,
      rectRadius: 0.06,
      fill: { color: C.amberBg },
      line: { color: C.amberBorder, width: 1.5 }
    });
    slide.addText(simBadge, {
      x: badgeX,
      y: 0.2,
      w: badgeW,
      h: 0.38,
      fontFace: FONT,
      fontSize: 14,
      bold: true,
      color: C.amber,
      align: 'center',
      valign: 'middle',
      margin: 0
    });
  }

  // Main Slide Title
  slide.addText(title, {
    x: 0.45,
    y: 0.58,
    w: titleMaxW,
    h: 0.46,
    fontFace: FONT,
    fontSize: 22,
    bold: true,
    color: C.navy,
    valign: 'middle',
    margin: 0
  });

  // Key Message Banner (1 main message per slide)
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.45,
    y: 1.08,
    w: 12.433,
    h: 0.48,
    rectRadius: 0.05,
    fill: { color: C.white },
    line: { color: C.teal, width: 1.2 }
  });
  slide.addShape(pres.ShapeType.rect, {
    x: 0.45,
    y: 1.08,
    w: 0.12,
    h: 0.48,
    fill: { color: C.teal },
    line: { color: C.teal, width: 0 }
  });
  slide.addText(message, {
    x: 0.68,
    y: 1.08,
    w: 12.1,
    h: 0.48,
    fontFace: FONT,
    fontSize: 14,
    bold: true,
    color: C.navyMid,
    valign: 'middle',
    margin: 0
  });

  // Footer
  slide.addShape(pres.ShapeType.line, {
    x: 0.45,
    y: 7.08,
    w: 12.433,
    h: 0,
    line: { color: C.border, width: 0.75 }
  });
  slide.addText('Cấp giấy xác nhận sinh viên – Trường Cao đẳng Y Dược (Prototype học thuật)', {
    x: 0.45,
    y: 7.12,
    w: 9.5,
    h: 0.3,
    fontFace: FONT,
    fontSize: 14,
    color: C.muted,
    valign: 'middle',
    margin: 0
  });
  slide.addText(`Slide ${num}/${total}`, {
    x: 10.5,
    y: 7.12,
    w: 2.383,
    h: 0.3,
    fontFace: FONT,
    fontSize: 14,
    bold: true,
    color: C.teal,
    align: 'right',
    valign: 'middle',
    margin: 0
  });

  if (notes) {
    slide.addNotes(notes);
  }
  return slide;
}

// Helper to draw a styled card with a header bar and body content
function addCard(slide, { x, y, w, h, title, headerBg = C.navy, bodyBg = C.white, borderColor = C.border, bullets = [] }) {
  slide.addShape(pres.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.06,
    fill: { color: bodyBg },
    line: { color: borderColor, width: 1 }
  });
  slide.addShape(pres.ShapeType.roundRect, {
    x,
    y,
    w,
    h: 0.42,
    rectRadius: 0.06,
    fill: { color: headerBg },
    line: { color: headerBg, width: 0 }
  });
  slide.addText(title, {
    x: x + 0.14,
    y,
    w: w - 0.28,
    h: 0.42,
    fontFace: FONT,
    fontSize: 15,
    bold: true,
    color: C.white,
    valign: 'middle',
    margin: 0
  });

  if (bullets.length > 0) {
    const textItems = bullets.map((b, idx) => ({
      text: b,
      options: {
        bullet: true,
        breakLine: idx < bullets.length - 1,
        paraSpaceAfter: 6
      }
    }));
    slide.addText(textItems, {
      x: x + 0.14,
      y: y + 0.48,
      w: w - 0.28,
      h: h - 0.56,
      fontFace: FONT,
      fontSize: 14,
      color: C.text,
      valign: 'top',
      margin: 2
    });
  }
}

// ============================================================================
// SLIDE 1: Bối cảnh & Giới thiệu đề tài
// ============================================================================
{
  const s1 = createBaseSlide({
    num: 1,
    section: 'Mở đầu',
    title: 'Cấp giấy xác nhận sinh viên: Phân tích & Tự động hóa quy trình',
    message: 'Thông điệp: Kết hợp khai phá quy trình và tự động hóa trên phạm vi thử nghiệm học thuật tại Trường Cao đẳng Y Dược.',
    simBadge: 'Dữ liệu mô phỏng',
    notes: 'Người trình bày: Thành viên 1.\n- Giới thiệu tên đề tài và phạm vi 4 loại giấy xác nhận tại Phòng CTHSSV Trường Cao đẳng Y Dược.\n- Nhấn mạnh mục tiêu kép: dùng Process Mining tìm đúng điểm nghẽn và xây dựng prototype tự động hóa kiểm soát trạng thái.\n- Làm rõ ranh giới học thuật: toàn bộ số liệu khai phá quy trình là dữ liệu mô phỏng, prototype chạy local không phát hành giấy có giá trị pháp lý.'
  });

  addCard(s1, {
    x: 0.45,
    y: 1.72,
    w: 4.1,
    h: 5.15,
    title: '1. Phạm vi 4 loại giấy xác nhận',
    headerBg: C.teal,
    bullets: [
      'Xác nhận đang là sinh viên tại trường.',
      'Xác nhận tạm hoãn nghĩa vụ quân sự.',
      'Xác nhận vay vốn tín dụng sinh viên.',
      'Xác nhận hồ sơ xét cấp học bổng.',
      'Đơn vị nghiệp vụ (giả định): Phòng Công tác Học sinh Sinh viên (CTHSSV).',
      'Bắt đầu từ lúc nộp yêu cầu đến khi nhận giấy, từ chối có lý do, hoặc đóng do quá hạn.'
    ]
  });

  addCard(s1, {
    x: 4.75,
    y: 1.72,
    w: 4.1,
    h: 5.15,
    title: '2. Mục tiêu phân tích & Tự động hóa',
    headerBg: C.navy,
    bullets: [
      'Tách bạch thời gian chờ và thời gian xử lý thực tế theo giờ làm việc.',
      'Kiểm định 4 giả thuyết điểm nghẽn bằng dữ liệu mô phỏng ghép cặp (20 seed × 400 hồ sơ).',
      'Tự động hóa tiền kiểm biểu mẫu, cấp mã tra cứu và gửi thông báo có lưu vết.',
      'Đảm bảo toàn vẹn giao dịch: khóa chống gửi trùng và kiểm soát máy trạng thái.'
    ]
  });

  addCard(s1, {
    x: 9.05,
    y: 1.72,
    w: 3.83,
    h: 2.65,
    title: '3. Ranh giới thử nghiệm học thuật',
    headerBg: C.amber,
    bodyBg: C.amberBg,
    borderColor: C.amberBorder,
    bullets: [
      'Dùng dữ liệu mô phỏng, không phải số đo thực tế tại trường.',
      'Ngoài phạm vi: chữ ký số, giá trị pháp lý, tích hợp CSDL trường, cấp lại.'
    ]
  });

  addCard(s1, {
    x: 9.05,
    y: 4.52,
    w: 3.83,
    h: 2.35,
    title: '4. Tổ chức nhóm thực hiện (4 thành viên)',
    headerBg: C.blue,
    bullets: [
      'Thành viên 1: Bài toán, phạm vi SIPOC & lộ trình.',
      'Thành viên 2: Mô hình BPMN hiện tại, điểm nghẽn & TO-BE.',
      'Thành viên 3: Mô phỏng, Process Mining & kiểm chứng tính tay.',
      'Thành viên 4: Kiến trúc Prototype, kiểm thử & đối chiếu KPI.'
    ]
  });
}

// ============================================================================
// SLIDE 2: Bài toán nghiệp vụ (giả định học thuật)
// ============================================================================
{
  const s2 = createBaseSlide({
    num: 2,
    section: 'Bài toán nghiệp vụ',
    title: 'Bài toán nghiệp vụ (Giả định học thuật)',
    message: 'Thông điệp: Sinh viên khó theo dõi tiến độ hồ sơ, trong khi cán bộ mất thời gian xử lý thủ công và rà sổ cuối tuần.',
    notes: 'Người trình bày: Thành viên 1.\n- Trình bày 5 vấn đề giả định trong quy trình cấp giấy thủ công: không có mã tra cứu cho SV, phát hiện thiếu thông tin muộn, chờ trình ký theo đợt, chỉ rà sổ quá hạn vào chiều thứ Sáu, và thông báo qua Zalo/điện thoại không lưu vết.\n- Đối chiếu sang 4 mục tiêu cải tiến dự kiến và sơ đồ 4 bên liên quan chính.'
  });

  s2.addText('5 vấn đề giả định & dấu hiệu kiểm chứng', {
    x: 0.45,
    y: 1.68,
    w: 7.4,
    h: 0.35,
    fontFace: FONT,
    fontSize: 16,
    bold: true,
    color: C.navy,
    margin: 0
  });

  const probRows = [
    [
      { text: 'Vấn đề giả định', options: { bold: true, color: C.white, fill: { color: C.navy } } },
      { text: 'Biểu hiện & Dấu hiệu đo lường', options: { bold: true, color: C.white, fill: { color: C.navy } } }
    ],
    [
      { text: '1. Không tra cứu được tiến độ', options: { bold: true, color: C.red, fill: { color: C.white } } },
      { text: 'Số sổ gán nội bộ khi tiếp nhận nhưng không báo cho SV; phát sinh hỏi lại.', options: { fill: { color: C.white } } }
    ],
    [
      { text: '2. Phát hiện thiếu/sai muộn', options: { bold: true, color: C.red, fill: { color: C.altRow } } },
      { text: 'Đơn giấy/form thiếu thông tin chỉ lộ ra khi cán bộ kiểm tra; phải bổ sung.', options: { fill: { color: C.altRow } } }
    ],
    [
      { text: '3. Chờ trình ký theo đợt lâu', options: { bold: true, color: C.red, fill: { color: C.white } } },
      { text: 'Hồ sơ gom theo lô chờ lãnh đạo duyệt ký; đo bằng giờ làm việc.', options: { fill: { color: C.white } } }
    ],
    [
      { text: '4. Quá hạn lộ ra khi rà sổ', options: { bold: true, color: C.red, fill: { color: C.altRow } } },
      { text: 'Hạn bổ sung 7 ngày làm việc nhưng chỉ rà sổ thủ công chiều thứ Sáu.', options: { fill: { color: C.altRow } } }
    ],
    [
      { text: '5. Thông báo không lưu vết', options: { bold: true, color: C.red, fill: { color: C.white } } },
      { text: 'Báo qua điện thoại/Zalo không có bằng chứng gửi đồng bộ (chỉ đo ở TO-BE).', options: { fill: { color: C.white } } }
    ]
  ];

  s2.addTable(probRows, {
    x: 0.45,
    y: 2.08,
    w: 7.4,
    colW: [2.75, 4.65],
    rowH: [0.42, 0.56, 0.56, 0.56, 0.56, 0.56],
    fontFace: FONT,
    fontSize: 14,
    color: C.text,
    border: { type: 'solid', color: C.border, pt: 0.75 },
    valign: 'middle',
    margin: [4, 6, 4, 6]
  });

  addCard(s2, {
    x: 0.45,
    y: 5.55,
    w: 7.4,
    h: 1.35,
    title: 'Mục tiêu cải tiến dự kiến',
    headerBg: C.teal,
    bodyBg: C.tealBg,
    borderColor: C.teal,
    bullets: [
      'Cấp mã hồ sơ tra cứu minh bạch; kiểm tra biểu mẫu ngay khi nộp để giảm vòng bổ sung.',
      'Tách thời gian chờ và xử lý; tự động cảnh báo quá hạn và lưu vết thông báo kèm lý do.'
    ]
  });

  addCard(s2, {
    x: 8.05,
    y: 1.68,
    w: 4.83,
    h: 5.22,
    title: 'Các bên liên quan trong quy trình',
    headerBg: C.blue,
    bullets: []
  });

  const stakeholders = [
    { role: 'L1 · Sinh viên', desc: 'Nộp yêu cầu, bổ sung hồ sơ, nhận kết quả', color: C.teal },
    { role: 'L2 · Cán bộ CTHSSV', desc: 'Tiếp nhận, kiểm tra, soạn giấy, xác nhận cấp & báo SV', color: C.navy },
    { role: 'L3 · Lãnh đạo phòng', desc: 'Thẩm quyền duy nhất duyệt ký hoặc từ chối (kèm lý do)', color: C.amber },
    { role: 'L4 · Văn thư', desc: 'Đóng dấu mộc, vào sổ công văn trước khi trả giấy', color: C.blue },
    { role: 'Ngoài phạm vi trực tiếp', desc: 'Phòng Đào tạo (nguồn tra cứu), cơ quan nhận giấy', color: C.muted }
  ];

  stakeholders.forEach((st, i) => {
    const sy = 2.25 + i * 0.9;
    s2.addShape(pres.ShapeType.roundRect, {
      x: 8.25,
      y: sy,
      w: 4.43,
      h: 0.78,
      rectRadius: 0.05,
      fill: { color: C.bg },
      line: { color: st.color, width: 1.2 }
    });
    s2.addText(st.role, {
      x: 8.38,
      y: sy + 0.05,
      w: 4.18,
      h: 0.3,
      fontFace: FONT,
      fontSize: 14,
      bold: true,
      color: st.color,
      margin: 0
    });
    s2.addText(st.desc, {
      x: 8.38,
      y: sy + 0.36,
      w: 4.18,
      h: 0.36,
      fontFace: FONT,
      fontSize: 14,
      color: C.text,
      margin: 0
    });
  });
}

// ============================================================================
// SLIDE 3: Tổng quan quy trình đầu-cuối (SIPOC & Mốc đo)
// ============================================================================
{
  const s3 = createBaseSlide({
    num: 3,
    section: 'Tổng quan quy trình',
    title: 'Tổng quan quy trình đầu–cuối & Ranh giới đo lường',
    message: 'Thông điệp: Quy trình đi từ lúc sinh viên nộp yêu cầu đến một trong ba kết cục rõ ràng, tách riêng thời gian phía trường và phía sinh viên.',
    notes: 'Người trình bày: Thành viên 1.\n- Giải thích khung SIPOC đầu-cuối: đầu vào gồm thông tin SV, loại giấy, mục đích, minh chứng; đầu ra gồm giấy xác nhận hoặc thông báo từ chối có lý do và event log.\n- Làm rõ 3 kết cục loại trừ nhau: Nhận giấy (E1), Bị từ chối kèm lý do (E2), Đóng hồ sơ do quá hạn bổ sung 7 ngày làm việc (E3).\n- Giải thích vì sao phải tách T_trường (kết thúc khi thông báo kết quả cho SV) và T_SV (tính đến khi SV đến nhận giấy; các ca đã cấp nhưng chưa nhận là dữ liệu bị cắt).'
  });

  addCard(s3, {
    x: 0.45,
    y: 1.7,
    w: 3.85,
    h: 3.1,
    title: 'Đầu vào (Inputs)',
    headerBg: C.navy,
    bullets: [
      'Mã số SV, họ tên, ngày sinh, lớp/khoa.',
      'Loại giấy xác nhận & số bản cần cấp.',
      'Mục đích sử dụng cụ thể.',
      'Email nhận thông báo & tệp minh chứng kèm theo (tùy loại giấy).'
    ]
  });

  addCard(s3, {
    x: 4.5,
    y: 1.7,
    w: 4.3,
    h: 3.1,
    title: 'Luồng xử lý & Quy ước giờ làm việc',
    headerBg: C.teal,
    bullets: [
      'Nộp yêu cầu → Tiếp nhận & kiểm tra → Duyệt ký → Đóng dấu → Thông báo kết quả.',
      'Giờ làm việc: Thứ Hai – Thứ Sáu (07:30–11:30 & 13:30–17:00, 450 phút/ngày).',
      'Hạn bổ sung hồ sơ: 7 ngày làm việc; ngưỡng quá hạn toàn trình: tham số 5 ngày LV.'
    ]
  });

  addCard(s3, {
    x: 9.0,
    y: 1.7,
    w: 3.88,
    h: 3.1,
    title: 'Đầu ra & 3 Kết cục rõ ràng',
    headerBg: C.blue,
    bullets: [
      'Kết cục 1 (E1): Sinh viên nhận giấy đã ký và đóng dấu.',
      'Kết cục 2 (E2): Từ chối cấp kèm lý do bắt buộc.',
      'Kết cục 3 (E3): Đóng hồ sơ do quá hạn bổ sung.',
      'Lưu vết sổ tiếp nhận / nhật ký sự kiện (Event Log).'
    ]
  });

  s3.addShape(pres.ShapeType.roundRect, {
    x: 0.45,
    y: 4.98,
    w: 12.433,
    h: 1.92,
    rectRadius: 0.06,
    fill: { color: C.white },
    line: { color: C.teal, width: 1.5 }
  });
  s3.addText('Ranh giới hai thước đo thời gian tách biệt (Tránh nhập nhằng trách nhiệm)', {
    x: 0.65,
    y: 5.08,
    w: 12.0,
    h: 0.36,
    fontFace: FONT,
    fontSize: 16,
    bold: true,
    color: C.teal,
    margin: 0
  });

  s3.addShape(pres.ShapeType.roundRect, {
    x: 0.65,
    y: 5.5,
    w: 5.85,
    h: 1.25,
    rectRadius: 0.05,
    fill: { color: C.tealBg },
    line: { color: C.teal, width: 1 }
  });
  s3.addText([
    { text: '1. Thời gian phía trường (T_trường):\n', options: { bold: true, color: C.teal } },
    { text: 'Tính từ lúc nộp yêu cầu đến khi hoàn tất thông báo kết quả (báo có giấy, báo từ chối, hoặc đóng quá hạn). Có bản Ròng (Net) trừ thời gian chờ SV bổ sung.', options: { color: C.text } }
  ], {
    x: 0.8,
    y: 5.56,
    w: 5.55,
    h: 1.12,
    fontFace: FONT,
    fontSize: 14,
    valign: 'middle',
    margin: 0
  });

  s3.addShape(pres.ShapeType.roundRect, {
    x: 6.75,
    y: 5.5,
    w: 5.9,
    h: 1.25,
    rectRadius: 0.05,
    fill: { color: C.blueBg },
    line: { color: C.blue, width: 1 }
  });
  s3.addText([
    { text: '2. Tổng thời gian phía sinh viên (T_SV):\n', options: { bold: true, color: C.blue } },
    { text: 'Tính từ lúc nộp đến khi SV thực sự nhận giấy. Hồ sơ "đã cấp nhưng chưa nhận" là dữ liệu bị cắt (censored): tách riêng số lượng & tuổi tồn, không gộp vào T_SV.', options: { color: C.text } }
  ], {
    x: 6.9,
    y: 5.56,
    w: 5.6,
    h: 1.12,
    fontFace: FONT,
    fontSize: 14,
    valign: 'middle',
    margin: 0
  });
}

// ============================================================================
// SLIDE 4: Quy trình hiện tại (giả định) - AS-IS BPMN
// ============================================================================
{
  const s4 = createBaseSlide({
    num: 4,
    section: 'Quy trình AS-IS',
    title: 'Quy trình hiện tại (Giả định) – Mô hình BPMN 4 làn',
    message: 'Thông điệp: Quy trình hiện tại đi qua 4 vai trò với nhiều thao tác ghi sổ thủ công, vòng lặp bổ sung và rà hạn vào chiều thứ Sáu.',
    notes: 'Người trình bày: Thành viên 2.\n- Chỉ trên sơ đồ BPMN 4 làn ngang: Sinh viên, Cán bộ CTHSSV, Lãnh đạo phòng, Văn thư.\n- Giải thích 3 nhánh sau bước kiểm tra thông tin và tư cách: (1) Đủ điều kiện -> soạn giấy và phiếu trình; (2) Thiếu/sai -> báo SV bổ sung; (3) Không đủ tư cách -> trình lãnh đạo quyết định từ chối.\n- Nhấn mạnh việc rà soát hồ sơ quá hạn bổ sung (7 ngày làm việc) chỉ thực hiện thủ công vào chiều thứ Sáu hằng tuần.'
  });

  addImageFitted(s4, 'inputs/images/as-is.png', 0.45, 1.65, 12.433, 3.6, true);

  addCard(s4, {
    x: 0.45,
    y: 5.38,
    w: 4.0,
    h: 1.55,
    title: 'Luồng xử lý qua 4 làn vai trò',
    headerBg: C.navy,
    bullets: [
      'SV nộp đơn giấy/form → Cán bộ ghi sổ, kiểm tra & soạn giấy → Lãnh đạo ký → Văn thư đóng dấu.'
    ]
  });

  addCard(s4, {
    x: 4.65,
    y: 5.38,
    w: 4.1,
    h: 1.55,
    title: 'Ba nhánh rẽ sau bước kiểm tra',
    headerBg: C.teal,
    bullets: [
      'Đủ điều kiện (soạn giấy); Thiếu/sai (yêu cầu bổ sung, không giới hạn số vòng); Không đủ tư cách (trình lãnh đạo từ chối).'
    ]
  });

  addCard(s4, {
    x: 8.95,
    y: 5.38,
    w: 3.933,
    h: 1.55,
    title: 'Rà soát quá hạn thủ công',
    headerBg: C.amber,
    bodyBg: C.amberBg,
    borderColor: C.amberBorder,
    bullets: [
      'Hạn bổ sung là 7 ngày làm việc, nhưng chỉ rà sổ vào chiều thứ Sáu để đóng hồ sơ quá hạn.'
    ]
  });
}

// ============================================================================
// SLIDE 5: Các ứng viên điểm nghẽn (Giả thuyết ngang hàng)
// ============================================================================
{
  const s5 = createBaseSlide({
    num: 5,
    section: 'Giả thuyết điểm nghẽn',
    title: 'Bốn ứng viên điểm nghẽn & Tiêu chí xác nhận trước thực nghiệm',
    message: 'Thông điệp: Bốn vị trí có nguy cơ gây trễ được đặt làm giả thuyết ngang hàng để kiểm chứng khách quan bằng dữ liệu.',
    notes: 'Người trình bày: Thành viên 2.\n- Trình bày 4 ứng viên điểm nghẽn ngang hàng (H1 đến H4): chờ trình ký theo đợt, vòng lặp yêu cầu bổ sung, chờ kiểm tra đầu vào do kiêm nhiệm, và chờ chuyển giấy đã ký sang văn thư đóng dấu.\n- Lưu ý: khoảng chờ từ lúc báo có giấy đến lúc SV đến nhận chỉ dùng để tách T_SV khỏi T_trường, không phải điểm nghẽn của trường.\n- Nêu rõ bộ tiêu chí công bố trước khi chạy mô phỏng để tránh kết luận chủ quan.'
  });

  const hRows = [
    [
      { text: 'Giả thuyết', options: { bold: true, color: C.white, fill: { color: C.navy } } },
      { text: 'Vị trí trên quy trình', options: { bold: true, color: C.white, fill: { color: C.navy } } },
      { text: 'Nguyên nhân giả định', options: { bold: true, color: C.white, fill: { color: C.navy } } },
      { text: 'Ảnh hưởng tới tiến độ', options: { bold: true, color: C.white, fill: { color: C.navy } } }
    ],
    [
      { text: 'Ứng viên H1', options: { bold: true, color: C.red, fill: { color: C.white } } },
      { text: 'Chờ trình ký (Soạn giấy → Duyệt ký)', options: { bold: true, fill: { color: C.white } } },
      { text: 'Trình ký theo lô, lãnh đạo bận/vắng', options: { fill: { color: C.white } } },
      { text: 'Kéo dài T_trường, sinh viên hỏi lại nhiều lần', options: { fill: { color: C.white } } }
    ],
    [
      { text: 'Ứng viên H2', options: { bold: true, color: C.amber, fill: { color: C.altRow } } },
      { text: 'Vòng lặp yêu cầu bổ sung hồ sơ', options: { bold: true, fill: { color: C.altRow } } },
      { text: 'Biểu mẫu chưa nêu rõ mục cần nộp; báo thiếu mơ hồ', options: { fill: { color: C.altRow } } },
      { text: 'Phát sinh làm lại nhiều vòng, tăng tỷ lệ đóng quá hạn', options: { fill: { color: C.altRow } } }
    ],
    [
      { text: 'Ứng viên H3', options: { bold: true, color: C.amber, fill: { color: C.white } } },
      { text: 'Chờ kiểm tra đầu vào (Tiếp nhận → Kiểm tra)', options: { bold: true, fill: { color: C.white } } },
      { text: '1 cán bộ tiếp nhận kiêm nhiệm, tra cứu thủ công', options: { fill: { color: C.white } } },
      { text: 'Tồn đọng hồ sơ đầu vào, tăng tuổi hồ sơ đang xử lý', options: { fill: { color: C.white } } }
    ],
    [
      { text: 'Ứng viên H4', options: { bold: true, color: C.amber, fill: { color: C.altRow } } },
      { text: 'Chờ chuyển đóng dấu (Duyệt ký → Văn thư)', options: { bold: true, fill: { color: C.altRow } } },
      { text: 'Giấy đã ký chờ gom chuyển theo lô sang văn thư', options: { fill: { color: C.altRow } } },
      { text: 'Tăng T_trường âm thầm trước khi báo cho sinh viên', options: { fill: { color: C.altRow } } }
    ]
  ];

  s5.addTable(hRows, {
    x: 0.45,
    y: 1.68,
    w: 12.433,
    colW: [1.75, 3.25, 3.85, 3.583],
    rowH: [0.42, 0.62, 0.62, 0.62, 0.62],
    fontFace: FONT,
    fontSize: 14,
    color: C.text,
    border: { type: 'solid', color: C.border, pt: 0.75 },
    valign: 'middle',
    margin: [4, 6, 4, 6]
  });

  addCard(s5, {
    x: 0.45,
    y: 4.82,
    w: 7.7,
    h: 2.1,
    title: 'Tiêu chí xác nhận điểm nghẽn (Công bố trước khi sinh dữ liệu)',
    headerBg: C.teal,
    bodyBg: C.tealBg,
    borderColor: C.teal,
    bullets: [
      '(a) Trung vị thời gian chờ thuộc nhóm 3 bước chuyển tiếp cao nhất.',
      '(b) Từ 50% số ca trở lên vượt ngưỡng (1 ngày làm việc = 450 phút); đối chiếu P90.',
      '(c) Có bằng chứng nguyên nhân (lịch ký, cỡ lô, mã lý do) & chỉ tính giờ làm việc.'
    ]
  });

  addCard(s5, {
    x: 8.35,
    y: 4.82,
    w: 4.533,
    h: 2.1,
    title: 'Lưu ý loại trừ sai lệch phép đo',
    headerBg: C.navy,
    bullets: [
      'Chờ dài chỉ do nghỉ trưa hoặc cuối tuần không được tính là nghẽn.',
      'Đoạn "Báo có giấy → SV nhận giấy" chỉ dùng để tách T_SV, không phải nghẽn của trường.'
    ]
  });
}

// ============================================================================
// SLIDE 6: Thiết kế dữ liệu mô phỏng (Dữ liệu mô phỏng)
// ============================================================================
{
  const s6 = createBaseSlide({
    num: 6,
    section: 'Thiết kế mô phỏng',
    title: 'Thiết kế dữ liệu mô phỏng ghép cặp (Common Random Numbers)',
    message: 'Thông điệp: Các kịch bản hiện tại và đề xuất được mô phỏng trên cùng cơ sở ngẫu nhiên để so sánh công bằng.',
    simBadge: 'Dữ liệu mô phỏng',
    notes: 'Người trình bày: Thành viên 3.\n- Trình bày thiết kế thực nghiệm mô phỏng: 400 hồ sơ trong 12 tuần đến + 8 tuần xả hàng, lặp lại qua 20 hạt giống ngẫu nhiên (seed) độc lập, tổng cộng 7 cấu hình.\n- Giải thích kỹ thuật ghép cặp từng hồ sơ bằng cùng luồng số ngẫu nhiên (Common Random Numbers) để giảm nhiễu khi so sánh AS-IS và TO-BE.\n- Chỉ rõ bảng đối chiếu tham số giữ cố định và tham số thay đổi để bóc tách hiệu quả của phần mềm với hiệu quả của việc đổi lịch ký.'
  });

  const stats = [
    { num: '400 hồ sơ / kịch bản', sub: '12 tuần nhận đơn + 8 tuần xả hàng tồn', color: C.teal },
    { num: '20 Seed độc lập', sub: 'Ghép cặp từng hồ sơ cùng luồng ngẫu nhiên', color: C.blue },
    { num: '450 phút / ngày LV', sub: 'Thứ Hai – Thứ Sáu (07:30–11:30, 13:30–17:00)', color: C.navy }
  ];

  stats.forEach((st, idx) => {
    const bx = 0.45 + idx * 4.21;
    s6.addShape(pres.ShapeType.roundRect, {
      x: bx,
      y: 1.68,
      w: 4.01,
      h: 1.05,
      rectRadius: 0.06,
      fill: { color: C.white },
      line: { color: st.color, width: 1.5 }
    });
    s6.addText(st.num, {
      x: bx + 0.15,
      y: 1.76,
      w: 3.7,
      h: 0.45,
      fontFace: FONT,
      fontSize: 20,
      bold: true,
      color: st.color,
      align: 'center',
      margin: 0
    });
    s6.addText(st.sub, {
      x: bx + 0.15,
      y: 2.22,
      w: 3.7,
      h: 0.4,
      fontFace: FONT,
      fontSize: 14,
      color: C.muted,
      align: 'center',
      margin: 0
    });
  });

  const paramRows = [
    [
      { text: 'Nhóm tham số', options: { bold: true, color: C.white, fill: { color: C.navy } } },
      { text: 'Kịch bản hiện tại (AS-IS)', options: { bold: true, color: C.white, fill: { color: C.navy } } },
      { text: 'Kịch bản đề xuất (TO-BE S0 & S1)', options: { bold: true, color: C.white, fill: { color: C.teal } } }
    ],
    [
      { text: 'Tham số giữ cố định\n(Đảm bảo công bằng)', options: { bold: true, color: C.navy, fill: { color: C.white } } },
      { text: '• Tỷ lệ 4 loại giấy, dòng hồ sơ đến, tư cách SV.\n• Thời gian SV phản hồi bổ sung & đến nhận giấy.\n• 1 cán bộ tiếp nhận, 1 lãnh đạo ký, hạn bổ sung 7 ngày LV.', options: { fill: { color: C.white } } },
      { text: '• Giữ nguyên hoàn toàn như AS-IS trên từng seed.\n• Ghép cặp từng hồ sơ để loại trừ nhiễu ngẫu nhiên.', options: { fill: { color: C.white } } }
    ],
    [
      { text: 'Thao tác & Rà hạn\n(Tự động hóa)', options: { bold: true, color: C.teal, fill: { color: C.altRow } } },
      { text: '• Ghi sổ, soạn giấy, báo kết quả thủ công.\n• Rà sổ quá hạn bổ sung vào chiều thứ Sáu.', options: { fill: { color: C.altRow } } },
      { text: '• Kiểm tra định dạng form, cấp mã, sinh bản thảo tự động.\n• Timer nhắc hạn (còn 2 ngày LV) & đóng đúng thời điểm quá hạn.', options: { fill: { color: C.altRow } } }
    ],
    [
      { text: 'Lịch trình ký\n(Tách S0 và S1)', options: { bold: true, color: C.blue, fill: { color: C.white } } },
      { text: '• Trình ký gom theo lô (batch).', options: { fill: { color: C.white } } },
      { text: '• TO-BE S0: Tự động hóa nhưng VẪN ký theo lô.\n• TO-BE S1: Đổi sang lịch ký 2 khung cố định/ngày (10:30 & 16:00).', options: { fill: { color: C.white } } }
    ],
    [
      { text: 'Tỷ lệ phải bổ sung (p)\n(Kiểm tra độ nhạy)', options: { bold: true, color: C.amber, fill: { color: C.altRow } } },
      { text: '• Tỷ lệ phải bổ sung đầu vào: 30,1%.', options: { fill: { color: C.altRow } } },
      { text: '• Giả định giảm còn 15,6% nhờ checklist form web.\n• Chạy thêm cấu hình "S1, p không giảm (30,1%)" để kiểm tra độc lập.', options: { fill: { color: C.altRow } } }
    ]
  ];

  s6.addTable(paramRows, {
    x: 0.45,
    y: 2.9,
    w: 12.433,
    colW: [2.7, 4.7, 5.033],
    rowH: [0.42, 0.95, 0.85, 0.85, 0.85],
    fontFace: FONT,
    fontSize: 14,
    color: C.text,
    border: { type: 'solid', color: C.border, pt: 0.75 },
    valign: 'middle',
    margin: [4, 6, 4, 6]
  });
}

// ============================================================================
// SLIDE 7: Kết quả khai phá quy trình - Bản đồ DFG (Dữ liệu mô phỏng)
// ============================================================================
{
  const s7 = createBaseSlide({
    num: 7,
    section: 'Khai phá quy trình',
    title: 'Kết quả khai phá quy trình: Bản đồ luồng trực tiếp (DFG)',
    message: 'Thông điệp: Chờ trình ký (A06→A07) là ứng viên nghẽn duy nhất đạt đủ tiêu chí ở AS-IS; sang TO-BE S1 không còn cạnh đỏ.',
    simBadge: 'Dữ liệu mô phỏng',
    notes: 'Người trình bày: Thành viên 3.\n- Đối chiếu hai đồ thị DFG (seed 20260302): Ở AS-IS, bước chuyển Soạn giấy sang Duyệt ký (A06->A07) tô đỏ vì đạt đủ tiêu chí nghẽn: trung vị chờ 621 phút làm việc, P90 là 1.201 phút, 63% số ca chờ quá 1 ngày làm việc, xuất hiện ở 369/400 ca.\n- Lưu ý: khoảng chờ A01->A02 (249 phút, màu vàng) phần lớn do quy ước làm tròn 07:30 của ngày ghi trên đơn (GA10), không kết luận là xếp hàng thật.\n- Sang TO-BE S1 (ký 2 lần/ngày), không còn cạnh đỏ, chờ trước ký giảm còn 123 phút. Tỷ lệ đi thẳng tăng từ 62,3% lên 75,5% (lưu ý mức giảm bổ sung từ 30,1% xuống 15,6% là tham số đầu vào p).'
  });

  s7.addText('Bản đồ DFG hiện tại (AS-IS) – Cạnh đỏ: A06→A07 chờ trung vị 621 phút LV', {
    x: 0.45,
    y: 1.65,
    w: 6.1,
    h: 0.34,
    fontFace: FONT,
    fontSize: 14,
    bold: true,
    color: C.red,
    margin: 0
  });
  addImageFitted(s7, 'inputs/images/dfg_AS-IS.png', 0.45, 2.02, 6.1, 3.15, true);

  s7.addText('Bản đồ DFG đề xuất (TO-BE S1) – Không còn cạnh đỏ, chờ ký còn 123 phút LV', {
    x: 6.78,
    y: 1.65,
    w: 6.1,
    h: 0.34,
    fontFace: FONT,
    fontSize: 14,
    bold: true,
    color: C.teal,
    margin: 0
  });
  addImageFitted(s7, 'inputs/images/dfg_TB-S1-p15.png', 6.78, 2.02, 6.1, 3.15, true);

  addCard(s7, {
    x: 0.45,
    y: 5.3,
    w: 4.15,
    h: 1.65,
    title: 'Xác nhận điểm nghẽn tại A06→A07 (AS-IS)',
    headerBg: C.red,
    bodyBg: C.redBg,
    borderColor: C.redBorder,
    bullets: [
      'Trung vị chờ 621 phút LV (P90: 1.201 phút); 63% số ca chờ > 1 ngày LV (369/400 ca).'
    ]
  });

  addCard(s7, {
    x: 4.75,
    y: 5.3,
    w: 4.15,
    h: 1.65,
    title: 'Biến thể quy trình & Vòng lặp bổ sung',
    headerBg: C.navy,
    bullets: [
      'Hồ sơ đi thẳng tăng từ 62,3% lên 75,5%. Tỷ lệ bổ sung 30,1% → 15,6% là giả định đầu vào p.'
    ]
  });

  addCard(s7, {
    x: 9.05,
    y: 5.3,
    w: 3.833,
    h: 1.65,
    title: 'Quy tắc tô màu & Lưu ý quy ước',
    headerBg: C.amber,
    bodyBg: C.amberBg,
    borderColor: C.amberBorder,
    bullets: [
      'Đỏ: Top 3 chờ lâu nhất + ≥50% ca > 450 phút + ≥10% tổng ca. A01→A02 (249\') do quy ước 07:30.'
    ]
  });
}

// ============================================================================
// SLIDE 8: Tách thời gian chờ – xử lý & Kiểm chứng tính tay (Dữ liệu mô phỏng)
// ============================================================================
{
  const s8 = createBaseSlide({
    num: 8,
    section: 'Kiểm chứng công thức',
    title: 'Tách thời gian chờ – xử lý & Kiểm chứng bằng tính tay',
    message: 'Thông điệp: Số liệu thời gian do công cụ tính khớp hoàn toàn với kết quả tính tay trên tập hồ sơ mẫu.',
    simBadge: 'Dữ liệu mô phỏng',
    notes: 'Người trình bày: Thành viên 3.\n- Bên trái: Biểu đồ tách thời gian chờ (vàng) và thời gian xử lý (xanh) theo từng bước. Cho thấy thời gian chờ chiếm đại đa số, đặc biệt tại bước A07 ở AS-IS.\n- Bên phải: Bảng đối chiếu kết quả tính tay và kết quả từ mã nguồn trên các hồ sơ mẫu C001–C004 (843 / 1.693 / 1.233 / 5.740 phút) cùng 2 hồ sơ quy trình đề xuất.\n- Xác nhận hàm lịch làm việc trừ đúng giờ nghỉ trưa, cuối tuần và tách đúng thời gian của trường khỏi thời gian chờ sinh viên.'
  });

  s8.addText('Tách thời gian chờ và xử lý theo bước (Seed 20260302)', {
    x: 0.45,
    y: 1.65,
    w: 6.15,
    h: 0.34,
    fontFace: FONT,
    fontSize: 15,
    bold: true,
    color: C.navy,
    margin: 0
  });
  addImageFitted(s8, 'inputs/images/wait_process.png', 0.45, 2.02, 6.15, 3.3, true);

  addCard(s8, {
    x: 0.45,
    y: 5.42,
    w: 6.15,
    h: 1.5,
    title: 'Xác nhận độ chính xác của công cụ đo',
    headerBg: C.teal,
    bodyBg: C.tealBg,
    borderColor: C.teal,
    bullets: [
      'Trừ chính xác giờ nghỉ trưa (11:30–13:30) và ngày nghỉ cuối tuần.',
      'Tách đúng thời gian chờ sinh viên bổ sung ra khỏi T_trường_net; kiểm trực tiếp hàm tính KPI trên ca C001 (12/12 test tự động đạt).'
    ]
  });

  s8.addText('Đối chiếu tính tay và mã nguồn trên tập hồ sơ mẫu (Phút LV)', {
    x: 6.8,
    y: 1.65,
    w: 6.08,
    h: 0.34,
    fontFace: FONT,
    fontSize: 15,
    bold: true,
    color: C.navy,
    margin: 0
  });

  const verifyRows = [
    [
      { text: 'Hồ sơ / Đại lượng kiểm chứng', options: { bold: true, color: C.white, fill: { color: C.navy } } },
      { text: 'Tính tay', options: { bold: true, color: C.white, fill: { color: C.navy }, align: 'center' } },
      { text: 'Mã nguồn', options: { bold: true, color: C.white, fill: { color: C.teal }, align: 'center' } },
      { text: 'Kết quả', options: { bold: true, color: C.white, fill: { color: C.green }, align: 'center' } }
    ],
    [
      { text: 'C001 (AS-IS – Luồng đi thẳng chuẩn)', options: { bold: true, fill: { color: C.white } } },
      { text: '843 phút', options: { align: 'center', fill: { color: C.white } } },
      { text: '843 phút', options: { align: 'center', fill: { color: C.white } } },
      { text: 'Khớp 100%', options: { bold: true, color: C.green, align: 'center', fill: { color: C.white } } }
    ],
    [
      { text: 'C002 (AS-IS – Có chờ qua ngày làm việc)', options: { bold: true, fill: { color: C.altRow } } },
      { text: '1.693 phút', options: { align: 'center', fill: { color: C.altRow } } },
      { text: '1.693 phút', options: { align: 'center', fill: { color: C.altRow } } },
      { text: 'Khớp 100%', options: { bold: true, color: C.green, align: 'center', fill: { color: C.altRow } } }
    ],
    [
      { text: 'C003 (AS-IS – Nhánh từ chối / kiểm tra)', options: { bold: true, fill: { color: C.white } } },
      { text: '1.233 phút', options: { align: 'center', fill: { color: C.white } } },
      { text: '1.233 phút', options: { align: 'center', fill: { color: C.white } } },
      { text: 'Khớp 100%', options: { bold: true, color: C.green, align: 'center', fill: { color: C.white } } }
    ],
    [
      { text: 'C004 (AS-IS – Tổng thời gian & Tuổi net)', options: { bold: true, fill: { color: C.altRow } } },
      { text: '5.740 / 95\'', options: { align: 'center', fill: { color: C.altRow } } },
      { text: '5.740 / 95\'', options: { align: 'center', fill: { color: C.altRow } } },
      { text: 'Khớp 100%', options: { bold: true, color: C.green, align: 'center', fill: { color: C.altRow } } }
    ],
    [
      { text: 'Chờ trình ký mẫu (2 ca kiểm chứng)', options: { bold: true, fill: { color: C.white } } },
      { text: '555 & 585\'', options: { align: 'center', fill: { color: C.white } } },
      { text: '555 & 585\'', options: { align: 'center', fill: { color: C.white } } },
      { text: 'Khớp 100%', options: { bold: true, color: C.green, align: 'center', fill: { color: C.white } } }
    ],
    [
      { text: 'Độ trễ phát hiện quá hạn bổ sung (AS-IS)', options: { bold: true, fill: { color: C.altRow } } },
      { text: '2.130 phút', options: { align: 'center', fill: { color: C.altRow } } },
      { text: '2.130 phút', options: { align: 'center', fill: { color: C.altRow } } },
      { text: 'Khớp 100%', options: { bold: true, color: C.green, align: 'center', fill: { color: C.altRow } } }
    ],
    [
      { text: '2 hồ sơ mẫu TO-BE (Đóng đúng hạn & luồng mới)', options: { bold: true, fill: { color: C.white } } },
      { text: 'Trễ = 0 phút', options: { align: 'center', fill: { color: C.white } } },
      { text: 'Trễ = 0 phút', options: { align: 'center', fill: { color: C.white } } },
      { text: 'Khớp 100%', options: { bold: true, color: C.green, align: 'center', fill: { color: C.white } } }
    ]
  ];

  s8.addTable(verifyRows, {
    x: 6.8,
    y: 2.02,
    w: 6.08,
    colW: [2.78, 1.1, 1.1, 1.1],
    rowH: [0.44, 0.56, 0.56, 0.56, 0.56, 0.56, 0.56, 0.56],
    fontFace: FONT,
    fontSize: 14,
    color: C.text,
    border: { type: 'solid', color: C.border, pt: 0.75 },
    valign: 'middle',
    margin: [3, 5, 3, 5]
  });
}

// ============================================================================
// SLIDE 9: Quy trình đề xuất (TO-BE) - BPMN 5 làn
// ============================================================================
{
  const s9 = createBaseSlide({
    num: 9,
    section: 'Quy trình TO-BE',
    title: 'Quy trình đề xuất (TO-BE) – Mô hình BPMN 5 làn (Có làn Hệ thống)',
    message: 'Thông điệp: Kiểm soát dữ liệu ngay từ biểu mẫu, tự động hóa sinh giấy và thông báo, giữ nguyên thẩm quyền ký và đóng dấu.',
    notes: 'Người trình bày: Thành viên 2.\n- Chỉ trên sơ đồ BPMN TO-BE 5 làn: bổ sung làn thứ 5 (Hệ thống Web + n8n).\n- Nêu 3 nhóm thay đổi chính: (1) Tiền kiểm định dạng ngay khi nộp biểu mẫu web (A15) và cấp mã hồ sơ tự động (A02); (2) Hệ thống tự sinh bản thảo từ mẫu (A06), tự động nhắc hạn khi còn 2 ngày làm việc (A16) và đóng hồ sơ đúng hạn (A13); (3) Giữ nguyên thẩm quyền duyệt của lãnh đạo (khung 10:30 và 16:00 ở kịch bản S1) và đóng dấu của văn thư, gửi email có lưu vết qua Mailpit.'
  });

  addImageFitted(s9, 'inputs/images/to-be.png', 0.45, 1.65, 12.433, 3.55, true);

  addCard(s9, {
    x: 0.45,
    y: 5.32,
    w: 4.05,
    h: 1.62,
    title: '1. Kiểm soát đầu vào & Cấp mã',
    headerBg: C.teal,
    bullets: [
      'Kiểm tra định dạng tự động (A15) ngay khi nộp form checklist; tạo mã hồ sơ GXN và gửi email xác nhận.'
    ]
  });

  addCard(s9, {
    x: 4.65,
    y: 5.32,
    w: 4.15,
    h: 1.62,
    title: '2. Sinh bản thảo & Tự động nhắc hạn',
    headerBg: C.blue,
    bullets: [
      'Tự sinh bản thảo giấy (A06) để cán bộ rà (A17); tự động nhắc hạn (A16) và đóng hồ sơ đúng hạn (A13).'
    ]
  });

  addCard(s9, {
    x: 8.95,
    y: 5.32,
    w: 3.933,
    h: 1.62,
    title: '3. Giữ thẩm quyền & Lưu vết thông báo',
    headerBg: C.navy,
    bullets: [
      'Lãnh đạo duyệt ký (khung 10:30 & 16:00), Văn thư đóng dấu; hệ thống gửi email lưu vết qua Mailpit.'
    ]
  });
}

// ============================================================================
// SLIDE 10: Kiến trúc Prototype tự động hóa (Cập nhật theo Prototype thật Mục 6)
// ============================================================================
{
  const s10 = createBaseSlide({
    num: 10,
    section: 'Kiến trúc Prototype',
    title: 'Kiến trúc Prototype tự động hóa (4 dịch vụ Docker Compose)',
    message: 'Thông điệp: Ứng dụng FastAPI là bên duy nhất ghi trạng thái và nhật ký; n8n điều phối tiền kiểm, gửi thư và callback đồng bộ.',
    notes: 'Người trình bày: Thành viên 4.\n- Trình bày đúng kiến trúc prototype thật đang chạy trong thư mục prototype/ (mục 6): gồm 4 dịch vụ trên Docker Compose (App FastAPI + Jinja + PM4Py, PostgreSQL 17, n8n Community 2.44, Mailpit 1.31).\n- Làm rõ phân vai: App FastAPI là bên duy nhất ghi trạng thái và event log, kiểm tra vai trò, version và Idempotency-Key; n8n nhận webhook, đọc hồ sơ, tiền kiểm tự động, gửi email qua Mailpit và gọi callback.\n- Trình bày máy trạng thái chặt chẽ (app/state_machine.py), mọi thao tác sai vai trò hoặc sai thứ tự đều bị từ chối.'
  });

  s10.addText('1. Kiến trúc 4 dịch vụ chạy Local (Docker Compose)', {
    x: 0.45,
    y: 1.68,
    w: 7.35,
    h: 0.34,
    fontFace: FONT,
    fontSize: 16,
    bold: true,
    color: C.navy,
    margin: 0
  });

  const svcRows = [
    [
      { text: 'Dịch vụ', options: { bold: true, color: C.white, fill: { color: C.navy } } },
      { text: 'Vai trò & Trách nhiệm kỹ thuật', options: { bold: true, color: C.white, fill: { color: C.navy } } },
      { text: 'Cổng', options: { bold: true, color: C.white, fill: { color: C.teal }, align: 'center' } }
    ],
    [
      { text: 'App Web & API\n(FastAPI + Jinja + PM4Py)', options: { bold: true, color: C.teal, fill: { color: C.white } } },
      { text: 'Giao diện SV, Cán bộ, Analytics; BÊN DUY NHẤT ghi trạng thái & event log; kiểm tra vai trò, version, Idempotency-Key.', options: { fill: { color: C.white } } },
      { text: ':8000', options: { bold: true, align: 'center', fill: { color: C.white } } }
    ],
    [
      { text: 'PostgreSQL 17\n(Cơ sở dữ liệu)', options: { bold: true, color: C.navy, fill: { color: C.altRow } } },
      { text: 'Lưu trữ nguyên tử hồ sơ, nhật ký sự kiện (event log), kho khóa chống trùng và hàng đợi outbox.', options: { fill: { color: C.altRow } } },
      { text: 'Nội bộ', options: { align: 'center', fill: { color: C.altRow } } }
    ],
    [
      { text: 'n8n Community 2.44\n(Điều phối tự động)', options: { bold: true, color: C.blue, fill: { color: C.white } } },
      { text: 'Nhận webhook, gọi API đọc hồ sơ, tiền kiểm điều kiện, gọi chuyển trạng thái, gửi SMTP và callback xác nhận.', options: { fill: { color: C.white } } },
      { text: ':5678', options: { bold: true, align: 'center', fill: { color: C.white } } }
    ],
    [
      { text: 'Mailpit 1.31\n(Hộp thư thử nghiệm)', options: { bold: true, color: C.amber, fill: { color: C.altRow } } },
      { text: 'Bắt toàn bộ email SMTP nội bộ để kiểm chứng bằng chứng gửi thư, tuyệt đối không phát tán ra Internet.', options: { fill: { color: C.altRow } } },
      { text: ':8025', options: { bold: true, align: 'center', fill: { color: C.altRow } } }
    ]
  ];

  s10.addTable(svcRows, {
    x: 0.45,
    y: 2.06,
    w: 7.35,
    colW: [2.25, 4.15, 0.95],
    rowH: [0.42, 0.85, 0.72, 0.85, 0.72],
    fontFace: FONT,
    fontSize: 14,
    color: C.text,
    border: { type: 'solid', color: C.border, pt: 0.75 },
    valign: 'middle',
    margin: [4, 6, 4, 6]
  });

  addCard(s10, {
    x: 0.45,
    y: 5.75,
    w: 7.35,
    h: 1.18,
    title: 'Nguyên tắc bảo vệ tính toàn vẹn',
    headerBg: C.teal,
    bodyBg: C.tealBg,
    borderColor: C.teal,
    bullets: [
      'Tách biệt điều phối (n8n) và nguồn chân lý trạng thái (FastAPI + PostgreSQL); từ chối mọi chuyển trạng thái sai thứ tự.'
    ]
  });

  addCard(s10, {
    x: 8.0,
    y: 1.68,
    w: 4.88,
    h: 5.25,
    title: '2. Máy trạng thái hồ sơ (state_machine.py)',
    headerBg: C.blue,
    bullets: []
  });

  const states = [
    { name: '1. SUBMITTED (SV nộp / gửi lại)', sub: 'Khởi tạo hoặc tăng attempt_no khi nộp bổ sung', bg: C.blueBg, border: C.blue },
    { name: '2. PRECHECK_OK / NEED_SUPPLEMENT', sub: 'n8n tiền kiểm tự động (thiếu phải kèm lý do)', bg: C.tealBg, border: C.teal },
    { name: '3. IN_REVIEW (Cán bộ nhận xử lý)', sub: 'Ghi nhận bắt đầu xem xét hồ sơ hợp lệ', bg: C.white, border: C.navy },
    { name: '4. APPROVED / REJECTED / SUPPLEMENT', sub: 'Duyệt, từ chối (bắt buộc lý do) hoặc yêu cầu bổ sung', bg: C.amberBg, border: C.amberBorder },
    { name: '5. ISSUED & SYNCED (Đã cấp & Báo SV)', sub: 'Xác nhận đã cấp → n8n gửi Mailpit → callback SYNCED', bg: C.greenBg, border: C.green }
  ];

  states.forEach((st, i) => {
    const sy = 2.22 + i * 0.92;
    s10.addShape(pres.ShapeType.roundRect, {
      x: 8.2,
      y: sy,
      w: 4.48,
      h: 0.78,
      rectRadius: 0.05,
      fill: { color: st.bg },
      line: { color: st.border, width: 1.2 }
    });
    s10.addText(st.name, {
      x: 8.32,
      y: sy + 0.05,
      w: 4.24,
      h: 0.32,
      fontFace: FONT,
      fontSize: 14,
      bold: true,
      color: C.navy,
      margin: 0
    });
    s10.addText(st.sub, {
      x: 8.32,
      y: sy + 0.38,
      w: 4.24,
      h: 0.34,
      fontFace: FONT,
      fontSize: 14,
      color: C.text,
      margin: 0
    });
  });
}

// ============================================================================
// SLIDE 11: Đáp ứng yêu cầu kỹ thuật tối thiểu và an toàn giao dịch
// ============================================================================
{
  const s11 = createBaseSlide({
    num: 11,
    section: 'An toàn giao dịch',
    title: 'Đáp ứng yêu cầu kỹ thuật n8n & Cơ chế an toàn giao dịch',
    message: 'Thông điệp: Workflow n8n thỏa mãn đầy đủ cấu phần bắt buộc, chống gửi trùng bằng Idempotency-Key và chống báo thành công giả.',
    notes: 'Người trình bày: Thành viên 4.\n- Đối chiếu bảng ánh xạ 5 yêu cầu tối thiểu của giảng viên sang các node thực tế trong file n8n/workflows/student-certificate.json.\n- Giải thích cơ chế chống gửi trùng (Idempotency-Key) và chống báo thành công giả (chỉ hiện SYNCED khi n8n gửi xong email qua Mailpit và gọi callback thành công; nếu lỗi giữ PENDING/FAILED).\n- Nêu rõ sự khác biệt trung thực giữa mô hình BPMN phân tích và prototype thực tế (prototype gộp tiền kiểm trước bước cán bộ xem xét, chưa bật timer A16/A13).'
  });

  s11.addText('Ánh xạ yêu cầu kỹ thuật tối thiểu sang Workflow n8n', {
    x: 0.45,
    y: 1.68,
    w: 7.35,
    h: 0.34,
    fontFace: FONT,
    fontSize: 16,
    bold: true,
    color: C.navy,
    margin: 0
  });

  const wfRows = [
    [
      { text: 'Cấu phần bắt buộc', options: { bold: true, color: C.white, fill: { color: C.navy } } },
      { text: 'Node thực tế trong student-certificate.json', options: { bold: true, color: C.white, fill: { color: C.teal } } }
    ],
    [
      { text: '1. Bộ kích hoạt (Trigger)', options: { bold: true, color: C.teal, fill: { color: C.white } } },
      { text: 'Webhook "Nhận yêu cầu từ Web" (POST /webhook/certificate-process)', options: { fill: { color: C.white } } }
    ],
    [
      { text: '2. Nguồn dữ liệu (Data Source)', options: { bold: true, color: C.teal, fill: { color: C.altRow } } },
      { text: 'HTTP Request "Đọc hồ sơ và nguồn dữ liệu sinh viên" (gọi API đọc PostgreSQL)', options: { fill: { color: C.altRow } } }
    ],
    [
      { text: '3. Điều kiện rẽ nhánh (Condition)', options: { bold: true, color: C.teal, fill: { color: C.white } } },
      { text: '2 nút IF: "Là yêu cầu tiền kiểm?" & "Đủ điều kiện và đủ thông tin?"', options: { fill: { color: C.white } } }
    ],
    [
      { text: '4. Hành động xử lý (≥ 4 Actions)', options: { bold: true, color: C.teal, fill: { color: C.altRow } } },
      { text: '4 nút: "Ghi kết quả tiền kiểm đạt", "Ghi yêu cầu bổ sung", "Xác nhận đồng bộ thông báo", "Phản hồi thành công"', options: { fill: { color: C.altRow } } }
    ],
    [
      { text: '5. Thông báo (Notification)', options: { bold: true, color: C.teal, fill: { color: C.white } } },
      { text: 'Send Email "Gửi thông báo qua Mailpit" qua giao thức SMTP nội bộ', options: { fill: { color: C.white } } }
    ]
  ];

  s11.addTable(wfRows, {
    x: 0.45,
    y: 2.06,
    w: 7.35,
    colW: [2.45, 4.9],
    rowH: [0.42, 0.72, 0.72, 0.72, 0.85, 0.72],
    fontFace: FONT,
    fontSize: 14,
    color: C.text,
    border: { type: 'solid', color: C.border, pt: 0.75 },
    valign: 'middle',
    margin: [4, 6, 4, 6]
  });

  addCard(s11, {
    x: 0.45,
    y: 5.5,
    w: 7.35,
    h: 1.42,
    title: 'Đối chiếu trung thực: Mô hình BPMN TO-BE vs Prototype thực tế',
    headerBg: C.amber,
    bodyBg: C.amberBg,
    borderColor: C.amberBorder,
    bullets: [
      'Prototype gộp bước tiền kiểm tự động của n8n đứng trước bước cán bộ xem xét; chưa bật timer nhắc hạn (A16) và đóng quá hạn tự động (A13).'
    ]
  });

  addCard(s11, {
    x: 8.0,
    y: 1.68,
    w: 4.88,
    h: 2.55,
    title: 'Chống gửi trùng (Idempotency-Key)',
    headerBg: C.navy,
    bullets: [
      'Mỗi yêu cầu tạo hồ sơ hoặc thao tác đều gắn khóa Idempotency-Key.',
      'Bấm gửi lại nhiều lần hoặc gửi song song cùng khóa không tạo hồ sơ hay sự kiện nhật ký thừa.',
      'Đã kiểm chứng tự động qua kịch bản replay.'
    ]
  });

  addCard(s11, {
    x: 8.0,
    y: 4.38,
    w: 4.88,
    h: 2.54,
    title: 'Chống thông báo thành công giả',
    headerBg: C.teal,
    bullets: [
      'Khi mới lưu DB, trạng thái tự động hóa chỉ là PENDING.',
      'Chỉ chuyển sang SYNCED ("Đã thông báo") sau khi n8n gửi xong SMTP Mailpit và gọi callback về App.',
      'Nếu n8n/SMTP lỗi: giữ PENDING/FAILED, không báo giả.'
    ]
  });
}

// ============================================================================
// SLIDE 12: Minh chứng Giao diện Prototype & Kịch bản Demo thực tế
// ============================================================================
{
  const s12 = createBaseSlide({
    num: 12,
    section: 'Minh chứng Prototype',
    title: 'Minh chứng Prototype thực tế & Kịch bản kiểm chứng End-to-End',
    message: 'Thông điệp: Prototype đã vận hành hoàn chỉnh từ cổng sinh viên, trang xử lý cán bộ đến bằng chứng email trong Mailpit.',
    notes: 'Người trình bày: Thành viên 3 & Thành viên 4.\n- Trình chiếu 3 ảnh chụp thực tế từ prototype đã chạy kiểm thử giao diện tự động ngày 24/10/2026: (1) Cổng sinh viên nộp hồ sơ và tra cứu mã GXN; (2) Trang cán bộ xử lý với trạng thái tự động hóa Đã thông báo (SYNCED) và chặn thao tác sai trạng thái; (3) Hộp thư Mailpit lưu bằng chứng email thật.\n- Tóm tắt luồng kiểm chứng trên hệ thống: nộp hồ sơ hợp lệ, vòng yêu cầu bổ sung (tăng attempt_no = 2), và thử thao tác sai thứ tự / gửi trùng khóa.'
  });

  s12.addText('1. Cổng dịch vụ Sinh viên (Nộp & Tra cứu)', {
    x: 0.45,
    y: 1.65,
    w: 4.0,
    h: 0.34,
    fontFace: FONT,
    fontSize: 14,
    bold: true,
    color: C.teal,
    margin: 0
  });
  addImageFitted(s12, 'inputs/images/student_full.png', 0.45, 2.02, 4.0, 3.25, true);

  s12.addText('2. Trang Cán bộ (Trạng thái & Nhật ký)', {
    x: 4.66,
    y: 1.65,
    w: 4.0,
    h: 0.34,
    fontFace: FONT,
    fontSize: 14,
    bold: true,
    color: C.navy,
    margin: 0
  });
  addImageFitted(s12, 'inputs/images/staff_detail_top.png', 4.66, 2.02, 4.0, 3.25, true);

  s12.addText('3. Bằng chứng thư trong Mailpit (:8025)', {
    x: 8.88,
    y: 1.65,
    w: 4.0,
    h: 0.34,
    fontFace: FONT,
    fontSize: 14,
    bold: true,
    color: C.blue,
    margin: 0
  });
  addImageFitted(s12, 'inputs/images/mail_crop.png', 8.88, 2.02, 4.0, 3.25, true);

  addCard(s12, {
    x: 0.45,
    y: 5.4,
    w: 12.433,
    h: 1.52,
    title: 'Các luồng nghiệp vụ đã kiểm chứng thực tế trên Prototype (Smoke E2E & Trình duyệt tự động)',
    headerBg: C.navy,
    bullets: [
      'Luồng chuẩn: SV nộp form → n8n tiền kiểm đạt → Cán bộ nhận xử lý, duyệt, cấp giấy → Mailpit nhận email → trạng thái SYNCED.',
      'Luồng bổ sung & An toàn: Cán bộ yêu cầu bổ sung (kèm lý do) → SV gửi lại (attempt_no = 2); chặn thao tác sai thứ tự và replay khóa.'
    ]
  });
}

// ============================================================================
// SLIDE 13: Đánh giá cải tiến & Kiểm thử hệ thống (Dữ liệu mô phỏng – Mục tiêu dự kiến)
// ============================================================================
{
  const s13 = createBaseSlide({
    num: 13,
    section: 'Đánh giá & Kiểm thử',
    title: 'Đánh giá cải tiến qua 20 Seed & Kết quả kiểm thử hệ thống',
    message: 'Thông điệp: Đổi lịch ký kết hợp tự động hóa giúp giảm mạnh thời gian chờ trong mô phỏng; phần mềm giảm thao tác và xóa trễ phát hiện quá hạn.',
    simBadge: 'Dữ liệu mô phỏng – Mục tiêu dự kiến',
    notes: 'Người trình bày: Thành viên 4.\n- Nhấn mạnh phát hiện cốt lõi từ bảng đối chiếu 4 kịch bản qua 20 seed: Nếu chỉ tự động hóa mà vẫn ký theo lô (TO-BE S0), thời gian chờ trước ký KHÔNG giảm (584 so với 551 phút, 0/20 seed tốt hơn). Chỉ khi kết hợp đổi lịch ký 2 lần/ngày (TO-BE S1), chờ trước ký mới giảm còn 121 phút và T_trường giảm từ 1.363 xuống 788 phút (tốt hơn ở 20/20 seed), kể cả khi tỷ lệ bổ sung p không giảm (792 phút).\n- Vai trò thực chất của phần mềm: giảm thao tác cán bộ từ 43 xuống 21 phút/ca và đưa độ trễ phát hiện quá hạn từ 1.239 phút về 0.\n- Báo cáo kết quả kiểm thử: đạt toàn bộ 12 test phân tích, 20 test tự động của prototype, cùng kiểm thử E2E giao diện.'
  });

  s13.addText('Biểu đồ KPI qua 20 Seed (Cột = Trung vị, Vạch = Min–Max)', {
    x: 0.45,
    y: 1.65,
    w: 6.2,
    h: 0.34,
    fontFace: FONT,
    fontSize: 15,
    bold: true,
    color: C.navy,
    margin: 0
  });
  addImageFitted(s13, 'inputs/images/kpi_compare.png', 0.45, 2.02, 6.2, 2.85, true);

  addCard(s13, {
    x: 0.45,
    y: 5.0,
    w: 6.2,
    h: 1.92,
    title: 'Phát hiện cốt lõi & Kết quả kiểm thử kỹ thuật',
    headerBg: C.teal,
    bodyBg: C.tealBg,
    borderColor: C.teal,
    bullets: [
      'Chỉ tự động hóa mà vẫn ký theo lô (S0) KHÔNG giảm chờ ký (584\' vs 551\'). Đổi lịch ký 2 lần/ngày (S1) mới giảm chờ ký còn 121\'.',
      'Phần mềm giúp giảm thao tác cán bộ (43\' → 21\'/ca) và xóa trễ phát hiện quá hạn (1.239\' → 0\'). Đạt 12/12 test phân tích & 20/20 test prototype.'
    ]
  });

  s13.addText('Bảng đối chiếu KPI trung vị qua 20 Seed (Đơn vị: Phút LV)', {
    x: 6.8,
    y: 1.65,
    w: 6.08,
    h: 0.34,
    fontFace: FONT,
    fontSize: 15,
    bold: true,
    color: C.navy,
    margin: 0
  });

  const kpiRows = [
    [
      { text: 'Chỉ số KPI (20 Seed)', options: { bold: true, color: C.white, fill: { color: C.navy } } },
      { text: 'AS-IS', options: { bold: true, color: C.white, fill: { color: C.navy }, align: 'center' } },
      { text: 'S0 (Lô)', options: { bold: true, color: C.white, fill: { color: C.blue }, align: 'center' } },
      { text: 'S1 (2 lần)', options: { bold: true, color: C.white, fill: { color: C.teal }, align: 'center' } },
      { text: 'S1 (p giữ)', options: { bold: true, color: C.white, fill: { color: C.teal }, align: 'center' } },
      { text: 'S1 > AS-IS', options: { bold: true, color: C.white, fill: { color: C.green }, align: 'center' } }
    ],
    [
      { text: 'K1: Trung vị T_trường', options: { bold: true, fill: { color: C.white } } },
      { text: '1.363', options: { align: 'center', fill: { color: C.white } } },
      { text: '944', options: { align: 'center', fill: { color: C.white } } },
      { text: '788', options: { bold: true, color: C.teal, align: 'center', fill: { color: C.white } } },
      { text: '792', options: { align: 'center', fill: { color: C.white } } },
      { text: '20/20', options: { bold: true, color: C.green, align: 'center', fill: { color: C.white } } }
    ],
    [
      { text: 'K2: P90 T_trường_net', options: { bold: true, fill: { color: C.altRow } } },
      { text: '1.780', options: { align: 'center', fill: { color: C.altRow } } },
      { text: '1.356', options: { align: 'center', fill: { color: C.altRow } } },
      { text: '804', options: { bold: true, color: C.teal, align: 'center', fill: { color: C.altRow } } },
      { text: '810', options: { align: 'center', fill: { color: C.altRow } } },
      { text: '20/20', options: { bold: true, color: C.green, align: 'center', fill: { color: C.altRow } } }
    ],
    [
      { text: 'K3: Chờ trước ký', options: { bold: true, fill: { color: C.white } } },
      { text: '551', options: { align: 'center', fill: { color: C.white } } },
      { text: '584', options: { bold: true, color: C.red, align: 'center', fill: { color: C.white } } },
      { text: '121', options: { bold: true, color: C.teal, align: 'center', fill: { color: C.white } } },
      { text: '120', options: { align: 'center', fill: { color: C.white } } },
      { text: '20/20 (S0: 0)', options: { bold: true, color: C.green, align: 'center', fill: { color: C.white } } }
    ],
    [
      { text: 'K4: Thao tác cán bộ/ca', options: { bold: true, fill: { color: C.altRow } } },
      { text: '43', options: { align: 'center', fill: { color: C.altRow } } },
      { text: '21', options: { bold: true, color: C.teal, align: 'center', fill: { color: C.altRow } } },
      { text: '21', options: { bold: true, color: C.teal, align: 'center', fill: { color: C.altRow } } },
      { text: '23', options: { align: 'center', fill: { color: C.altRow } } },
      { text: '20/20', options: { bold: true, color: C.green, align: 'center', fill: { color: C.altRow } } }
    ],
    [
      { text: 'Trễ phát hiện quá hạn', options: { bold: true, fill: { color: C.white } } },
      { text: '1.239', options: { bold: true, color: C.red, align: 'center', fill: { color: C.white } } },
      { text: '0', options: { bold: true, color: C.teal, align: 'center', fill: { color: C.white } } },
      { text: '0', options: { bold: true, color: C.teal, align: 'center', fill: { color: C.white } } },
      { text: '0', options: { bold: true, color: C.teal, align: 'center', fill: { color: C.white } } },
      { text: 'Xóa trễ', options: { bold: true, color: C.green, align: 'center', fill: { color: C.white } } }
    ],
    [
      { text: 'K9: Tỷ lệ bổ sung (p)', options: { bold: true, fill: { color: C.altRow } } },
      { text: '30,1%', options: { align: 'center', fill: { color: C.altRow } } },
      { text: '15,6%', options: { align: 'center', fill: { color: C.altRow } } },
      { text: '15,6%', options: { align: 'center', fill: { color: C.altRow } } },
      { text: '30,1%', options: { align: 'center', fill: { color: C.altRow } } },
      { text: 'Tham số', options: { color: C.muted, align: 'center', fill: { color: C.altRow } } }
    ]
  ];

  s13.addTable(kpiRows, {
    x: 6.8,
    y: 2.02,
    w: 6.08,
    colW: [2.03, 0.75, 0.78, 0.82, 0.82, 0.88],
    rowH: [0.46, 0.65, 0.65, 0.68, 0.65, 0.65, 0.65],
    fontFace: FONT,
    fontSize: 14,
    color: C.text,
    border: { type: 'solid', color: C.border, pt: 0.75 },
    valign: 'middle',
    margin: [3, 4, 3, 4]
  });
}

// ============================================================================
// SLIDE 14: Giới hạn nghiên cứu và kế hoạch tiếp theo
// ============================================================================
{
  const s14 = createBaseSlide({
    num: 14,
    section: 'Giới hạn & Lộ trình',
    title: 'Giới hạn nghiên cứu & Lộ trình thí điểm thực tế',
    message: 'Thông điệp: Kết quả mô phỏng chỉ minh họa phương pháp; cần thu thập nhật ký thực tế tại trường để hiệu chỉnh và kiểm định.',
    simBadge: 'Dữ liệu mô phỏng',
    notes: 'Người trình bày: Thành viên 1.\n- Thẳng thắn nêu 6 điều không được kết luận vội từ mô phỏng (hiệu quả thực tế tại trường, tự động hóa đơn thuần làm giảm chờ ký, form web chắc chắn giảm một nửa tỷ lệ bổ sung, hay ngoại suy cho mùa cao điểm/nhiều cán bộ).\n- Trình bày kế hoạch thu thập dữ liệu thực từ sổ tiếp nhận, phiếu trình, sổ văn thư và hộp thư.\n- Đề xuất lộ trình 3 bước chuyển từ prototype học thuật sang thí điểm thực tế tại Phòng CTHSSV.'
  });

  addCard(s14, {
    x: 0.45,
    y: 1.68,
    w: 6.1,
    h: 3.1,
    title: '1. Giới hạn của nghiên cứu hiện tại',
    headerBg: C.amber,
    bodyBg: C.amberBg,
    borderColor: C.amberBorder,
    bullets: [
      'Tham số thời gian và tỷ lệ giảm bổ sung (30,1% → 15,6%) là giả định đầu vào, không phải số đo thực tế tại trường.',
      'Mô hình giả sử cố định 1 cán bộ tiếp nhận, 1 người ký, chưa loại trừ ngày lễ 30/4–1/5 và chưa xét mùa cao điểm.',
      'Tỷ lệ đóng quá hạn giữ ở mức 12,7–14,2% do mô hình giữ cố định hành vi phản hồi của sinh viên.'
    ]
  });

  addCard(s14, {
    x: 6.78,
    y: 1.68,
    w: 6.1,
    h: 3.1,
    title: '2. Kế hoạch thu thập nhật ký thực tế tại trường',
    headerBg: C.navy,
    bullets: [
      'Sổ tiếp nhận (A02) & Phiếu trình ký (A06/A07): ghi nhận mốc giờ nhận đơn và giờ trình/ký thực tế thay vì chỉ ghi ngày.',
      'Sổ văn thư (A08) & Hộp thư/Zalo (A04/A11/A14): đo thời gian chuyển đóng dấu và bằng chứng gửi thông báo.',
      'Bật đầy đủ bộ hẹn giờ tự động nhắc hạn (A16) và đóng hồ sơ quá hạn (A13) trên bản prototype trước khi thí điểm.'
    ]
  });

  s14.addText('3. Lộ trình 3 bước từ Prototype học thuật đến Thí điểm thực tế', {
    x: 0.45,
    y: 4.92,
    w: 12.433,
    h: 0.36,
    fontFace: FONT,
    fontSize: 16,
    bold: true,
    color: C.teal,
    margin: 0
  });

  const steps = [
    {
      step: 'Bước 1 · Chuẩn hóa ghi nhận',
      desc: 'Thống nhất mã hồ sơ và biểu mẫu ghi mốc giờ tại Phòng CTHSSV trong 4–6 tuần để lấy dữ liệu nền (baseline).',
      color: C.navy
    },
    {
      step: 'Bước 2 · Thí điểm & Hiệu chỉnh',
      desc: 'Vận hành thử nghiệm cổng web + n8n song song sổ tay; nạp event log thật vào PM4Py để hiệu chỉnh tham số mô phỏng.',
      color: C.teal
    },
    {
      step: 'Bước 3 · Đo kiểm định kỳ',
      desc: 'Đo kiểm KPI hằng tuần (T_trường, chờ trước ký, tỷ lệ bổ sung thực tế) và đề xuất khung giờ ký cố định phù hợp.',
      color: C.blue
    }
  ];

  steps.forEach((st, idx) => {
    const sx = 0.45 + idx * 4.21;
    s14.addShape(pres.ShapeType.roundRect, {
      x: sx,
      y: 5.34,
      w: 4.01,
      h: 1.58,
      rectRadius: 0.06,
      fill: { color: C.white },
      line: { color: st.color, width: 1.5 }
    });
    s14.addShape(pres.ShapeType.roundRect, {
      x: sx,
      y: 5.34,
      w: 4.01,
      h: 0.4,
      rectRadius: 0.06,
      fill: { color: st.color },
      line: { color: st.color, width: 0 }
    });
    s14.addText(st.step, {
      x: sx + 0.12,
      y: 5.34,
      w: 3.77,
      h: 0.4,
      fontFace: FONT,
      fontSize: 15,
      bold: true,
      color: C.white,
      valign: 'middle',
      margin: 0
    });
    s14.addText(st.desc, {
      x: sx + 0.14,
      y: 5.8,
      w: 3.73,
      h: 1.05,
      fontFace: FONT,
      fontSize: 14,
      color: C.text,
      valign: 'top',
      margin: 0
    });
  });
}

// Write presentation to output/slide.pptx
const outPath = path.join(outDir, 'slide.pptx');
pres.writeFile({ fileName: outPath }).then(() => {
  console.log('Successfully generated:', outPath);
}).catch((err) => {
  console.error('Error generating presentation:', err);
  process.exit(1);
});
