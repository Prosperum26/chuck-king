# 🔀 Git Workflow - Chuck King

> **Hướng dẫn sử dụng Git cho team 9 người**

---

## 🌿 Branching Strategy

### Main Branches

```
main (production)
  └── develop (integration)
      ├── feature/frontend-ui
      ├── feature/frontend-canvas
      ├── feature/frontend-integration
      ├── feature/game-engine
      ├── feature/game-entities
      ├── feature/ai-integration
      ├── feature/ai-tracking
      ├── feature/backend-server
      └── feature/backend-api
```

### Branch Naming Convention

**Format:** `feature/team-name-task`

**Examples:**
- `feature/frontend-ui-mute-button`
- `feature/game-engine-physics-fix`
- `feature/backend-api-ai-endpoint`
- `feature/ai-integration-error-handling`

---

## 📋 Workflow Steps

### 1. Bắt đầu làm việc

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Tạo feature branch mới
git checkout -b feature/your-team-task

# Example:
git checkout -b feature/frontend-ui-stats-display
```

### 2. Làm việc trên feature branch

```bash
# Code, code, code...

# Stage changes
git add .

# Commit với message rõ ràng
git commit -m "[FE-1] Add stats display component"

# Push lên remote
git push origin feature/your-team-task
```

### 3. Commit Message Format

**Format:** `[TEAM] Description`

**Team Codes:**
- `[FE-1]` - Frontend UI/UX
- `[FE-2]` - Frontend Canvas
- `[FE-3]` - Frontend Integration
- `[GE-1]` - Game Engine
- `[GE-2]` - Game Entities
- `[AI-1]` - AI Integration
- `[AI-2]` - AI Tracking
- `[BE-1]` - Backend Server
- `[BE-2]` - Backend API

**Examples:**
```
[FE-1] Add mute button styling
[GE-1] Fix player jump physics
[AI-1] Add API error handling
[BE-2] Implement /api/ai/generate endpoint
[FE-3] Integrate AI API calls
```

### 4. Merge vào develop

```bash
# Switch về develop
git checkout develop
git pull origin develop

# Merge feature branch
git merge feature/your-team-task

# Push lên remote
git push origin develop
```

### 5. Xử lý merge conflicts

```bash
# Khi có conflict
git merge feature/other-team-branch

# Git sẽ báo conflict, mở file và fix:
# <<<<<<< HEAD
# Your code
# =======
# Their code
# >>>>>>> feature/other-team-branch

# Sau khi fix:
git add .
git commit -m "[TEAM] Resolve merge conflict"
```

---

## ⚠️ Quy tắc quan trọng

### ✅ Nên làm:

1. **Pull trước khi push:**
   ```bash
   git pull origin develop
   ```

2. **Commit thường xuyên:**
   - Commit sau mỗi feature nhỏ hoàn thành
   - Không commit code chưa test

3. **Test trước khi merge:**
   - Test code trên local trước
   - Test integration với develop branch

4. **Review code:**
   - Nếu có thể, review code của nhau trước khi merge
   - Đặc biệt với shared files

### ❌ Không nên làm:

1. **Không commit vào `main` trực tiếp**
   - Luôn merge qua `develop` trước

2. **Không commit sensitive data:**
   - API keys
   - Passwords
   - `.env` files

3. **Không force push vào shared branches:**
   ```bash
   # ❌ KHÔNG làm:
   git push --force origin develop
   ```

4. **Không commit code không chạy được:**
   - Code phải chạy được trên local
   - Ít nhất không có syntax errors

---

## 🔄 Daily Workflow

### Buổi sáng (bắt đầu làm việc):

```bash
# 1. Update develop
git checkout develop
git pull origin develop

# 2. Tạo/switch feature branch
git checkout -b feature/your-task-today
# hoặc
git checkout feature/your-existing-branch
git pull origin feature/your-existing-branch
```

### Trong ngày:

```bash
# Code, test, commit
git add .
git commit -m "[TEAM] Description"
git push origin feature/your-branch
```

### Cuối ngày:

```bash
# Merge vào develop nếu feature hoàn thành
git checkout develop
git pull origin develop
git merge feature/your-branch
git push origin develop

# Hoặc để lại cho ngày mai
git push origin feature/your-branch
```

---

## 🚨 Xử lý tình huống

### 1. Code bị conflict với develop

```bash
# Update feature branch với develop
git checkout feature/your-branch
git pull origin develop
# Fix conflicts
git add .
git commit -m "[TEAM] Resolve conflicts with develop"
```

### 2. Commit nhầm message

```bash
# Nếu chưa push:
git commit --amend -m "[TEAM] Correct message"

# Nếu đã push:
git commit --amend -m "[TEAM] Correct message"
git push --force origin feature/your-branch
# (Chỉ force push vào feature branch của mình)
```

### 3. Muốn undo commit

```bash
# Undo last commit (giữ changes):
git reset --soft HEAD~1

# Undo last commit (xóa changes):
git reset --hard HEAD~1
# ⚠️ Cẩn thận, mất code!
```

### 4. Muốn xem thay đổi

```bash
# Xem changes chưa stage:
git diff

# Xem changes đã stage:
git diff --staged

# Xem commit history:
git log --oneline
```

---

## 📊 Git Commands Cheat Sheet

### Basic Commands

```bash
# Status
git status

# Add files
git add .                    # Add all
git add file.js              # Add specific file

# Commit
git commit -m "Message"

# Push
git push origin branch-name

# Pull
git pull origin branch-name

# Branch
git branch                   # List branches
git branch -a                # List all (including remote)
git checkout -b new-branch   # Create and switch
git checkout branch-name     # Switch branch
```

### Advanced Commands

```bash
# Stash (tạm lưu changes)
git stash                    # Save changes
git stash pop                # Restore changes

# Log
git log --oneline            # Compact log
git log --graph --oneline    # Visual log

# Remote
git remote -v                # Show remotes
git fetch origin             # Fetch without merge
```

---

## 👥 Team Coordination

### Khi merge vào develop:

1. **Thông báo trên Discord/Slack:**
   ```
   "Đã merge feature/frontend-ui-mute-button vào develop"
   ```

2. **Nếu có breaking changes:**
   ```
   "⚠️ BREAKING: Đã thay đổi API format, cần update frontend"
   ```

3. **Nếu cần test integration:**
   ```
   "Cần test integration với backend API endpoint"
   ```

---

## 🎯 Best Practices

1. **Small, frequent commits** > Large, infrequent commits
2. **Clear commit messages** giúp team hiểu changes
3. **Pull before push** tránh conflicts
4. **Test before merge** đảm bảo code chạy
5. **Communicate** khi có breaking changes

---

**Last Updated**: 2024-01-15
**Maintained by**: All Teams

