# Kết nối form website với Google Sheets và Gmail

## 1. Tạo Apps Script đúng cách
1. Mở Google Sheet muốn nhận lead.
2. Chọn **Extensions > Apps Script**.
3. Xóa code mặc định và dán toàn bộ nội dung file `scripts/google-apps-script-contact.gs`.
4. Bấm **Save**.

## 2. Deploy thành Web app
1. Bấm **Deploy > New deployment**.
2. Chọn loại **Web app**.
3. Execute as: **Me**.
4. Who has access: **Anyone**.
5. Bấm **Deploy**, cấp quyền Google theo yêu cầu.
6. Sao chép URL kết thúc bằng `/exec`.

Không dùng URL kết thúc bằng `/dev`.

## 3. Nối website
Mở `content/site-config.json` và điền URL `/exec`:

```json
{
  "phone": "0377348008",
  "zalo": "https://zalo.me/0377348008",
  "email": "nguyendhungdung@gmail.com",
  "calendar_url": "",
  "form_endpoint": "https://script.google.com/macros/s/XXXXXXXX/exec",
  "show_unverified_kpis": false
}
```

Chỉ cần upload lại đúng file `content/site-config.json` lên GitHub.

## 4. Test
1. Mở URL `/exec` trực tiếp. Phải thấy JSON có `"ok":true`.
2. Gửi form thử trên website.
3. Kiểm tra tab `Leads` trong Google Sheet.
4. Kiểm tra email `nguyendhungdung@gmail.com`, kể cả Spam.
5. Trong Apps Script, mở **Executions** để kiểm tra lỗi nếu Sheet hoặc email chưa nhận dữ liệu.

## Lưu ý
- Sau khi sửa Apps Script, vào **Deploy > Manage deployments > Edit > New version > Deploy**.
- Chỉ lưu code nhưng không tạo version/deploy lại thì website vẫn chạy code cũ.
- Form website dùng field `goal`; script bản này đã đồng bộ field đó.
