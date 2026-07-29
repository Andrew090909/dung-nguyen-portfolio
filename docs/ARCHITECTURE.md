# Kiến trúc v11

## Luồng request công khai

`Route → Locale/Security Middleware → Controller → Service → Repository → Eloquent Model → Blade`

Controller chỉ điều phối HTTP. Business rule, cache, transaction và notification nằm trong Service. Repository chịu trách nhiệm query. Form Request chịu trách nhiệm authorization và validation.

## Module boundaries

- **Home**: aggregate banner/service/post/portfolio cho landing page và cache theo locale.
- **Pricing**: gói dịch vụ và logic hiển thị đầu tư.
- **Portfolio**: gate session 8 giờ, danh sách và detail case.
- **Insight**: listing có pagination, detail published post.
- **Contact**: validation, persistence transaction, queued email.
- **Admin**: CRUD dùng service/repository chung, RBAC theo `super_admin`, `editor`, `analyst`.

## Data model

Nội dung ba ngôn ngữ lưu JSON (`vi`, `en`, `zh`) để một record giữ cùng semantic identity. Slug là định danh ổn định. SEO metadata dùng polymorphic relation để gắn vào Page, Post, Product và PortfolioProject.

## Cache invalidation

Public aggregate cache được xóa ở AdminContentService và PostObserver sau khi nội dung thay đổi. Production dùng Redis; OPcache và Nginx static cache giảm PHP work.

## Security boundary

- Blade `{{ }}` escape mặc định; chỉ body bài viết dùng `{!! !!}` và chỉ dành cho editor tin cậy.
- Form Request + Eloquent chống mass assignment/query injection.
- CSRF middleware, CSP/security headers, login/contact/portfolio throttling.
- Role middleware chặn route admin; user inactive không có quyền.
- Upload qua MIME, kích thước, decode và WebP conversion.
