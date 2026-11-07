# BKonnect API Documentation

Tài liệu thiết kế API RESTful cho hệ thống **BKonnect (Cộng đồng tìm đồ thất lạc Bách Khoa)** phục vụ tích hợp ứng dụng React Native / Expo.

---

## 📋 Danh Sách Màn Hình & Endpoint Liên Quan

| Màn hình | Tính năng | Method | Endpoint |
| :--- | :--- | :--- | :--- |
| **Đăng nhập** | Đăng nhập tài khoản | `POST` | `/api/v1/auth/login` |
| **Đăng ký** | Đăng ký tài khoản mới | `POST` | `/api/v1/auth/register` |
| **Xác thực ngầm** | Lấy lại Access Token mới (Refresh Token) | `POST` | `/api/v1/auth/refresh-token` |
| **Đăng ký / Đăng nhập** | Quên mật khẩu | `POST` | `/api/v1/auth/forgot-password` |
| **Trang chủ** | Lấy danh sách đồ thất lạc (Feed) | `GET` | `/api/v1/items/feed` |
| **Trang chủ** | Lấy chi tiết 1 vật phẩm | `GET` | `/api/v1/items/:id` |
| **Trang chủ** | Gửi yêu cầu nhận lại đồ | `POST` | `/api/v1/items/:id/claim` |
| **Báo nhặt đồ** | Đăng vật phẩm nhặt được | `POST` | `/api/v1/items` |
| **Báo nhặt đồ** | Tải ảnh vật phẩm lên | `POST` | `/api/v1/upload` |
| **Báo nhặt đồ / Filter**| Lấy danh mục & địa điểm | `GET` | `/api/v1/master-data` |

---

## 🛡️ Quy Chuẩn Chung (General Standards)

### Base URL
```text
https://api.bkonnect.hcmut.edu.vn/api/v1
```

### Common Headers
```http
Content-Type: application/json
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

### Standard Response Formats

#### Thành công (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "message": "Xử lý thành công",
  "data": {}
}
```

#### Lỗi (`400`, `401`, `403`, `404`, `500`)
```json
{
  "success": false,
  "errorCode": "INVALID_CREDENTIALS",
  "message": "Tên đăng nhập hoặc mật khẩu không chính xác.",
  "errors": null
}
```

---

## 1. Authentication Module (Xác thực người dùng)

### 1.1. Đăng nhập (Login)
Đăng nhập bằng MSSV hoặc Tên đăng nhập.

- **URL:** `/auth/login`
- **Method:** `POST`
- **Auth required:** Không

#### Request Body
```json
{
  "identifier": "2210001",
  "password": "mySecurePassword123",
  "remember": true
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "d9b2d63d-8bfa-4a2a-9e12...",
    "user": {
      "id": "usr_987654",
      "studentId": "2210001",
      "fullName": "Nguyễn Văn A",
      "email": "a.nguyen2210001@hcmut.edu.vn",
      "avatarUrl": "https://cdn.bkonnect.hcmut.edu.vn/avatars/2210001.png",
      "role": "STUDENT"
    }
  }
}
```

---

### 1.2. Đăng ký (Register)
Tạo tài khoản mới cho sinh viên / cán bộ Bách Khoa.

- **URL:** `/auth/register`
- **Method:** `POST`
- **Auth required:** Không

#### Request Body
```json
{
  "fullName": "Nguyễn Văn A",
  "studentId": "2210001",
  "email": "a.nguyen2210001@hcmut.edu.vn",
  "password": "mySecurePassword123"
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "d9b2d63d-8bfa-4a2a-9e12...",
    "user": {
      "id": "usr_987654",
      "studentId": "2210001",
      "fullName": "Nguyễn Văn A",
      "email": "a.nguyen2210001@hcmut.edu.vn"
    }
  }
}
```

---

### 1.3. Cấp lại Access Token mới (Refresh Token)
Tự động gọi ngầm ở Frontend (`apiService.ts`) khi Access Token bị lỗi `401 Unauthorized`.

- **URL:** `/auth/refresh-token`
- **Method:** `POST`
- **Auth required:** Không

