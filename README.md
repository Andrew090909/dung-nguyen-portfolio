# Dũng Nguyễn Portfolio v11

Website portfolio đa ngôn ngữ (Việt / Anh / Trung) theo định vị **Commercial Growth Architect**, xây trên Laravel 12 + PHP 8.4. Phiên bản này chuyển visual từ nền tối sang hệ màu **emerald sáng**, giữ chiều sâu công nghệ bằng WebGL/Three.js, GSAP và một “AI Earth” sống ở hero.

## 1. Phạm vi đã có

- Trang chủ, Báo giá, Portfolio có mật khẩu, Insights, Liên hệ.
- Admin: dashboard, bài viết, sản phẩm/dịch vụ, danh mục, banner, trang tĩnh, SEO, lead liên hệ, nhật ký hoạt động, người dùng và phân quyền.
- Kiến trúc module: Controller → Service → Repository → Model; Form Request, Middleware, Observer, Helper, Trait.
- SEO: title/description/canonical, Open Graph, Twitter Card, hreflang, JSON-LD, breadcrumb schema, sitemap XML, robots.txt, semantic heading, internal link, SEO pagination.
- Performance: Vite, SCSS, critical CSS inline, lazy loading, WebP, responsive fallback, deferred Three.js, Redis cache/session/queue, OPcache, Gzip/Brotli config.
- Security: CSRF, escaped Blade output, Eloquent parameter binding, CSP/security headers, rate limit, auth, role authorization, honeypot, validated uploads.
- Database: foreign keys, indexes, normalized relations, timestamps, soft delete, migrations and seeders.

## 2. Yêu cầu môi trường

- PHP 8.4 với: BCMath, Ctype, cURL, DOM, Fileinfo, GD/WebP, Intl, Mbstring, OpenSSL, PDO MySQL, Tokenizer, XML, Zip.
- Composer 2.8+, Node.js 22+, npm 10+.
- MySQL 8.4, Redis 7.4.

## 3. Chạy local không Docker

```bash
cp .env.example .env
composer install
php artisan key:generate
npm install
npm run build
php artisan migrate --seed
php artisan storage:link
php artisan serve
php artisan queue:work
```

Mở `http://127.0.0.1:8000/vi`. Admin ở `/admin/login`.

Tài khoản seed mặc định lấy từ `.env`:

```dotenv
ADMIN_NAME="Dũng Nguyễn"
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD="ChangeThisImmediately!2026"
PORTFOLIO_PASSWORD="999999"
```

Đổi toàn bộ credential trước khi đưa lên Internet. Không commit file `.env`.

## 4. Chạy bằng Docker

```bash
cp .env.example .env
# Cập nhật DB_PASSWORD, DB_ROOT_PASSWORD, APP_URL và credential admin.
docker compose up -d --build
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
docker compose exec app php artisan storage:link
```

Mở `http://localhost:8080/vi`.

## 5. Deploy Linux + Nginx

1. Cài PHP 8.4-FPM, MySQL 8.4, Redis, Nginx có module Brotli, Composer và Node.js 22.
2. Copy `.env.example` thành `.env`, đặt `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://domain`.
3. Cấu hình Redis cho cache/session/queue và SMTP thật.
4. Dùng `deploy/nginx-production.conf`, thay domain/certificate/path.
5. Dùng `deploy/supervisor-queue.conf` cho queue worker.
6. Chạy `APP_DIR=/var/www/dung-portfolio/current ./deploy/deploy.sh`.
7. Thiết lập cron:

```cron
* * * * * cd /var/www/dung-portfolio/current && php artisan schedule:run >> /dev/null 2>&1
```

## 6. Kiểm tra chất lượng

```bash
vendor/bin/pint --test
vendor/bin/phpstan analyse --memory-limit=1G
php artisan test
npm run build
```

Sau deploy, đo Lighthouse/PageSpeed trên URL thật ở mobile và desktop. Mục tiêu cấu hình là **90+**, nhưng điểm thực tế phụ thuộc hosting, CDN, TTFB, font, analytics, ảnh admin tải lên và script bên thứ ba. Không nên coi điểm 90+ là một cam kết trước khi audit trên hạ tầng production.

## 7. Cấu trúc chính

```text
app/Modules/{Home,Pricing,Portfolio,Insight,Contact,Admin}/
  Controllers/ Requests/ Repositories/ Services/
app/{Models,Helpers,Traits,Middleware,Observers,Services}/
resources/{views,scss,js}/
database/{migrations,seeders,data}/
docker/ deploy/ tests/
```

## 8. Lưu ý nội dung

- Các chỉ số `+38.7%`, `4.63×`, `+24.6%`, `+42.1%` trong hero hiện là **visual KPI demo**, không nên công bố như kết quả khách hàng đã kiểm chứng nếu chưa có hồ sơ nguồn.
- Portfolio được bảo vệ bằng session 8 giờ. Để bảo mật mạnh hơn, dùng tài khoản khách hàng, signed URL hoặc policy theo từng case.
- Nội dung HTML trong Insights chỉ nên nhập bởi editor tin cậy; khi mở cho nguồn không tin cậy, bổ sung HTML sanitizer ở tầng Service.

## 9. License

Mã nguồn proprietary cho Dũng Nguyễn. Không phân phối công khai nếu chưa có chấp thuận.
