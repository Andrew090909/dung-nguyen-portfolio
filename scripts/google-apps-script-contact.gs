/**
 * Nguyen Studio contact form receiver.
 * Deploy this script as a Web App: Execute as "Me" and access "Anyone".
 * Add the deployed /exec URL to content/site-config.json -> form_endpoint.
 */
const RECIPIENT_EMAIL = 'nguyendhungdung@gmail.com';
const SHEET_NAME = 'Website Leads';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'nguyen-studio-contact' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = e && e.parameter ? e.parameter : {};
    if (data.website) return response_(false, 'Spam rejected', data.origin);

    const sheet = getSheet_();
    ensureHeader_(sheet);

    const row = [
      new Date(),
      safeCell_(data.submission_token),
      safeCell_(data.name),
      safeCell_(data.email),
      safeCell_(data.phone),
      safeCell_(data.company),
      safeCell_(data.goal),
      safeCell_(data.message),
      safeCell_(data.language),
      safeCell_(data.page)
    ];
    sheet.appendRow(row);

    MailApp.sendEmail({
      to: RECIPIENT_EMAIL,
      subject: '[Nguyen Studio] Yêu cầu tư vấn mới - ' + (safe_(data.name) || 'Khách hàng'),
      htmlBody: buildEmail_(data),
      replyTo: safe_(data.email) || RECIPIENT_EMAIL
    });

    return response_(true, 'Saved to Google Sheet and email sent', data.origin);
  } catch (error) {
    console.error(error);
    return response_(false, String(error && error.message ? error.message : error), e && e.parameter && e.parameter.origin);
  }
}

function getSheet_() {
  const configuredId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  const spreadsheet = configuredId
    ? SpreadsheetApp.openById(configuredId)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('No spreadsheet is connected. Set the SPREADSHEET_ID script property or bind this script to a Sheet.');
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow(['Timestamp', 'Submission token', 'Name', 'Email', 'Phone', 'Company', 'Goal', 'Message', 'Language', 'Page']);
  sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#e9fbf3');
  sheet.setFrozenRows(1);
}

function safe_(value) {
  return value == null ? '' : String(value).trim().slice(0, 5000);
}

function safeCell_(value) {
  const text = safe_(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function escapeHtml_(value) {
  return safe_(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildEmail_(data) {
  const rows = [
    ['Họ tên', data.name], ['Email', data.email], ['Điện thoại', data.phone],
    ['Công ty', data.company], ['Mục tiêu', data.goal], ['Nội dung', data.message],
    ['Ngôn ngữ', data.language], ['Trang gửi', data.page]
  ];
  return '<h2>Yêu cầu tư vấn mới</h2><table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse">'
    + rows.map(function(row) {
      return '<tr><th align="left">' + escapeHtml_(row[0]) + '</th><td>' + escapeHtml_(row[1]) + '</td></tr>';
    }).join('') + '</table>';
}

function response_(ok, message, origin) {
  const targetOrigin = /^https:\/\/[a-z0-9.-]+$/i.test(safe_(origin)) ? safe_(origin) : '*';
  const payload = JSON.stringify({ source: 'nguyen-studio-contact', ok: ok, message: message });
  const html = '<!doctype html><meta charset="utf-8"><script>'
    + 'window.parent.postMessage(' + payload + ',' + JSON.stringify(targetOrigin) + ');'
    + '<\/script>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
