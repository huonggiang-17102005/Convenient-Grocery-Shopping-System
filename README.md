# 🛒 Convenient Grocery Shopping System (Hệ thống đi chợ tiện lợi)

Hệ thống đi chợ tiện lợi được thiết kế nhằm hỗ trợ người dùng trong việc lập kế hoạch mua sắm, quản lý thực phẩm trong tủ lạnh và lên thực đơn hàng ngày. Mục tiêu của dự án là giúp người dùng duy trì thói quen tiêu dùng hiệu quả, giảm thiểu lãng phí thực phẩm và đảm bảo dinh dưỡng hợp lý.

## ✨ Tính năng nổi bật (Core Features)

1. **📝 Quản lý danh sách mua sắm**
   - Tạo danh sách theo ngày/tuần, phân loại thực phẩm.
   - Chia sẻ danh sách với các thành viên trong gia đình.
   - Cập nhật trạng thái mua sắm theo thời gian thực.
2. **🧊 Quản lý thực phẩm trong tủ lạnh**
   - Nhập thông tin, số lượng, hạn sử dụng.
   - Tự động nhắc nhở khi thực phẩm sắp hết hạn (trước 3 ngày).
   - Điều chỉnh tồn kho tự động khi nấu ăn hoặc mua mới.
3. **🍱 Lên kế hoạch bữa ăn**
   - Tạo thực đơn theo ngày/tuần dựa trên thực phẩm có sẵn.
   - Lưu trữ công thức nấu ăn và hướng dẫn chế biến.
4. **💡 Gợi ý món ăn thông minh**
   - Đề xuất món ăn dựa trên nguyên liệu còn lại trong tủ lạnh.
   - Tự động tạo danh sách nguyên liệu cần bổ sung.
5. **📊 Báo cáo và Thống kê**
   - Thống kê lịch sử mua sắm và xu hướng tiêu thụ.
   - Báo cáo số lượng thực phẩm lãng phí do hết hạn.
6. **👑 Phân quyền theo vai trò (Role-based Access Control)**
   - **Người nội trợ (Chủ gia đình):** Có toàn quyền tạo và quản lý danh sách mua sắm, kiểm soát thực phẩm trong tủ lạnh, lên thực đơn, và quản lý các thành viên khác trong gia đình.
   - **Thành viên gia đình:** Có quyền xem danh sách mua sắm, cập nhật trạng thái (đánh dấu đã mua), xem thực đơn và theo dõi tình trạng tủ lạnh.
   - **Quản trị viên (Admin):** Quản lý toàn bộ hệ thống, quản lý tài khoản người dùng, kiểm duyệt và quản lý các danh mục dữ liệu dùng chung (như danh mục thực phẩm cơ bản, công thức nấu ăn).

## 🛠 Tech Stack (Công nghệ sử dụng)

- **Frontend:** React.js, Vite, TypeScript, React Router DOM, Axios, Lucide-React.
- **Backend:** Node.js, Express.js, TypeScript.
- **Database & Storage:** Supabase (PostgreSQL).

## 🚀 Hướng dẫn cài đặt và Chạy dự án (Getting Started)

Yêu cầu máy có cài đặt sẵn [Node.js](https://nodejs.org/) (khuyến nghị phiên bản LTS).

### 1. Khởi động Backend
Mở terminal và di chuyển vào thư mục `backend`:
```bash
cd backend
npm install
```

Tạo file `.env` ở trong thư mục `backend` và thiết lập các biến môi trường cho **Supabase**:
```env
PORT=5000
SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
```
*(Ghi chú: Thay thế URL và Key bằng thông tin từ project Supabase của nhóm)*

Khởi động server Backend:
```bash
npm run dev
```
*(Nếu cài đặt đúng, terminal sẽ hiển thị "✅ Đã kết nối thành công với Database (Supabase)!")*

### 2. Khởi động Frontend
Mở một terminal mới và di chuyển vào thư mục `frontend`:
```bash
cd frontend
npm install
```

Khởi động ứng dụng React:
```bash
npm run dev
```
Trang web sẽ tự động hiển thị trên trình duyệt (thường là tại `http://localhost:5173`).

## 🌍 Triển khai (Deployment)

Dự án có thể được triển khai trên các nền tảng đám mây phổ biến như Vercel, Render:

### 1. Frontend (Vercel)
- Tạo tài khoản và kết nối GitHub repository với **Vercel**.
- Khi tạo Project mới, cấu hình Framework Preset là **Vite** (hoặc để tự động nhận diện).
- Root Directory: chọn thư mục `frontend` (tuỳ thuộc cấu trúc repo).
- Build Command: `npm run build`
- Output Directory: `dist`
- Thêm biến môi trường (Environment Variables) nếu có trên giao diện của Vercel.

### 2. Backend (Render hoặc Railway)
- Tạo Web Service mới trên **Render**.
- Kết nối repository và cấu hình Root Directory là `backend`.
- Build Command: `npm install && npm run build` (cần cấu hình script build nếu sử dụng TypeScript).
- Start Command: `npm start` (hoặc lệnh tương ứng chạy production).
- **Lưu ý quan trọng:** Cần thiết lập đầy đủ các biến môi trường (Environment Variables) như `PORT`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` trong phần Settings của dịch vụ.

### 3. Database (Supabase)
- **Supabase** là dịch vụ Cloud nên database đã được triển khai sẵn.
- Đảm bảo bạn sử dụng URL và API key từ dự án Production của mình để kết nối trong phần cấu hình biến môi trường của Backend.