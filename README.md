# Hệ thống Quản Lý Chi Tiêu Cá Nhân

## Giới thiệu
Đây là dự án quản lý chi tiêu cá nhân, giúp người dùng kiểm soát các khoản chi, đặt hạn mức, nhận cảnh báo và gợi ý tiết kiệm thông minh. Hệ thống gồm backend (Node.js/Express/MongoDB) và frontend (React).

## Tính năng chính
- Đăng ký, đăng nhập, xác thực JWT
- Quản lý danh mục chi tiêu, khoản chi, hạn mức
- Đặt hạn mức chi tiêu từng danh mục và tổng tháng
- Cảnh báo khi gần/vượt hạn mức
- Gợi ý tiết kiệm thông minh (AI rule-based)
- Dashboard trực quan, sử dụng biểu đồ tròn và cột
- Giao diện hiện đại, dễ sử dụng

## Cấu trúc dự án
```
backend/
  src/
    controllers/    // Xử lý logic API
    models/         // Định nghĩa dữ liệu MongoDB
    routes/         // Định tuyến API
    middlewares/    // Xác thực, bảo vệ API
    config/         // Kết nối DB
frontend/
  src/
    pages/          // Các trang chính: Dashboard, Category, Expense, Limit, Login, Register, Profile
    components/     // Sidebar, Notification, ...
```

## Hướng dẫn cài đặt
### Backend
1. Di chuyển vào thư mục `backend`
2. Cài đặt package:
   ```bash
   npm install
   ```
3. Tạo file `.env` và cấu hình biến môi trường (ví dụ kết nối MongoDB, JWT_SECRET, ...)
4. Khởi động server:
   ```bash
   npm start
   ```

### Frontend
1. Di chuyển vào thư mục `frontend`
2. Cài đặt package:
   ```bash
   npm install
   ```
3. Khởi động ứng dụng React:
   ```bash
   npm start
   ```

## API tiêu biểu
- `/api/expenses` CRUD khoản chi
- `/api/categories` CRUD danh mục
- `/api/limits` Đặt/lấy hạn mức
- `/api/dashboard/limit-warnings` Cảnh báo hạn mức
- `/api/ai/saving-suggestion` Gợi ý tiết kiệm

## Đóng góp
Mọi đóng góp, báo lỗi hoặc ý tưởng mới đều được hoan nghênh qua Issues hoặc Pull Request trên Github.

## Tác giả
- Doquangan

## License
MIT
