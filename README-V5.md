# DNG Works V5 — Daily news + global DNG AI

## Tác động
- `insights.html`: thay trang AI/News V4 bằng bản đọc `data/news.json`.
- `data/news.json`: snapshot hiện tại; được GitHub Action cập nhật hằng ngày.
- `.github/workflows/update-news.yml`: mục tiêu chạy 00:00 GMT+7 (17:00 UTC).
- `scripts/update_news.py`: lấy RSS/metadata nguồn thật, ảnh `og:image`, video khi nguồn có.
- `assets/js/dng-ai-widget.js` + `assets/css/dng-ai-widget.css`: nút DNG AI dùng chung.
- `scripts/inject_global_chat.py`: tự chèn nút DNG AI vào HTML root, `en/`, `zh/`, `posts/`.

## Không đụng
Portfolio, Pricing, Contact, homepage không bị thay nội dung. Workflow chỉ thêm 2 thẻ asset cho DNG AI vào các trang HTML.

## Lưu ý
GitHub Actions schedule không cam kết chạy đúng từng giây. Cron đặt 17:00 UTC = 00:00 GMT+7, nhưng GitHub có thể trễ vài phút khi hệ thống đông.
DNG AI front-end đã có trên mọi trang sau khi injector chạy; để AI trả lời thật cần đặt endpoint qua `data-dng-ai-endpoint` trên thẻ `<html>` hoặc nối Worker riêng.
Nguồn tin có thể thay cấu trúc/điều khoản. Script giữ snapshot cũ nếu nguồn tạm lỗi để tránh trang trắng.
