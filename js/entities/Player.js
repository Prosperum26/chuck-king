const PHYSICS = {
    // 1. TRỌNG LỰC & RƠI 
    gravity: 1.0,      //0.6    
    fallMultiplier: 1.6,   //1.35
    maxFallSpeed: 30,     //25

    // 2. DI CHUYỂN (Chạy nhanh)
    accel: 1.5,          //0.8
    maxSpeed: 12,         //8
    friction: 0.82,        //0.85
    
    // 3. NHẢY (Phải tăng theo trọng lực)
    jumpChargeSpeed: 2.5,  //0.8
    maxJumpForce: 28,      //22
    minJumpForce: 12,     //8
    
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
        this.eventTracker = eventTracker; // Để báo cho AI
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.vx = 0;
        this.vy = 0;
        this.charge = 0;
        // Báo cho AI biết là người chơi vừa chết
        if (this.eventTracker) this.eventTracker.track('death');
    }

    jump() {
        if (!this.isGrounded) return;
        
        const force = Math.max(this.charge, PHYSICS.minJumpForce);
        this.vy = -force;
        this.vx = this.vx;
        this.isGrounded = false;
        this.charge = 0;
        this.platformType = "air";
        
        if (this.eventTracker) this.eventTracker.track('jump');
    }

    update(input, platforms, canvasWidth, canvasHeight) {
        // logic mới: nếu đang đứng trên bục di chuyển thì nhân vật cũng sẽ bị ảnh hưởng theo vận tốc của bục đó
        if (this.isGrounded && this.standingOnPlatform && this.platformType === "moving") {
        // Chúng ta phải nhân cả speed và direction để biết bục đang tiến hay lùi
        const platformMovement = this.standingOnPlatform.speed * this.standingOnPlatform.direction;
        this.x += platformMovement;
        }
        
        // 1. Logic di chuyển (Gia tốc)
        let accel = PHYSICS.accel;
        if (this.platformType === "ice") accel *= 0.1; // giảm gia tốc trên băng

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

        // 2. Logic sạc lực nhảy (Input)
        if (input.keys["Space"] && this.isGrounded) {
            this.charge = Math.min(this.charge + PHYSICS.jumpChargeSpeed, PHYSICS.maxJumpForce);
        }

        // 3. Vật lý (Ma sát & Tốc độ tối đa)
        if (this.vx > PHYSICS.maxSpeed) this.vx = PHYSICS.maxSpeed;
        if (this.vx < -PHYSICS.maxSpeed) this.vx = -PHYSICS.maxSpeed;

        let friction = PHYSICS.friction;
        if (!this.isGrounded) friction = PHYSICS.airResistance;
        else if (this.platformType === "ice") friction = PHYSICS.iceFriction;
        // bỏ cái nhảy thì ma sát giảm đi vì nó gây ra nhiều xung đột

        this.vx *= friction;

        // 4. Trọng lực
        if (this.vy < 0) this.vy += PHYSICS.gravity;
        else this.vy += PHYSICS.gravity * PHYSICS.fallMultiplier;
        this.vy = Math.min(this.vy, PHYSICS.maxFallSpeed);

        // =========================================================
        // XỬ LÝ VA CHẠM (Tách X và Y để không xuyên tường)
        // =========================================================

        // --- BƯỚC 1: Xử lý trục NGANG (X) ---
        this.x += this.vx;

        platforms.forEach(p => {
            if ((p.type === "broken" && p.isBroken) || p.type === "fake" || p.type === "oneWay") return;
            
            if (this.checkCollision(p)) {
                // 1. Xác định hướng đẩy dựa trên vị trí tương đối (Chống xuyên tường)
                const playerCenter = this.x + this.w / 2;
                const platformCenter = p.x + p.w / 2;

                if (playerCenter < platformCenter) {
                    this.x = p.x - this.w;
                } else {
                    this.x = p.x + p.w;
                }

                // 2. Tính toán lại độ nảy (Tính năng bật ra)
                // Nếu bục đang di chuyển, ta cộng thêm vận tốc của bục vào lực nảy
                let platformVel = (p.type === "moving") ? p.speed * p.direction : 0;
                
                // Đảo ngược vận tốc và giảm chấn (0.4)
                // Chúng ta lấy (vận tốc cũ - vận tốc bục) để tính lực bật thực tế
                this.vx = (platformVel - this.vx) * 0.4;

                // Nếu lực bật quá nhỏ, hãy cho nó một cái "huých" tối thiểu để không bị dính
                if (Math.abs(this.vx) < 1) {
                    this.vx = (playerCenter < platformCenter) ? -2 : 2;
                }
            }
        });

        // --- BƯỚC 2: Xử lý trục DỌC (Y) ---
        this.y += this.vy;
        let foundGround = false; // Biến để kiểm tra xem có chạm đất không

        platforms.forEach(p => {
            if ((p.type === "broken" && p.isBroken) || p.type === "fake") return; // BỎ QUA va chạm nếu bục đã vỡ hoặc là bục giả
            if (this.checkCollision(p)) {
                // Nếu là bục một chiều
                if (p.type === "oneWay") {
                    // Chỉ va chạm nếu đang rơi VÀ chân đang ở trên mặt bục
                    // (Thêm sai số 10px để tránh bị "giật" khi rơi quá nhanh)
                    if (this.vy > 0 && (this.y + this.h - this.vy) <= p.y + 5) {
                        this.y = p.y - this.h;
                        this.vy = 0;
                        this.isGrounded = true;
                        this.standingOnPlatform = p;
                        this.platformType = p.type;
                        foundGround = true;
                    }
                    // Nếu đang đi lên (vy < 0), không làm gì cả (đi xuyên qua)
                }
                else {
                    // A. Rơi xuống sàn
                    if (this.vy > 0) {
                        this.y = p.y - this.h;
                        this.vy = 0;
                        foundGround = true; // Đã tìm thấy đất
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
                    // B. Cụng đầu
                    else if (this.vy < 0) {
                        this.y = p.y + p.h;
                        this.vy = 0;
                    }
                }
            }
            
        });
        // Nếu chạy hết danh sách bục mà không chạm cái nào
        if (!foundGround) {
            this.isGrounded = false;
            this.standingOnPlatform = null;
            this.platformType = "air";
        }
        // 1. Chặn mép trái (Không cho x nhỏ hơn 0)
    if (this.x < 0) {
        this.x = 0;
        this.vx = 0; // Đâm vào tường thì dừng vận tốc
    }

    // 2. Chặn mép phải (Không cho x lớn hơn chiều rộng màn hình)
    if (this.x + this.w > canvasWidth) {
        this.x = canvasWidth - this.w;
        this.vx = 0;
    }

        // Chết khi rơi xuống vực
        if (this.y > canvasHeight) {
            this.reset();
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

    draw(ctx) {
        // Vẽ nhân vật
        ctx.fillStyle = "#ff4444";
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // Vẽ mắt
        ctx.fillStyle = "white";
        let eyeX = this.facingRight ? this.x + 38 : this.x + 4;
        ctx.fillRect(eyeX, this.y + 5, 8, 8);

        // Vẽ thanh lực nhảy
        if (this.charge > 0) {
            ctx.fillStyle = "lime";
            ctx.beginPath();
            ctx.arc(this.x + 15, this.y - 15, 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "yellow";
            ctx.fillRect(this.x - 5, this.y - 10, (this.charge / PHYSICS.maxJumpForce) * 40, 5);
        }
    }
}