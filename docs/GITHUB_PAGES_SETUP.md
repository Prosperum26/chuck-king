# 🚀 GitHub Pages Setup Guide

> **Hướng dẫn deploy Chuck King lên GitHub Pages**

---

## 📋 Prerequisites

- GitHub account
- Repository đã push code lên GitHub

---

## 🔧 Setup GitHub Pages

### Bước 1: Enable GitHub Pages

1. Vào repository trên GitHub
2. Click **Settings** → **Pages** (sidebar bên trái)
3. Trong **Source**, chọn:
   - **Branch**: `main` (hoặc `master`)
   - **Folder**: `/ (root)`
4. Click **Save**

### Bước 2: Đợi deployment

- GitHub sẽ tự động build và deploy
- Thường mất 1-2 phút
- URL sẽ là: `https://[username].github.io/[repository-name]`

### Bước 3: Kiểm tra

- Mở URL trong browser
- Game sẽ tự động load
- Nếu có lỗi, check Console (F12)

---

## ✅ Checklist trước khi deploy

### Paths đã fix:

- [x] CSS path: `./styles/main.css` (relative)
- [x] JS path: `./js/main.js` (relative)
- [x] Tất cả imports dùng `./` hoặc `../`
- [x] Script tag có `type="module"`
- [x] Không có absolute paths (`/`)

### Cache busting:

- [x] Meta tags đã thêm vào `game.html` (trang game)
- [x] User có thể refresh cache bằng `Ctrl + Shift + R`

---

## 🔍 Troubleshooting

### Lỗi: "Failed to load module"

**Nguyên nhân:** Import paths không đúng

**Giải pháp:**
- Đảm bảo tất cả imports dùng relative paths (`./` hoặc `../`)
- Không dùng absolute paths (`/js/...`)

### Lỗi: "404 Not Found"

**Nguyên nhân:** File không tồn tại hoặc path sai

**Giải pháp:**
- Check file structure trong repository
- Đảm bảo `index.html` (entry) và `game.html` (game) ở root
- Check paths trong `index.html` và `game.html`

### Lỗi: CORS khi gọi API

**Nguyên nhân:** Backend không cho phép GitHub Pages origin

**Giải pháp:**
- Backend cần config CORS cho GitHub Pages URL
- Hoặc dùng proxy/CORS proxy

### Cache không refresh

**Giải pháp:**
- Hard refresh: `Ctrl + Shift + R` (Windows) hoặc `Cmd + Shift + R` (Mac)
- Clear browser cache
- Thêm query string vào assets (nếu cần): `./js/main.js?v=1.0.0`

---

## 📝 Notes

### GitHub Pages URL format:

```
https://[username].github.io/[repository-name]/
```

**Ví dụ:**
- Username: `john-doe`
- Repository: `chuck-king`
- URL: `https://john-doe.github.io/chuck-king/`

### Custom domain (optional):

Nếu có custom domain, có thể config trong Settings → Pages → Custom domain

---

## 🔄 Update code

Sau khi push code mới:

1. GitHub tự động rebuild
2. Đợi 1-2 phút
3. Hard refresh browser (`Ctrl + Shift + R`)
4. Check xem update đã apply chưa

---

## 🎯 Best Practices

1. **Test local trước khi push:**
   - Mở `index.html` (menu) và `game.html` (game) trong browser
   - Check Console không có errors
   - Test tất cả features

2. **Commit message rõ ràng:**
   ```
   [Deploy] Fix paths for GitHub Pages
   [Fix] Update CSS paths to relative
   ```

3. **Monitor deployment:**
   - Check Actions tab trên GitHub
   - Xem có build errors không

---

## 📚 Resources

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [GitHub Pages Custom 404](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site)

---

**Last Updated**: 2024-01-15

