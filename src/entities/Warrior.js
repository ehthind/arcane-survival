import { Player } from './Player.js';

export class Warrior extends Player {
    constructor(game) {
        super(game);
        this.className = 'warrior';
        this.health = 120;
        this.maxHealth = 120;
        this.baseMaxHealth = 120;
        this.speed = 200;
        this.attackRate = 0.35;
        this.baseAttackRate = 0.35;
        this.specialMaxCooldown = 5;
        this.mana = 100;
        this.maxMana = 100;
        this.manaRegen = 12;
        this.baseManaRegen = 12;

        // Melee
        this.swordArc = Math.PI * 0.8;
        this.swordRange = 55;
        this.swordDamage = 28;
        this.swingAngle = 0;
        this.swingDir = 1;

        // Visual
        this.bodyColor = '#b91c1c';
        this.accentColor = '#f97316';
        this.shieldColor = '#6b7280';
        this.capeAngle = 0;
        this.breathAnim = 0;
    }

    update(dt, input) {
        super.update(dt, input);

        this.mana = Math.min(this.maxMana, this.mana + this.manaRegen * dt);
        this.capeAngle += dt * 2.5;
        this.breathAnim += dt;

        // Berserker rage multiplier
        let berserkDmgMult = 1;
        if (this.berserkerMult > 0) {
            const missingHpPct = 1 - (this.health / this.maxHealth);
            berserkDmgMult = 1 + (missingHpPct * 100 * this.berserkerMult / 100);
        }

        // Primary — sword swing
        if ((input.mouse.clicked || input.spaceAttack) && this.attackCooldown <= 0) {
            this.swordSwing(berserkDmgMult);
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
            this.groundSlam(berserkDmgMult);
            this.specialCooldown = this.specialMaxCooldown;
            this.mana -= 35;
        }
    }

    swordSwing(berserkDmgMult = 1) {
        const finalDamage = Math.round(this.swordDamage * this.damageMultiplier * berserkDmgMult);
        let totalDamageDealt = 0;

        for (const enemy of this.game.enemies) {
            if (enemy.dead) continue;
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > this.swordRange + enemy.radius) continue;

            let diff = Math.atan2(dy, dx) - this.facing;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;

            if (Math.abs(diff) < this.swordArc / 2) {
                enemy.takeDamage(finalDamage);
                totalDamageDealt += finalDamage;
                const angle = Math.atan2(dy, dx);
                enemy.x += Math.cos(angle) * 20;
                enemy.y += Math.sin(angle) * 20;
            }
        }

        // Lifesteal
        if (this.lifesteal > 0 && totalDamageDealt > 0) {
            const heal = Math.round(totalDamageDealt * this.lifesteal);
            this.health = Math.min(this.maxHealth, this.health + heal);
            if (heal > 0) {
                this.game.particles.emit(this.x, this.y - 10, 4, {
                    colors: ['#4ade80', '#22c55e'], speed: 40, lifetime: 0.5, size: 3, sizeEnd: 0,
                });
            }
        }

