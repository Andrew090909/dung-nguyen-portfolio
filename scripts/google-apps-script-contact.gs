function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Leads');
  if (!sheet) {
    sheet = ss.insertSheet('Leads');
    sheet.appendRow(['Time','Language','Page','Name','Company','Phone','Email','Need','Budget','Message']);
  }

  const p = e.parameter || {};
  if (p.website) {
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  sheet.appendRow([
    new Date(),
    p.language || '',
    p.page || '',
    p.name || '',
    p.company || '',
    p.phone || '',
    p.email || '',
    p.need || '',
    p.budget || '',
    p.message || ''
  ]);

  MailApp.sendEmail({
    to: 'dungnguyen.mkt@gmail.com',
    subject: 'Lead mới từ Nguyen Studio',
    htmlBody:
      '<b>Họ tên:</b> ' + (p.name || '') + '<br>' +
      '<b>Công ty:</b> ' + (p.company || '') + '<br>' +
      '<b>Điện thoại:</b> ' + (p.phone || '') + '<br>' +
      '<b>Email:</b> ' + (p.email || '') + '<br>' +
      '<b>Nhu cầu:</b> ' + (p.need || '') + '<br>' +
      '<b>Ngân sách:</b> ' + (p.budget || '') + '<br>' +
      '<b>Lời nhắn:</b> ' + (p.message || '')
  });

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
