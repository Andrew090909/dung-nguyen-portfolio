# Trạng thái kết nối form

- Email đích trong source và Apps Script: `nguyendhungdung@gmail.com`.
- Mã Apps Script ghi lead vào tab `Leads` và gửi email đã có tại `scripts/google-apps-script-contact.gs`.
- `content/site-config.json` hiện chưa có `form_endpoint`, vì gói source và repository đang dùng đều để trống URL Apps Script.
- Vì chưa có URL Web App `/exec`, không được tuyên bố form đã gửi thành công vào Google Sheet. Khi có URL đã deploy, dán vào `form_endpoint`, deploy sạch và gửi một lead thật để kiểm tra cả Sheet lẫn Inbox/Spam.