        this.game.addScreenShake(3, 0.1);
        this.game.particles.emit(
            this.x + Math.cos(this.facing) * 25, this.y + Math.sin(this.facing) * 25, 8, {
            colors: ['#fbbf24', '#f59e0b', '#ffffff', '#ef4444'],
            speed: 100, lifetime: 0.3, size: 3, spread: this.swordArc, angle: this.facing,
        }
        );
    }

    groundSlam(berserkDmgMult = 1) {
        const radius = 130 * this.slamRadiusMult;
        const slamDmg = Math.round(35 * this.damageMultiplier * berserkDmgMult);
        this.game.addScreenShake(8, 0.3);
        let totalDmg = 0;

        for (const enemy of this.game.enemies) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius && !enemy.dead) {
                enemy.takeDamage(slamDmg);
                totalDmg += slamDmg;
                const angle = Math.atan2(dy, dx);
                enemy.x += Math.cos(angle) * 60;
                enemy.y += Math.sin(angle) * 60;
            }
        }

        if (this.lifesteal > 0 && totalDmg > 0) {
            this.health = Math.min(this.maxHealth, this.health + Math.round(totalDmg * this.lifesteal));
        }

        this.game.particles.emit(this.x, this.y, 50, {
            colors: ['#f97316', '#fbbf24', '#ef4444', '#ffffff'],
            speed: 250, speedVariance: 100, lifetime: 0.5, size: 5, sizeEnd: 1,
        });
    }

    render(ctx) {
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 10) % 2 === 0) return;
        this.renderShadow(ctx);

        ctx.save();
        ctx.translate(this.x, this.y);

        // Berserker visual aura
        if (this.berserkerMult > 0 && this.health < this.maxHealth) {
            const missingPct = 1 - (this.health / this.maxHealth);
            const auraAlpha = missingPct * 0.15;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
            gradient.addColorStop(0, `rgba(239, 68, 68, ${auraAlpha})`);
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, 40, 0, Math.PI * 2);
            ctx.fill();
        }

        // Shield upgrade visual
        if (this.shield > 0) {
            ctx.strokeStyle = `rgba(192, 132, 252, ${0.3 + Math.sin(this.animTimer * 3) * 0.15})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Cape
        const capeDir = this.facing + Math.PI;
        const capeW1 = Math.sin(this.capeAngle) * 5;
        const capeW2 = Math.sin(this.capeAngle + 0.8) * 4;
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.moveTo(Math.cos(capeDir - 0.6) * 10, Math.sin(capeDir - 0.6) * 10);
        ctx.quadraticCurveTo(
            Math.cos(capeDir) * 30 + capeW1, Math.sin(capeDir) * 30 + capeW2,
            Math.cos(capeDir + 0.6) * 10, Math.sin(capeDir + 0.6) * 10
        );
        ctx.fill();
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.moveTo(Math.cos(capeDir - 0.4) * 8, Math.sin(capeDir - 0.4) * 8);
        ctx.quadraticCurveTo(
            Math.cos(capeDir) * 24 + capeW1 * 0.7, Math.sin(capeDir) * 24 + capeW2 * 0.7,
            Math.cos(capeDir + 0.4) * 8, Math.sin(capeDir + 0.4) * 8
        );
        ctx.fill();

        // Body (armor) — layered
        const breath = Math.sin(this.breathAnim * 2) * 0.5;
        // Outer armor
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.arc(0, 2, this.radius + 2, 0, Math.PI * 2);
        ctx.fill();
        // Main armor
        const armorGrad = ctx.createRadialGradient(0, -4, 0, 0, 6, this.radius + 1);
        armorGrad.addColorStop(0, '#dc2626');
        armorGrad.addColorStop(0.5, '#b91c1c');
        armorGrad.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.arc(0, breath, this.radius, 0, Math.PI * 2);
        ctx.fill();
        // Armor trim
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, breath, this.radius, -0.5, 0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, breath, this.radius, Math.PI - 0.5, Math.PI + 0.5);
        ctx.stroke();

        // Pauldrons (shoulder armor)
        const pAngle1 = this.facing + Math.PI * 0.6;
        const pAngle2 = this.facing - Math.PI * 0.6;
        for (const pa of [pAngle1, pAngle2]) {
            ctx.save();
            ctx.translate(Math.cos(pa) * 14, Math.sin(pa) * 14);
            ctx.fillStyle = '#374151';
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#4b5563';
            ctx.beginPath();
            ctx.arc(0, -1, 5, 0, Math.PI * 2);
            ctx.fill();
            // Pauldron spike
            ctx.fillStyle = '#9ca3af';
            ctx.beginPath();
            ctx.moveTo(-2, -4);
            ctx.lineTo(0, -9);
            ctx.lineTo(2, -4);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Belt
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-9, 3, 18, 3);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 4.5, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Helmet
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(0, -5, 13, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        // Helmet detail
        ctx.fillStyle = '#4b5563';
        ctx.beginPath();
        ctx.arc(0, -6, 10, Math.PI + 0.3, -0.3);
        ctx.closePath();
        ctx.fill();
        // Helmet crest
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(-2, -12);
        ctx.lineTo(0, -20);
        ctx.lineTo(2, -12);
        ctx.closePath();
        ctx.fill();
        // Visor
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.roundRect(-8, -10, 16, 5, 2);
        ctx.fill();
        // Eyes through visor — glowing
        const eyeGlow = 0.6 + Math.sin(this.animTimer * 3) * 0.2;
        ctx.fillStyle = `rgba(251, 191, 36, ${eyeGlow})`;
        ctx.beginPath();
        ctx.arc(-3.5, -8, 2, 0, Math.PI * 2);
        ctx.arc(3.5, -8, 2, 0, Math.PI * 2);
        ctx.fill();
        // Eye glow effect
        ctx.fillStyle = `rgba(251, 191, 36, ${eyeGlow * 0.3})`;
        ctx.beginPath();
        ctx.arc(-3.5, -8, 4, 0, Math.PI * 2);
        ctx.arc(3.5, -8, 4, 0, Math.PI * 2);
        ctx.fill();

        // Shield (detailed)
        const shieldAngle = this.facing + Math.PI;
        ctx.save();
        ctx.translate(Math.cos(shieldAngle) * 18, Math.sin(shieldAngle) * 18);
        ctx.rotate(shieldAngle);
        // Shield body
        const shieldGrad = ctx.createLinearGradient(-8, -12, 8, 12);
        shieldGrad.addColorStop(0, '#9ca3af');
        shieldGrad.addColorStop(0.3, '#6b7280');
        shieldGrad.addColorStop(0.7, '#4b5563');
        shieldGrad.addColorStop(1, '#374151');
        ctx.fillStyle = shieldGrad;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(9, -10);
        ctx.lineTo(9, 4);
        ctx.lineTo(0, 14);
        ctx.lineTo(-9, 4);
        ctx.lineTo(-9, -10);
        ctx.closePath();
        ctx.fill();
        // Shield border
        ctx.strokeStyle = '#d4d4d8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Shield emblem
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(4, 0);
        ctx.lineTo(0, 6);
        ctx.lineTo(-4, 0);
        ctx.closePath();
        ctx.fill();
        // Shield cross
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(0, 4);
        ctx.moveTo(-3, 0);
        ctx.lineTo(3, 0);
        ctx.stroke();
        ctx.restore();

        // Sword
        ctx.save();
        let swordRotation = this.facing;
        if (this.isAttacking) swordRotation = this.facing + this.swingAngle;
        ctx.rotate(swordRotation);

        // Sword blade with gradient
        const bladeGrad = ctx.createLinearGradient(15, -3, 48, 3);
        bladeGrad.addColorStop(0, '#d4d4d8');
        bladeGrad.addColorStop(0.5, '#f5f5f5');
        bladeGrad.addColorStop(1, '#e5e7eb');
        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(15, -3);
        ctx.lineTo(45, -2);
        ctx.lineTo(50, 0);
        ctx.lineTo(45, 2);
        ctx.lineTo(15, 3);
        ctx.closePath();
        ctx.fill();
        // Blade edge highlight
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(16, -2);
        ctx.lineTo(48, -1);
        ctx.stroke();
        // Fuller (blade groove)
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(40, 0);
        ctx.stroke();
        // Guard (crossguard)
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.roundRect(12, -6, 5, 12, 1);
        ctx.fill();
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.roundRect(13, -5, 3, 10, 1);
        ctx.fill();
        // Handle (grip)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(5, -2.5, 9, 5);
        // Leather wrap
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = '#92400e';
            ctx.fillRect(6 + i * 3, -2.5, 1.5, 5);
        }
        // Pommel
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(4, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(4, 0, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Swing arc visual
        if (this.isAttacking) {
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.swordRange, this.facing - this.swordArc / 2, this.facing + this.swordArc / 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}
