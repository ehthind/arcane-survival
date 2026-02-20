import { Enemy } from '../Enemy.js';
import { Projectile } from '../../systems/Projectile.js';

export class DarkMage extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.type = 'darkmage';
        this.speed = 45;
        this.baseSpeed = 45;
        this.health = 80;
        this.maxHealth = 80;
        this.radius = 16;
        this.damage = 15;
        this.scoreValue = 50;
        this.goldValue = 25;
        this.deathColors = ['#7c3aed', '#a855f7', '#312e81'];
        this.shootCooldown = 0;
        this.shootRate = 3;
        this.preferredDist = 220;
        this.floatAnim = Math.random() * Math.PI * 2;
        this.runeAngle = 0;
        this.grimoireAngle = 0;
    }

    update(dt, player) {
        super.update(dt, player);
        if (this.dead || this.frozen) return;

        this.floatAnim += dt * 2;
        this.runeAngle += dt * 1.5;
        this.grimoireAngle += dt * 2;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.preferredDist) {
            this.vx = -(dx / dist) * this.speed * 0.6;
            this.vy = -(dy / dist) * this.speed * 0.6;
            this.x += this.vx * dt;
            this.y += this.vy * dt;
        }

        this.shootCooldown -= dt;
        if (this.shootCooldown <= 0 && dist < 500) {
            this.fireOrb(player);
            this.shootCooldown = this.shootRate;
        }

        // Ambient dark particles
        if (Math.random() < 0.5) {
            this.game.particles.emit(
                this.x + (Math.random() - 0.5) * 30,
                this.y + (Math.random() - 0.5) * 30,
                1,
                { colors: ['#7c3aed', '#312e81', '#1e1b4b'], speed: 15, lifetime: 0.7, size: 2.5, sizeEnd: 0 }
            );
        }
    }

    fireOrb(player) {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        const proj = new Projectile({
            x: this.x + Math.cos(angle) * 20,
            y: this.y + Math.sin(angle) * 20,
            angle, speed: 150, damage: 15, radius: 7, lifetime: 4,
            color: '#7c3aed', trailColor: '#a855f7',
            isPlayerProjectile: false, homing: true, homingStrength: 1.8,
            game: this.game,
        });
        this.game.projectiles.push(proj);
    }

    renderBody(ctx) {
        const floatY = Math.sin(this.floatAnim) * 4;

        // Dark vortex beneath
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            const vortexR = 18 + i * 6;
            const vortexAlpha = 0.15 - i * 0.04;
            ctx.globalAlpha = vortexAlpha;
            ctx.beginPath();
            ctx.arc(0, floatY + 10, vortexR, this.runeAngle + i, this.runeAngle + i + Math.PI * 1.2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.restore();

        // Robe (layered, flowing)
        // Outer robe with rune edges
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.moveTo(-14, floatY - 6);
        ctx.quadraticCurveTo(-16, floatY + 14, -10 + Math.sin(this.floatAnim * 0.7) * 2, floatY + 22);
        ctx.lineTo(10 + Math.sin(this.floatAnim * 0.7 + 1) * 2, floatY + 22);
        ctx.quadraticCurveTo(16, floatY + 14, 14, floatY - 6);
        ctx.closePath();
        ctx.fill();

        // Robe tattered bottom
        ctx.fillStyle = '#312e81';
        for (let i = -8; i <= 8; i += 3) {
            const waveOff = Math.sin(this.floatAnim + i * 0.5) * 2;
            ctx.beginPath();
            ctx.moveTo(i - 1.5, floatY + 20);
            ctx.lineTo(i, floatY + 24 + waveOff);
            ctx.lineTo(i + 1.5, floatY + 20);
            ctx.closePath();
            ctx.fill();
        }

        // Inner robe
        const robeGrad = ctx.createRadialGradient(0, floatY, 0, 0, floatY + 4, this.radius);
        robeGrad.addColorStop(0, '#3730a3');
        robeGrad.addColorStop(0.6, '#312e81');
        robeGrad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.arc(0, floatY, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Glowing rune symbols on robe
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const ra = this.runeAngle + (i * Math.PI * 0.5);
            const rx = Math.cos(ra) * 10;
            const ry = floatY + Math.sin(ra) * 8;
            ctx.beginPath();
            ctx.arc(rx, ry, 2, 0, Math.PI * 2);
            ctx.stroke();
            // Connecting rune lines
            ctx.beginPath();
            ctx.moveTo(rx - 2, ry);
            ctx.lineTo(rx + 2, ry);
            ctx.moveTo(rx, ry - 2);
            ctx.lineTo(rx, ry + 2);
            ctx.stroke();
        }

        // Hood
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(0, floatY - 4, 14, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        // Hood inner shadow
        ctx.fillStyle = '#0f0b2e';
        ctx.beginPath();
        ctx.arc(0, floatY - 3, 11, Math.PI + 0.3, -0.3);
        ctx.closePath();
        ctx.fill();
        // Hood peak
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.moveTo(-3, floatY - 14);
        ctx.lineTo(0, floatY - 19);
        ctx.lineTo(3, floatY - 14);
        ctx.closePath();
        ctx.fill();

        // Glowing eyes — only visible in darkness of hood
        const glow = 0.5 + Math.sin(Date.now() * 0.006) * 0.3;
        // Eye glow aura
        const eyeGrad = ctx.createRadialGradient(0, floatY - 5, 0, 0, floatY - 5, 15);
        eyeGrad.addColorStop(0, `rgba(168, 85, 247, ${glow * 0.4})`);
        eyeGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = eyeGrad;
        ctx.beginPath();
        ctx.arc(0, floatY - 5, 15, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = `rgba(168, 85, 247, ${glow})`;
        ctx.beginPath();
        ctx.ellipse(-4, floatY - 5, 3, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(4, floatY - 5, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eye bright centers
        ctx.fillStyle = `rgba(196, 132, 252, ${glow})`;
        ctx.beginPath();
        ctx.arc(-4, floatY - 5, 1.2, 0, Math.PI * 2);
        ctx.arc(4, floatY - 5, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Floating grimoire
        const gx = -this.radius - 6;
        const gy = floatY + Math.sin(this.grimoireAngle) * 4 - 4;
        const gRot = Math.sin(this.grimoireAngle * 0.5) * 0.15;
        ctx.save();
        ctx.translate(gx, gy);
        ctx.rotate(gRot);
        // Book cover
        ctx.fillStyle = '#312e81';
        ctx.fillRect(-6, -8, 12, 16);
        // Book spine
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(-6, -8, 2.5, 16);
        // Book pages
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(-3, -6, 8, 12);
        // Book clasp
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.arc(5, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        // Book glow
        ctx.fillStyle = `rgba(124, 58, 237, ${0.2 + Math.sin(this.grimoireAngle * 2) * 0.1})`;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        // Floating rune above book
        ctx.fillStyle = `rgba(168, 85, 247, ${0.3 + Math.sin(this.grimoireAngle * 3) * 0.2})`;
        ctx.font = '8px serif';
        ctx.textAlign = 'center';
        ctx.fillText('✧', 0, -12);
        ctx.restore();

        // Raised hand with dark energy
        const handX = this.radius + 3;
        const handY = floatY - 2;
        ctx.fillStyle = '#312e81';
        ctx.beginPath();
        ctx.arc(handX, handY, 4, 0, Math.PI * 2);
        ctx.fill();
        // Dark energy orb in hand
        const orbPulse = 4 + Math.sin(Date.now() * 0.005) * 1.5;
        const orbGrad = ctx.createRadialGradient(handX, handY - 3, 0, handX, handY - 3, orbPulse * 2);
        orbGrad.addColorStop(0, 'rgba(124, 58, 237, 0.6)');
        orbGrad.addColorStop(0.5, 'rgba(88, 28, 135, 0.3)');
        orbGrad.addColorStop(1, 'rgba(124, 58, 237, 0)');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(handX, handY - 3, orbPulse * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.arc(handX, handY - 3, orbPulse * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(handX, handY - 3, orbPulse * 0.25, 0, Math.PI * 2);
        ctx.fill();
    }
}
