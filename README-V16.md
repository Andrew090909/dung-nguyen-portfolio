# Nguyen Studio Portfolio v16 — Full audit

## Phạm vi kiểm tra
- Kiểm tra toàn bộ HTML ngoài thư mục build `_site`.
- Kiểm tra link nội bộ, asset, ID trùng, alt ảnh.
- Quét tiếng Việt còn sót trong EN/ZH, ngoại trừ tên thương hiệu.
- Kiểm tra Skills trên 6 trang Home/Portfolio của VI/EN/ZH.
- Kiểm tra chuyển ngôn ngữ trên 9 trang báo giá.
- Kiểm tra Zalo desktop, mobile menu và form liên hệ.
- Báo cáo chi tiết: `QA-REPORT-V16.json`.

## Skills
Skills được dựng lại từ đầu theo bố cục ảnh tham chiếu:
- Desktop: 4 card trên một hàng.
- Icon tròn bên trái.
- Tiêu đề, mô tả, tag công cụ.
- Thanh quy trình xanh liền khối bên dưới.
- Tablet: 2 cột.
- Mobile: 1 cột.

## Form
Frontend đã sẵn sàng. Để form gửi trực tiếp vào Google Sheets/email:
1. Dùng file `scripts/google-apps-script-contact.gs`.
2. Deploy thành Web App với quyền Anyone.
3. Dán URL vào `content/site-config.json` tại `form_endpoint`.

Nếu chưa có endpoint, website không giả báo thành công; nó mở ứng dụng email dự phòng.

## Admin
GitHub Pages không chạy PHP/database. `/admin/` là trình sửa JSON và tải file nhỏ để upload lên GitHub, không phải WordPress thật.
