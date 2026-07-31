# V19.1 Insights-only Patch

## Phạm vi

Bản vá này chỉ thay phần Insights của V19. Không thay trang chủ, Portfolio, Báo giá, Liên hệ, quả cầu V5 hoặc nền kỹ thuật số chung.

## Cách upload

1. Giải nén file ZIP.
2. Mở repository `Nguyen-studio/nguyen-studio.github.io` tại nhánh `main`.
3. Upload toàn bộ file và thư mục nằm bên trong bản vá vào thư mục gốc repository.
4. Khi GitHub hỏi file trùng, giữ phiên bản mới để ghi đè:
   - `insights.html`
   - `en/insights.html`
   - `zh/insights.html`
5. Commit với nội dung: `Apply V19.1 insights hub patch`.
6. Chờ GitHub Pages cập nhật rồi kiểm tra bằng cửa sổ ẩn danh.

Không upload nguyên file ZIP vào repository.

## Những gì được thêm

- 6 bài phân tích có nội dung đầy đủ bằng VI/EN/ZH.
- Card bài viết mở được trang chi tiết thật.
- Bộ lọc danh mục và tìm kiếm.
- Market Dashboard tải dữ liệu trực tiếp từ TradingView khi có Internet.
- 3 playbook tải về ở mỗi ngôn ngữ.
- File `.pages.yml` để quản lý bài qua Pages CMS.

## Đăng bài mới bằng Pages CMS

1. Mở `app.pagescms.org`.
2. Đăng nhập GitHub và chọn repository.
3. Chọn nhánh `main`.
4. Mở `Insights Articles`.
5. Thêm hoặc sửa bài rồi lưu.

Dữ liệu được ghi vào `content/insights-v20.json`. Website đọc trực tiếp file này, nên không cần tạo `/admin/` và không cần build thủ công.

## Giới hạn thực tế

- Trang chi tiết dùng URL dạng `insight.html?slug=...`; đây là giải pháp nhỏ gọn, chưa tối ưu SEO bằng mỗi bài có một file HTML riêng.
- TradingView là dịch vụ bên ngoài. Nếu script bị chặn, khu vực biểu đồ sẽ hiển thị placeholder thay vì dữ liệu trực tiếp.
- Bản vá chưa thêm hệ thống tin tự động RSS/API.
- Bản vá chưa thêm module đăng bất động sản; có thể xây bằng cùng cơ chế JSON + Pages CMS ở vòng riêng.
