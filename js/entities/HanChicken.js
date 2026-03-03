export class HanChicken {
    constructor(x, y) {
        // Vị trí và kích thước (1x3 tiled: 32x96 pixel)
        this.x = x;
        this.y = y;
        this.w = 70;      // chiều rộng 1 tile
        this.h = 70;      // chiều cao 3 tiles

        // Animation
        this.frameX = 0;
        this.frameTimer = 0;
        this.fps = 2;    
        this.frameInterval = 1000 / this.fps;
        this.currentState = 'idle';

        // Kích thước frame từ sprite sheet chicken-heart.png
        // File có kích thước 32x32 mỗi frame, 2 frame theo chiều ngang
        this.frameWidth = 32;   // Chiều rộng mỗi frame trong sprite
        this.frameHeight = 32;  // Chiều cao mỗi frame trong sprite
        this.maxFrames = 2;     // chicken-heart.png có 2 frame theo chiều ngang

        // Load hình ảnh sprite sheet
        const getAsset = (path) => new URL(path, import.meta.url).href;

        this.spriteImage = new Image();
        this.spriteImage.src = getAsset('../../Assets/chicken-heart.png');

        // Đảm bảo ảnh được load hoàn toàn trước khi render
        this.imageLoaded = false;
        this.spriteImage.onload = () => {
            this.imageLoaded = true;
        };
    }

    update(deltaTime) {
        // Chỉ cập nhật animation nếu ảnh đã load
        if (!this.imageLoaded) {
            return;
        }

        // Cập nhật timer animation
        this.frameTimer += deltaTime;

        // Lặp lại sau mỗi frameInterval
        if (this.frameTimer >= this.frameInterval) {
            this.frameX++;
            this.frameTimer -= this.frameInterval; // Trừ thay vì reset để tránh stuttering

            // Lặp lại frame khi vượt quá số frame tối đa
            if (this.frameX >= this.maxFrames) {
                this.frameX = 0;
            }
        }
    }

     draw(ctx, camera) {
        if (!this.imageLoaded || !this.spriteImage.complete) return;

        let screenX = this.x;
        let screenY = this.y;

        if (camera && typeof camera.worldToScreen === 'function') {
            const screenPos = camera.worldToScreen(this.x, this.y);
            screenX = screenPos.screenX;
            screenY = screenPos.screenY;
        }

        // 🔥 LUÔN QUAY SANG TRÁI
        ctx.save();

        ctx.translate(screenX + this.w, screenY);
        ctx.scale(-1, 1);

        ctx.drawImage(
            this.spriteImage,
            this.frameX * this.frameWidth, 0,
            this.frameWidth, this.frameHeight,
            0, 0,
            this.w, this.h
        );

        ctx.restore();
    }


    // Reset NPC về vị trí ban đầu (nếu cần)
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.frameX = 0;
        this.frameTimer = 0;
    }
}
