export class Player {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.speed = 220;
        this.radius = 18;
        this.health = 100;
        this.maxHealth = 100;
        this.baseMaxHealth = 100;
        this.invincibleTimer = 0;
        this.invincibleDuration = 0.5;
        this.attackCooldown = 0;
        this.attackRate = 0.3;
        this.baseAttackRate = 0.3;
        this.specialCooldown = 0;
        this.specialMaxCooldown = 5;
        this.facing = 0;
        this.animTimer = 0;
        this.isAttacking = false;
        this.attackAnimTimer = 0;
        this.className = 'player';
        this.dead = false;
        this.gold = 0;

        // Upgrade stats
        this.damageMultiplier = 1;
        this.pierceCount = 0;
        this.chainCount = 0;
        this.lifesteal = 0;
        this.thornsReflect = 0;
        this.berserkerMult = 0;
        this.slowAura = 0;
        this.shield = 0;
        this.shieldMax = 0;
        this.shieldRechargeTimer = 0;
        this.warCryInterval = 0;
        this.warCryTimer = 0;
        this.frostRadiusMult = 1;
        this.frostDurationBonus = 0;
        this.meteorCount = 0;
        this.slamRadiusMult = 1;
    }

    takeDamage(amount) {
        if (this.invincibleTimer > 0) return;

        // Shield absorb
        if (this.shield > 0) {
            const absorbed = Math.min(this.shield, amount);
            this.shield -= absorbed;
            amount -= absorbed;
            this.shieldRechargeTimer = 5;
            this.game.particles.emit(this.x, this.y, 6, {
                colors: ['#c084fc', '#a855f7', '#ffffff'],
                speed: 100, lifetime: 0.3, size: 3,
            });
            if (amount <= 0) return;
        }

        // Thorns reflect
        if (this.thornsReflect > 0) {
            // Apply to nearby enemies
            for (const enemy of this.game.enemies) {
                if (enemy.dead) continue;
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.radius + enemy.radius + 10) {
                    enemy.takeDamage(Math.round(amount * this.thornsReflect));
                }
            }
        }

        this.health -= amount;
        this.invincibleTimer = this.invincibleDuration;
        this.game.addScreenShake(4, 0.15);
        this.game.particles.emit(this.x, this.y, 8, {
            colors: ['#ff4444', '#ff6666', '#ff2222'],
            speed: 120,
            lifetime: 0.4,
            size: 3,
        });
        if (this.health <= 0) {
            this.health = 0;
            this.dead = true;
        }
    }


    update(dt, input) {
        // Movement
        let mx = 0, my = 0;
        if (input.isDown('KeyW') || input.isDown('ArrowUp')) my -= 1;
        if (input.isDown('KeyS') || input.isDown('ArrowDown')) my += 1;
        if (input.isDown('KeyA') || input.isDown('ArrowLeft')) mx -= 1;
        if (input.isDown('KeyD') || input.isDown('ArrowRight')) mx += 1;

        // Normalize diagonal
        const mag = Math.sqrt(mx * mx + my * my);
        if (mag > 0) {
            mx /= mag;
            my /= mag;
        }

        this.vx = mx * this.speed;
        this.vy = my * this.speed;
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Arena bounds
        const arena = this.game.arena;
        const pad = this.radius;
        this.x = Math.max(arena.left + pad, Math.min(arena.right - pad, this.x));
        this.y = Math.max(arena.top + pad, Math.min(arena.bottom - pad, this.y));

        // Face mouse
        const worldMouse = input.getWorldMouse(this.game.camera, this.game.width, this.game.height);
        this.facing = Math.atan2(worldMouse.y - this.y, worldMouse.x - this.x);

        // Timers
        if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.specialCooldown > 0) this.specialCooldown -= dt;

        this.animTimer += dt;
        if (this.attackAnimTimer > 0) this.attackAnimTimer -= dt;
        else this.isAttacking = false;

        // Shield recharge
        if (this.shieldMax > 0 && this.shield < this.shieldMax) {
            this.shieldRechargeTimer -= dt;
            if (this.shieldRechargeTimer <= 0) {
                this.shield = Math.min(this.shieldMax, this.shield + this.shieldMax * 0.1 * dt * 60);
            }
        }

        // War Cry - periodic stun
        if (this.warCryInterval > 0) {
            this.warCryTimer -= dt;
            if (this.warCryTimer <= 0) {
                this.warCryTimer = this.warCryInterval;
                for (const enemy of this.game.enemies) {
                    if (enemy.dead) continue;
                    const dx = enemy.x - this.x;
                    const dy = enemy.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 200) {
                        enemy.freeze(1.5);
                    }
                }
                this.game.particles.emit(this.x, this.y, 25, {
                    colors: ['#eab308', '#fbbf24', '#ffffff'],
                    speed: 200, lifetime: 0.4, size: 4, sizeEnd: 1,
                });
                this.game.addScreenShake(3, 0.1);
            }
        }

        // Slow aura
        if (this.slowAura > 0) {
            for (const enemy of this.game.enemies) {
                if (enemy.dead || enemy.frozen) continue;
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 180) {
                    enemy.speed = enemy.baseSpeed ? enemy.baseSpeed * (1 - this.slowAura) : enemy.speed;
                }
            }
        }
    }

    render(ctx) {
        // Blink when invincible
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 10) % 2 === 0) return;
        // Subclasses override this
    }

    renderShadow(ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.radius + 2, this.radius * 0.9, this.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
