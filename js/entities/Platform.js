import { platformAssets } from '../main.js';
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
            // Wood 2: Bục vỡ sau khi chạm (dùng import.meta.url cho GitHub Pages)
            this.image.src = new URL('../../assets/wood2.png', import.meta.url).href;
            
            // --- Logic mới thay thế cho bục broken ---
            this.isTriggered = false;  // Trạng thái: true là đã bắt đầu đếm ngược
            this.breakTimer = 0;       // Đếm ngược thời gian để vỡ
            this.respawnTimer = 0;     // Đếm ngược thời gian để hồi phục
            
        } else {
            // Wood 1 và 3: Random cho các bục fake và real (dùng import.meta.url cho GitHub Pages)
            const getWood = (name) => new URL(`../../assets/${name}`, import.meta.url).href;
            const randomWood = Math.random() > 0.5 ? getWood('wood3.png') : getWood('wood.png');
            this.image.src = randomWood;
        }
    }

    update(deltaTime, player) { 
        // Chuẩn hóa deltaTime theo frame 60fps (giữ tương thích map cũ)
        const frameFactor = (typeof deltaTime === 'number' && isFinite(deltaTime) && deltaTime > 0)
            ? deltaTime / (1000 / 60)
            : 1;
       // --- Logic di chuyển (Moving Platform) ---
        if (this.type === "moving") {
            this.x += this.speed * this.direction;
            if (Math.abs(this.x - this.startX) > this.range) {
                this.direction *= -1;
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

    draw(ctx, camera) {
    if (this.isBroken) return;
    const screenPos = camera.worldToScreen(this.x, this.y);
    const tileSize = 32;

    // --- LOGIC VẼ BỤC NGHIÊNG ---
    if (this.type === "slopeLeft" || this.type === "slopeRight") {
        // Kiểm tra xem có ảnh slope chưa, nếu chưa có hoặc chưa gán thì vẽ màu luôn
        const img = (typeof platformAssets !== 'undefined') ? 
                    (this.type === "slopeLeft" ? platformAssets.slopeLeft : platformAssets.slopeRight) : null;

        if (img && img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, screenPos.screenX, screenPos.screenY, this.w, this.h);
        } else {
            // VẼ MÀU CHO DỐC (KHI CHƯA CÓ ẢNH)
            ctx.fillStyle = "#E67E22"; // Màu cam đặc trưng cho dốc
            ctx.beginPath();
            if (this.type === "slopeLeft") {
                ctx.moveTo(screenPos.screenX, screenPos.screenY);
                ctx.lineTo(screenPos.screenX + this.w, screenPos.screenY + this.h);
                ctx.lineTo(screenPos.screenX, screenPos.screenY + this.h);
            } else {
                ctx.moveTo(screenPos.screenX + this.w, screenPos.screenY);
                ctx.lineTo(screenPos.screenX + this.w, screenPos.screenY + this.h);
                ctx.lineTo(screenPos.screenX, screenPos.screenY + this.h);
            }
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.stroke();
        }
    } 
    // --- LOGIC VẼ BỤC THẲNG ---
    else {
        // Kiểm tra an toàn: platformAssets có tồn tại và có loại bục này không?
        let skins = (typeof platformAssets !== 'undefined') ? platformAssets[this.type] : null;
        
        const numTiles = Math.max(1, Math.round(this.w / tileSize));

        for (let i = 0; i < numTiles; i++) {
            const tileX = screenPos.screenX + (i * tileSize);
            let img = null;

            // Chỉ cố gắng lấy ảnh nếu bộ skins có tồn tại và có đủ đầu/giữa/đuôi
            if (skins && skins.mid) {
                if (numTiles === 1) img = skins.mid;
                else if (i === 0) img = skins.left;
                else if (i === numTiles - 1) img = skins.right;
                else img = skins.mid;
            }

            // Nếu có ảnh và ảnh đã load xong
            if (img && img.complete && img.naturalWidth !== 0) {
                ctx.drawImage(img, tileX, screenPos.screenY, tileSize, this.h);
            } else {
                // VẼ KHỐI MÀU (KHI CHƯA SET UP ẢNH)
                // Tùy biến màu theo loại bục để dễ phân biệt khi test
                if (this.type === "ice") ctx.fillStyle = "#A5F2F3";
                else if (this.type === "bouncy") ctx.fillStyle = "#FF477E";
                else if (this.type === "moving") ctx.fillStyle = "#F4D03F";
                else if (this.type === "oneWay") ctx.fillStyle = "#2ECC71";
                else if (this.type === "fake") ctx.fillStyle = "#3f10b6";
                else if (this.type === "broken") 
                    {
                    if (this.isTriggered) {
                    ctx.fillStyle = "#7F8C8D"; // Có thể thay màu xám nhạt hơn (đang đếm ngược)
                } else {
                    ctx.fillStyle = "#7F8C8D"; // Màu xám gốc
                }
                    }
                else ctx.fillStyle = "#4A2C2A"; // Mặc định màu nâu gỗ

                ctx.fillRect(tileX, screenPos.screenY, tileSize, this.h);
                ctx.strokeStyle = "rgba(255,255,255,0.3)";
                ctx.strokeRect(tileX, screenPos.screenY, tileSize, this.h);
            }
        }
    }
}
}