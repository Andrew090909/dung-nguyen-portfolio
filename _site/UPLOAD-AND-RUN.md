# Upload xong là chạy — 3 bước

1. Upload **toàn bộ file và thư mục** của gói này vào root repository, không bọc thêm một thư mục ngoài.
2. GitHub → **Settings → Pages → Source: GitHub Actions**.
3. GitHub → **Actions** → mở workflow deploy, chờ dấu tích xanh rồi bấm URL website.

Netlify: Project configuration → Build & deploy phải trỏ đúng repository và branch `main`. File `netlify.toml` đã cấu hình build/publish tự động.
