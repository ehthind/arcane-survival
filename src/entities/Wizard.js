import { Player } from './Player.js';
import { Projectile } from '../systems/Projectile.js';

export class Wizard extends Player {
    constructor(game) {
        super(game);
        this.className = 'wizard';
        this.health = 80;
        this.maxHealth = 80;
        this.speed = 240;
        this.attackRate = 0.25; // seconds between shots
        this.specialMaxCooldown = 6;
        this.mana = 100;
        this.maxMana = 100;
        this.manaRegen = 15; // per second

        // Visual
        this.bodyColor = '#6c3ebf';
        this.accentColor = '#a855f7';
        this.glowColor = '#c084fc';
    }

    update(dt, input) {
        super.update(dt, input);

        this.mana = Math.min(this.maxMana, this.mana + this.manaRegen * dt);

        // Primary attack — magic bolt
        if (input.mouse.down && this.attackCooldown <= 0) {
            this.fireProjectile();
            this.attackCooldown = this.attackRate;
            this.isAttacking = true;
            this.attackAnimTimer = 0.15;
        }

        // Special — frost nova (right click)
        if (input.mouse.rightClicked && this.specialCooldown <= 0 && this.mana >= 40) {
            this.frostNova();
            this.specialCooldown = this.specialMaxCooldown;
            this.mana -= 40;
        }

        // Ambient magic particles
        if (Math.random() < 0.3) {
            this.game.particles.emit(
                this.x + (Math.random() - 0.5) * 20,
                this.y + (Math.random() - 0.5) * 20,
                1,
                {
                    colors: ['#c084fc', '#a855f7', '#7c3aed'],
                    speed: 20,
                    lifetime: 0.8,
                    size: 2,
                    sizeEnd: 0,
                }
            );
        }
    }

    fireProjectile() {
        const worldMouse = this.game.input.getWorldMouse(this.game.camera, this.game.width, this.game.height);
        const angle = Math.atan2(worldMouse.y - this.y, worldMouse.x - this.x);
        const proj = new Projectile({
            x: this.x + Math.cos(angle) * 20,
            y: this.y + Math.sin(angle) * 20,
            angle,
            speed: 500,
            damage: 18,
            radius: 6,
            lifetime: 1.5,
            color: '#a855f7',
            trailColor: '#c084fc',
            isPlayerProjectile: true,
            game: this.game,
        });
        this.game.projectiles.push(proj);
    }

    frostNova() {
        const radius = 150;
        this.game.addScreenShake(6, 0.2);
        // Damage and freeze nearby enemies
        for (const enemy of this.game.enemies) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius && !enemy.dead) {
                enemy.takeDamage(25);
                enemy.freeze(2); // freeze for 2 seconds
                // Knockback
                const angle = Math.atan2(dy, dx);
                enemy.x += Math.cos(angle) * 30;
                enemy.y += Math.sin(angle) * 30;
            }
        }
        // Visual effect
        this.game.particles.emit(this.x, this.y, 40, {
            colors: ['#93c5fd', '#60a5fa', '#3b82f6', '#dbeafe'],
            speed: 200,
            speedVariance: 100,
            lifetime: 0.6,
            size: 5,
            sizeEnd: 1,
        });
    }

    render(ctx) {
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 10) % 2 === 0) return;

        this.renderShadow(ctx);

        ctx.save();
        ctx.translate(this.x, this.y);

        // Staff glow
        const glowSize = 25 + Math.sin(this.animTimer * 4) * 3;
        const gradient = ctx.createRadialGradient(
            Math.cos(this.facing) * 22, Math.sin(this.facing) * 22 - 5, 0,
            Math.cos(this.facing) * 22, Math.sin(this.facing) * 22 - 5, glowSize
        );
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(Math.cos(this.facing) * 22, Math.sin(this.facing) * 22 - 5, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Robe (body)
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner robe detail
        ctx.fillStyle = '#5b21b6';
        ctx.beginPath();
        ctx.arc(0, 2, this.radius * 0.65, 0, Math.PI * 2);
        ctx.fill();

        // Hat (triangle pointing up)
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.moveTo(-10, -8);
        ctx.lineTo(10, -8);
        ctx.lineTo(0, -28);
        ctx.closePath();
        ctx.fill();

        // Hat accent
        ctx.strokeStyle = this.accentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-12, -8);
        ctx.lineTo(12, -8);
        ctx.stroke();

        // Star on hat
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, -18, 3, 0, Math.PI * 2);
        ctx.fill();

        // Staff
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 3;
        const staffEndX = Math.cos(this.facing) * 28;
        const staffEndY = Math.sin(this.facing) * 28;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(staffEndX, staffEndY);
        ctx.stroke();

        // Staff orb
        ctx.fillStyle = this.isAttacking ? '#f59e0b' : this.glowColor;
        ctx.beginPath();
        ctx.arc(staffEndX, staffEndY - 2, 5, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        const eyeOffX = Math.cos(this.facing) * 5;
        const eyeOffY = Math.sin(this.facing) * 5;
        ctx.fillStyle = '#e0e7ff';
        ctx.beginPath();
        ctx.arc(eyeOffX - 4, eyeOffY - 4, 2.5, 0, Math.PI * 2);
        ctx.arc(eyeOffX + 4, eyeOffY - 4, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
