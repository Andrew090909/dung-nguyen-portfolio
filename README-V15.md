# Nguyen Studio Portfolio v15

## Đã sửa và có kiểm tra tự động
- Nút Zalo nổi và nút gọi điện trên PC/laptop.
- Thanh Gọi/Zalo/Đặt lịch trên mobile.
- Chuyển VI/EN/ZH giữ đúng trang ở Pricing hub, Marketing Pricing và Video Pricing.
- KPI chưa xác minh được ẩn khỏi giao diện.
- Template bài viết dùng CSS/JS hiện tại và link tương đối.
- Form có validation, trạng thái gửi, honeypot và tích hợp Google Apps Script.
- Admin tĩnh được nâng cấp để sửa, kiểm tra và tải JSON.
- Báo cáo kiểm thử: `QA-REPORT-V15.json`.

## Kích hoạt gửi form trực tiếp
1. Tạo Google Sheet.
2. Mở Extensions → Apps Script.
3. Dán `scripts/google-apps-script-contact.gs`.
4. Deploy → Web app → quyền truy cập Anyone.
5. Copy URL.
6. Mở `content/site-config.json`.
7. Dán URL vào `form_endpoint`.

Khi chưa dán URL, form sẽ mở ứng dụng email thay vì giả báo gửi thành công.

## Giới hạn kỹ thuật
GitHub Pages là hosting tĩnh. `/admin/` không thể tự ghi vào repository như WordPress nếu không có backend xác thực. Bản admin này cho phép sửa và tải đúng file JSON nhỏ để upload lên GitHub.
