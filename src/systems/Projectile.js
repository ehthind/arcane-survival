export class Projectile {
    constructor(opts) {
        this.game = opts.game;
        this.x = opts.x;
        this.y = opts.y;
        this.angle = opts.angle;
        this.speed = opts.speed;
        this.damage = opts.damage;
        this.radius = opts.radius || 5;
        this.lifetime = opts.lifetime || 2;
        this.maxLifetime = this.lifetime;
        this.color = opts.color || '#ffaa00';
        this.trailColor = opts.trailColor || '#ff6600';
        this.isPlayerProjectile = opts.isPlayerProjectile;
        this.expired = false;
        this.homing = opts.homing || false;
        this.homingStrength = opts.homingStrength || 1;

        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;

        this.trail = [];
    }

    update(dt) {
        // Homing behavior
        if (this.homing && this.game.player && !this.isPlayerProjectile) {
            const dx = this.game.player.x - this.x;
            const dy = this.game.player.y - this.y;
            const targetAngle = Math.atan2(dy, dx);

            let angleDiff = targetAngle - this.angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

            this.angle += angleDiff * this.homingStrength * dt;
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
        }

        // Store trail position
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 8) this.trail.shift();

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        this.lifetime -= dt;
        if (this.lifetime <= 0) {
            this.expired = true;
        }

        // Check arena bounds
        const arena = this.game.arena;
        if (this.x < arena.left - 50 || this.x > arena.right + 50 ||
            this.y < arena.top - 50 || this.y > arena.bottom + 50) {
            this.expired = true;
        }
    }

    render(ctx) {
        // Trail
        for (let i = 0; i < this.trail.length; i++) {
            const t = i / this.trail.length;
            ctx.globalAlpha = t * 0.4;
            ctx.fillStyle = this.trailColor;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, this.radius * t * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Glow
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
        gradient.addColorStop(0, this.color + '66');
        gradient.addColorStop(1, this.color + '00');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Bright center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
}
