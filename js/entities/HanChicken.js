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

        // Kích thước frame mặc định cho tất cả sprite (32x32)
        this.frameWidth = 32;
        this.frameHeight = 32;
        this.maxFrames = 2;

        // Load hình ảnh sprite sheet cho các animation
        // GitHub Pages phân biệt hoa/thường → luôn dùng "assets" (lowercase).
        const getAsset = (path) => new URL(path, import.meta.url).href;

        this.animations = {};

        const createAnimation = (key, src, frameCount, fps) => {
            const image = new Image();
            const anim = {
                image,
                frameWidth: 32,
                frameHeight: 32,
                maxFrames: frameCount,
                fps,
                loaded: false,
            };

            image.src = getAsset(src);
            image.onload = () => {
                anim.loaded = true;
            };

            this.animations[key] = anim;
        };

        // Idle: trái tim bay lượn
        createAnimation('idle', '../../assets/chicken-heart.png', 2, 2);
        // Fall: hiệu ứng gà hồn rơi
        createAnimation('fall', '../../assets/Fall(G).png', 6, 10);
        // Kick: hiệu ứng gà đá + trái tim
        createAnimation('kick', '../../assets/kick.png', 5, 10);

        // Ảnh đang dùng để vẽ (mặc định là idle)
        this.spriteImage = null;

        // Đảm bảo ảnh được load hoàn toàn trước khi render
        this.setAnimation('idle', false);
    }

    update(deltaTime) {
        const currentAnim = this.animations[this.currentState];
        // Chỉ cập nhật animation nếu ảnh đã load
        if (!currentAnim || !currentAnim.loaded) {
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

    // Đổi animation hiện tại
    setAnimation(state, resetFrame = true) {
        const anim = this.animations[state];
        if (!anim) return;

        this.currentState = state;
        this.spriteImage = anim.image;
        this.frameWidth = anim.frameWidth;
        this.frameHeight = anim.frameHeight;
        this.maxFrames = anim.maxFrames;
        this.fps = anim.fps;
        this.frameInterval = 1000 / this.fps;

        if (resetFrame) {
            this.frameX = 0;
            this.frameTimer = 0;
        }
    }

    // Các hàm public để bên ngoài có thể gọi dễ dàng
    playIdle() {
        this.setAnimation('idle', true);
    }

    playFall() {
        this.setAnimation('fall', true);
    }

    playKick() {
        this.setAnimation('kick', true);
    }

     draw(ctx, camera) {
        const currentAnim = this.animations[this.currentState];
        if (!currentAnim || !currentAnim.loaded || !this.spriteImage || !this.spriteImage.complete) return;

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
