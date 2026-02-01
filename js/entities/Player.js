/**
 * Player - Character with jump charge mechanics
 */
export class Player {
    constructor(x, y) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 30;
        
        // Physics
        this.vx = 0;
        this.vy = 0;
        this.gravity = 800;
        this.friction = 0.8;
        this.maxSpeed = 300;
        this.moveSpeed = 200; // Horizontal movement speed
        
        // Jump charge system
        this.isCharging = false;
        this.chargePower = 0;
        this.maxCharge = 1.0;
        this.chargeRate = 2.0; // charge per second (tăng tốc độ charge)
        this.minJumpPower = 0.1; // Giảm min để dễ nhảy hơn
        
        // Jump properties
        this.jumpPower = 500; // Tăng jump power
        this.onGround = false;
        this.wasCharging = false; // Track previous charging state
    }
    
    respawn(x, y) {
        this.x = x || this.startX;
        this.y = y || this.startY;
        this.vx = 0;
        this.vy = 0;
        this.chargePower = 0;
        this.isCharging = false;
        this.wasCharging = false;
        this.onGround = false;
    }
    
    update(dt, jumpKeyPressed, leftKey, rightKey, platforms) {
        // Handle horizontal movement (A/D keys)
        if (leftKey && !rightKey) {
            this.vx = -this.moveSpeed;
        } else if (rightKey && !leftKey) {
            this.vx = this.moveSpeed;
        } else if (!leftKey && !rightKey) {
            // No input, apply friction if on ground
            if (this.onGround) {
                this.vx *= this.friction;
            }
        }
        
        // Handle jump charging (only when on ground)
        if (jumpKeyPressed && this.onGround) {
            this.isCharging = true;
            this.chargePower = Math.min(this.chargePower + this.chargeRate * dt, this.maxCharge);
        } else {
            // Release jump - only jump if we were charging and have enough power
            if (this.wasCharging && !jumpKeyPressed && this.chargePower >= this.minJumpPower && this.onGround) {
                this.jump(leftKey, rightKey);
            }
            // Reset charge if not pressing jump key
            if (!jumpKeyPressed) {
                this.isCharging = false;
            }
        }
        
        // Update wasCharging for next frame
        this.wasCharging = this.isCharging;
        
        // Apply gravity
        if (!this.onGround) {
            this.vy += this.gravity * dt;
        }
        
        // Store previous position for collision resolution
        const prevX = this.x;
        const prevY = this.y;
        
        // Apply velocity
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Check platform collisions
        this.onGround = false;
        platforms.forEach(platform => {
            if (this.checkCollision(platform)) {
                this.handlePlatformCollision(platform, prevX, prevY, dt);
            }
        });
        
        // Apply friction when on ground
        if (this.onGround) {
            this.vx *= this.friction;
        }
        
        // Boundary check (horizontal)
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        }
        if (this.x + this.width > 400) {
            this.x = 400 - this.width;
            this.vx = 0;
        }
    }
    
    jump(leftKey, rightKey) {
        const power = this.chargePower;
        this.vy = -this.jumpPower * power;
        
        // Apply horizontal velocity based on input
        if (leftKey) {
            this.vx = -this.moveSpeed * 0.7; // Slightly slower when jumping
        } else if (rightKey) {
            this.vx = this.moveSpeed * 0.7;
        }
        // If no horizontal input, keep current vx (or let it be 0)
        
        this.chargePower = 0;
        this.isCharging = false;
        this.wasCharging = false;
        this.onGround = false;
    }
    
    checkCollision(platform) {
        return this.x < platform.x + platform.width &&
               this.x + this.width > platform.x &&
               this.y < platform.y + platform.height &&
               this.y + this.height > platform.y;
    }
    
    handlePlatformCollision(platform, prevX, prevY, dt) {
        // Calculate overlap amounts
        const overlapLeft = (this.x + this.width) - platform.x;
        const overlapRight = (platform.x + platform.width) - this.x;
        const overlapTop = (this.y + this.height) - platform.y;
        const overlapBottom = (platform.y + platform.height) - this.y;
        
        // Determine collision direction based on previous position
        const wasAbove = prevY + this.height <= platform.y;
        const wasBelow = prevY >= platform.y + platform.height;
        const wasLeft = prevX + this.width <= platform.x;
        const wasRight = prevX >= platform.x + platform.width;
        
        // Landing on top of platform (most common case)
        if (wasAbove && this.vy >= 0 && overlapTop > 0 && overlapTop < overlapBottom) {
            this.y = platform.y - this.height;
            this.vy = 0;
            this.onGround = true;
            return;
        }
        
        // Hitting from below (ceiling collision)
        if (wasBelow && this.vy < 0 && overlapBottom > 0 && overlapBottom < overlapTop) {
            this.y = platform.y + platform.height;
            this.vy = 0;
            return;
        }
        
        // Side collisions
        if (wasLeft && this.vx > 0 && overlapLeft > 0 && overlapLeft < overlapRight) {
            this.x = platform.x - this.width;
            this.vx = 0;
            return;
        }
        
        if (wasRight && this.vx < 0 && overlapRight > 0 && overlapRight < overlapLeft) {
            this.x = platform.x + platform.width;
            this.vx = 0;
            return;
        }
        
        // Fallback: if we're inside the platform, push out based on smallest overlap
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        if (minOverlap === overlapTop) {
            this.y = platform.y - this.height;
            this.vy = 0;
            this.onGround = true;
        } else if (minOverlap === overlapBottom) {
            this.y = platform.y + platform.height;
            this.vy = 0;
        } else if (minOverlap === overlapLeft) {
            this.x = platform.x - this.width;
            this.vx = 0;
        } else if (minOverlap === overlapRight) {
            this.x = platform.x + platform.width;
            this.vx = 0;
        }
    }
    
    render(ctx) {
        // Draw player body
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 5, this.y + 8, 3, 3);
        ctx.fillRect(this.x + 12, this.y + 8, 3, 3);
    }
}

