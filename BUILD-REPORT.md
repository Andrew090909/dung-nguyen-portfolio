# Build report — v11

Ngày đóng gói: 2026-07-29

## Kiểm tra đã thực hiện trong môi trường tạo source

- PHP syntax lint cho toàn bộ `app`, `bootstrap`, `config`, `database`, `routes`, Blade PHP và `tests`: đạt.
- JavaScript syntax check cho app/admin và toàn bộ JS modules: đạt.
- JSON parse cho composer/package/seed data: đạt.
- Đối chiếu key dịch VI/EN/ZH: đạt, không thiếu key.
- Kiểm tra toàn bộ ảnh được seed đều tồn tại: đạt.
- Portfolio raster assets đã chuyển WebP và loại metadata.

## Kiểm tra cần chạy sau khi cài dependency

```bash
composer install
npm install
npm run build
vendor/bin/pint --test
vendor/bin/phpstan analyse --memory-limit=1G
php artisan test
```

`vendor/`, `node_modules/` và build output không được đưa vào source ZIP theo chuẩn dự án Laravel. Môi trường tạo source không có registry dependency đầy đủ nên không tuyên bố đã chạy PHPUnit, PHPStan, Pint hoặc Vite production build tại đây.
