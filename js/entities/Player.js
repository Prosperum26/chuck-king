const PHYSICS = {
  gravity: 1.0,
  fallMultiplier: 1.6,
  maxFallSpeed: 30,
  accel: 1.5,
  maxSpeed: 12,
  friction: 0.82,
  jumpChargeSpeed: 2.5,
  maxJumpForce: 28,
  minJumpForce: 12,
  iceFriction: 0.98,
  airResistance: 0.99,
  bounceForce: 25,
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

    this.lastGroundedY = y;

    this.loadSprites();

    this.currentState = "idle";
    this.currentFrame = 0;
    this.frameTimer = 0;
  }

  loadSprites() {
    this.sprites = {
      idle: new Image(),
      walk: new Image(),
      jump: new Image(),
      fall: new Image(),
    };

    this.sprites.idle.src = "../assets/idle.png";
    this.sprites.walk.src = "../assets/Walk.png";
    this.sprites.jump.src = "../assets/Jump.png";
    this.sprites.fall.src = "../assets/Fall.png";

    this.animations = {
      idle: {
        img: this.sprites.idle,
        totalFrames: 2,
        frameSpeed: 200,
        frameWidth: 32,
        frameHeight: 32,
      },
      walk: {
        img: this.sprites.walk,
        totalFrames: 6,
        frameSpeed: 800,
        frameWidth: 32,
        frameHeight: 32,
      },
      run: {
        img: this.sprites.walk,
        totalFrames: 6,
        frameSpeed: 500,
        frameWidth: 32,
        frameHeight: 32,
      },
      jump: {
        img: this.sprites.jump,
        totalFrames: 6,
        frameSpeed: 600,
        frameWidth: 32,
        frameHeight: 32,
      },
      fall: {
        img: this.sprites.fall,
        totalFrames: 6,
        frameSpeed: 600,
        frameWidth: 32,
        frameHeight: 32,
      },
    };
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.vx = 0;
    this.vy = 0;
    this.charge = 0;
    if (this.eventTracker) this.eventTracker.track("death");
    
    this.lastGroundedY = this.startY;
    this.currentState = "idle";
  }

  jump() {
    if (!this.isGrounded) return;
    const force = Math.max(this.charge, PHYSICS.minJumpForce);
    this.vy = -force;
    this.isGrounded = false;
    this.charge = 0;
    this.platformType = "air";
    if (this.eventTracker) this.eventTracker.track("jump");
  }

  update(input, platforms, canvasWidth, canvasHeight, deltaTime = 16.67) {
    if (this.isGrounded && this.standingOnPlatform && this.platformType === "moving") {
      const platformMovement = this.standingOnPlatform.speed * this.standingOnPlatform.direction;
      this.x += platformMovement;
    }

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
    
    if (this.vx > PHYSICS.maxSpeed) this.vx = PHYSICS.maxSpeed;
    if (this.vx < -PHYSICS.maxSpeed) this.vx = -PHYSICS.maxSpeed;
    
    let friction = PHYSICS.friction;
    if (!this.isGrounded) friction = PHYSICS.airResistance;
    else if (this.platformType === "ice") friction = PHYSICS.iceFriction;
    
    this.vx *= friction;
    
    if (this.vy < 0) this.vy += PHYSICS.gravity;
    else this.vy += PHYSICS.gravity * PHYSICS.fallMultiplier;
    this.vy = Math.min(this.vy, PHYSICS.maxFallSpeed);

    const previousGrounded = this.isGrounded;

    this.handleCollision(platforms);

    if (!previousGrounded && this.isGrounded) {
      if (this.y > this.lastGroundedY + 5) {
        if (this.eventTracker?.track) {
          this.eventTracker.track("fall");
        }
      }
    }

    if (this.isGrounded) {
      this.lastGroundedY = this.y;
    }

    if (this.x < 0) {
      this.x = 0;
      this.vx = 0;
    }
    if (this.x + this.w > canvasWidth) {
      this.x = canvasWidth - this.w;
      this.vx = 0;
    }

    if (this.y > canvasHeight) {
      this.reset();
    }

    this.determineAnimState();
    this.updateAnimation(deltaTime);
  }

  determineAnimState() {
    if (!this.isGrounded) {
      if (this.vy >= 0) {
        this.currentState = "fall";
      } else {
        this.currentState = "jump";
      }
      return;
    }

    const speed = Math.abs(this.vx);
    if (speed < 0.5) {
      this.currentState = "idle";
    } else if (speed < PHYSICS.maxSpeed * 0.7) {
      this.currentState = "walk";
    } else {
      this.currentState = "run";
    }
  }

  updateAnimation(deltaTime) {
    const animConfig = this.animations[this.currentState];
    
    if (animConfig.totalFrames <= 1) {
      this.currentFrame = animConfig.fixedFrameIndex || 0;
      return;
    }

    this.frameTimer += deltaTime;
    
    if (this.frameTimer >= animConfig.frameSpeed) {
      this.frameTimer = 0;
      this.currentFrame++;
      
      if (this.currentFrame >= animConfig.totalFrames) {
        this.currentFrame = 0;
      }
    }
  }
  
  handleCollision(platforms) {
    this.x += this.vx;
    platforms.forEach((p) => {
      if ((p.type === "broken" && p.isBroken) || p.type === "fake" || p.type === "oneWay") return;
      
      if (this.checkCollision(p)) {
        const playerCenter = this.x + this.w / 2;
        const platformCenter = p.x + p.w / 2;
        if (playerCenter < platformCenter) {
          this.x = p.x - this.w;
        } else {
          this.x = p.x + p.w;
        }
        let platformVel = p.type === "moving" ? p.speed * p.direction : 0;
        this.vx = (platformVel - this.vx) * 0.4;
        if (Math.abs(this.vx) < 1) {
          this.vx = playerCenter < platformCenter ? -2 : 2;
        }
      }
    });

    this.y += this.vy;
    let foundGround = false;
    
    platforms.forEach((p) => {
      if ((p.type === "broken" && p.isBroken) || p.type === "fake") return;
      if (this.checkCollision(p)) {
        if (p.type === "oneWay") {
          if (this.vy > 0 && this.y + this.h - this.vy <= p.y + 5) {
            this.y = p.y - this.h;
            this.vy = 0;
            this.isGrounded = true;
            this.standingOnPlatform = p;
            this.platformType = p.type;
            foundGround = true;
          }
        } else {
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
                this.eventTracker.track("bounce");
              }
            }
          } else if (this.vy < 0) {
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
    const anim = this.animations[this.currentState];
    let sx = this.currentFrame * anim.frameWidth;
    let sy = 0;

    const scale = 1.5; 
    const drawW = this.w * scale;
    const drawH = this.h * scale;
    const drawX = this.x - (drawW - this.w) / 2;
    const drawY = this.y - (drawH - this.h);

    ctx.save();

    if (!this.facingRight) {
      ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
      ctx.scale(-1, 1);
      ctx.translate(-(this.x + this.w / 2), -(this.y + this.h / 2));
    }

    if (anim.img.complete) {
      ctx.drawImage(
        anim.img,
        sx,
        sy,
        anim.frameWidth,
        anim.frameHeight,
        drawX,
        drawY,
        drawW,
        drawH
      );
    } else {
      ctx.fillStyle = "#ff4444";
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    ctx.restore();

    if (this.charge > 0) {
      ctx.fillStyle = "lime";
      ctx.beginPath();
      ctx.arc(this.x + 15, this.y - 15, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "yellow";
      ctx.fillRect(
        this.x - 5,
        this.y - 10,
        (this.charge / PHYSICS.maxJumpForce) * 40,
        5
      );
    }
  }
}