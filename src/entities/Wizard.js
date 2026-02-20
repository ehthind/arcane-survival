import { Player } from './Player.js';
import { Projectile } from '../systems/Projectile.js';

export class Wizard extends Player {
    constructor(game) {
        super(game);
        this.className = 'wizard';
        this.health = 80;
        this.maxHealth = 80;
        this.baseMaxHealth = 80;
        this.speed = 240;
        this.attackRate = 0.25;
        this.baseAttackRate = 0.25;
        this.specialMaxCooldown = 6;
        this.mana = 100;
        this.maxMana = 100;
        this.manaRegen = 15;
        this.baseManaRegen = 15;

        // Visual
        this.bodyColor = '#6c3ebf';
        this.accentColor = '#a855f7';
        this.glowColor = '#c084fc';
        this.capeAngle = 0;
        this.orbAngle = 0;
    }

    update(dt, input) {
        super.update(dt, input);

        this.mana = Math.min(this.maxMana, this.mana + this.manaRegen * dt);
        this.capeAngle += dt * 2;
        this.orbAngle += dt * 3;

        // Primary attack — magic bolt
        if ((input.mouse.down || input.spaceAttack) && this.attackCooldown <= 0) {
            this.fireProjectile();
            this.attackCooldown = this.attackRate;
            this.isAttacking = true;
            this.attackAnimTimer = 0.15;
        }

        // Special — frost nova (right click)
        if (input.mouse.rightClicked && this.specialCooldown <= 0 && this.mana >= 40) {
            if (this.meteorCount > 0) {
                this.meteorStorm();
            } else {
                this.frostNova();
            }
            this.specialCooldown = this.specialMaxCooldown;
            this.mana -= 40;
        }

        // Ambient magic particles
        if (Math.random() < 0.3) {
            this.game.particles.emit(
                this.x + (Math.random() - 0.5) * 20,
                this.y + (Math.random() - 0.5) * 20,
                1,
                { colors: ['#c084fc', '#a855f7', '#7c3aed'], speed: 20, lifetime: 0.8, size: 2, sizeEnd: 0 }
            );
        }
    }

    fireProjectile() {
        const worldMouse = this.game.input.getWorldMouse(this.game.camera, this.game.width, this.game.height);
        const angle = Math.atan2(worldMouse.y - this.y, worldMouse.x - this.x);
        const damage = Math.round(18 * this.damageMultiplier);
        const proj = new Projectile({
            x: this.x + Math.cos(angle) * 20,
            y: this.y + Math.sin(angle) * 20,
            angle, speed: 500, damage, radius: 6, lifetime: 1.5,
            color: '#a855f7', trailColor: '#c084fc',
            isPlayerProjectile: true, game: this.game,
            pierceCount: this.pierceCount,
            chainCount: this.chainCount,
            owner: this,
        });
        this.game.projectiles.push(proj);
    }

