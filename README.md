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
6. **👑 Phân quyền & Quản trị (Roles & Admin)**
   - Các vai trò: Người nội trợ, Thành viên gia đình, Quản trị viên (Admin).
   - Quản trị viên hỗ trợ quản lý tài khoản, danh mục thực phẩm, công thức.

## 🛠 Tech Stack (Công nghệ sử dụng)

- **Frontend:** React.js, Vite, TypeScript, React Router DOM, Axios, Lucide-React.
- **Backend:** Node.js, Express.js, TypeScript, JWT, Bcrypt.
- **Database:** 

## 🚀 Hướng dẫn cài đặt và Chạy dự án (Getting Started)

Yêu cầu máy có cài đặt sẵn [Node.js](https://nodejs.org/) (khuyến nghị phiên bản LTS).

### 1. Khởi động Backend
Mở terminal và di chuyển vào thư mục `backend`:
```bash
cd backend
npm install
```
Tạo file `.env` (nếu chưa có) và thiết lập môi trường:
```env
PORT=5000
# DB_URL=...
# JWT_SECRET=...
```

Khởi động server phát triển:
```bash
npm run dev
```

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
Trang web sẽ tự động hiển thị hoặc bạn có thể truy cập thông qua `http://localhost:5173`.