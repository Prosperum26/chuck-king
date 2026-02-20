const PHYSICS = {
    // 1. TRỌNG LỰC & RƠI 
    gravity: 1.0,       
    fallMultiplier: 1.6,   
    maxFallSpeed: 30,     

    // 2. DI CHUYỂN (Chạy nhanh)
    accel: 1.5,          
    maxSpeed: 12,         
    friction: 0.82,       
    
    // 3. NHẢY (Phải tăng theo trọng lực)
    jumpChargeSpeed: 2.5,  
    maxJumpForce: 28,      
    minJumpForce: 12,     
    
    iceFriction: 0.98,
    airResistance: 0.99,
    bounceForce: 25
};

export class Player {
    constructor(x, y, eventTracker) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.w = 50;
        this.h = 50;
        this.vx = 0;
        this.vy = 0;
        this.isGrounded = false;
        this.charge = 0;
        this.platformType = "air";
        this.facingRight = true;
        this.eventTracker = eventTracker; 

        // ==========================================
        // CẤU HÌNH ANIMATION
        // ==========================================
        this.runImage = new Image();
        this.runImage.src = '../../Assets/player_assets/Run (32x32).png'; 

        this.idleImage = new Image();
        this.idleImage.src = '../../Assets/player_assets/Idle (32x32).png'; 

        this.jumpImage = new Image();
        this.jumpImage.src = '../../Assets/player_assets/Jump (32x32).png'; 

        this.fallImage = new Image();
        this.fallImage.src = '../../Assets/player_assets/Fall (32x32).png'; 
        
        this.appearingImage = new Image();
        this.appearingImage.src = '../../Assets/player_assets/Appearing (96x96).png'; 

        this.disappearingImage = new Image();
        this.disappearingImage.src = '../../Assets/player_assets/Desappearing (96x96).png'; // Lưu ý đúng tên file của bạn
        
        this.frameX = 0;           
        this.maxRunFrames = 12;    
        this.maxIdleFrames = 11;   
        this.maxJumpFrames = 1;    
        this.maxFallFrames = 1;    
        this.maxAppearingFrames = 7; 
        this.maxDisappearingFrames = 7; // Thêm số frame cho Disappearing
        
        this.fps = 16;             
        this.frameInterval = 1000 / this.fps; 
        this.frameTimer = 0;       
        
        this.currentState = 'appearing'; 
        // ==========================================
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.vx = 0;
        this.vy = 0;
        this.charge = 0;
        
