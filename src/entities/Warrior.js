import { Player } from './Player.js';

export class Warrior extends Player {
    constructor(game) {
        super(game);
        this.className = 'warrior';
        this.health = 120;
        this.maxHealth = 120;
        this.speed = 200;
        this.attackRate = 0.35;
        this.specialMaxCooldown = 5;
        this.mana = 100;
        this.maxMana = 100;
        this.manaRegen = 12;

        // Melee
        this.swordArc = Math.PI * 0.8; // sweep angle
        this.swordRange = 55;
        this.swordDamage = 28;
        this.swingAngle = 0;
        this.swingDir = 1;

        // Visual
        this.bodyColor = '#b91c1c';
        this.accentColor = '#f97316';
        this.shieldColor = '#6b7280';
    }

    update(dt, input) {
        super.update(dt, input);

        this.mana = Math.min(this.maxMana, this.mana + this.manaRegen * dt);

        // Primary — sword swing
        if (input.mouse.clicked && this.attackCooldown <= 0) {
            this.swordSwing();
            this.attackCooldown = this.attackRate;
            this.isAttacking = true;
            this.attackAnimTimer = 0.25;
            this.swingAngle = -this.swordArc / 2;
            this.swingDir = 1;
        }

        // Animate sword swing
        if (this.isAttacking) {
            this.swingAngle += this.swingDir * (this.swordArc / 0.25) * dt;
            if (this.swingAngle > this.swordArc / 2) {
                this.swingAngle = this.swordArc / 2;
            }
        }

        // Special — ground slam (right click)
        if (input.mouse.rightClicked && this.specialCooldown <= 0 && this.mana >= 35) {
            this.groundSlam();
            this.specialCooldown = this.specialMaxCooldown;
            this.mana -= 35;
        }
    }

    swordSwing() {
        const startAngle = this.facing - this.swordArc / 2;
        const endAngle = this.facing + this.swordArc / 2;

        for (const enemy of this.game.enemies) {
            if (enemy.dead) continue;
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > this.swordRange + enemy.radius) continue;

            let angle = Math.atan2(dy, dx);
            // Normalize angle diff
            let diff = angle - this.facing;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;

            if (Math.abs(diff) < this.swordArc / 2) {
                enemy.takeDamage(this.swordDamage);
                // Small knockback
                const kb = 20;
                enemy.x += Math.cos(angle) * kb;
                enemy.y += Math.sin(angle) * kb;
            }
        }

        this.game.addScreenShake(3, 0.1);
        // Sword slash particles
        this.game.particles.emit(
            this.x + Math.cos(this.facing) * 25,
            this.y + Math.sin(this.facing) * 25,
            6,
            {
                colors: ['#fbbf24', '#f59e0b', '#ffffff'],
                speed: 80,
                lifetime: 0.3,
                size: 3,
                spread: this.swordArc,
                angle: this.facing,
            }
        );
    }

    groundSlam() {
        const radius = 130;
        this.game.addScreenShake(8, 0.3);

        for (const enemy of this.game.enemies) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius && !enemy.dead) {
                enemy.takeDamage(35);
                // Big knockback
                const angle = Math.atan2(dy, dx);
                enemy.x += Math.cos(angle) * 60;
                enemy.y += Math.sin(angle) * 60;
            }
        }

        // Shockwave particles
        this.game.particles.emit(this.x, this.y, 50, {
            colors: ['#f97316', '#fbbf24', '#ef4444', '#ffffff'],
            speed: 250,
            speedVariance: 100,
            lifetime: 0.5,
            size: 5,
            sizeEnd: 1,
        });
    }

    render(ctx) {
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 10) % 2 === 0) return;

        this.renderShadow(ctx);

        ctx.save();
        ctx.translate(this.x, this.y);

        // Body (armor)
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Armor detail
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.arc(0, 2, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Helmet
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(0, -6, 12, Math.PI, 0);
        ctx.closePath();
        ctx.fill();

        // Helmet visor
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.rect(-7, -10, 14, 5);
        ctx.fill();

        // Eyes through visor
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(-3, -8, 1.5, 0, Math.PI * 2);
        ctx.arc(3, -8, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Shield (opposite facing direction)
        const shieldAngle = this.facing + Math.PI;
        ctx.save();
        ctx.translate(Math.cos(shieldAngle) * 16, Math.sin(shieldAngle) * 16);
        ctx.rotate(shieldAngle);
        ctx.fillStyle = this.shieldColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d4d4d8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Shield emblem
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Sword
        ctx.save();
        let swordRotation = this.facing;
        if (this.isAttacking) {
            swordRotation = this.facing + this.swingAngle;
        }
        ctx.rotate(swordRotation);

        // Sword blade
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.rect(15, -2, 30, 4);
        ctx.fill();

        // Sword tip
        ctx.beginPath();
        ctx.moveTo(45, -3);
        ctx.lineTo(50, 0);
        ctx.lineTo(45, 3);
        ctx.closePath();
        ctx.fill();

        // Sword guard
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.rect(13, -5, 4, 10);
        ctx.fill();

        // Sword handle
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.rect(7, -2, 8, 4);
        ctx.fill();

        ctx.restore();

        // Swing arc visual
        if (this.isAttacking) {
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.swordRange, this.facing - this.swordArc / 2, this.facing + this.swordArc / 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}
