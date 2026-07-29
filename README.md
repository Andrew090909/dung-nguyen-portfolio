# Dũng Nguyễn Portfolio V11.1 — GitHub/Netlify Ready

Bản này là **dual-deploy**:

- Thư mục gốc: website tĩnh hoàn chỉnh chạy ngay bằng GitHub Pages hoặc Netlify.
- `backend-laravel/`: source Laravel 12 + PHP 8.4 cho admin/database khi triển khai VPS hoặc hosting Laravel.

## Cách nhanh nhất: GitHub Pages

1. Upload toàn bộ source lên nhánh `main`.
2. Vào **Settings → Pages → Build and deployment → Source**.
3. Chọn **GitHub Actions**.
4. Mở tab **Actions**, đợi workflow `Deploy portfolio to GitHub Pages` chuyển xanh.
5. Website xuất hiện tại `https://USERNAME.github.io/TEN-REPO/`.

Workflow tự nhận base path của repository, nên CSS/JS/ảnh và ba ngôn ngữ không bị lỗi đường dẫn.

## Netlify

Netlify tự đọc `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `_site`
- Node: 22

Chỉ cần nối đúng repository và nhánh `main`, sau mỗi commit Netlify tự deploy.

## Local preview

```bash
npm run build
python -m http.server 8080 --directory _site
```

Mở `http://localhost:8080`.

## Portfolio

Portfolio được mã hóa AES-GCM trong build output. Mật khẩu hiện tại: `999999`. Có thể đổi khi build:

```bash
PORTFOLIO_PASSWORD=mat-khau-moi npm run build
```

## Laravel backend

GitHub Pages chỉ chạy static HTML/CSS/JS, không chạy PHP/MySQL. Source Laravel vẫn được giữ trong `backend-laravel/` để deploy riêng trên VPS/Docker. Xem `backend-laravel/README.md`.
