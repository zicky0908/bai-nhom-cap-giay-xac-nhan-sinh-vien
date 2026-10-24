const STATUS_LABELS = {
  SUBMITTED: "Đã tiếp nhận",
  PRECHECK_OK: "Đã tiền kiểm",
  NEED_SUPPLEMENT: "Cần bổ sung",
  IN_REVIEW: "Đang kiểm tra",
  APPROVED: "Đã phê duyệt",
  REJECTED: "Đã từ chối",
  ISSUED: "Đã cấp giấy"
};

const ACTIVITY_LABELS = {
  SUBMITTED: "Nộp hồ sơ",
  PRECHECK: "Tiền kiểm tự động",
  PRECHECK_OK: "Tiền kiểm hợp lệ",
  NEED_SUPPLEMENT: "Yêu cầu bổ sung",
  IN_REVIEW: "Kiểm tra hồ sơ",
  APPROVED: "Phê duyệt",
  REJECTED: "Từ chối",
  ISSUED: "Cấp giấy",
  NOTIFY_SENT: "Gửi thông báo"
};

document.querySelectorAll("[data-status]").forEach((el) => {
  const value = el.dataset.status;
  el.textContent = STATUS_LABELS[value] || value || "Chưa xác định";
});

document.querySelectorAll("[data-activity]").forEach((el) => {
  const value = el.dataset.activity;
  el.textContent = ACTIVITY_LABELS[value] || value || "Sự kiện";
});

document.querySelectorAll("[data-automation-status]").forEach((el) => {
  const labels = { PENDING: "Đang chờ tự động hóa", SYNCED: "Đã thông báo", FAILED: "Tự động hóa lỗi" };
  const value = el.dataset.automationStatus;
  el.textContent = labels[value] || value || "Chưa có";
  el.dataset.tone = value === "SYNCED" ? "good" : value === "FAILED" ? "danger" : "pending";
});

document.querySelectorAll("[data-idempotent-form]").forEach((form) => {
  form.addEventListener("submit", () => {
    const input = form.querySelector("input[name='idempotency_key']");
    if (input && !input.value) input.value = crypto.randomUUID();
    const button = form.querySelector("button[type='submit']");
    if (button) { button.disabled = true; button.dataset.originalText = button.textContent; button.textContent = "Đang xử lý…"; }
  });
});

document.querySelectorAll("form[data-confirm]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    if (!window.confirm(form.dataset.confirm)) event.preventDefault();
  });
});

const lookupForm = document.querySelector("[data-lookup-form]");
if (lookupForm) lookupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = lookupForm.elements.case_id.value.trim();
  if (value) window.location.assign(`/requests/${encodeURIComponent(value)}`);
});

const rows = [...document.querySelectorAll("[data-table-row]")];
let activeStatus = "all";
const applyTableFilters = () => {
  const query = (document.querySelector("[data-table-search]")?.value || "").toLocaleLowerCase("vi");
  rows.forEach((row) => {
    const statusMatches = activeStatus === "all" || row.dataset.status === activeStatus;
    const textMatches = (row.dataset.search || "").toLocaleLowerCase("vi").includes(query);
    row.hidden = !(statusMatches && textMatches);
  });
};
document.querySelector("[data-table-search]")?.addEventListener("input", applyTableFilters);
document.querySelectorAll("[data-status-filter]").forEach((button) => button.addEventListener("click", () => {
  activeStatus = button.dataset.statusFilter;
  document.querySelectorAll("[data-status-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
  applyTableFilters();
}));

const processMap = document.querySelector("[data-process-map]");
if (processMap) processMap.addEventListener("error", () => {
  processMap.closest(".process-map").hidden = true;
  const fallback = document.querySelector("[data-process-fallback]");
  if (fallback) fallback.hidden = false;
});
