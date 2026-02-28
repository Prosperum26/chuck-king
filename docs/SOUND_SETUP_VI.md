# 🎵 Hệ Thống Âm Thanh - Hướng Dẫn Nhanh

## 📋 Tổng Thể
Mình vừa tích hợp hệ thống âm thanh hoàn chỉnh cho game với:
- 🎵 **Nhạc nền** cho menu và các scene
- 🔊 **Hiệu ứng âm thanh** cho hành động nhân vật
- 🔉 **Điều chỉnh âm lượng** riêng biệt

## 📁 Cấu Trúc File Âm Thanh

```
assets/sound/
├── background/
│   ├── menuTheme.mp3          ← Nhạc menu chính
│   ├── background_scene1.ogg  ← Nhạc nền Scene 1 (gameplay)
│   └── background_scene2.mp3  ← Nhạc nền Scene 2 (gameplay)
└── SFX/
    ├── jump.mp3               ← Âm thanh nhảy
    ├── DEEP_fall.mp3          ← Âm thanh té/hạ cánh
    ├── sfx_conversation.mp3   ← Âm thanh hội thoại
    ├── sfx_walk_scene1_left.flac   ← Đi bộ trái (Scene 1)
    ├── sfx_walk_scene1_right.flac  ← Đi bộ phải (Scene 1)
    ├── sfx_walk_scene2_left.flac   ← Đi bộ trái (Scene 2)
    └── sfx_walk_scene2_right.flac  ← Đi bộ phải (Scene 2)
```

## 🎮 Khi Nào Âm Thanh Phát

| Âm Thanh | Sự Kiện | Khi Nào |
|---------|--------|---------|
| **Menu Theme** | Trang tải | Khi mở game (trước khi chơi) |
| **Scene Background** | Game bắt đầu | Khi nhấn "GET READY!" |
| **Jump** | Nhân vật nhảy | Bấm Space khi đứng trên nền |
| **Walk** | Di chuyển | Bấm ← → A D khi đứng trên nền |
| **Fall** | Hạ cánh mạnh | Rơi từ cao + tiếp đất |
| **Bounce** | Nảy | Bước lên nền nảy (bouncy platform) |

## 🎛️ Điều Chỉnh Âm Lượng

### Thay Đổi Âm Lượng (Console)
```javascript
// Điều chỉnh âm lượng (từ 0.0 đến 1.0)
soundManager.setMasterVolume(0.8);    // Âm lượng chính
soundManager.setBGMVolume(0.6);       // Nhạc nền
soundManager.setSFXVolume(0.9);       // Hiệu ứng

// Bật/tắt âm thanh
soundManager.toggleMute();  // Tắt tiếng hoàn toàn
```

### Âm Lượng Mặc Định
- **Master:** 100% (1.0)
- **BGM:** 50% (0.5) 
- **SFX:** 70% (0.7)

## 🔧 Các File Được Sửa

### 1. **js/systems/SoundManager.js** (TẠO MỚI)
- Quản lý tất cả âm thanh
- Phát/dừng/điều khiển âm lượng
- Xử lý nhạc nền & SFX riêng biệt

### 2. **js/systems/EventTracker.js** (CẬP NHẬT)
- Thêm hệ thống lắng nghe sự kiện
- Phát sự kiện khi nhân vật hành động

### 3. **js/entities/Player.js** (CẬP NHẬT)
- Ghi nhận sự kiện "walk" (di chuyển)
- Ghi nhận sự kiện "land" (hạ cánh)

### 4. **js/main.js** (CẬP NHẬT)
- Import SoundManager
- Khởi tạo SoundManager
- Lắng nghe sự kiện từ EventTracker
- Phát nhạc menu khi tải trang
- Phát nhạc nền khi game bắt đầu

## 🎯 Các Tính Năng Chính

### Tự Động Phát
```javascript
// Khi tải trang → Phát menu theme
// Khi nhấn "GET READY!" → Dừng menu, phát Scene 1 music
```

### Lắng Nghe Sự Kiện
```javascript
// Nhân vật nhảy → Phát jump sound
// Nhân vật di chuyển → Phát walk sound (trái/phải)
// Nhân vật hạ cánh mạnh → Phát fall sound
// Bước lên nền nảy → Phát jump sound
```

### Chuyển Scene (Nâng Cao)
```javascript
// Trong Console, gõ:
window.switchScene(2);  // Chuyển sang Scene 2 music
window.switchScene(1);  // Quay lại Scene 1 music
```

## 📊 Sơ Đồ Hệ Thống

```
┌─────────────┐
│  Trang HTML │─→ Load event → soundManager.playMenuTheme()
└─────────────┘

┌─────────┐
│  Player │─→ Movement event → eventTracker.track('walk')
│         │─→ Jump event → eventTracker.track('jump')
│         │─→ Landing event → eventTracker.track('land')
└─────────┘
    ↓
┌──────────────────┐
│ EventTracker     │─→ Emit events
└──────────────────┘
    ↓
┌──────────────────┐
│ SoundManager     │─→ Play appropriate sounds
│ (listeners)      │
└──────────────────┘
```

## ✅ Kiểm Tra Hoạt Động

1. Mở game → Nghe nhạc menu
2. Nhấn "GET READY!" → Nhạc menu dừng, nhạc Scene 1 phát
3. Bấm mũi tên → Nghe tiếng bước chân
4. Bấm Space → Nghe tiếng nhảy
5. Rơi từ cao → Nghe tiếng hạ cánh
6. Bước lên nền nảy → Nghe tiếng nhảy

## 🎓 Thêm Âm Thanh Mới

### Bước 1: Thêm File Audio
- Đặt file vào thư mục `assets/sound/category/`

### Bước 2: Đăng Ký Trong SoundManager
```javascript
// Trong SoundManager.js, phần soundPaths:
this.soundPaths = {
    // ... các sound cũ
    myNewSound: 'assets/sound/SFX/my_new_sound.mp3',
};
```

### Bước 3: Phát Âm Thanh
```javascript
// Cách 1: Trực tiếp
soundManager.playSFX('myNewSound');

// Cách 2: Qua Event
eventTracker.on('someEvent', () => {
    soundManager.playSFX('myNewSound');
});
```

## 🐛 Xử Lý Vấn Đề

**Không nghe thấy âm thanh?**
1. Kiểm tra browser console (F12) xem có lỗi
2. Kiểm tra đường dẫn file có đúng không
3. Kiểm tra browser/hệ điều hành đã bật âm thanh
4. Kiểm tra file audio tồn tại

**Âm thanh bị lag/giật?**
1. Thể file FLAC sang MP3/OGG
2. Giảm số lượng âm thanh phát cùng lúc

**Âm thanh quá to/quá nhỏ?**
1. Dùng hàm điều chỉnh volume
2. Hoặc sửa giá trị mặc định trong SoundManager

## 📝 Ghi Chú

- ✅ **Không làm hỏng code cũ** - Hoàn toàn tương thích
- ✅ **Event tracking vẫn hoạt động** - Chỉ thêm âm thanh vào
- ✅ **Dễ tùy chỉnh** - Thay đổi volume, thêm sound nhé
- ✅ **Hỗ trợ scene switching** - Sẵn sàng cho nhiều level

## 🚀 Tiếp Theo?

Bạn có thể:
1. Thêm âm thanh Settings/About (khi click button)
2. Thêm ambient sound cho từng scene
3. Thêm UI button sounds
4. Thêm combo/score sounds
5. Lưu volume preferences vào localStorage

Chúc bạn code vui vẻ! 🎮
