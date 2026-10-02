# 🧠 Brain Dump - AI Planner cho Sinh Viên

> **Hệ thống AI Planner toàn diện**: Biến suy nghĩ hỗn độn & deadline dồn dập thành lịch trình học tập cụ thể, khả thi và tự động điều chỉnh khi cuộc sống thay đổi.

---

## 🏗️ Kiến Trúc Hệ Thống (3-Tier Architecture)

* **Frontend (FE)**: React (Vite) + Tailwind CSS + Lucide Icons + Canvas Confetti (Giao diện Lịch tuần, Lịch ngày, Checklist Hôm nay, Pomodoro đếm giờ, Cảnh báo Workload & Streak).
* **Backend (BE)**: Node.js (Express.js) + Prisma ORM + Google Generative AI (Gemini 1.5/2.0 Flash) & NLP Rule Engine tích hợp sẵn.
* **Database (DB)**: PostgreSQL (Hỗ trợ Cloud Neon.tech / Supabase hoặc In-Memory Fallback tức thì) + File script `schema.sql` có sẵn để import / nộp bài.

---

## ⚡ Hướng Dẫn Chạy Nhanh Trong 1 Phút

### 1. Khởi động Backend (Port 5000)
```bash
cd backend
npm install
npm run dev
```

### 2. Khởi động Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Truy cập ngay trên trình duyệt: **`http://localhost:5173`**

---

## 🗄️ Cấu Hình PostgreSQL Online (Tùy Chọn)
1. Đăng ký tài khoản miễn phí tại **[Neon.tech](https://neon.tech/)** hoặc **[Supabase.com](https://supabase.com/)**.
2. Copy chuỗi kết nối (Connection String) dán vào file `backend/.env`:
   ```env
   DATABASE_URL="postgresql://username:password@ep-xyz.neon.tech/neondb?sslmode=require"
   ```
3. Chạy lệnh đồng bộ bảng:
   ```bash
   cd backend
   npx prisma db push
   ```
4. Hoặc tải trực tiếp file `backend/schema.sql` (hoặc bấm nút **"Tải .SQL"** trên thanh Navbar của ứng dụng) để nộp báo cáo hoặc chạy câu lệnh SQL.

---

## ✨ Các Tính Năng Đã Hoàn Thiện Trong Ứng Dụng:
1. **Brain Dump Chatbot**: Nhập văn bản tự do tiếng Việt (tên việc, mốc thời gian tương đối như "thứ 6 này", "ngày mai", viết tắt).
2. **Auto Breakdown**: Tự nhận diện môn học, mức độ ưu tiên và chia thành các bước nhỏ thực tế (Thu thập tài liệu -> Dàn ý -> Viết nháp -> Rà soát).
3. **Weekly & Daily Calendar**: Hiển thị trực quan Thời khóa biểu cố định và các khối việc AI xếp, phân biệt màu sắc rõ ràng.
4. **Today Checklist**: Danh sách việc cần làm trong ngày với thanh tiến độ hoàn thành.
5. **Pomodoro Timer (25/5 & 50/10)**: Đồng hồ tập trung, ghi nhận số phút thực tế vào Database để AI tính toán hệ số bù và khung giờ vàng.
6. **Re-plan / Bận / Dời lịch**: Tự động dời lịch khi người dùng báo bận đột xuất.
7. **Panic Mode**: Nén lịch trình dày đặc và tối giản các bước phụ khi sát deadline.
8. **What-If Simulation**: Mô phỏng khối lượng tải khi nhận thêm 10 giờ làm việc/tuần.
9. **Cảnh báo quá tải (Workload Banner)** & **Báo cáo Streak / Thống kê tuần**.
"# Brain-Dump" 
"# Brain-Dump" 
"# Brain-Dump" 
