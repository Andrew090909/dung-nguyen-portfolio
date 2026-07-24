# Dũng Nguyễn Portfolio V9

## Bản V9

- Thiết kế lại Trang chủ theo hướng AI-enabled marketing system: visual local, Canvas animation, parallax nhẹ và bố cục không còn khoảng trống vô nghĩa.
- Typography dùng **Be Vietnam Pro + Manrope**, có fallback hỗ trợ tiếng Việt; H1 được giới hạn theo desktop/mobile.
- Insights được xây thành intelligence hub: market snapshot, mini chart, ảnh tin nổi bật, tín hiệu đáng chú ý, nguồn tin trực tiếp và bài viết từ Admin.
- Portfolio sử dụng 23 ảnh dự án lưu local; không còn phụ thuộc Framer.
- Portfolio Việt / Anh / Trung được mã hóa AES-GCM và mở bằng mật khẩu `999999`.
- Sau khi mở khóa, form mật khẩu biến mất ngay và nội dung Portfolio xuất hiện từ đầu trang.
- `/admin/` không xuất hiện trong menu hoặc footer; chỉ truy cập bằng cách tự gõ URL.
- Netlify build chỉ **validate** source, không tái sinh HTML cũ; việc đăng từ Admin không thể ghi đè thiết kế V9.

## Deploy chính thức

1. Giải nén ZIP và đưa toàn bộ nội dung lên GitHub.
2. Kết nối repository với đúng project Netlify hiện tại.
3. Netlify đọc cấu hình trong `netlify.toml`:

```text
Build command: python scripts/validate_site.py
Publish directory: .
Functions directory: netlify/functions
```

4. Bật Netlify Identity, chọn `Invite only`, rồi mời email quản trị.
5. Thêm biến môi trường:

```text
ADMIN_EMAIL=nguyendhungdung@gmail.com
GITHUB_REPO=github-username/repository-name
GITHUB_BRANCH=main
GITHUB_TOKEN=github_pat_xxx
```

6. Truy cập Admin bằng URL:

```text
https://dung-nguyen.netlify.app/admin/
```

## Portfolio

```text
Mật khẩu: 999999
```

Áp dụng cho `/portfolio.html`, `/en/portfolio.html`, `/zh/portfolio.html`.

## Lưu ý bảo mật

- Không đưa `GITHUB_TOKEN` vào source code.
- Chỉ lưu token trong Netlify Environment variables.
- File Portfolio bản rõ không nằm trong source; website chỉ chứa payload mã hóa.
