# V18 — Scope khóa thay đổi

## Phạm vi được phép thay đổi
1. Thay riêng hình quả cầu ở hero trang chủ VI/EN/ZH.
2. Bỏ nền đen hình chữ nhật, bỏ WebGL/lưới chéo và icon rời rạc.
3. Dùng 5 nhãn có ý nghĩa kinh doanh: AI & Data, Global Marketing, Sales & CRM, Automation, Growth Analytics; bản VI/EN/ZH không trộn ngôn ngữ.
4. Xóa toàn bộ thư mục/route admin khỏi gói source và gói build.
5. Đổi email nhận lead và email liên hệ thành `nguyendhungdung@gmail.com`.
6. Giữ nguyên toàn bộ nội dung, bố cục, menu, typography, màu thương hiệu, portfolio, pricing, insights, skills và CTA còn lại.

## Điều kiện nghiệm thu
- Hero không có khung nền đen hoặc mép ảnh vuông.
- Không tải Three.js/CDN cho quả cầu.
- Không còn icon Play, kính lúp, mũi tên, target rời rạc.
- Quả cầu và nhãn không tràn ngang ở desktop/mobile.
- Không tồn tại thư mục `admin/` trong source và `_site`.
- Không còn địa chỉ email liên hệ cũ trong source.
- Form chỉ được xem là kết nối Google Sheet khi `content/site-config.json` có URL Apps Script `/exec` hợp lệ và đã test lead thật.
