# Checklist trước production

## Nội dung và chuyển đổi
- [ ] Thay KPI demo bằng số liệu có hồ sơ chứng minh hoặc đổi thành “illustrative”.
- [ ] Xác minh email, Zalo, legal pages, consent và privacy policy.
- [ ] Review toàn bộ VI/EN/ZH bởi người bản ngữ.
- [ ] Đổi portfolio password và admin password.

## SEO
- [ ] Đặt APP_URL đúng HTTPS và canonical domain.
- [ ] Validate sitemap, robots, hreflang, JSON-LD và breadcrumb.
- [ ] Kiểm tra 1 H1/trang, heading order, alt ảnh và internal links.
- [ ] Kết nối Search Console/Bing Webmaster sau launch.

## Performance
- [ ] `npm run build`, `php artisan optimize`, Redis/OPcache hoạt động.
- [ ] CDN cho ảnh và asset immutable.
- [ ] Lighthouse mobile/desktop trên production; kiểm tra LCP, INP, CLS.
- [ ] Test thiết bị thật, mạng 4G chậm, reduced motion và WebGL unavailable.

## Security
- [ ] APP_DEBUG=false, rotate APP_KEY/credentials, SMTP/API secrets chỉ ở secret store.
- [ ] HTTPS/HSTS sau khi domain ổn định.
- [ ] Backup DB và storage; test restore.
- [ ] Dependency audit, log rotation, alert 5xx và queue failure.
- [ ] Thêm sanitizer nếu editor không hoàn toàn tin cậy.
