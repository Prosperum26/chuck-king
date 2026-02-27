export class Platform {
    // Sử dụng param1, param2 để linh hoạt nhận data (range, speed) cho bục moving từ main.js
    constructor(x, y, w, h, type = "normal", param1 = 0, param2 = 1) {
        this.startX = x;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.type = type;
        
        // --- Xử lý tham số riêng cho bục moving ---
        if (this.type === "moving") {
            this.range = param1; // Quãng đường di chuyển (ví dụ: 300)
            this.speed = param2; // Tốc độ di chuyển (ví dụ: 2)
            this.direction = 1;
        } else {
            this.speed = param1;
            this.direction = param2;
        }

        // --- Xử lý ảnh gỗ và logic riêng của từng loại ---
        this.isBroken = false; 
        this.image = new Image();

        if (this.type === "broken") {
            // Wood 2: Bục vỡ sau khi chạm
            this.image.src = "../assets/wood2.png";
            
            // --- Logic mới thay thế cho bục broken ---
            this.isTriggered = false;  // Trạng thái: true là đã bắt đầu đếm ngược
            this.breakTimer = 0;       // Đếm ngược thời gian để vỡ
            this.respawnTimer = 0;     // Đếm ngược thời gian để hồi phục
            
        } else {
            // Wood 1 và 3: Random cho các bục fake và real
            // Lấy ngẫu nhiên tỷ lệ 50-50
            const randomWood = Math.random() > 0.5 ? "../assets/wood3.png" : "../assets/wood.png";
            this.image.src = randomWood;
        }
    }

    update(deltaTime, player) { 
        // 1. Logic cho bục di chuyển
        if (this.type === "moving") {
            this.x += this.speed * this.direction;
            
            // Đảo chiều
            if (this.x >= this.startX + this.range) {
                this.x = this.startX + this.range;
                this.direction = -1;
            } else if (this.x <= this.startX) {
                this.x = this.startX;
                this.direction = 1;
            }
        }

        // 2. Logic cho bục wood 2 (broken)
        if (this.type === "broken") {
            // Giai đoạn 1: BỤC ĐANG TỒN TẠI
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
            // Giai đoạn 2: BỤC ĐÃ VỠ (Đang tàng hình)
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
        // Nếu bục đang trong chu kỳ biến mất, hoặc bục giả đã bị đạp gãy từ event bên ngoài -> không vẽ
        if ((this.type === "broken" || this.type === "fake") && this.isBroken) {
            return; 
        }

        if (this.image.complete && this.image.naturalWidth > 0) {
            ctx.save();
            
            // Cắt (clip) vùng vẽ bằng đúng kích thước w, h của bục
            // Để ảnh không bị tràn ra ngoài khung va chạm vật lý
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.w, this.h);
            ctx.clip();

            // Tính toán chiều rộng hiển thị của ảnh gỗ để giữ nguyên tỷ lệ gốc
            let imgRatio = this.image.naturalWidth / this.image.naturalHeight;
            let drawW = this.h * imgRatio; 
            let drawH = this.h;
            
            // THUẬT TOÁN XẾP GỖ (TILING):
            // Lặp lại việc vẽ thanh gỗ kề nhau cho đến khi lấp đầy chiều dài w của bục
            let currentX = this.x;
            while (currentX < this.x + this.w) {
                ctx.drawImage(this.image, currentX, this.y, drawW, drawH);
                currentX += drawW;
            }
            
            ctx.restore();

        } else {
            // Khối màu giữ chỗ nếu ảnh chưa load kịp
            ctx.fillStyle = "#654321";
            ctx.fillRect(this.x, this.y, this.w, this.h);
        }
    }
}