#### Request Body
```json
{
  "refreshToken": "d9b2d63d-8bfa-4a2a-9e12..."
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Cấp lại Token thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "e7c3e74e-9cfb-5b3b-0f23..."
  }
}
```

---

### 1.4. Quên mật khẩu (Forgot Password)
Gửi email khôi phục mật khẩu.

- **URL:** `/auth/forgot-password`
- **Method:** `POST`
- **Auth required:** Không

#### Request Body
```json
{
  "email": "a.nguyen2210001@hcmut.edu.vn"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Mã xác minh đã được gửi đến email Bách Khoa của bạn."
}
```

---

## 2. Lost & Found Items Module (Trang chủ & Danh sách)

### 2.1. Lấy danh sách vật phẩm thất lạc (Get Items Feed)
Lấy danh sách các món đồ được báo nhặt được, hỗ trợ tìm kiếm và lọc theo cơ sở, thể loại.

- **URL:** `/items/feed`
- **Method:** `GET`
- **Auth required:** Có (Bearer Token)

#### Query Parameters
| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `search` (hoặc `q`) | string | No | Từ khóa tìm kiếm (tên đồ, tòa nhà, màu sắc) | `Ví da` |
| `campus` | string | No | Lọc cơ sở (`Tất cả cơ sở`, `Cơ sở 1`, `Cơ sở 2` hoặc `LTK`, `DA`) | `Cơ sở 1` |
| `category` | string | No | Lọc danh mục (`Tất cả`, `Máy tính`, `Điện tử`, `Giấy tờ / Thẻ`, `Ví & Ba lô`, `Chìa khóa`, `Sách vở`) | `Ví & Ba lô` |
| `page` | number | No | Trang hiện tại (Default: 1) | `1` |
| `limit` | number | No | Số lượng item/trang (Default: 10) | `10` |

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Lấy danh sách thành công",
  "data": {
    "items": [
      {
        "id": "item_001",
        "title": "Ví da màu đen",
        "category": "Ví & Ba lô",
        "campus": "Cơ sở 1",
        "building": "Tòa H6",
        "specificLocation": "Phòng H6-302",
        "color": "Màu đen",
        "status": "OPEN",
        "holdingStatusText": "Bảo vệ đang giữ",
        "imageUrl": "https://cdn.bkonnect.hcmut.edu.vn/items/item_001.jpg",
        "createdAt": "2026-11-07T14:30:00Z"
      },
      {
        "id": "item_002",
        "title": "Thẻ sinh viên HCMUT",
        "category": "Giấy tờ / Thẻ",
        "campus": "Cơ sở 1",
        "building": "Thư viện A2",
        "specificLocation": "Tầng 2 bàn đọc",
        "color": "Xanh dương",
        "status": "OPEN",
        "holdingStatusText": "Văn phòng Đoàn - Hội",
        "imageUrl": "https://cdn.bkonnect.hcmut.edu.vn/items/item_002.jpg",
        "createdAt": "2026-11-07T13:45:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 48,
      "hasNextPage": true
    }
  }
}
```

---

### 2.2. Lấy chi tiết vật phẩm (Get Item Details)
- **URL:** `/items/:id`
- **Method:** `GET`
- **Auth required:** Có

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Lấy thông tin chi tiết thành công",
  "data": {
    "id": "item_001",
    "title": "Ví da màu đen",
    "category": "Ví & Ba lô",
    "campus": "Cơ sở 1 - Lý Thường Kiệt",
    "building": "Tòa H6",
    "room": "Phòng H6-302",
    "holdingStatus": "KEEPING_BY_YOUTH_UNION",
    "holdingStatusText": "Văn phòng Đoàn - Hội",
    "description": "Nhặt được tại bàn thứ 2 dãy B. Bên trong có thẻ xe và tiền lẻ.",
    "imageUrl": "https://cdn.bkonnect.hcmut.edu.vn/items/item_001.jpg",
    "finder": {
      "userId": "usr_112233",
      "fullName": "Lê Văn B",
      "maskedStudentId": "221****"
    },
    "createdAt": "2026-11-07T14:30:00Z"
  }
}
```

---

### 2.3. Yêu cầu nhận lại vật phẩm (Claim Item)
Gửi yêu cầu xác minh nhận lại đồ cho người giữ.