        // Reset lại animation appearing khi hồi sinh
        this.currentState = 'appearing';
        this.frameX = 0;
        this.frameTimer = 0;
        this.facingRight = true;
    }

    // GỌI HÀM NÀY KHI NHÂN VẬT CHẾT (Đụng quái, đụng gai...)
    die() {
        if (this.currentState !== 'disappearing') {
            this.currentState = 'disappearing';
            this.frameX = 0;
            this.frameTimer = 0;
            this.vx = 0;
            this.vy = 0; // Đứng yên tại chỗ khi chết
            if (this.eventTracker) this.eventTracker.track('death');
        }
    }

    jump() {
        if (!this.isGrounded || this.currentState === 'appearing' || this.currentState === 'disappearing') return;
        
        const force = Math.max(this.charge, PHYSICS.minJumpForce);
        this.vy = -force;
        this.vx = this.vx;
        this.isGrounded = false;
        this.charge = 0;
        this.platformType = "air";
        
        if (this.eventTracker) this.eventTracker.track('jump');
    }

    update(input, platforms, canvasWidth, canvasHeight, deltaTime = 16) {
        // NẾU ĐANG CHẾT, ĐÓNG BĂNG VẬT LÝ VÀ CHỈ CHẠY ANIMATION
        if (this.currentState === 'disappearing') {
            this.updateAnimationOnly(deltaTime);
            return; 
        }

        if (this.isGrounded && this.standingOnPlatform && this.platformType === "moving") {
            const platformMovement = this.standingOnPlatform.speed * this.standingOnPlatform.direction;
            this.x += platformMovement;
        }
        
        // KHÓA DI CHUYỂN NẾU ĐANG TRONG TRẠNG THÁI "APPEARING"
        if (this.currentState !== 'appearing') {
            let accel = PHYSICS.accel;
            if (this.platformType === "ice") accel *= 0.1; 

            if (this.isGrounded) {
                if (input.keys["ArrowLeft"] || input.keys["KeyA"]) {
                    this.vx -= accel;
                    this.facingRight = false;
                }
                if (input.keys["ArrowRight"] || input.keys["KeyD"]) {
                    this.vx += accel;
                    this.facingRight = true;
                }
            }

            if (input.keys["Space"] && this.isGrounded) {
                this.charge = Math.min(this.charge + PHYSICS.jumpChargeSpeed, PHYSICS.maxJumpForce);
            }
        } else {
            this.vx *= 0.5; 
            this.charge = 0;
        }

        // Vật lý cơ bản
        if (this.vx > PHYSICS.maxSpeed) this.vx = PHYSICS.maxSpeed;
        if (this.vx < -PHYSICS.maxSpeed) this.vx = -PHYSICS.maxSpeed;

        let friction = PHYSICS.friction;
        if (!this.isGrounded) friction = PHYSICS.airResistance;
        else if (this.platformType === "ice") friction = PHYSICS.iceFriction;

        this.vx *= friction;

        if (this.vy < 0) this.vy += PHYSICS.gravity;
        else this.vy += PHYSICS.gravity * PHYSICS.fallMultiplier;
        this.vy = Math.min(this.vy, PHYSICS.maxFallSpeed);

        // Va chạm Trục X
        this.x += this.vx;
        platforms.forEach(p => {
            if ((p.type === "broken" && p.isBroken) || p.type === "fake" || p.type === "oneWay") return;
            
            if (this.checkCollision(p)) {
                const playerCenter = this.x + this.w / 2;
                const platformCenter = p.x + p.w / 2;

                if (playerCenter < platformCenter) {
                    this.x = p.x - this.w;
                } else {
                    this.x = p.x + p.w;
                }

                let platformVel = (p.type === "moving") ? p.speed * p.direction : 0;
                this.vx = (platformVel - this.vx) * 0.4;

                if (Math.abs(this.vx) < 1) {
                    this.vx = (playerCenter < platformCenter) ? -2 : 2;
                }
            }
        });

        // Va chạm Trục Y
        this.y += this.vy;
        let foundGround = false; 

        platforms.forEach(p => {
            if ((p.type === "broken" && p.isBroken) || p.type === "fake") return; 
            if (this.checkCollision(p)) {
                if (p.type === "oneWay") {
                    if (this.vy > 0 && (this.y + this.h - this.vy) <= p.y + 5) {
                        this.y = p.y - this.h;
                        this.vy = 0;
                        this.isGrounded = true;
                        this.standingOnPlatform = p;
                        this.platformType = p.type;
                        foundGround = true;
                    }
                }
                else {
                    if (this.vy > 0) {
                        this.y = p.y - this.h;
                        this.vy = 0;
                        foundGround = true; 
                        this.isGrounded = true;
                        this.platformType = p.type;
                        this.standingOnPlatform = p;

                        if (p.type === "bouncy") {
                            this.vy = -PHYSICS.bounceForce;
                            this.isGrounded = false;
                            if (this.eventTracker?.track) { 
                                this.eventTracker.track('bounce'); 
                            }
                        }
                    } 
                    else if (this.vy < 0) {
                        this.y = p.y + p.h;
                        this.vy = 0;
                    }
                }
            }
        });

        if (!foundGround) {
            this.isGrounded = false;
            this.standingOnPlatform = null;
            this.platformType = "air";
        }
        
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0; 
        }
        if (this.x + this.w > canvasWidth) {
            this.x = canvasWidth - this.w;
            this.vx = 0;
        }

        // Rớt hố thì gọi hàm die() thay vì reset ngay lập tức
        if (this.y > canvasHeight) {
            this.die();
        }

        // Cập nhật Animation cho các trạng thái bình thường
        this.updateAnimationOnly(deltaTime);
    }

    // Tách riêng logic xử lý khung hình để gọi lại cho gọn
    updateAnimationOnly(deltaTime) {
        let nextState = this.currentState;
        
        if (this.currentState !== 'appearing' && this.currentState !== 'disappearing') {
            if (!this.isGrounded) {
                if (this.vy < 0) nextState = 'jump';
                else nextState = 'fall';
            } 
            else if (Math.abs(this.vx) > 0.5) {
                nextState = 'run';
            } else {
                nextState = 'idle';
            }
        }

        if (this.currentState !== nextState) {
            this.currentState = nextState;
            this.frameX = 0;
            this.frameTimer = 0;
        }

        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frameX++;
            
            let maxFrames = 1;
            if (this.currentState === 'run') maxFrames = this.maxRunFrames;
            else if (this.currentState === 'idle') maxFrames = this.maxIdleFrames;
            else if (this.currentState === 'jump') maxFrames = this.maxJumpFrames;
            else if (this.currentState === 'fall') maxFrames = this.maxFallFrames;
            else if (this.currentState === 'appearing') maxFrames = this.maxAppearingFrames;
            else if (this.currentState === 'disappearing') maxFrames = this.maxDisappearingFrames;
            
            if (this.frameX >= maxFrames) {
                if (this.currentState === 'appearing') {
                    this.currentState = 'idle';
                    this.frameX = 0;
                } else if (this.currentState === 'disappearing') {
                    // Nếu chạy xong hiệu ứng chết, reset lại nhân vật (sẽ tự động thành appearing)
                    this.reset(); 
                } else {
                    this.frameX = 0;
                }
            }
            this.frameTimer = 0;
        }
    }

    checkCollision(p) {
        return (
            this.x + this.w > p.x &&
            this.x < p.x + p.w &&
            this.y + this.h > p.y &&
            this.y < p.y + p.h
        );
    }

    draw(ctx, camera) {
        // 1. TÍNH TOÁN VỊ TRÍ THEO CAMERA (Điểm mấu chốt để sửa lỗi)
        let screenX = this.x;
        let screenY = this.y;
        
        // Cập nhật tọa độ hiển thị nếu có camera
        if (camera && typeof camera.worldToScreen === 'function') {
            const screenPos = camera.worldToScreen(this.x, this.y);
            screenX = screenPos.screenX;
            screenY = screenPos.screenY;
        }

        // 2. CHUẨN BỊ ẢNH THEO TRẠNG THÁI
        let currentImage;
        let sWidth = 32;   
        let sHeight = 32;  
        let dWidth = this.w; 
        let dHeight = this.h;
        let drawOffsetX = 0; 
        let drawOffsetY = 0;

        if (this.currentState === 'run') currentImage = this.runImage;
        else if (this.currentState === 'jump') currentImage = this.jumpImage;
        else if (this.currentState === 'fall') currentImage = this.fallImage;
        else if (this.currentState === 'appearing' || this.currentState === 'disappearing') {
            currentImage = this.currentState === 'appearing' ? this.appearingImage : this.disappearingImage;
            sWidth = 96;  
            sHeight = 96; 
            dWidth = this.w * 3;  
            dHeight = this.h * 3; 
            drawOffsetX = -(dWidth - this.w) / 2;
            drawOffsetY = -(dHeight - this.h) / 2;
        }
        else currentImage = this.idleImage;

        // 3. VẼ HÌNH ẢNH NHÂN VẬT LÊN MÀN HÌNH
        if (currentImage && currentImage.complete && currentImage.naturalWidth !== 0) {
            ctx.save();
            
            // Lật ảnh nếu quay trái (Và không ở trạng thái xuất hiện/biến mất)
            if (!this.facingRight && this.currentState !== 'appearing' && this.currentState !== 'disappearing') {
                // Tịnh tiến tới cạnh phải của nhân vật TRÊN MÀN HÌNH (Dùng screenX)
                ctx.translate(screenX + this.w, screenY); 
                ctx.scale(-1, 1); 
                
                ctx.drawImage(
                    currentImage, 
                    this.frameX * sWidth, 0, sWidth, sHeight, 
                    0, 0, dWidth, dHeight  
                );
            } else {
                // Vẽ bình thường với độ lệch (Offset)
                ctx.drawImage(
                    currentImage, 
                    this.frameX * sWidth, 0, sWidth, sHeight, 
                    screenX + drawOffsetX, screenY + drawOffsetY, dWidth, dHeight
                );
            }
            ctx.restore();
        } else {
            // BACKUP: Hiển thị cục vuông đỏ nếu đường dẫn ảnh bị sai hoặc chưa load kịp
            ctx.fillStyle = "#ff4444";
            ctx.fillRect(screenX, screenY, this.w, this.h);
        }

        // 4. VẼ THANH LỰC NHẢY (Không vẽ lúc đang dùng Animation Appear/Disappear)
        if (this.charge > 0 && this.currentState !== 'appearing' && this.currentState !== 'disappearing') {
            ctx.fillStyle = "lime";
            ctx.beginPath();
            ctx.arc(screenX + 15, screenY - 15, 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "yellow";
            ctx.fillRect(screenX - 5, screenY - 10, (this.charge / PHYSICS.maxJumpForce) * 40, 5);
        }
    }
}