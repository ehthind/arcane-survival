export class CombatSystem {
    constructor(game) {
        this.game = game;
    }

    update(dt) {
        this.checkProjectileCollisions();
        this.checkEnemyPlayerCollisions();
    }

    checkProjectileCollisions() {
        const { projectiles, enemies, player } = this.game;

        for (let i = projectiles.length - 1; i >= 0; i--) {
            const proj = projectiles[i];

            if (proj.isPlayerProjectile) {
                // Player projectiles hit enemies
                for (const enemy of enemies) {
                    if (enemy.dead) continue;
                    if (proj.hitEnemies && proj.hitEnemies.has(enemy)) continue;
                    const dx = proj.x - enemy.x;
                    const dy = proj.y - enemy.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < proj.radius + enemy.radius) {
                        enemy.takeDamage(proj.damage);

                        // Call onHitEnemy for pierce/chain logic
                        const consumed = proj.onHitEnemy(enemy);

                        // Impact particles
                        this.game.particles.emit(proj.x, proj.y, 6, {
                            colors: [proj.color, '#ffffff'],
                            speed: 100, lifetime: 0.3, size: 3, sizeEnd: 0,
                        });

                        if (consumed) {
                            proj.expired = true;
                            break;
                        }
                    }
                }
            } else {
                // Enemy projectiles hit player
                if (!player || player.dead || player.invincibleTimer > 0) continue;
                const dx = proj.x - player.x;
                const dy = proj.y - player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < proj.radius + player.radius) {
                    player.takeDamage(proj.damage);
                    proj.expired = true;
                    this.game.particles.emit(proj.x, proj.y, 8, {
                        colors: ['#ef4444', '#ff6666'],
                        speed: 80, lifetime: 0.3, size: 3,
                    });
                }
            }
        }
    }

    checkEnemyPlayerCollisions() {
        const { enemies, player } = this.game;
        if (!player || player.dead) return;

        for (const enemy of enemies) {
            if (enemy.dead) continue;
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < enemy.radius + player.radius) {
                player.takeDamage(enemy.damage);
                if (dist > 0) {
                    const angle = Math.atan2(dy, dx);
                    enemy.x += Math.cos(angle) * 25;
                    enemy.y += Math.sin(angle) * 25;
                }
            }
        }
    }
}
