import { Enemy } from '../Enemy.js';
import { Projectile } from '../../systems/Projectile.js';

export class DarkMage extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.type = 'darkmage';
        this.speed = 45;
        this.health = 80;
        this.maxHealth = 80;
        this.radius = 16;
        this.damage = 15;
        this.scoreValue = 50;
        this.deathColors = ['#7c3aed', '#a855f7', '#312e81'];
        this.shootCooldown = 0;
        this.shootRate = 3;
        this.preferredDist = 220;
        this.orbTimer = 0;
    }

    update(dt, player) {
        super.update(dt, player);
        if (this.dead || this.frozen) return;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Keep distance
        if (dist < this.preferredDist) {
            this.vx = -(dx / dist) * this.speed * 0.6;
            this.vy = -(dy / dist) * this.speed * 0.6;
            this.x += this.vx * dt;
            this.y += this.vy * dt;
        }

        // Fire homing dark orb
        this.shootCooldown -= dt;
        if (this.shootCooldown <= 0 && dist < 500) {
            this.fireOrb(player);
            this.shootCooldown = this.shootRate;
        }

        // Ambient dark particles
        this.orbTimer += dt;
        if (Math.random() < 0.4) {
            this.game.particles.emit(
                this.x + (Math.random() - 0.5) * 24,
                this.y + (Math.random() - 0.5) * 24,
                1,
                {
                    colors: ['#7c3aed', '#312e81'],
                    speed: 15,
                    lifetime: 0.6,
                    size: 2.5,
                    sizeEnd: 0,
                }
            );
        }
    }

    fireOrb(player) {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        const proj = new Projectile({
            x: this.x + Math.cos(angle) * 20,
            y: this.y + Math.sin(angle) * 20,
            angle,
            speed: 150,
            damage: 15,
            radius: 7,
            lifetime: 4,
            color: '#7c3aed',
            trailColor: '#a855f7',
            isPlayerProjectile: false,
            homing: true,
            homingStrength: 1.8,
            game: this.game,
        });
        this.game.projectiles.push(proj);
    }

    renderBody(ctx) {
        // Dark robe
        ctx.fillStyle = '#312e81';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner robe
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(0, 2, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Hood
        ctx.fillStyle = '#312e81';
        ctx.beginPath();
        ctx.arc(0, -4, 12, Math.PI, 0);
        ctx.closePath();
        ctx.fill();

        // Glowing eyes
        const glow = Math.sin(Date.now() * 0.006) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(168, 85, 247, ${glow})`;
        ctx.beginPath();
        ctx.arc(-4, -3, 3, 0, Math.PI * 2);
        ctx.arc(4, -3, 3, 0, Math.PI * 2);
        ctx.fill();

        // Eye glow aura
        const gradient = ctx.createRadialGradient(0, -3, 0, 0, -3, 18);
        gradient.addColorStop(0, 'rgba(124, 58, 237, 0.3)');
        gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, -3, 18, 0, Math.PI * 2);
        ctx.fill();

        // Floating orb in hand
        const orbY = Math.sin(Date.now() * 0.004) * 3;
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.arc(this.radius + 5, orbY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(this.radius + 5, orbY, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
}
