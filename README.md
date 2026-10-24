# 🇻🇳 ĐIỆN BIÊN 3D — STEAM HERITAGE LAB & DIGITAL MUSEUM

> **Không chỉ một nơi. Cả chiến trường lên tiếng.**  
> Hành trình di sản số & giáo dục STEAM Chiến dịch Điện Biên Phủ (1954 – 2026).

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Audio API](https://img.shields.io/badge/Web_Audio-Tactical_FX-blueviolet?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License](https://img.shields.io/badge/Copyright-DESIGN_BY_VUONGGIA-black?style=for-the-badge)](https://github.com/nguyennhu19022008-ux)

---

## 🌟 Giới thiệu Dự án

**Điện Biên 3D** là nền tảng bảo tàng số tương tác kết hợp phương pháp giáo dục liên môn **STEAM (Science, Technology, Engineering, Arts, Mathematics)**. Dự án kết nối 8 không gian 360°, hệ thống cứ điểm chiến trường, sở chỉ huy, di tích lịch sử và các địa điểm tưởng niệm thành một hành trình học tập có nhiệm vụ quan sát, dữ liệu tọa độ thực địa và góc nhìn tư duy hệ thống.

---

## 🎯 Các Tính năng Cốt lõi

### 1. 🛡️ Slide 0 Bản quyền & Giấy chứng nhận sở hữu trí tuệ ("DESIGN BY VUONGGIA")
- Giao diện mở đầu nghệ thuật **100% Monochrome OLED** (`#000000`), 5 hàng chữ lớn in hoa `DESIGN BY VUONGGIA` nghiêng `-32°` chạy marquee chậm rãi.
- Bảng kính mờ trung tâm với chứng nhận mã định danh `ID: VG-DB3D-2026-IP`, điều khoản nghiêm ngặt cấm thương mại hóa, thông tin liên hệ chính thức Email & Hotline kèm nút sao chép 1 chạm.

### 2. 🧭 Trung tâm Khám phá 8 Tour 3D & Bảng Telemetry trượt động
- Bộ chuyển tour bằng nút mũi tên `←` và `→` kết hợp dải quét quang học HUD (`hud-scanning`) và chuyển cảnh đa chiều (`slide-in-right` / `slide-in-left`).
- **Bảng thông tin trượt ra mượt mà (Info Telemetry Panel)**: Hiển thị đầy đủ huy hiệu chặng, tiêu đề di sản, tọa độ GPS thực địa, diễn biến tác chiến 1954, nhiệm vụ quan sát STEAM và danh sách 4 điểm nên tìm.
- 5 Tab lọc tour thông minh: *Tất cả (8)*, *Chiến trường (2)*, *Chỉ huy (1)*, *Di sản (1)*, *Tưởng niệm (4)*.
- **Trình giả lập Panorama 360°**: Kéo chuột xoay đa hướng (drag-to-pan), phóng to/thu nhỏ (zoom in/out) và liên kết trực tiếp cổng eGAL 3D.

### 3. 🗺️ Sa bàn Tác chiến 10 Cứ điểm & Tuyến đường Hành quân Động
- 10 điểm pin tác chiến (từ H01 Him Lam đến H10 Hầm De Castries).
- Hiệu ứng sóng radar sonar quét vòng tròn khi chọn cứ điểm, cập nhật tư liệu thực địa, câu hỏi STEAM và thanh đếm tiến trình khám phá (`1/10` -> `10/10`).
- **Đường nét đứt hành quân chuyển động liên tục** (`stroke-dashoffset` animation) trực quan hóa mạch tiến công tác chiến của quân ta trong chế độ *Theo hành trình*.

### 4. 🔬 Phòng học STEAM Tương tác (4 Trạm Mô phỏng)
- **S · Science (Khoa học)**: Thanh trượt tương tác thay đổi độ cao quan sát từ 10m đến 80m để tính tầm nhìn xa hình học (km), góc tà xạ giới xuống sân bay Mường Thanh và tỷ lệ vùng che khuất (Dead Zone).
- **T · Technology (Công nghệ)**: Thuật toán tối ưu hóa tuyến đường số GIS ngắn nhất.
- **E · Engineering (Kỹ thuật)**: Mô phỏng tiêu âm và tán xạ sóng nổ của chiến hào chữ chi 120°.
- **M · Mathematics (Toán học)**: Bộ đếm số liệu tự động tăng dần (cubic ease-out) cho dữ liệu hậu cần, xe đạp thồ và năng lượng nổ bộc phá.

### 5. 📜 4 Chặng Hành trình & Hồ sơ Quân sự Chuyên sâu
- **Mường Phăng ↗**: Hồ sơ cơ mật Sở chỉ huy Đại tướng Võ Nguyên Giáp và đường hầm xuyên núi 320m.
- **So sánh A1 – D1 ↗**: Bảng đối chiếu quân sự chuyên sâu giữa 2 cao điểm Đông (Cao độ, công sự ngầm, hỏa lực, ý nghĩa chiến dịch).
- **Thành Bản Phủ ↗**: Di sản thành lũy Hoàng Công Chất thế kỷ XVIII.
- **Tuyến Tri Ân ↗**: Bản đồ 4 nghĩa trang liệt sĩ mặt trận (A1, Him Lam, Độc Lập, Tông Khao).

### 6. ✨ Hiệu ứng Cuộn Màn hình, ScrollSpy & Âm thanh Web Audio
- **Global Scroll Progress Bar**: Dải chỉ vàng kim cao 2.5px chạy sát mép Header phản ánh chính xác vị trí đọc trang.
- **Header Glassmorphism**: Tự động chuyển nền kính mờ khi cuộn trang (`scrollY > 80px`).
- **ScrollSpy**: Tự động đánh dấu mục menu đang xem bằng đường gạch chân vàng kim phát sáng.
- **Card 3D Perspective Tilt**: Thẻ nghiêng 3D mượt mà theo vị trí con trỏ chuột.
- **Web Audio API**: Âm thanh tactile click, radar blip, transition whoosh, success chime (kèm nút bật/tắt âm thanh trên Header).
- **100% SVG Icons**: Tuyệt đối không dùng emoji, chuẩn hóa toàn bộ sang Heroicons/Lucide SVG sắc nét.

---

## 📁 Cấu trúc Thư mục

```
dienbiendisanso/
├── index.html                   # Điểm vào chính của ứng dụng web
├── vercel.json                  # Cấu hình tối ưu bộ nhớ đệm và bảo mật Vercel
├── package.json                 # Cấu hình Node.js & script phát triển
├── .gitignore                   # Loại trừ các tệp tạm và file hệ thống
├── README.md                    # Tài liệu dự án
├── favicon.svg                  # Icon thương hiệu DB
├── file.svg, globe.svg...       # Tài nguyên đồ họa vector
├── assets/
│   ├── site_styles.css          # Hệ màu Editorial Military & typography
│   ├── interactive_enhancements.css # Animation, Scroll-Driven reveals, 3D tilt
│   ├── site_data.js             # Dữ liệu 8 Tour 3D & 10 Cứ điểm Sa bàn
│   ├── site_audio.js            # Bộ tổng hợp âm thanh Web Audio API
│   └── interactive_engine.js    # Động cơ tương tác, chuyển cảnh & ScrollSpy
└── images/
    ├── a1.webp                  # Cứ điểm Đồi A1 & hố bộc phá 960kg
    ├── d1.webp                  # Cứ điểm Đồi D1 & Tượng đài Chiến thắng
    ├── muong-phang.webp         # Sở chỉ huy Mường Phăng rừng nguyên sinh
    ├── him-lam-aerial.webp      # Không ảnh trinh sát sân bay & thung lũng
    ├── him-lam-memorial.webp    # Cứ điểm & Nghĩa trang Liệt sĩ Him Lam
    └── a1-cemetery.webp         # Nghĩa trang Liệt sĩ Đồi A1
```

---

## 🚀 Hướng dẫn Triển khai & Phát triển

### 1. Triển khai 1-Click lên Vercel (Production)
1. Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
2. Nhấn **Add New...** -> **Project**.
3. Chọn kho lưu trữ `dienbiendisanso`.
4. Giữ nguyên toàn bộ thiết lập mặc định (Framework Preset: *Other*, Root Directory: `./`).
5. Nhấn **Deploy** — Website sẽ được phát hành toàn cầu trong vòng 15 giây với chứng chỉ SSL HTTPS tự động!

### 2. Chạy Môi trường Phát triển Cục bộ (Local Dev)
Yêu cầu Node.js (phiên bản 18+ trở lên):

```bash
# 1. Cài đặt các gói phụ thuộc (nếu cần dùng Vite)
npm install

# 2. Khởi chạy máy chủ phát triển Vite với Hot Reload
npm run dev

# Hoặc khởi chạy nhanh bằng serve
npx serve .
```

---

## ⚖️ Bản quyền & Điều khoản Sở hữu Trí tuệ

- **Thiết kế & Tác quyền**: Thuộc quyền sở hữu độc bản của **VUONGGIA**.
- **Mã định danh**: `VG-DB3D-2026-IP`.
- **Điều khoản nghiêm ngặt**: `TUYỆT ĐỐI KHÔNG THƯƠNG MẠI, MUA BÁN, SANG NHƯỢNG DƯỚI MỌI HÌNH THỨC SAU KHI ĐÃ SỞ HỮU.`
- **Email liên hệ**: [nguyennhu19022008@gmail.com](mailto:nguyennhu19022008@gmail.com)
- **Hotline hỗ trợ**: `0876637806`
