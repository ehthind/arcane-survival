import { GoldDrop } from './GoldDrop.js';

export class Enemy {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 80;
        this.baseSpeed = 80;
        this.radius = 14;
        this.health = 30;
        this.maxHealth = 30;
        this.damage = 10;
        this.dead = false;
        this.deathTimer = 0.3;
        this.frozen = false;
        this.frozenTimer = 0;
        this.hitFlashTimer = 0;
        this.type = 'enemy';
        this.scoreValue = 10;
        this.goldValue = 5;
    }

    takeDamage(amount) {
        if (this.dead) return;
        this.health -= amount;
        this.hitFlashTimer = 0.1;
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }

    freeze(duration) {
        this.frozen = true;
        this.frozenTimer = duration;
    }

    die() {
        this.dead = true;
        this.deathTimer = 0.3;
        this.game.score += this.scoreValue;

        // Drop gold
        const goldCount = 1 + Math.floor(Math.random() * 2);
        const perCoin = Math.ceil(this.goldValue / goldCount);
        for (let i = 0; i < goldCount; i++) {
            this.game.goldDrops.push(new GoldDrop(this.x, this.y, perCoin, this.game));
        }

        // Death particles
        this.game.particles.emit(this.x, this.y, 12, {
            colors: this.deathColors || ['#ff6b6b', '#ffa500', '#ffdd00'],
            speed: 150,
            speedVariance: 80,
            lifetime: 0.5,
            size: 4,
            sizeEnd: 0,
        });
    }

    update(dt, player) {
        if (this.dead) {
            this.deathTimer -= dt;
            return;
        }

        if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;

        if (this.frozen) {
            this.frozenTimer -= dt;
            if (this.frozenTimer <= 0) {
                this.frozen = false;
            }
            return; // Don't move while frozen
        }

        // Move toward player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
        }

        // Separation from other enemies
        for (const other of this.game.enemies) {
            if (other === this || other.dead) continue;
            const ox = this.x - other.x;
            const oy = this.y - other.y;
            const oDist = Math.sqrt(ox * ox + oy * oy);
            const minDist = this.radius + other.radius + 4;
            if (oDist < minDist && oDist > 0) {
                const push = (minDist - oDist) * 2;
                this.vx += (ox / oDist) * push;
                this.vy += (oy / oDist) * push;
            }
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Arena bounds
        const arena = this.game.arena;
        const pad = this.radius;
        this.x = Math.max(arena.left + pad, Math.min(arena.right - pad, this.x));
        this.y = Math.max(arena.top + pad, Math.min(arena.bottom - pad, this.y));
    }

    render(ctx) {
        if (this.dead) {
            // Death shrink animation
            const t = this.deathTimer / 0.3;
            ctx.globalAlpha = t;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(t, t);
            this.renderBody(ctx);
            ctx.restore();
            ctx.globalAlpha = 1;
            return;
        }

        this.renderShadow(ctx);
        ctx.save();
        ctx.translate(this.x, this.y);

        // Frozen overlay
        if (this.frozen) {
            ctx.fillStyle = 'rgba(147, 197, 253, 0.4)';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Hit flash
        if (this.hitFlashTimer > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
            ctx.fill();
        }

        this.renderBody(ctx);

        // Health bar
        if (this.health < this.maxHealth) {
            const barW = 30;
            const barH = 4;
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(-barW / 2, -this.radius - 12, barW, barH);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(-barW / 2, -this.radius - 12, barW * (this.health / this.maxHealth), barH);
        }

        ctx.restore();
    }

    renderBody(ctx) {
        // Override in subclasses
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    renderShadow(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.radius + 2, this.radius * 0.8, this.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
