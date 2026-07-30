# Nguyen Studio v17

## Cập nhật
- Menu mobile đồng nhất trên VI/EN/ZH, đóng bằng nút X, backdrop hoặc Escape.
- Thanh CTA mobile: Gọi điện, Zalo, Đặt lịch.
- Nút gọi dùng `tel:0377348008`; Zalo dùng `https://zalo.me/0377348008`.
- Kỹ năng giữ đúng layout tham chiếu bốn thẻ + luồng triển khai.
- Portfolio tiếp tục đọc mapping từ `content/portfolio-image-map.json` và JSON từng dự án.
- Form liên hệ hỗ trợ endpoint qua `content/site-config.json`; nếu chưa cấu hình sẽ mở email fallback.
- Dọn file CMS/Netlify cũ; bản này dành cho GitHub Pages.
- Globe có nhãn trung tâm DIGITAL STUDIO và interaction WebGL.

## Cập nhật nội dung nhỏ
- Sửa ảnh: thay file ảnh cùng tên hoặc chỉnh `content/portfolio-image-map.json`.
- Sửa nội dung dự án: chỉnh JSON tương ứng trong `content/portfolio/`.
- Cấu hình form: điền URL Google Apps Script hoặc Formspree vào `form_endpoint` trong `content/site-config.json`.

## Deploy
Upload toàn bộ lần đầu. Các lần sau chỉ cần upload file đã sửa; GitHub Pages tự deploy từ `main/(root)`.
