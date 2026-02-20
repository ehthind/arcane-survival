import { Enemy } from '../Enemy.js';
import { Projectile } from '../../systems/Projectile.js';

export class Skeleton extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.type = 'skeleton';
        this.speed = 70;
        this.baseSpeed = 70;
        this.health = 40;
        this.maxHealth = 40;
        this.radius = 14;
        this.damage = 12;
        this.scoreValue = 20;
        this.goldValue = 12;
        this.deathColors = ['#d4d4d8', '#a1a1aa', '#e5e7eb'];
        this.shootCooldown = 0;
        this.shootRate = 2.5;
        this.preferredDist = 180;
        this.jawOpen = 0;
        this.bobAnim = Math.random() * Math.PI * 2;
    }

    update(dt, player) {
        super.update(dt, player);
        if (this.dead || this.frozen) return;

        this.bobAnim += dt * 3;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.preferredDist) {
            this.vx = -(dx / dist) * this.speed * 0.5;
            this.vy = -(dy / dist) * this.speed * 0.5;
            this.x += this.vx * dt;
            this.y += this.vy * dt;
        }

        this.shootCooldown -= dt;
        // Jaw animation
        if (this.shootCooldown < 0.3 && this.shootCooldown > 0) {
            this.jawOpen = Math.min(1, this.jawOpen + dt * 8);
        } else {
            this.jawOpen = Math.max(0, this.jawOpen - dt * 4);
        }

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
            angle, speed: 220, damage: 10, radius: 5, lifetime: 2,
            color: '#d4d4d8', trailColor: '#a1a1aa',
            isPlayerProjectile: false, game: this.game,
        });
        this.game.projectiles.push(proj);
    }

    renderBody(ctx) {
        const bob = Math.sin(this.bobAnim) * 1.5;

        // Tattered cloak
        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.moveTo(-10, bob - 4);
        ctx.quadraticCurveTo(-14, bob + 16, -8 + Math.sin(this.bobAnim * 0.7) * 2, bob + 18);
        ctx.lineTo(8 + Math.sin(this.bobAnim * 0.7 + 1) * 2, bob + 18);
        ctx.quadraticCurveTo(14, bob + 16, 10, bob - 4);
        ctx.closePath();
        ctx.fill();
        // Cloak tattered edges
        ctx.fillStyle = '#1c1917';
        for (let i = -6; i <= 6; i += 3) {
            ctx.beginPath();
            ctx.moveTo(i - 1, bob + 16);
            ctx.lineTo(i, bob + 20 + Math.random());
            ctx.lineTo(i + 1, bob + 16);
            ctx.closePath();
            ctx.fill();
        }

        // Ribcage
        ctx.strokeStyle = '#d4d4d8';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
            const ry = bob + 2 + i * 3;
            const rw = 7 - i * 0.8;
            ctx.beginPath();
            ctx.ellipse(0, ry, rw, 1.5, 0, 0, Math.PI);
            ctx.stroke();
        }
        // Spine
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, bob - 2);
        ctx.lineTo(0, bob + 14);
        ctx.stroke();

        // Skull
        const skullGrad = ctx.createRadialGradient(0, bob - 6, 0, 0, bob - 4, 12);
        skullGrad.addColorStop(0, '#f5f5f4');
        skullGrad.addColorStop(0.7, '#e7e5e4');
        skullGrad.addColorStop(1, '#d6d3d1');
        ctx.fillStyle = skullGrad;
        ctx.beginPath();
        ctx.arc(0, bob - 4, 11, 0, Math.PI * 2);
        ctx.fill();

        // Skull crack
        ctx.strokeStyle = '#a8a29e';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(3, bob - 12);
        ctx.lineTo(5, bob - 8);
        ctx.lineTo(3, bob - 5);
        ctx.stroke();

        // Eye sockets — deep
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.ellipse(-4, bob - 5, 4, 3.5, 0, 0, Math.PI * 2);
        ctx.ellipse(4, bob - 5, 4, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Soul-fire eyes
        const fireFlicker = 0.6 + Math.sin(Date.now() * 0.01) * 0.3;
        const fireGrad = ctx.createRadialGradient(-4, bob - 5, 0, -4, bob - 5, 3);
        fireGrad.addColorStop(0, '#22d3ee');
        fireGrad.addColorStop(0.6, `rgba(6, 182, 212, ${fireFlicker})`);
        fireGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.arc(-4, bob - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        const fireGrad2 = ctx.createRadialGradient(4, bob - 5, 0, 4, bob - 5, 3);
        fireGrad2.addColorStop(0, '#22d3ee');
        fireGrad2.addColorStop(0.6, `rgba(6, 182, 212, ${fireFlicker})`);
        fireGrad2.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = fireGrad2;
        ctx.beginPath();
        ctx.arc(4, bob - 5, 3, 0, Math.PI * 2);
        ctx.fill();

        // Nose hole
        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.moveTo(-1.5, bob - 1);
        ctx.lineTo(1.5, bob - 1);
        ctx.lineTo(0, bob + 1);
        ctx.closePath();
        ctx.fill();

        // Jaw (animated)
        const jawDrop = this.jawOpen * 4;
        ctx.fillStyle = '#d6d3d1';
        ctx.beginPath();
        ctx.arc(0, bob + 1 + jawDrop, 8, 0.2, Math.PI - 0.2);
        ctx.closePath();
        ctx.fill();
        // Teeth — upper
        ctx.fillStyle = '#e7e5e4';
        for (let i = -4; i <= 4; i += 2) {
            ctx.fillRect(i - 0.8, bob, 1.6, 2.5);
        }
        // Teeth — lower (on jaw)
        for (let i = -3; i <= 3; i += 2) {
            ctx.fillRect(i - 0.7, bob + jawDrop - 0.5, 1.4, 2);
        }

        // Bone staff weapon
        ctx.save();
        ctx.translate(this.radius + 2, bob);
        ctx.rotate(0.3);
        // Staff shaft
        ctx.strokeStyle = '#e7e5e4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(0, 16);
        ctx.stroke();
        // Bone joints
        ctx.fillStyle = '#d6d3d1';
        ctx.beginPath();
        ctx.ellipse(0, -8, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, 16, 3, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Skull on top
        ctx.fillStyle = '#e7e5e4';
        ctx.beginPath();
        ctx.arc(0, -12, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(-1.5, -12.5, 1, 0, Math.PI * 2);
        ctx.arc(1.5, -12.5, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
