import { Enemy } from '../Enemy.js';
import { Projectile } from '../../systems/Projectile.js';

export class Skeleton extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.type = 'skeleton';
        this.speed = 70;
        this.health = 40;
        this.maxHealth = 40;
        this.radius = 14;
        this.damage = 12;
        this.scoreValue = 20;
        this.deathColors = ['#d4d4d8', '#a1a1aa', '#e5e7eb'];
        this.shootCooldown = 0;
        this.shootRate = 2.5; // seconds between shots
        this.preferredDist = 180;
    }

    update(dt, player) {
        super.update(dt, player);
        if (this.dead || this.frozen) return;

        // Try to keep distance
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.preferredDist) {
            // Back away
            this.vx = -(dx / dist) * this.speed * 0.5;
            this.vy = -(dy / dist) * this.speed * 0.5;
            this.x += this.vx * dt;
            this.y += this.vy * dt;
        }

        // Shoot
        this.shootCooldown -= dt;
        if (this.shootCooldown <= 0 && dist < 400) {
            this.shoot(player);
            this.shootCooldown = this.shootRate;
        }
    }

    shoot(player) {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        const proj = new Projectile({
            x: this.x + Math.cos(angle) * 18,
            y: this.y + Math.sin(angle) * 18,
            angle,
            speed: 220,
            damage: 10,
            radius: 5,
            lifetime: 2,
            color: '#d4d4d8',
            trailColor: '#a1a1aa',
            isPlayerProjectile: false,
            game: this.game,
        });
        this.game.projectiles.push(proj);
    }

    renderBody(ctx) {
        // Skull
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Jaw
        ctx.fillStyle = '#d4d4d8';
        ctx.beginPath();
        ctx.arc(0, 5, this.radius * 0.7, 0, Math.PI);
        ctx.fill();

        // Eye sockets
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(-4, -2, 4, 0, Math.PI * 2);
        ctx.arc(4, -2, 4, 0, Math.PI * 2);
        ctx.fill();

        // Red eye glow
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-4, -2, 2, 0, Math.PI * 2);
        ctx.arc(4, -2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Nose hole
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.moveTo(-2, 3);
        ctx.lineTo(2, 3);
        ctx.lineTo(0, 5);
        ctx.closePath();
        ctx.fill();

        // Teeth
        ctx.fillStyle = '#e5e7eb';
        for (let i = -3; i <= 3; i++) {
            ctx.fillRect(i * 2.5 - 1, 7, 2, 3);
        }

        // Bone in hand
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(this.radius + 12, -5);
        ctx.stroke();
    }
}
