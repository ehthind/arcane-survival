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

        // Upgrade support
        this.pierceCount = opts.pierceCount || 0;
        this.pierced = 0;
        this.chainCount = opts.chainCount || 0;
        this.chainedFrom = opts.chainedFrom || null; // set of enemy ids we already hit
        this.hitEnemies = opts.hitEnemies || new Set();
        this.owner = opts.owner || null;

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

    // Called when this projectile hits an enemy — returns true if should be consumed
    onHitEnemy(enemy) {
        this.hitEnemies.add(enemy);

        // Chain lightning — spawn a new bolt toward nearest un-hit enemy
        if (this.chainCount > 0 && this.isPlayerProjectile) {
            let nearest = null;
            let nearestDist = 200; // max chain range
            for (const e of this.game.enemies) {
                if (e.dead || this.hitEnemies.has(e)) continue;
                const dx = e.x - enemy.x;
                const dy = e.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearest = e;
                }
            }
            if (nearest) {
                const chainAngle = Math.atan2(nearest.y - enemy.y, nearest.x - enemy.x);
                const chainProj = new Projectile({
                    x: enemy.x, y: enemy.y,
                    angle: chainAngle,
                    speed: this.speed * 1.2,
                    damage: Math.round(this.damage * 0.7),
                    radius: this.radius * 0.8,
                    lifetime: 0.8,
                    color: '#facc15',
                    trailColor: '#fbbf24',
                    isPlayerProjectile: true,
                    game: this.game,
                    pierceCount: 0,
                    chainCount: this.chainCount - 1,
                    hitEnemies: new Set(this.hitEnemies),
                    owner: this.owner,
                });
                this.game.projectiles.push(chainProj);

                // Lightning visual
                this.game.particles.emit(enemy.x, enemy.y, 4, {
                    colors: ['#facc15', '#ffffff'],
                    speed: 80, lifetime: 0.2, size: 2, sizeEnd: 0,
                });
            }
        }

        // Lifesteal on projectile hit (for wizard with vampiric-like upgrades isn't standard, but check owner)
        if (this.owner && this.owner.lifesteal > 0 && this.isPlayerProjectile) {
            const heal = Math.round(this.damage * this.owner.lifesteal);
            if (heal > 0) {
                this.owner.health = Math.min(this.owner.maxHealth, this.owner.health + heal);
            }
        }

        // Piercing
        if (this.pierceCount > 0 && this.pierced < this.pierceCount) {
            this.pierced++;
            return false; // don't consume
        }

        return true; // consume
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
