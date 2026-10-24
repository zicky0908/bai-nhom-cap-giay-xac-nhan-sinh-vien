// Dựng slide nhóm bản Claude (13 slide, 16:9). Chạy trong thư mục này:
//   NODE_PATH=../node_modules PPTX_SKILL=<thư mục skill pptx> node build_deck.js
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");

const THEME = {
  name: "Teal Clinic",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1B2A33", lt1: "FFFFFF", dk2: "0E4A50", lt2: "EEF5F4",
    accent1: "0E7C74", accent2: "E39B2D", accent3: "C2453B", accent4: "5B8C85",
    accent5: "9DBFB9", accent6: "3D5A66", hlink: "0E7C74", folHlink: "5B8C85",
  },
};
const HEX = THEME.colors;
const OUT = "../../Slide-Claude.pptx";
const IMG = "../../hinh-anh/";
const FIG = { asis: IMG + "01-bpmn-as-is.png", tobe: IMG + "02-bpmn-to-be.png", dfg: IMG + "03-dfg-as-is.png" };
const LABEL_SIM = "Dữ liệu mô phỏng";

async function icon(Comp, hex, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + hex, size: String(size) }));
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
  pres.title = "Cấp giấy xác nhận sinh viên: phân tích và tự động hóa quy trình";
  pres.author = "Nhóm 4";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  const W = 13.33, M = 0.6;

  // ---- layouts ----
  pres.defineSlideMaster({
    title: "DARK", background: { color: HEX.dk2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: M, y: 2.2, w: 11.6, h: 1.8, fontSize: 38, bold: true, color: C.background1, valign: "bottom", align: "left" }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: M, y: 4.2, w: 11.6, h: 2.6, fontSize: 18, color: C.accent5, valign: "top" }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "CONTENT", background: { color: HEX.lt1 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: M, y: 0.4, w: 12.1, h: 0.8, fontSize: 26, bold: true, color: C.text2, valign: "middle", align: "left" }, text: "" } },
      { text: { text: "Nhóm 4 · Cao đẳng Y Dược", options: { x: M, y: 7.05, w: 6, h: 0.3, fontSize: 10, color: C.accent4 } } },
    ],
    slideNumber: { x: 12.3, y: 7.05, w: 0.5, h: 0.3, fontSize: 10, color: HEX.accent4 },
  });

  const add = (section, master = "CONTENT") => pres.addSlide({ masterName: master, sectionTitle: section });
  const T = (slide, text) => slide.addText(text, { placeholder: "title" });
  const box = (slide, text, o) => slide.addText(text, { isTextBox: true, margin: 0, fontSize: 14, color: C.text1, valign: "top", ...o });
  const simTag = (slide, x = 10.2, y = 6.98) => slide.addText(LABEL_SIM, {
    isTextBox: true, shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.08, x, y, w: 1.85, h: 0.38,
    fill: { color: HEX.accent2, transparency: 82 }, color: C.accent3, fontSize: 11, bold: true, align: "center", valign: "middle", margin: 0,
    objectName: "nhan-du-lieu-mo-phong" });
  const card = (slide, x, y, w, h, name, fill = HEX.lt2) => slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: { color: fill }, objectName: name });
  const circleIcon = async (slide, Comp, x, y, d = 0.62, bg = HEX.accent1, name = "icon") => {
    slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: bg }, line: { color: bg }, objectName: name + "-nen" });
    slide.addImage({ data: await icon(Comp, "FFFFFF"), x: x + d * 0.22, y: y + d * 0.22, w: d * 0.56, h: d * 0.56, objectName: name });
  };
  const picture = (slide, path, x, y, w, ratio, name) => slide.addImage({ path, x, y, w, h: w / ratio, objectName: name, altText: name });

  // ---- 1. Tiêu đề ----
  pres.addSection({ title: "Mở đầu" });
  let s = add("Mở đầu", "DARK");
  s.addText("Cấp giấy xác nhận sinh viên: phân tích và tự động hóa quy trình", { placeholder: "title" });
  s.addText("Trường Cao đẳng Y Dược (bối cảnh giả định cho mục đích học thuật)\nNhóm 4 · TV1, TV2, TV3, TV4", { placeholder: "body" });
  await circleIcon(s, fa.FaFileSignature, M, 1.1, 0.9, HEX.accent1, "icon-tieu-de");
  s.addNotes("TV1 mở đầu: giới thiệu đề tài và 4 thành viên. Nhấn mạnh: bối cảnh và số liệu là giả định/mô phỏng cho mục đích học thuật, không phải số liệu chính thức của trường.");

  // ---- 2. Bài toán ----
  pres.addSection({ title: "Bài toán và quy trình hiện tại" });
  s = add("Bài toán và quy trình hiện tại");
  T(s, "SV không biết hồ sơ đang ở đâu, cán bộ không đo được chỗ chậm");
  const problems = [
    [fa.FaSearch, "Không tra được trạng thái", "Số thứ tự ghi sổ lúc tiếp nhận không báo cho SV, nên SV phải hỏi lại nhiều lần"],
    [fa.FaRedo, "Thiếu hồ sơ phát hiện muộn", "Thông tin thiếu/sai chỉ lộ ra khi kiểm tra, dẫn tới bổ sung nhiều vòng"],
    [fa.FaSignature, "Chờ ký lâu", "Hồ sơ đã soạn nằm chờ phiên ký theo lô"],
    [fa.FaCalendarTimes, "Quá hạn chỉ lộ khi rà sổ", "Không có mốc thời gian hệ thống; rà hồ sơ quá hạn mỗi chiều thứ Sáu"],
    [fa.FaPhoneSlash, "Thông báo không lưu vết", "Báo kết quả qua điện thoại/Zalo, không có bằng chứng đã báo"],
  ];
  for (let i = 0; i < problems.length; i++) {
    const [Ic, head, body] = problems[i];
    const y = 1.45 + i * 1.07;
    await circleIcon(s, Ic, M, y, 0.62, i === 2 ? HEX.accent2 : HEX.accent1, `icon-van-de-${i + 1}`);
    box(s, [{ text: head, options: { bold: true, fontSize: 17, color: C.text2, breakLine: true } },
            { text: body, options: { fontSize: 14, color: C.text1 } }], { x: M + 0.85, y: y - 0.02, w: 6.6, h: 0.95, objectName: `van-de-${i + 1}` });
  }
  card(s, 8.4, 1.45, 4.33, 5.2, "the-muc-tieu");
  box(s, [{ text: "Mục tiêu (dự kiến)", options: { bold: true, fontSize: 18, color: C.text2, breakLine: true } },
          { text: "Có mã hồ sơ, tra được trạng thái", options: { bullet: true, breakLine: true } },
          { text: "Kiểm tra đủ/thiếu ngay khi nộp", options: { bullet: true, breakLine: true } },
          { text: "Tách thời gian chờ và thời gian xử lý", options: { bullet: true, breakLine: true } },
          { text: "Nhắc hạn, đóng hồ sơ quá hạn đúng hạn", options: { bullet: true, breakLine: true } },
          { text: "Thông báo có lưu vết và có lý do", options: { bullet: true } }],
      { x: 8.7, y: 1.7, w: 3.8, h: 4.8, fontSize: 15, paraSpaceAfter: 8, objectName: "muc-tieu" });
  s.addNotes("TV1: 5 vấn đề P1–P5 là giả thuyết, cần phỏng vấn cán bộ để xác minh. Vấn đề tô màu cam (chờ ký) là ứng viên điểm nghẽn mà phần Process Mining sẽ kiểm chứng.");

  // ---- 3. Tổng quan ----
  s = add("Bài toán và quy trình hiện tại");
  T(s, "Một hồ sơ đi từ lúc nộp tới một trong ba trạng thái kết thúc");
  const sipoc = [["Bên tham gia", "Sinh viên · Cán bộ CTHSSV · Lãnh đạo phòng · Văn thư · Phòng Đào tạo (nguồn tra cứu)"],
                 ["Đầu vào", "MSSV, họ tên, lớp/khoa, loại giấy, mục đích, số bản, email, giấy tờ kèm theo"],
                 ["Bắt đầu", "Sinh viên nộp yêu cầu"],
                 ["Kết thúc", "E1 nhận giấy · E2 bị từ chối có lý do · E3 đóng do quá hạn bổ sung"],
                 ["Đầu ra", "Giấy đã ký, đóng dấu hoặc thông báo từ chối; nhật ký sự kiện"]];
  sipoc.forEach(([k, v], i) => {
    const x = M + i * 2.46;
    card(s, x, 1.5, 2.3, 2.45, `sipoc-${i + 1}`, i === 3 ? HEX.dk2 : HEX.lt2);
    box(s, [{ text: k, options: { bold: true, fontSize: 16, color: i === 3 ? C.background1 : C.text2, breakLine: true } },
            { text: v, options: { fontSize: 13.5, color: i === 3 ? C.background1 : C.text1 } }],
        { x: x + 0.2, y: 1.7, w: 1.9, h: 2.15, paraSpaceAfter: 6, objectName: `sipoc-chu-${i + 1}` });
  });
  box(s, [{ text: "Hai mốc đo thời gian", options: { bold: true, fontSize: 18, color: C.text2, breakLine: true } },
          { text: "Thời gian phía trường: ", options: { bold: true } },
          { text: "từ lúc nộp tới lúc SV biết kết quả. Đây là phần trường kiểm soát được.", options: { breakLine: true } },
          { text: "Thời gian phía SV: ", options: { bold: true } },
          { text: "thêm khoảng SV chuẩn bị bổ sung và đến nhận giấy. Tách riêng để không đổ lỗi cho trường." }],
      { x: M, y: 4.3, w: 12.1, h: 1.8, fontSize: 16, paraSpaceAfter: 6, objectName: "hai-moc-do" });
  s.addNotes("TV1: phạm vi từ lúc nộp tới E1/E2/E3. Ngoài phạm vi: ký số, giá trị pháp lý, tích hợp CSDL của trường. Giả định giờ làm việc T2–T6, 7:30–11:30 và 13:30–17:00.");

  // ---- 4. AS-IS ----
  s = add("Bài toán và quy trình hiện tại");
  T(s, "Quy trình hiện tại: 4 vai trò, nhiều bước làm tay, một vòng bổ sung");
  picture(s, FIG.asis, M, 1.45, 12.1, 3.48, "bpmn-as-is");
  box(s, [{ text: "Đọc sơ đồ: ", options: { bold: true, color: C.text2 } },
          { text: "kiểm tra có 3 nhánh (đủ, thiếu, không đủ tư cách); thiếu thì báo SV bổ sung và chờ tới hạn 7 ngày làm việc; quá hạn chỉ được phát hiện khi rà sổ chiều thứ Sáu; lãnh đạo ký theo lô thứ Ba và thứ Năm." }],
      { x: M, y: 5.2, w: 12.1, h: 1.1, fontSize: 15, objectName: "doc-so-do-as-is" });
  s.addNotes("TV2: sơ đồ BPMN 2.0, file chỉnh sửa được ở 03-so-do-quy-trinh/as-is.bpmn (mở bằng bpmn.io). Chỉ ra vòng A03→A04→A05→A03 và nhánh từ chối A10→A14.");

  // ---- 5. Bottleneck ----
  s = add("Bài toán và quy trình hiện tại");
  T(s, "Bốn vị trí có thể gây trễ, để dữ liệu kiểm chứng");
  const hs = [["H1", "Chờ ký", "Soạn giấy → lãnh đạo ký", "Ký theo lô, người ký vắng", "Kéo dài thời gian phía trường; SV hỏi lại", true],
              ["H2", "Vòng bổ sung", "Kiểm tra → báo bổ sung → nộp lại", "Biểu mẫu không nêu rõ giấy tờ", "Làm lại nhiều lần; tăng hồ sơ bị đóng quá hạn", false],
              ["H3", "Chờ kiểm tra", "Tiếp nhận → kiểm tra", "Cán bộ kiêm nhiệm, tra cứu tay", "Ứ đọng đầu vào, tuổi hồ sơ tăng", false],
              ["H4", "Chờ chuyển giấy", "Lãnh đạo ký → văn thư", "Giấy đã ký chờ chuyển theo lô", "Thêm thời gian mà không ai theo dõi", false]];
  hs.forEach(([code, name, where, cause, impact, hot], i) => {
    const x = M + i * 3.05;
    card(s, x, 1.45, 2.85, 3.2, `gia-thuyet-${code}`, hot ? HEX.accent2 : HEX.lt2);
    box(s, [{ text: code, options: { bold: true, fontSize: 30, fontFace: THEME.headFontFace, color: hot ? C.background1 : C.accent1, breakLine: true } },
            { text: name, options: { bold: true, fontSize: 17, color: hot ? C.background1 : C.text2, breakLine: true } },
            { text: where, options: { fontSize: 13.5, color: hot ? C.background1 : C.text1, breakLine: true } },
            { text: "Nguyên nhân giả định: " + cause, options: { fontSize: 13, italic: true, color: hot ? C.background1 : C.accent6, breakLine: true } },
            { text: "Ảnh hưởng: " + impact, options: { fontSize: 13, bold: true, color: hot ? C.background1 : C.text2 } }],
        { x: x + 0.2, y: 1.6, w: 2.45, h: 2.95, paraSpaceAfter: 4, objectName: `chu-gia-thuyet-${code}` });
  });
  box(s, [{ text: "Tiêu chí công bố trước khi chạy dữ liệu", options: { bold: true, fontSize: 18, color: C.text2, breakLine: true } },
          { text: "(a) Trung vị thời gian chờ thuộc 3 chuyển tiếp lớn nhất", options: { bullet: true, breakLine: true } },
          { text: "(b) Ít nhất 50% số ca qua chuyển tiếp chờ quá 1 ngày làm việc (450 phút)", options: { bullet: true, breakLine: true } },
          { text: "(f) Chuyển tiếp xuất hiện ở ít nhất 10% số ca", options: { bullet: true, breakLine: true } },
          { text: "Đạt cả ba mới gọi là ứng viên điểm nghẽn; chỉ nêu nguyên nhân khi có bằng chứng (lịch ký, cỡ lô).", options: { italic: true, color: C.accent6 } }],
      { x: M, y: 4.85, w: 12.1, h: 2.0, fontSize: 15, paraSpaceAfter: 4, objectName: "tieu-chi-nghen" });
  s.addNotes("TV2: không kết luận nguyên nhân chỉ từ một con số lớn. Thời gian SV đến nhận giấy (A11→A12) không tính là điểm nghẽn của trường. H1 tô cam vì là ứng viên dữ liệu sẽ xác nhận ở slide 7.");

  // ---- 6. Dữ liệu mô phỏng ----
  pres.addSection({ title: "Process Mining" });
  s = add("Process Mining");
  T(s, "Hai kịch bản được mô phỏng trên cùng một dòng hồ sơ đến");
  simTag(s);
  [["400", "hồ sơ mỗi lần chạy, 12 tuần"], ["20", "seed ngẫu nhiên, ghép cặp từng hồ sơ"], ["7", "cấu hình: AS-IS, TO-BE S0/S1 × 3 mức bổ sung"]]
    .forEach(([n, l], i) => {
      box(s, n, { x: M + i * 4.05, y: 1.45, w: 3.8, h: 0.95, fontSize: 54, bold: true, fontFace: THEME.headFontFace, color: C.accent1, objectName: `so-lieu-${i + 1}` });
      box(s, l, { x: M + i * 4.05, y: 2.4, w: 3.8, h: 0.6, fontSize: 14, color: C.accent6, objectName: `nhan-so-lieu-${i + 1}` });
    });
  const rowsParam = [
    ["Tham số", "AS-IS", "TO-BE", "Lý do"],
    ["Lịch ký của lãnh đạo", "Lô thứ Ba, thứ Năm 14:00", "S1: 10:30 và 16:00 mỗi ngày · S0: giữ lô", "Tách tác động của lịch ký"],
    ["Xác suất phải bổ sung (lần 1 / sau)", "0,30 / 0,15", "0,15 / 0,08 · độ nhạy 0,22 và 0,30", "Chưa có căn cứ, nên chạy độ nhạy"],
    ["Phát hiện quá hạn bổ sung", "Rà sổ thứ Sáu 15:00", "Timer đúng hạn", "Thay đổi P4"],
    ["Giữ nguyên ở cả hai", "Số hồ sơ, loại giấy, hành vi SV, 1 cán bộ tiếp nhận", "", "Cùng cơ sở so sánh"]];
  s.addTable(rowsParam.map((r, i) => r.map(c => ({ text: c, options: { bold: i === 0, color: i === 0 ? HEX.lt1 : HEX.dk1, fill: { color: i === 0 ? HEX.dk2 : (i % 2 ? HEX.lt2 : HEX.lt1) } } }))),
    { x: M, y: 3.2, w: 12.1, colW: [3.0, 3.0, 3.5, 2.6], fontSize: 13, fontFace: THEME.bodyFontFace, border: { type: "solid", color: "D5E3E1", pt: 0.75 }, valign: "middle", rowH: 0.62, objectName: "bang-tham-so" });
  s.addNotes("TV3: mô phỏng sự kiện rời rạc, cùng seed cho ra cùng log. Mọi tham số là giả định; xác suất bổ sung của TO-BE chưa có căn cứ nên luôn báo kèm độ nhạy. Code và event log CSV ở thư mục 04-process-mining/.");

  // ---- 7. Kết quả mining ----
  s = add("Process Mining");
  T(s, "Chờ ký là ứng viên điểm nghẽn duy nhất đạt đủ ba tiêu chí");
  simTag(s);
  picture(s, FIG.dfg, M, 1.4, 8.3, 2.22, "dfg-as-is");
  card(s, 9.2, 1.4, 3.5, 3.75, "the-ket-qua-dfg");
  box(s, [{ text: "621", options: { bold: true, fontSize: 48, fontFace: THEME.headFontFace, color: C.accent3, breakLine: true } },
          { text: "phút làm việc: trung vị chờ từ soạn giấy tới lúc ký (A06→A07), seed 20260302", options: { fontSize: 14, breakLine: true } },
          { text: "63% số ca chờ quá 1 ngày làm việc; xuất hiện ở 369/400 ca", options: { fontSize: 14, bold: true, color: C.text2 } }],
      { x: 9.45, y: 1.6, w: 3.0, h: 3.4, paraSpaceAfter: 8, objectName: "chu-ket-qua-dfg" });
  box(s, [{ text: "Biến thể (seed 20260302): ", options: { bold: true, color: C.text2 } },
          { text: "62,3% đi thẳng; 18,5% bổ sung 1 vòng rồi nhận giấy; 3,5% bổ sung 2 vòng; 4,5% bổ sung rồi bị đóng quá hạn.", options: { breakLine: true } },
          { text: "AS-IS qua 20 seed: ", options: { bold: true, color: C.text2 } },
          { text: "cycle time phía trường trung vị 1.363 phút (P90 2.816); rework: 30,1% hồ sơ phải bổ sung, trung bình 0,35 vòng lặp A03→A04→A05→A03 mỗi hồ sơ." }],
      { x: M, y: 5.35, w: 12.1, h: 1.3, fontSize: 14.5, paraSpaceAfter: 4, objectName: "bien-the" });
  s.addNotes("TV3: DFG dựng bằng PM4Py (discover_dfg), thời gian chờ tính bằng pandas theo phút làm việc. Cạnh đỏ đạt (a)+(b)+(f); cạnh vàng chỉ đạt (a). Cạnh A01→A02 vàng phần lớn do quy ước làm tròn giờ nộp về 7:30, không phải xếp hàng thật.");

  // ---- 8. Tính tay ----
  s = add("Process Mining");
  T(s, "Công thức trong code khớp số tính tay trên hồ sơ mẫu");
  simTag(s);
  const hc = [["Hồ sơ mẫu", "Biến thể", "Thời gian phía trường", "Chờ ký", "Ghi chú"],
              ["C001", "Đi thẳng, được duyệt", "843", "555", "Khớp test tự động"],
              ["C002", "Bổ sung 1 vòng", "1.693", "585", "Khớp test tự động"],
              ["C003", "Không đủ tư cách", "1.233", "–", "Khớp test tự động"],
              ["C004", "Quá hạn bổ sung, đóng", "5.740", "–", "Trễ phát hiện 2.130; ròng khi đóng 2.235"]];
  s.addTable(hc.map((r, i) => r.map((c, j) => ({ text: c, options: { bold: i === 0 || j === 0, align: j >= 2 && j <= 3 ? "right" : "left", color: i === 0 ? HEX.lt1 : HEX.dk1, fill: { color: i === 0 ? HEX.dk2 : (i % 2 ? HEX.lt2 : HEX.lt1) } } }))),
    { x: M, y: 1.5, w: 8.2, colW: [1.15, 2.25, 1.75, 0.95, 2.1], fontSize: 14, fontFace: THEME.bodyFontFace, border: { type: "solid", color: "D5E3E1", pt: 0.75 }, valign: "middle", rowH: 0.62, objectName: "bang-tinh-tay" });
  box(s, "Đơn vị: phút làm việc (1 ngày = 450 phút).", { x: M, y: 4.75, w: 8.2, h: 0.35, fontSize: 12, color: C.accent6, objectName: "don-vi-tinh-tay" });
  await circleIcon(s, fa.FaCheckDouble, 9.4, 1.5, 0.75, HEX.accent1, "icon-kiem-thu");
  box(s, [{ text: "12 test tự động đều đạt", options: { bold: true, fontSize: 18, color: C.text2, breakLine: true } },
          { text: "Hàm lịch làm việc khớp bộ tính tay C001–C004", options: { bullet: true, breakLine: true } },
          { text: "Hàm tính KPI kiểm trực tiếp trên ca C001", options: { bullet: true, breakLine: true } },
          { text: "Log mô phỏng đúng quy tắc: start trước complete, chỉ đóng dấu sau khi duyệt", options: { bullet: true, breakLine: true } },
          { text: "Codex và Antigravity (Gemini) rà code 2 đợt; lỗi tìm được đã sửa trước khi chốt số", options: { bullet: true } }],
      { x: 9.4, y: 2.45, w: 3.3, h: 4.2, fontSize: 14, paraSpaceAfter: 6, objectName: "kiem-thu" });
  s.addNotes("TV3: bộ tính tay ở mục 4.6 báo cáo. Không nói 'khớp 100% mọi ca': test gọi hàm KPI trực tiếp mới có ca C001. Kể ngắn về lỗi tìm được: thời gian xử lý từng bị tính cả giờ nghỉ trưa.");

  // ---- 9. TO-BE ----
  pres.addSection({ title: "Quy trình cải tiến và prototype" });
  s = add("Quy trình cải tiến và prototype");
  T(s, "TO-BE: bỏ bước thừa, tự động hóa giấy tờ và thông báo");
  picture(s, FIG.tobe, M, 1.3, 12.1, 3.0, "bpmn-to-be");
  const changes = [["Kiểm soát lại", "Form web có checklist; ký 2 khung giờ/ngày; báo văn thư ngay"],
                   ["Tự động hóa", "Mã hồ sơ, sinh giấy từ mẫu, email bổ sung, nhắc hạn, đóng quá hạn"],
                   ["Loại bỏ", "Bước ghi lý do từ chối riêng (gộp vào bước duyệt, bắt buộc lý do)"],
                   ["Giữ nguyên", "Lãnh đạo quyết định; ký và đóng dấu giấy; tiêu chí tư cách"]];
  changes.forEach(([k, v], i) => {
    const x = M + i * 3.05;
    box(s, [{ text: k, options: { bold: true, fontSize: 15, color: C.accent1, breakLine: true } }, { text: v, options: { fontSize: 13 } }],
        { x, y: 5.5, w: 2.85, h: 1.3, objectName: `thay-doi-${i + 1}` });
  });
  s.addNotes("TV2: ô nền xanh là bước hệ thống tự làm. A05 (SV nộp bổ sung) nằm ở làn Sinh viên. File chỉnh sửa: 03-so-do-quy-trinh/to-be.bpmn. Lưu ý prototype demo hiện thực một phần TO-BE (chưa có nhắc hạn và đóng quá hạn tự động).");

  // ---- 10. Kiến trúc prototype ----
  s = add("Quy trình cải tiến và prototype");
  T(s, "Prototype: app ghi trạng thái, n8n điều phối, Mailpit lưu email");
  const svc = [[fa.FaDesktop, "Web app (FastAPI)", "Giao diện SV, cán bộ, phân tích. Bên duy nhất ghi trạng thái và nhật ký"],
               [fa.FaDatabase, "PostgreSQL", "Data source: hồ sơ, nhật ký sự kiện, hàng đợi thông báo"],
               [fa.FaProjectDiagram, "n8n Community", "Nhận webhook, tiền kiểm, gọi chuyển trạng thái, gửi email, callback"],
               [fa.FaEnvelopeOpenText, "Mailpit", "Hộp thư thử nghiệm local, không gửi ra Internet"]];
  for (let i = 0; i < svc.length; i++) {
    const [Ic, name, desc] = svc[i]; const x = M + i * 3.05;
    card(s, x, 1.45, 2.85, 2.35, `dich-vu-${i + 1}`);
    await circleIcon(s, Ic, x + 0.2, 1.6, 0.6, i === 2 ? HEX.accent2 : HEX.accent1, `icon-dich-vu-${i + 1}`);
    box(s, [{ text: name, options: { bold: true, fontSize: 16, color: C.text2, breakLine: true } }, { text: desc, options: { fontSize: 13 } }],
        { x: x + 0.2, y: 2.3, w: 2.45, h: 1.45, objectName: `chu-dich-vu-${i + 1}` });
  }
  box(s, "Workflow n8n đáp ứng yêu cầu tối thiểu", { x: M, y: 4.1, w: 12.1, h: 0.45, fontSize: 18, bold: true, color: C.text2, objectName: "tieu-de-workflow" });
  const req = [["Trigger", "Webhook nhận yêu cầu từ web"], ["Data source", "Đọc hồ sơ và dữ liệu SV qua API"],
               ["Condition", "IF tiền kiểm? · IF đủ điều kiện và đủ thông tin?"], ["4 actions", "Ghi đạt · ghi yêu cầu bổ sung · xác nhận đồng bộ · phản hồi"],
               ["Notification", "Gửi email qua Mailpit (SMTP)"]];
  req.forEach(([k, v], i) => {
    const x = M + i * 2.46;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.65, w: 2.3, h: 1.75, rectRadius: 0.1, fill: { color: HEX.lt1 }, line: { color: HEX.accent5, width: 1 }, objectName: `yeu-cau-${i + 1}` });
    box(s, [{ text: k, options: { bold: true, fontSize: 15, color: C.accent1, breakLine: true } }, { text: v, options: { fontSize: 12.5 } }],
        { x: x + 0.15, y: 4.8, w: 2.0, h: 1.5, objectName: `chu-yeu-cau-${i + 1}` });
  });
  s.addNotes("TV4: prototype hiện thực luồng cốt lõi, gộp một số bước so với BPMN TO-BE và chưa có timer nhắc hạn A16 / tự đóng quá hạn A13. Trang Analytics trong app dùng 120 ca (seed 43044) để minh họa trực tiếp; KPI chính thức lấy từ bộ 20 seed × 400 ca. Giảng viên đã đồng ý thay Power Automate bằng n8n tự host. Giao diện chỉ báo 'đã thông báo' khi n8n callback về (SYNCED); n8n lỗi thì hồ sơ giữ PENDING/FAILED, không báo thành công giả. Gửi lại cùng khóa không tạo hồ sơ trùng.");

  // ---- 11. Màn hình prototype ----
  s = add("Quy trình cải tiến và prototype");
  T(s, "Một hồ sơ chạy thật: từ form nộp tới email thử nghiệm");
  picture(s, IMG + "07-man-hinh-sinh-vien.png", M, 1.4, 3.9, 1.6, "man-hinh-sinh-vien");
  picture(s, IMG + "08-man-hinh-can-bo-chi-tiet.png", M + 4.1, 1.4, 3.9, 1.63, "man-hinh-can-bo");
  picture(s, IMG + "09-email-mailpit.png", M + 8.2, 1.4, 3.9, 2.03, "man-hinh-mailpit");
  [["1. Sinh viên nộp form", "Nhận mã hồ sơ GXN-…; n8n tiền kiểm tự động"],
   ["2. Cán bộ nhận xử lý, duyệt, cấp giấy", "Mỗi bước ghi start/complete; thao tác sai thứ tự bị từ chối"],
   ["3. Email trong Mailpit", "Có bằng chứng thư; trạng thái đổi sang 'Đã thông báo'"]]
    .forEach(([k, v], i) => box(s, [{ text: k, options: { bold: true, fontSize: 15, color: C.text2, breakLine: true } }, { text: v, options: { fontSize: 13 } }],
      { x: M + i * 4.1, y: 4.2, w: 3.9, h: 1.2, objectName: `buoc-demo-${i + 1}` }));
  box(s, "Đã chạy thử qua giao diện ngày 24/10/2026: luồng cấp giấy và vòng yêu cầu bổ sung đều đạt.", { x: M, y: 5.75, w: 12.1, h: 0.5, fontSize: 14, italic: true, color: C.accent6, objectName: "ghi-chu-chay-thu" });
  s.addNotes("TV4: phần demo trực tiếp 10 phút sẽ đi đúng 3 bước này, cộng vòng yêu cầu bổ sung. Hồ sơ trong ảnh là dữ liệu demo, xóa được bằng scripts/reset-demo.sh.");

  // ---- 12. Đánh giá ----
  pres.addSection({ title: "Đánh giá và kết luận" });
  s = add("Đánh giá và kết luận");
  T(s, "Đổi lịch ký mới giảm chờ ký; phần mềm giảm thao tác cán bộ");
  simTag(s);
  const cats = ["AS-IS", "TO-BE S0 (ký theo lô)", "TO-BE S1 (ký 2 lần/ngày)"];
  const chartOpt = (title, name) => ({ x: 0, y: 1.45, w: 4.0, h: 3.6, objectName: name, showTitle: true, title, titleFontSize: 14, titleColor: HEX.dk2, titleFontFace: "+mn-lt",
    chartColors: [HEX.accent1], showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 12, dataLabelColor: HEX.dk1, dataLabelFontFace: "+mn-lt", dataLabelFormatCode: "#,##0",
    catAxisLabelColor: HEX.accent6, catAxisLabelFontSize: 11, catAxisLabelFontFace: "+mn-lt", valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false, barGapWidthPct: 60 });
  s.addChart(pres.charts.BAR, [{ name: "Phút làm việc", labels: cats, values: [1363, 944, 788] }], { ...chartOpt("Thời gian phía trường (trung vị, phút LV)", "bieu-do-k1"), x: M });
  s.addChart(pres.charts.BAR, [{ name: "Phút làm việc", labels: cats, values: [551, 584, 121] }], { ...chartOpt("Chờ trước khi ký (trung vị, phút LV)", "bieu-do-k3"), x: M + 4.1 });
  card(s, 8.95, 1.45, 3.75, 3.6, "the-tom-tat-kpi");
  box(s, [{ text: "So theo cặp, 20 seed (p = 0,15)", options: { bold: true, fontSize: 16, color: C.text2, breakLine: true } },
          { text: "S1 tốt hơn AS-IS ở 20/20 seed về thời gian phía trường và chờ ký", options: { bullet: true, breakLine: true } },
          { text: "S0 không giảm chờ ký: 0/20 seed (3/20 và 4/20 khi p = 0,22 và 0,30)", options: { bullet: true, breakLine: true } },
          { text: "Thao tác cán bộ: 43 → 21 phút/ca", options: { bullet: true, breakLine: true } },
          { text: "Trễ phát hiện quá hạn: 1.239 → 0 phút", options: { bullet: true } }],
      { x: 9.15, y: 1.6, w: 3.4, h: 3.35, fontSize: 14, paraSpaceAfter: 6, objectName: "tom-tat-kpi" });
  box(s, [{ text: "Không được kết luận: ", options: { bold: true, color: C.accent3 } },
          { text: "hiệu quả thực tế tại trường; phần mềm tự thân làm giảm chờ ký; form web chắc chắn giảm một nửa hồ sơ phải bổ sung (đó là giả định đầu vào)." }],
      { x: M, y: 5.4, w: 12.1, h: 0.9, fontSize: 15, objectName: "khong-ket-luan" });
  s.addNotes("TV4: đây là phát hiện quan trọng nhất. Nếu tự động hóa mà vẫn ký theo lô (S0) thì chờ ký không giảm, nên muốn cải thiện phải đổi cả cách tổ chức (lịch ký), không chỉ mua phần mềm. Mọi mục tiêu KPI là dự kiến. Nếu được hỏi: K5 (quá hạn ròng) bằng 0% ở mọi kịch bản vì sau khi trừ thời gian chờ SV, hồ sơ đều dưới ngưỡng 5 ngày làm việc; K6 (đóng do quá hạn, 12,7–14,2%) không giảm vì mô hình cố ý giữ nguyên tỷ lệ SV không phản hồi 8%, không gán hiệu quả chủ quan cho email nhắc hạn.");

  // ---- 13. Giới hạn ----
  s = add("Đánh giá và kết luận", "DARK");
  s.addText("Kết quả mô phỏng chỉ minh họa phương pháp; cần nhật ký thật để kiểm chứng", { placeholder: "title" });
  s.addText([
    { text: "Giới hạn: tham số là giả định, 1 cán bộ tiếp nhận, chưa loại trừ ngày lễ; prototype chưa có nhắc hạn và đóng quá hạn tự động", options: { bullet: true, breakLine: true } },
    { text: "Bước 1: thu sổ tiếp nhận, phiếu trình, sổ văn thư của một học kỳ để dựng event log thật", options: { bullet: true, breakLine: true } },
    { text: "Bước 2: hiệu chỉnh tham số, chạy lại Process Mining, xác nhận hoặc bác giả thuyết H1", options: { bullet: true, breakLine: true } },
    { text: "Bước 3: thí điểm lịch ký 2 khung giờ và form web cho một loại giấy, đo hằng tuần", options: { bullet: true } }],
    { placeholder: "body" });
  s.addNotes("TV1 kết luận và chuyển sang demo 10 phút. Câu hỏi có thể gặp: (1) Sao dùng dữ liệu mô phỏng? Trường đang làm trên sổ giấy/Zalo, chưa có log theo phút; nhóm dùng mô phỏng 20 seed ghép cặp và chạy độ nhạy, kèm lộ trình thu log thật. (2) Sao S0 tự động hóa mà chờ ký còn tăng nhẹ? Vẫn ký theo lô thứ Ba/thứ Năm; bước trước xong sớm hơn nên hồ sơ chờ phiên ký lâu hơn; phải đổi lịch ký (S1) mới giảm. (3) Prototype khác TO-BE thế nào? Có luồng cốt lõi và chống báo thành công giả, chưa có timer nhắc hạn/đóng quá hạn. (4) Sao có nhắc hạn mà tỷ lệ đóng quá hạn không giảm? Mô hình giữ cố định hành vi SV để không thổi phồng hiệu quả; timer chỉ làm trễ phát hiện quá hạn về 0.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})().catch(e => { console.error(e); process.exit(1); });
