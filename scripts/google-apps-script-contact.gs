const SETTINGS = {
  SHEET_NAME: 'Leads',
  EMAIL_TO: 'dungnguyen.mkt@gmail.com'
};

function doGet() {
  return jsonResponse_({ ok: true, service: 'Nguyen Studio contact form' });
}

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};

    // Honeypot: silently accept bot submissions without storing them.
    if (p.website) return jsonResponse_({ ok: true });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error('This Apps Script must be created from the destination Google Sheet: Extensions > Apps Script.');
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      let sheet = ss.getSheetByName(SETTINGS.SHEET_NAME);
      if (!sheet) {
        sheet = ss.insertSheet(SETTINGS.SHEET_NAME);
        sheet.appendRow([
          'Time', 'Language', 'Page', 'Name', 'Company',
          'Phone', 'Email', 'Goal', 'Message'
        ]);
        sheet.setFrozenRows(1);
      }

      sheet.appendRow([
        new Date(),
        value_(p.language),
        value_(p.page),
        value_(p.name),
        value_(p.company),
        value_(p.phone),
        value_(p.email),
        value_(p.goal || p.need),
        value_(p.message)
      ]);
    } finally {
      lock.releaseLock();
    }

    const senderEmail = value_(p.email);
    MailApp.sendEmail({
      to: SETTINGS.EMAIL_TO,
      replyTo: senderEmail || SETTINGS.EMAIL_TO,
      subject: 'Lead mới từ Nguyen Studio - ' + (value_(p.name) || 'Khách mới'),
      htmlBody:
        '<b>Ngôn ngữ:</b> ' + escapeHtml_(p.language) + '<br>' +
        '<b>Trang gửi:</b> ' + escapeHtml_(p.page) + '<br>' +
        '<b>Họ tên:</b> ' + escapeHtml_(p.name) + '<br>' +
        '<b>Công ty:</b> ' + escapeHtml_(p.company) + '<br>' +
        '<b>Điện thoại:</b> ' + escapeHtml_(p.phone) + '<br>' +
        '<b>Email:</b> ' + escapeHtml_(p.email) + '<br>' +
        '<b>Mục tiêu:</b> ' + escapeHtml_(p.goal || p.need) + '<br>' +
        '<b>Lời nhắn:</b> ' + escapeHtml_(p.message)
    });

    return jsonResponse_({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, error: String(error && error.message || error) });
  }
}

function value_(value) {
  return String(value == null ? '' : value).trim();
}

function escapeHtml_(value) {
  return value_(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
