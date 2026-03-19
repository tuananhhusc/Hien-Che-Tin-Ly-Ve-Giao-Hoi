# Lumen Gentium - Nền tảng Đọc Thần Học Học Thuật

Dự án này là một ứng dụng web hiện đại được xây dựng bằng **Next.js**, chuyên dùng để trình bày báo cáo nghiên cứu chuyên sâu về Hiến chế Tín lý **Lumen Gentium** (Công đồng Vaticanô II). Ứng dụng tập trung vào trải nghiệm đọc học thuật với thiết kế theo phong cách tạp chí thần học cao cấp, tối ưu hóa cho cả máy tính và thiết bị di động.

![Giao diện dự án](file:///C:/Users/ASUS/.gemini/antigravity/brain/5919b1ae-0a86-4e08-8094-6624055ee1ad/final_text_content_check_1773924934872.png)

## 🌟 Tính năng chính

- **Trải nghiệm đọc cao cấp**: Sử dụng hệ phông chữ Serif học thuật (Merriweather & Source Serif 4), hỗ trợ Drop Cap (chữ hoa đầu dòng) nghệ thuật.
- **Công cụ hỗ trợ đọc (Reader Tools)**:
  - Tùy chỉnh kích thước chữ, khoảng cách dòng và độ rộng cột văn bản.
  - Tìm kiếm toàn văn (Full-text search) với tính năng highlight từ khóa thời gian thực.
  - Chế độ đọc tập trung, tối giản.
- **Hệ thống Chú thích & Nguồn dẫn thông minh**:
  - Chú thích (Footnotes) hiển thị qua popover/tooltip mà không làm gián đoạn việc đọc.
  - Danh mục nguồn trích dẫn hỗ trợ liên kết hai chiều (bi-directional linking).
  - Xuất trích dẫn theo chuẩn Chicago và hỗ trợ định dạng BibTeX.
- **Mục lục động (Sticky TOC)**: Cập nhật vị trí đang đọc theo thời gian thực (Scrollspy), hỗ trợ điều hướng nhanh trên cả mobile (Sheet/Drawer).
- **Tối ưu hóa học thuật**:
  - Chỉ số thống kê: Số lượng từ, thời gian đọc ước tính.
  - Dữ liệu cấu trúc (JSON-LD) giúp tối ưu tìm kiếm (SEO) theo chuẩn `ScholarlyArticle`.
  - Loại bỏ các ký tự dấu gạch ngang (–, —) để văn bản mượt mà theo chuẩn tiếng Việt học thuật.

## 🛠 Công nghệ sử dụng

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router).
- **Ngôn ngữ**: [TypeScript](https://www.typescriptlang.org/).
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Typography Plugin](https://tailwindcss.com/docs/typography-plugin).
- **UI Components**: [Radix UI](https://www.radix-ui.com/) (Popover, Dialog, Tooltip).
- **Search Engine**: [Mark.js](https://markjs.io/) cho việc highlight nội dung.
- **Icons**: [Lucide React](https://lucide.dev/).

## 📁 Cấu trúc thư mục chính

- `app/`: Chứa các route chính, layout và cấu hình SEO.
- `components/`: Các thành phần giao diện (ArticleBody, SidebarTOC, ReaderEnhancements, v.v.).
- `data/`: Chứa dữ liệu nội dung đã qua xử lý cấu trúc (`structured-content.json`).
- `lib/`: Các tiện ích xử lý logic và parser nội dung.
- `scripts/`: Chứa các script quản lý nội dung:
  - `build-content.ts`: Chuyển đổi văn bản thô `hienche.txt` sang định dạng JSON cấu trúc.
  - `clean-hienche.js`: Dọn dẹp định dạng văn bản gốc.
  - `remove-dashes.js`: Loại bỏ các dấu gạch ngang không cần thiết.

## 🚀 Hướng dẫn cài đặt & Chạy dự án

### Yêu cầu hệ thống
- Node.js 18.x trở lên.
- npm hoặc yarn.

### Các bước cài đặt

1. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

2. **Xây dựng dữ liệu nội dung**:
   Hệ thống sẽ tự động quét file `hienche.txt` để tạo dữ liệu cấu trúc:
   ```bash
   npm run content:build
   ```

3. **Chạy môi trường phát triển**:
   ```bash
   npm run dev
   ```
   Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## 📖 Quy trình xử lý nội dung

Để cập nhật nội dung mới:
1. Chỉnh sửa file `hienche.txt` (Hỗ trợ định dạng số thứ tự mục và chú thích số).
2. Chạy `npm run content:build` để cập nhật dữ liệu vào ứng dụng.
3. Nếu có các ký tự đặc biệt cần loại bỏ, sử dụng các script trong thư mục `scripts/`.

---
© 2024 Lumen Gentium Research Project.
