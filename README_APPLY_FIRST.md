# DNGWORKS FULL HOTFIX — 06/08/2026

## Mục tiêu của gói này

Gói này gom TẤT CẢ các yêu cầu thành một lần triển khai:

1. Bỏ `.html` khỏi URL hiển thị.
2. Giữ URL cũ và tự chuyển sang URL sạch.
3. Sửa top-left brand:
   - Trang chủ: `DNG`
   - Các trang khác: `DŨNG NGUYỄN`
   - Sub-brand: `DNGWORKS`
4. SEO toàn site:
   - title + description chuẩn từng trang VI / EN / ZH
   - canonical URL sạch
   - hreflang VI / EN / ZH
   - robots index/follow
   - WebSite / Person / ProfessionalService / WebPage / Breadcrumb JSON-LD
   - robots.txt + sitemap.xml tự sinh
   - favicon + manifest
5. Social share:
   - Open Graph + Twitter Card
   - ảnh 1200×630 riêng cho Home / Portfolio / Pricing / Insights / Contact
   - tên site thống nhất là DNGWORKS
6. Insights:
   - đọc dữ liệu thật từ `/data/news.json`
   - hiển thị thời gian cập nhật
   - Mới nhất / Đọc nhiều / Thế giới / Kinh tế / AI / Video
   - fallback về HTML cũ nếu nguồn lỗi
7. News bot:
   - chạy 00:00 / 06:00 / 12:00 / 18:00 giờ Việt Nam
   - sửa `Đọc nhiều` bị kéo dữ liệu RSS quá cũ
   - lọc link điều hướng rác của OpenAI
   - Media không giữ mãi tin cũ nếu không có video trực tiếp

## Cách upload

1. GIẢI NÉN file ZIP.
2. Upload toàn bộ nội dung bên trong vào ROOT repo `DNGWORKS/DNGWORKS.github.io`.
3. Giữ nguyên cấu trúc folder.
4. Sau khi commit, workflow `Apply DNGWORKS Site Hotfix` sẽ tự chạy.
5. Nếu workflow không tự chạy:
   GitHub → Actions → `Apply DNGWORKS Site Hotfix` → `Run workflow`.
6. Chạy thêm một lần:
   GitHub → Actions → `News Update Every 6 Hours` → `Run workflow`.

## URL sau khi fix

- https://dngworks.github.io/
- https://dngworks.github.io/portfolio/
- https://dngworks.github.io/pricing/
- https://dngworks.github.io/pricing-marketing/
- https://dngworks.github.io/pricing-video/
- https://dngworks.github.io/insights/
- https://dngworks.github.io/contact/

Tiếng Anh:
- /en/
- /en/portfolio/
- /en/pricing/
- /en/pricing-marketing/
- /en/pricing-video/
- /en/insights/
- /en/contact/

Tiếng Trung tương tự với `/zh/`.

Các link cũ như `/portfolio.html` vẫn hoạt động nhưng sẽ tự chuyển sang `/portfolio/`.

## Sau deploy: việc cần làm để Google tìm thấy DNGWORKS nhanh hơn

1. Google Search Console → Add property `https://dngworks.github.io/`
2. Submit sitemap:
   `https://dngworks.github.io/sitemap.xml`
3. URL Inspection → Request indexing cho:
   - /
   - /portfolio/
   - /pricing/
   - /insights/
   - /contact/
4. Không đổi lại title thành tên version kiểu `V9.1 Fast Review`.
5. Khi share Facebook / LinkedIn / Zalo, dùng URL sạch có dấu `/` cuối.

Lưu ý: SEO không thể bảo đảm lên top hoặc index ngay lập tức. Google có thể cần vài ngày đến vài tuần để crawl/re-index.
