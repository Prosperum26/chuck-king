// entities/Platform.js
export class Platform {
    constructor(x, y, w, h, type = "normal", range = 0, speed = 0) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.type = type;
        
        // Dành cho loại bục "moving"
        this.range = range; 
        this.speed = speed; 
        this.startX = x;    
        this.direction = 1; 

        // --- CẤU HÌNH BỤC VỠ ---
        this.isBroken = false;     // Trạng thái: true là đã biến mất
        this.isTriggered = false;  // Trạng thái: true là đã bắt đầu đếm ngược
        this.breakTimer = 0;       // Đếm ngược thời gian để vỡ
        this.respawnTimer = 0;     // Đếm ngược thời gian để hồi phục
    }

    update(player) {
        // --- Logic di chuyển (Moving Platform) ---
        if (this.type === "moving") {
            this.x += this.speed * this.direction;
            if (Math.abs(this.x - this.startX) > this.range) {
                this.direction *= -1;
            }
        }

        // --- Logic bục vỡ (Broken Platform) ---
        if (this.type === "broken") {
            
            // 1. Giai đoạn: BỤC ĐANG TỒN TẠI
            if (!this.isBroken) {
                
                // A. Kích hoạt đếm ngược nếu Player chạm vào lần đầu
                if (!this.isTriggered && player && player.standingOnPlatform === this) {
                    this.isTriggered = true;
                }

                // B. Nếu đã kích hoạt -> Tự động đếm ngược (kể cả Player đã nhảy đi)
                if (this.isTriggered) {
                    this.breakTimer++;

                    // Sau 1.5 giây (90 frames) -> VỠ
                    if (this.breakTimer >= 90) {
                        this.isBroken = true;
                        this.isTriggered = false; // Tắt kích hoạt để chờ lần hồi phục sau
                        this.breakTimer = 0;      // Reset bộ đếm

                        // NẾU Player vẫn còn đang đứng trên bục lúc nó vỡ -> Cho rơi xuống
                        if (player && player.standingOnPlatform === this) {
                            player.isGrounded = false;
                            player.standingOnPlatform = null;
                            player.platformType = "air";
                            player.y += 2; // Đẩy nhẹ xuống để tách khỏi hitbox
                        }
                    }
                }
            } 
            
            // 2. Giai đoạn: BỤC ĐÃ VỠ (Đang tàng hình)
            else {
                this.respawnTimer++;
                
                // Sau 1 giây (60 frames) -> HỒI PHỤC
                if (this.respawnTimer >= 60) {
                    this.isBroken = false;
                    this.respawnTimer = 0;
                    // Reset sạch sẽ các trạng thái để đón lượt nhảy mới
                    this.breakTimer = 0;
                    this.isTriggered = false;
                }
            }
        }
    }

    draw(ctx) {
        // Nếu bục đã vỡ (isBroken = true) thì không vẽ gì cả
        if (this.isBroken) return; 

        // Chọn màu sắc
        switch (this.type) {
            case "ice": ctx.fillStyle = "#A5F2F3"; break; 
            case "bouncy": ctx.fillStyle = "#FF477E"; break; 
            case "moving": ctx.fillStyle = "#F4D03F"; break; 
            
            // Màu bục vỡ: Có thể đổi màu nhẹ khi đã bị kích hoạt để người chơi biết
            case "broken": 
                if (this.isTriggered) {
                    ctx.fillStyle = "#7F8C8D"; // Có thể thay màu xám nhạt hơn (đang đếm ngược)
                } else {
                    ctx.fillStyle = "#7F8C8D"; // Màu xám gốc
                }
                break;
                
            case "oneWay": ctx.fillStyle = "#2ECC71"; break;
            case "fake": ctx.fillStyle = "#3f10b6"; break; 
            default: ctx.fillStyle = "#4A2C2A"; 
        }

        // Vẽ hình khối
        ctx.fillRect(this.x, this.y, this.w, this.h);
        
        // Vẽ viền
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    }
}