- **URL:** `/items/:id/claim`
- **Method:** `POST`
- **Auth required:** Có

#### Request Body
```json
{
  "note": "Tôi là chủ sở hữu chiếc ví. Thẻ xe trong ví mang biển số 59P1-12345.",
  "contactPhone": "0901234567"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Yêu cầu nhận lại đã được gửi đến người đang giữ vật phẩm."
}
```

---

## 3. Report Found Item Module (Báo nhặt được đồ)

### 3.1. Upload Ảnh vật phẩm (Upload Image)
Tải ảnh vật phẩm trước khi submit form.

- **URL:** `/upload`
- **Method:** `POST`
- **Auth required:** Có
- **Content-Type:** `multipart/form-data`

#### Request Body (FormData)
- `file`: Ảnh định dạng JPG/PNG (Tối đa 10 MB)

#### Response (`210 Created`)
```json
{
  "success": true,
  "message": "Upload ảnh thành công",
  "data": {
    "imageUrl": "https://cdn.bkonnect.hcmut.edu.vn/uploads/2026/11/img_998822.jpg",
    "fileId": "file_998822"
  }
}
```

---

### 3.2. Đăng bài báo nhặt được đồ (Create Found Item)
- **URL:** `/items`
- **Method:** `POST`
- **Auth required:** Có

#### Request Body
```json
{
  "title": "Ví da màu đen, hiệu Tommy",
  "imageUrl": "https://cdn.bkonnect.hcmut.edu.vn/uploads/2026/11/img_998822.jpg",
  "categoryCode": "WALLET_BAG",
  "campusCode": "LTK",
  "buildingId": "bld_h6",
  "room": "H6-302",
  "holdingStatus": "KEEPING_BY_YOUTH_UNION",
  "description": "Nhặt được lúc 14h chiều tại phòng học H6-302."
}
```

#### Field Values Reference:
- **`categoryCode`**: `EQUIPMENT` (Thiết bị), `WALLET_BAG` (Ví & ba lô), `DOCUMENT` (Giấy tờ), `OTHER` (Khác)
- **`campusCode`**: `LTK` (Lý Thường Kiệt), `DA` (Dĩ An)
- **`holdingStatus`**: 
  - `KEEPING_BY_SELF` ("Tôi đang giữ")
  - `KEEPING_BY_SECURITY` ("Đã gửi bàn bảo vệ")
  - `KEEPING_BY_YOUTH_UNION` ("Văn phòng Đoàn - Hội")

#### Response (`201 Created`)
```json
{
  "success": true,
  "message": "Đăng tin vật phẩm thành công",
  "data": {
    "itemId": "item_105",
    "status": "PUBLISHED",
    "createdAt": "2026-11-07T15:00:00Z"
  }
}
```

---

## 4. Master Data Module (Dữ liệu danh mục & Địa điểm)

### 4.1. Lấy danh sách Địa điểm & Danh mục (Get Master Data)
Dùng để hiển thị dữ liệu dropdown trên màn hình "Báo nhặt được đồ" và thanh filter ở "Trang chủ".

- **URL:** `/master-data`
- **Method:** `GET`
- **Auth required:** Có

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "categories": [
      { "code": "EQUIPMENT", "name": "Thiết bị", "icon": "laptop" },
      { "code": "WALLET_BAG", "name": "Ví & ba lô", "icon": "briefcase" },
      { "code": "DOCUMENT", "name": "Giấy tờ", "icon": "file-text" }
    ],
    "campuses": [
      {
        "code": "LTK",
        "name": "Cơ sở 1 - Lý Thường Kiệt",
        "buildings": [
          { "id": "bld_a5", "name": "Hội trường A5" },
          { "id": "bld_h6", "name": "Tòa H6" },
          { "id": "bld_c6", "name": "Căn tin C6" },
          { "id": "bld_lib", "name": "Thư viện A2" }
        ]
      },
      {
        "code": "DA",
        "name": "Cơ sở 2 - Dĩ An",
        "buildings": [
          { "id": "bld_h1", "name": "Tòa H1" },
          { "id": "bld_h2", "name": "Tòa H2" },
          { "id": "bld_h3", "name": "Tòa H3" }
        ]
      }
    ]
  }
}
```