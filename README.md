# Dũng Nguyễn Portfolio V10 — Content Studio

## Quản trị mới

Trang quản trị: `https://dung-nguyen.netlify.app/admin/`

V10 dùng Decap CMS theo kiểu WordPress nhẹ:

- Tạo, sửa, xóa bài viết.
- Lưu nháp, review và publish.
- Upload và chọn ảnh trong Media.
- Chỉnh nội dung Việt / Anh / Trung.
- Thêm, sắp xếp và sửa dự án Portfolio.
- Chỉnh màu sắc, kích thước H1, độ rộng website, khoảng cách section, bo góc và hiệu ứng.
- Chỉnh email, điện thoại và Zalo.

## Cài đặt một lần trên Netlify

1. Upload toàn bộ source V10 lên GitHub và chờ Netlify deploy thành công.
2. Netlify → Project configuration → Identity → Services → Git Gateway → Enable Git Gateway.
3. Identity → External providers → bật GitHub.
4. Mở `/admin/` và đăng nhập bằng GitHub.

## Lưu ý bảo mật Portfolio

Source CMS có thư mục `content/portfolio/` để quản trị dự án. Build Netlify không xuất bản thư mục này; website công khai chỉ nhận file Portfolio đã mã hóa. Tuy nhiên, repository GitHub hiện của bạn đang Public. Hãy đổi repository sang **Private** để nội dung nguồn Portfolio không bị đọc trực tiếp trên GitHub.

Mật khẩu Portfolio mặc định trong build là `999999`. Có thể thay bằng biến môi trường Netlify `PORTFOLIO_PASSWORD`.

## Cách hoạt động

Decap CMS commit nội dung vào GitHub. Netlify chạy `scripts/build_cms.mjs`, tạo thư mục `_site`, tổng hợp bài viết và nội dung đa ngôn ngữ, mã hóa Portfolio rồi publish.