    frostNova() {
        const radius = 150 * this.frostRadiusMult;
        const freezeDuration = 2 + this.frostDurationBonus;
        this.game.addScreenShake(6, 0.2);
        for (const enemy of this.game.enemies) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius && !enemy.dead) {
                enemy.takeDamage(25);
                enemy.freeze(freezeDuration);
                const angle = Math.atan2(dy, dx);
                enemy.x += Math.cos(angle) * 30;
                enemy.y += Math.sin(angle) * 30;
            }
        }
        this.game.particles.emit(this.x, this.y, 40, {
            colors: ['#93c5fd', '#60a5fa', '#3b82f6', '#dbeafe'],
            speed: 200, speedVariance: 100, lifetime: 0.6, size: 5, sizeEnd: 1,
        });
    }

    meteorStorm() {
        this.game.addScreenShake(8, 0.4);
        for (let i = 0; i < this.meteorCount; i++) {
            setTimeout(() => {
                const tx = this.x + (Math.random() - 0.5) * 250;
                const ty = this.y + (Math.random() - 0.5) * 250;
                // Damage enemies in area
                for (const enemy of this.game.enemies) {
                    const dx = enemy.x - tx;
                    const dy = enemy.y - ty;
                    if (Math.sqrt(dx * dx + dy * dy) < 60 && !enemy.dead) {
                        enemy.takeDamage(Math.round(35 * this.damageMultiplier));
                    }
                }
                this.game.particles.emit(tx, ty, 25, {
                    colors: ['#f97316', '#ef4444', '#fbbf24', '#ffffff'],
                    speed: 200, speedVariance: 100, lifetime: 0.5, size: 6, sizeEnd: 1,
                });
                this.game.addScreenShake(5, 0.15);
            }, i * 150);
        }
    }

    render(ctx) {
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 10) % 2 === 0) return;
        this.renderShadow(ctx);

        ctx.save();
        ctx.translate(this.x, this.y);

        // Slow aura visual
        if (this.slowAura > 0) {
            const auraAlpha = 0.05 + Math.sin(this.animTimer * 2) * 0.03;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 180);
            gradient.addColorStop(0, `rgba(139, 92, 246, ${auraAlpha})`);
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, 180, 0, Math.PI * 2);
            ctx.fill();
        }

        // Shield visual
        if (this.shield > 0) {
            ctx.strokeStyle = `rgba(192, 132, 252, ${0.3 + Math.sin(this.animTimer * 3) * 0.15})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Cape (flowing behind)
        const capeDir = this.facing + Math.PI;
        const capeWave1 = Math.sin(this.capeAngle) * 4;
        const capeWave2 = Math.sin(this.capeAngle + 1) * 3;
        ctx.fillStyle = '#4c1d95';
        ctx.beginPath();
        ctx.moveTo(Math.cos(capeDir - 0.5) * 8, Math.sin(capeDir - 0.5) * 8);
        ctx.quadraticCurveTo(
            Math.cos(capeDir) * 28 + capeWave1, Math.sin(capeDir) * 28 + capeWave2,
            Math.cos(capeDir + 0.5) * 8, Math.sin(capeDir + 0.5) * 8
        );
        ctx.fill();
        // Cape highlight
        ctx.fillStyle = '#5b21b6';
        ctx.beginPath();
        ctx.moveTo(Math.cos(capeDir - 0.3) * 6, Math.sin(capeDir - 0.3) * 6);
        ctx.quadraticCurveTo(
            Math.cos(capeDir) * 22 + capeWave1 * 0.7, Math.sin(capeDir) * 22 + capeWave2 * 0.7,
            Math.cos(capeDir + 0.3) * 6, Math.sin(capeDir + 0.3) * 6
        );
        ctx.fill();

        // Robe (body) — layered
        // Outer robe
        ctx.fillStyle = '#5b21b6';
        ctx.beginPath();
        ctx.arc(0, 2, this.radius + 2, 0, Math.PI * 2);
        ctx.fill();
        // Main robe
        const robeGrad = ctx.createRadialGradient(0, -5, 0, 0, 5, this.radius + 1);
        robeGrad.addColorStop(0, '#7c3aed');
        robeGrad.addColorStop(0.6, '#6d28d9');
        robeGrad.addColorStop(1, '#4c1d95');
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Robe trim (golden)
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, Math.PI * 0.3, Math.PI * 0.7);
        ctx.stroke();

        // Inner robe detail (darker center)
        ctx.fillStyle = '#4c1d95';
        ctx.beginPath();
        ctx.ellipse(0, 3, this.radius * 0.5, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Belt
        ctx.fillStyle = '#92400e';
        ctx.fillRect(-8, 2, 16, 3);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 3.5, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Hat — layered with stars
        ctx.fillStyle = '#4c1d95';
        ctx.beginPath();
        ctx.moveTo(-13, -6);
        ctx.lineTo(13, -6);
        ctx.lineTo(3, -32);
        ctx.quadraticCurveTo(1, -34, -1, -30);
        ctx.closePath();
        ctx.fill();
        // Hat front highlight
        ctx.fillStyle = '#6d28d9';
        ctx.beginPath();
        ctx.moveTo(-8, -6);
        ctx.lineTo(5, -6);
        ctx.lineTo(2, -28);
        ctx.closePath();
        ctx.fill();
        // Hat brim
        ctx.fillStyle = '#5b21b6';
        ctx.beginPath();
        ctx.ellipse(0, -6, 16, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Hat band
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, -7, 14, 3, 0, Math.PI, 0);
        ctx.stroke();
        // Stars on hat
        this.drawStar(ctx, -2, -20, 3, '#fbbf24');
        this.drawStar(ctx, 1, -26, 2, '#fde68a');

        // Orbiting sparkles
        for (let i = 0; i < 3; i++) {
            const oa = this.orbAngle + (i * Math.PI * 2 / 3);
            const ox = Math.cos(oa) * 24;
            const oy = Math.sin(oa) * 12 - 5;
            const sparkAlpha = 0.3 + Math.sin(this.animTimer * 4 + i) * 0.2;
            ctx.fillStyle = `rgba(192, 132, 252, ${sparkAlpha})`;
            ctx.beginPath();
            ctx.arc(ox, oy, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Staff
        const staffEndX = Math.cos(this.facing) * 32;
        const staffEndY = Math.sin(this.facing) * 32;
        // Staff shaft with gradient
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(staffEndX, staffEndY);
        ctx.stroke();
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(staffEndX, staffEndY);
        ctx.stroke();

        // Staff crystal
        const crystalX = staffEndX;
        const crystalY = staffEndY - 3;
        const crystalGlow = 8 + Math.sin(this.animTimer * 4) * 3;
        // Crystal glow
        const crystGrad = ctx.createRadialGradient(crystalX, crystalY, 0, crystalX, crystalY, crystalGlow * 2);
        crystGrad.addColorStop(0, this.isAttacking ? 'rgba(245, 158, 11, 0.5)' : 'rgba(168, 85, 247, 0.4)');
        crystGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = crystGrad;
        ctx.beginPath();
        ctx.arc(crystalX, crystalY, crystalGlow * 2, 0, Math.PI * 2);
        ctx.fill();
        // Crystal body — diamond shape
        ctx.fillStyle = this.isAttacking ? '#fbbf24' : '#c084fc';
        ctx.beginPath();
        ctx.moveTo(crystalX, crystalY - 7);
        ctx.lineTo(crystalX + 5, crystalY);
        ctx.lineTo(crystalX, crystalY + 5);
        ctx.lineTo(crystalX - 5, crystalY);
        ctx.closePath();
        ctx.fill();
        // Crystal highlight
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.moveTo(crystalX - 1, crystalY - 5);
        ctx.lineTo(crystalX + 2, crystalY - 1);
        ctx.lineTo(crystalX - 1, crystalY);
        ctx.closePath();
        ctx.fill();

        // Eyes — glowing
        const eyeOffX = Math.cos(this.facing) * 5;
        const eyeOffY = Math.sin(this.facing) * 5;
        // Eye glow
        ctx.fillStyle = 'rgba(192, 132, 252, 0.3)';
        ctx.beginPath();
        ctx.arc(eyeOffX - 4, eyeOffY - 5, 5, 0, Math.PI * 2);
        ctx.arc(eyeOffX + 4, eyeOffY - 5, 5, 0, Math.PI * 2);
        ctx.fill();
        // Eye whites
        ctx.fillStyle = '#e0e7ff';
        ctx.beginPath();
        ctx.arc(eyeOffX - 4, eyeOffY - 5, 2.5, 0, Math.PI * 2);
        ctx.arc(eyeOffX + 4, eyeOffY - 5, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Pupils
        ctx.fillStyle = '#4c1d95';
        ctx.beginPath();
        ctx.arc(eyeOffX - 3.5 + Math.cos(this.facing) * 1, eyeOffY - 5 + Math.sin(this.facing) * 1, 1.2, 0, Math.PI * 2);
        ctx.arc(eyeOffX + 4.5 + Math.cos(this.facing) * 1, eyeOffY - 5 + Math.sin(this.facing) * 1, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawStar(ctx, x, y, size, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const a = (i * Math.PI * 2 / 5) - Math.PI / 2;
            const r = i % 2 === 0 ? size : size * 0.4;
            if (i === 0) ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
            else ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
    }
}
