export class Enemy {
    constructor(x, y, w, h, range) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.startX = x;
        this.range = range;
        
        this.vx = 2; 
        this.direction = 1; 

        // --- HỆ THỐNG ANIMATION ---
        this.image = new Image();
        // GitHub Pages phân biệt hoa/thường → dùng "assets", không phải "Assets"
        this.image.src = './assets/mini-chicken.png';
        
        this.frameX = 0;         // Khung hình hiện tại (0 hoặc 1)
        this.maxFrames = 2;      // Tổng số khung hình trong ảnh
        this.frameTimer = 0;
        this.fps = 8;            // Tốc độ đập cánh/chạy (8 khung hình/giây)
        this.frameInterval = 1000 / this.fps;
    }

    update(deltaTime) {
        this.x += this.vx * this.direction;

        // Quay đầu khi đi hết tầm range
        if (Math.abs(this.x - this.startX) > this.range) {
            this.direction *= -1;
        }

        // Cập nhật khung hình animation
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameX = (this.frameX + 1) % this.maxFrames; // Luân phiên 0 -> 1 -> 0
            this.frameTimer = 0;
        }
    }

    draw(ctx, camera) {
        const screenPos = camera.worldToScreen(this.x, this.y);
        
        // Chỉ vẽ khi ảnh đã load OK (tránh lỗi "broken" image trên GitHub Pages).
        if (this.image.complete && this.image.naturalWidth > 0 && this.image.naturalHeight > 0) {
            ctx.save();
            
            // Tính toán kích thước 1 khung hình trong ảnh gốc (Sprite Sheet)
            // Vì ảnh có 2 khung hình nằm ngang, ta chia chiều rộng tự nhiên cho 2
            const sWidth = this.image.naturalWidth / 2;
            const sHeight = this.image.naturalHeight;

            // Lật ảnh theo hướng di chuyển
            if (this.direction === 1) {
                ctx.translate(screenPos.screenX + this.w, screenPos.screenY);
                ctx.scale(-1, 1); // Lật ngang
                ctx.drawImage(this.image, this.frameX * sWidth, 0, sWidth, sHeight, 0, 0, this.w, this.h);
            } else {
                ctx.drawImage(this.image, this.frameX * sWidth, 0, sWidth, sHeight, screenPos.screenX, screenPos.screenY, this.w, this.h);
            }

            ctx.restore();
        }
    }
}