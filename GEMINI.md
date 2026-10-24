# HƯỚNG DẪN & QUY TẮC PHÁT TRIỂN DỰ ÁN DIỆN BIÊN DI SẢN SỐ (DIENBIENDISANSO)

## 1. Bối cảnh & Bài học kinh nghiệm (Post-Mortem & Incident History)

- **Sự cố ngày 24/10/2026**:
  - Khi triển khai lên Vercel (`https://dienbiendisanso.vercel.app/`), toàn bộ các nút bấm và tương tác click (Khám phá, Xem 360, Stepper, Lightbox) không hoạt động mặc dù thanh menu header vẫn cuộn bình thường.
  - **Nguyên nhân gốc rễ**:
    1. **Bundler bỏ sót script cổ điển (classic scripts)**: Lệnh `vite build` mặc định chỉ quét `<script type="module">`. Các tệp JavaScript độc lập (`assets/site_data.js`, `assets/site_audio.js`, `assets/interactive_engine.js`) và hình ảnh động (`images/*.webp`) không được sao chép vào thư mục `dist/`.
    2. **Ngộ độc bộ nhớ đệm (Cache Poisoning)**: Cấu hình `vercel.json` trước đó áp dụng `Cache-Control: public, max-age=31536000, immutable` cho đường dẫn `/assets/*`. Khi `dist/` bị thiếu file, Vercel trả về mã lỗi 404 và trình duyệt client lưu vĩnh viễn kết quả 404 này vào cache, khiến việc sửa code thông thường không tự cập nhật trên máy khách.

---

## 2. Quy tắc bắt buộc khi Build & Đóng gói (Packaging Standards)

1. **Build tất định (Deterministic Atomic Build)**:
   - Dự án PHẢI sử dụng `scripts/build_dist.cjs` trong lệnh `"build": "node scripts/build_dist.cjs"`.
   - Script build phải tự động:
     - Tạo thư mục `dist/`.
     - Sao chép toàn bộ `assets/` (chứa đầy đủ `site_data.js`, `site_audio.js`, `interactive_engine.js`, `style.css`...).
     - Sao chép toàn bộ `images/` (ảnh WebP, SVG, PNG).
     - Tự động nén và xác thực cú pháp của `index.html`.
     - Chạy bước kiểm thử tự động (Assertion Check): Nếu thiếu bất kỳ file `.js` hoặc `.css` cốt lõi nào trong `dist/`, lệnh build PHẢI throw error dừng ngay lập tức.

2. **Chính sách Cache-Control & Cache-Busting an toàn**:
   - Trong `vercel.json`:
     - Tài nguyên HTML (`/index.html`): `max-age=0, must-revalidate`.
     - Tài nguyên assets không có mã hash nội dung trong tên file (`/assets/(.*)`): `max-age=0, must-revalidate` (hoặc `no-cache`). Tuyệt đối KHÔNG dùng `immutable`.
     - Chỉ dùng `immutable` cho các file có định danh hash duy nhất.
   - Trong `index.html`:
     - Mọi thẻ `<script src="assets/....js?v=...">` và `<link rel="stylesheet" href="assets/....css?v=...">` PHẢI gắn query string version `?v=YYYYMMDD_...` để ép trình duyệt tải mới khi có bản vá.

---

## 3. Quy trình Kiểm thử & Nghiệm thu (Verification Protocol)

- **Không bao giờ khẳng định thành công chỉ bằng mắt thường trên localhost**:
  1. **Kiểm tra mạng (Network)**: Mở DevTools trên domain thật (`https://dienbiendisanso.vercel.app/`), xác nhận 100% tài nguyên `.js` và `.css` trả về `HTTP 200 OK` (0 lỗi 404).
  2. **Kiểm tra Console**: 0 lỗi uncaught exceptions.
  3. **Kiểm tra tương tác chuột (Synthetic Click Test)**:
     - Nút CTA Khám phá (Hero)
     - Nút chuyển di tích (Tour Stepper Next / Prev)
     - Nút Mở Sa bàn 3D / Toàn cảnh 360 độ (Modal Viewer)
     - Thẻ chiến dịch 3 giai đoạn (Campaign Phases)
     - Bản đồ số & Thư viện ảnh (Lightbox)
