# Xóa `/admin/` khỏi website GitHub Pages đang chạy

Gói V18 không chứa thư mục `admin/`. Tuy nhiên GitHub không tự xóa file cũ khi chỉ upload các file thay đổi.

Trong repository `Nguyen-studio/nguyen-studio.github.io`, xóa tối thiểu:
- `admin/index.html`
- `admin/admin.css`

Cách chắc chắn bằng Git:
```bash
git pull
git rm -r admin
git add -A
git commit -m "Remove legacy admin route"
git push origin main
```

Sau khi GitHub Pages deploy xong, mở cửa sổ ẩn danh và kiểm tra `/admin/` phải trả về trang 404. Xóa cache trình duyệt nếu vẫn thấy bản cũ.
