export class Player {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.speed = 220;
        this.radius = 18;
        this.health = 100;
        this.maxHealth = 100;
        this.invincibleTimer = 0;
        this.invincibleDuration = 0.5;
        this.attackCooldown = 0;
        this.specialCooldown = 0;
        this.specialMaxCooldown = 5;
        this.facing = 0; // angle in radians
        this.animTimer = 0;
        this.isAttacking = false;
        this.attackAnimTimer = 0;
        this.className = 'player';
        this.dead = false;
    }

    takeDamage(amount) {
        if (this.invincibleTimer > 0) return;
        this.health -= amount;
        this.invincibleTimer = this.invincibleDuration;
        this.game.addScreenShake(4, 0.15);
        this.game.particles.emit(this.x, this.y, 8, {
            colors: ['#ff4444', '#ff6666', '#ff2222'],
            speed: 120,
            lifetime: 0.4,
            size: 3,
        });
        if (this.health <= 0) {
            this.health = 0;
            this.dead = true;
        }
    }

    update(dt, input) {
        // Movement
        let mx = 0, my = 0;
        if (input.isDown('KeyW') || input.isDown('ArrowUp')) my -= 1;
        if (input.isDown('KeyS') || input.isDown('ArrowDown')) my += 1;
        if (input.isDown('KeyA') || input.isDown('ArrowLeft')) mx -= 1;
        if (input.isDown('KeyD') || input.isDown('ArrowRight')) mx += 1;

        // Normalize diagonal
        const mag = Math.sqrt(mx * mx + my * my);
        if (mag > 0) {
            mx /= mag;
            my /= mag;
        }

        this.vx = mx * this.speed;
        this.vy = my * this.speed;
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Arena bounds
        const arena = this.game.arena;
        const pad = this.radius;
        this.x = Math.max(arena.left + pad, Math.min(arena.right - pad, this.x));
        this.y = Math.max(arena.top + pad, Math.min(arena.bottom - pad, this.y));

        // Face mouse
        const worldMouse = input.getWorldMouse(this.game.camera, this.game.width, this.game.height);
        this.facing = Math.atan2(worldMouse.y - this.y, worldMouse.x - this.x);

        // Timers
        if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.specialCooldown > 0) this.specialCooldown -= dt;

        this.animTimer += dt;
        if (this.attackAnimTimer > 0) this.attackAnimTimer -= dt;
        else this.isAttacking = false;
    }

    render(ctx) {
        // Blink when invincible
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 10) % 2 === 0) return;
        // Subclasses override this
    }

    renderShadow(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.radius + 2, this.radius * 0.9, this.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
