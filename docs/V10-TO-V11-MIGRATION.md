# Migration v10 → v11

- Giữ lại nội dung portfolio ADEVA, Koi Service, Phê Ly, Phong Cách Mộc và Phúc Đại Nam từ bộ source v10.
- Giữ lại ba bài Insights mẫu và chuẩn hóa vào seed JSON đa ngôn ngữ.
- Chuyển static JSON/HTML sang Eloquent models, migrations, repositories và services.
- Chuẩn hóa toàn bộ ảnh portfolio thành WebP; ảnh AI Earth từ brief được tối ưu thành asset hero 560/1000 px và OG cover.
- Thay Netlify/Decap CMS bằng admin Laravel có authentication, RBAC, activity log và SEO polymorphic.
- Giữ password gate portfolio theo session, thêm rate limiting và thời hạn 8 giờ.
