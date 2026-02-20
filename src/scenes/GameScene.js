import Phaser from 'phaser';
import { UpgradeManager } from '../systems/UpgradeManager.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.characterClass = data.characterClass || 'wizard';
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Arena dimensions
        this.arenaWidth = 1400;
        this.arenaHeight = 1000;
        this.arenaCenterX = this.arenaWidth / 2;
        this.arenaCenterY = this.arenaHeight / 2;

        // Set world bounds
        this.physics.world.setBounds(0, 0, this.arenaWidth, this.arenaHeight);

        // Draw arena
        this.createArena();

        // Game state
        this.score = 0;
        this.playerGold = 0;
        this.waveNumber = 0;
        this.waveActive = false;
        this.enemiesToSpawn = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 1.2;
        this.bannerTimer = 0;
        this.bannerText = '';
        this.started = false;
        this.intermissionTimer = 2;
        this.gameOver = false;

        // Upgrade manager (reused from Phase 2)
        this.upgradeManager = new UpgradeManager(this);
        // Patch upgradeManager to use our scene as 'game'
        this.upgradeManager.game = { player: null };

        // Groups
        this.enemies = this.physics.add.group();
        this.playerProjectiles = this.physics.add.group();
        this.enemyProjectiles = this.physics.add.group();
        this.goldDrops = this.physics.add.group();

        // Create player
        this.createPlayer();

        // Camera
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, this.arenaWidth, this.arenaHeight);

        // Input
        this.cursors = this.input.keyboard.addKeys({
            up: 'W', down: 'S', left: 'A', right: 'D',
            upArrow: 'UP', downArrow: 'DOWN', leftArrow: 'LEFT', rightArrow: 'RIGHT',
            space: 'SPACE',
        });
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                this.playerSpecial();
            } else {
                this.playerAttack();
            }
        });
        this.input.mouse.disableContextMenu();

        // Physics overlaps
        this.physics.add.overlap(this.playerProjectiles, this.enemies, this.onProjectileHitEnemy, null, this);
        this.physics.add.overlap(this.enemyProjectiles, this.player, this.onEnemyProjectileHitPlayer, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.onPlayerTouchEnemy, null, this);
        this.physics.add.overlap(this.player, this.goldDrops, this.onPickupGold, null, this);

        // HUD (fixed to camera)
        this.createHUD();

        // Particle emitters
        this.hitEmitter = this.add.particles(0, 0, 'particle', {
            speed: { min: 80, max: 150 },
            scale: { start: 0.6, end: 0 },
            lifespan: 400,
            tint: [0xff4444, 0xff6666],
            emitting: false,
        });
        this.goldEmitter = this.add.particles(0, 0, 'particle', {
            speed: { min: 50, max: 100 },
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            tint: [0xfbbf24, 0xfde68a],
            emitting: false,
        });

        // Track player stats for upgrades
        this.playerStats = {
            damageMultiplier: 1,
            attackRate: this.characterClass === 'wizard' ? 250 : 350,
            baseAttackRate: this.characterClass === 'wizard' ? 250 : 350,
            pierceCount: 0,
            chainCount: 0,
            lifesteal: 0,
            thornsReflect: 0,
            berserkerMult: 0,
            slowAura: 0,
            shield: 0,
            shieldMax: 0,
            shieldRechargeTimer: 0,
            warCryInterval: 0,
            warCryTimer: 0,
            frostRadiusMult: 1,
            frostDurationBonus: 0,
            meteorCount: 0,
            slamRadiusMult: 1,
            swordDamage: 28,
            swordRange: 55,
            swordArc: Math.PI * 0.8,
            mana: 100,
            maxMana: 100,
            manaRegen: this.characterClass === 'wizard' ? 15 : 12,
            baseManaRegen: this.characterClass === 'wizard' ? 15 : 12,
            specialCooldown: 0,
            specialMaxCooldown: this.characterClass === 'wizard' ? 6 : 5,
            gold: 0,
            className: this.characterClass,
        };

        // Patch upgrade manager to reference our stats
        this.upgradeManager.game.player = this.playerStats;

        // Attack cooldown timer
        this.attackCooldownTimer = 0;
        this.isAttacking = false;

        // Spacebar attack polling
        this.input.keyboard.on('keydown-SPACE', () => {
            this.playerAttack();
        });
    }

    createArena() {
        // Floor tiles
        for (let x = 0; x < this.arenaWidth; x += 64) {
            for (let y = 0; y < this.arenaHeight; y += 64) {
                this.add.image(x + 32, y + 32, 'floor_tile');
            }
        }

        // Magic circle at center
        this.add.image(this.arenaCenterX, this.arenaCenterY, 'magic_circle').setAlpha(0.3);

        // Arena border (walls)
        const wallThickness = 32;
        const wallColor = 0x2d2d4e;
        // Top
        this.add.rectangle(this.arenaWidth / 2, -wallThickness / 2, this.arenaWidth + wallThickness * 2, wallThickness, wallColor);
        // Bottom
        this.add.rectangle(this.arenaWidth / 2, this.arenaHeight + wallThickness / 2, this.arenaWidth + wallThickness * 2, wallThickness, wallColor);
        // Left
        this.add.rectangle(-wallThickness / 2, this.arenaHeight / 2, wallThickness, this.arenaHeight, wallColor);
        // Right
        this.add.rectangle(this.arenaWidth + wallThickness / 2, this.arenaHeight / 2, wallThickness, this.arenaHeight, wallColor);

        // Corner glow effects
        for (const [cx, cy] of [[0, 0], [this.arenaWidth, 0], [0, this.arenaHeight], [this.arenaWidth, this.arenaHeight]]) {
            const glow = this.add.circle(cx, cy, 80, 0x7c3aed, 0.06);
        }
    }

    createPlayer() {
        const tex = this.characterClass === 'wizard' ? 'wizard' : 'warrior';
        this.player = this.physics.add.sprite(this.arenaCenterX, this.arenaCenterY, tex);
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(10);
        this.player.setCircle(12, this.characterClass === 'wizard' ? 20 : 20, this.characterClass === 'wizard' ? 22 : 22);

        const maxHP = this.characterClass === 'wizard' ? 80 : 120;
        this.player.hp = maxHP;
        this.player.maxHP = maxHP;
        this.player.invincibleTimer = 0;
        this.player.speed = this.characterClass === 'wizard' ? 240 : 200;
    }

    createHUD() {
        this.hudElements = {};

        // HP bar background
        this.hudElements.hpBg = this.add.rectangle(120, 20, 220, 22, 0x7f1d1d).setScrollFactor(0).setDepth(100).setOrigin(0, 0);
        this.hudElements.hpBar = this.add.rectangle(121, 21, 218, 20, 0xef4444).setScrollFactor(0).setDepth(101).setOrigin(0, 0);
        this.hudElements.hpText = this.add.text(125, 22, '', {
            fontFamily: 'Inter, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#ffffff',
        }).setScrollFactor(0).setDepth(102);
        this.hudElements.hpLabel = this.add.text(20, 22, '❤ HP', {
            fontFamily: 'Inter, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#ef4444',
        }).setScrollFactor(0).setDepth(102);

        // Mana bar
        const manaColor = this.characterClass === 'wizard' ? 0x8b5cf6 : 0xf97316;
        this.hudElements.manaBg = this.add.rectangle(100, 48, 180, 16, 0x1e1b4b).setScrollFactor(0).setDepth(100).setOrigin(0, 0);
        this.hudElements.manaBar = this.add.rectangle(101, 49, 178, 14, manaColor).setScrollFactor(0).setDepth(101).setOrigin(0, 0);
        this.hudElements.manaText = this.add.text(105, 49, '', {
            fontFamily: 'Inter, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#ffffff',
        }).setScrollFactor(0).setDepth(102);
        this.hudElements.manaLabel = this.add.text(20, 49, '✦ MP', {
            fontFamily: 'Inter, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#a78bfa',
        }).setScrollFactor(0).setDepth(102);

        // Wave text (top center)
        this.hudElements.waveText = this.add.text(this.cameras.main.width / 2, 20, 'Wave 0', {
            fontFamily: 'MedievalSharp, serif', fontSize: '20px', fontStyle: 'bold', color: '#e2e8f0',
        }).setScrollFactor(0).setDepth(100).setOrigin(0.5, 0);

        this.hudElements.enemyCount = this.add.text(this.cameras.main.width / 2, 44, '', {
            fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#94a3b8',
        }).setScrollFactor(0).setDepth(100).setOrigin(0.5, 0);

        // Gold (top right)
        this.hudElements.goldText = this.add.text(this.cameras.main.width - 20, 20, '🪙 0', {
            fontFamily: 'MedievalSharp, serif', fontSize: '20px', fontStyle: 'bold', color: '#fbbf24',
        }).setScrollFactor(0).setDepth(100).setOrigin(1, 0);

        this.hudElements.scoreText = this.add.text(this.cameras.main.width - 20, 44, 'Score: 0', {
            fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#94a3b8',
        }).setScrollFactor(0).setDepth(100).setOrigin(1, 0);

        // Special cooldown
        this.hudElements.specialText = this.add.text(20, 72, '⚡ Special Ready! [Right Click]', {
            fontFamily: 'Inter, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#4ade80',
        }).setScrollFactor(0).setDepth(100);

        // Wave banner (center, hidden by default)
        this.hudElements.banner = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 60, '', {
            fontFamily: 'MedievalSharp, serif', fontSize: '48px', fontStyle: 'bold', color: '#fbbf24',
        }).setScrollFactor(0).setDepth(200).setOrigin(0.5).setAlpha(0);

        // Controls hint
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 15, 'WASD to move • Left Click / Space to attack • Right Click for special', {
            fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.3)',
        }).setScrollFactor(0).setDepth(100).setOrigin(0.5);
    }

    update(time, delta) {
        if (this.gameOver) return;

        const dt = delta / 1000;

        // Player movement
        this.updatePlayerMovement(dt);

        // Player timers
        if (this.player.invincibleTimer > 0) {
            this.player.invincibleTimer -= dt;
            this.player.setAlpha(Math.floor(this.player.invincibleTimer * 10) % 2 === 0 ? 0.3 : 1);
        } else {
            this.player.setAlpha(1);
        }
        if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= delta;
        if (this.playerStats.specialCooldown > 0) this.playerStats.specialCooldown -= dt;
        this.playerStats.mana = Math.min(this.playerStats.maxMana, this.playerStats.mana + this.playerStats.manaRegen * dt);

        // Flip player based on pointer
        const pointer = this.input.activePointer;
        const worldPointer = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const facingRight = worldPointer.x > this.player.x;
        this.player.setFlipX(!facingRight);

        // Wave management
        this.updateWaves(dt);

        // Enemy AI
        this.updateEnemies(dt);

        // Gold drop magnetic pickup
        this.updateGoldDrops(dt);

        // War cry
        if (this.playerStats.warCryInterval > 0) {
            this.playerStats.warCryTimer -= dt;
            if (this.playerStats.warCryTimer <= 0) {
                this.playerStats.warCryTimer = this.playerStats.warCryInterval;
                this.doWarCry();
            }
        }

        // Shield recharge
        if (this.playerStats.shieldMax > 0 && this.playerStats.shield < this.playerStats.shieldMax) {
            this.playerStats.shieldRechargeTimer -= dt;
            if (this.playerStats.shieldRechargeTimer <= 0) {
                this.playerStats.shield = Math.min(this.playerStats.shieldMax, this.playerStats.shield + this.playerStats.shieldMax * 0.1 * dt * 60);
            }
        }

        // Update HUD
        this.updateHUD(dt);

        // Check death
        if (this.player.hp <= 0 && !this.gameOver) {
            this.doGameOver();
        }
    }

    updatePlayerMovement(dt) {
        let mx = 0, my = 0;
        if (this.cursors.up.isDown || this.cursors.upArrow.isDown) my = -1;
        if (this.cursors.down.isDown || this.cursors.downArrow.isDown) my = 1;
        if (this.cursors.left.isDown || this.cursors.leftArrow.isDown) mx = -1;
        if (this.cursors.right.isDown || this.cursors.rightArrow.isDown) mx = 1;

        const mag = Math.sqrt(mx * mx + my * my);
        if (mag > 0) { mx /= mag; my /= mag; }

        this.player.setVelocity(mx * this.player.speed, my * this.player.speed);
    }

    updateWaves(dt) {
        if (this.bannerTimer > 0) {
            this.bannerTimer -= dt;
            this.hudElements.banner.setAlpha(Math.min(1, this.bannerTimer));
            if (this.bannerTimer <= 0) this.hudElements.banner.setAlpha(0);
        }

        if (!this.started) {
            this.intermissionTimer -= dt;
            if (this.intermissionTimer <= 0) {
                this.started = true;
                this.startNextWave();
            }
            return;
        }

        if (this.waveActive) {
            if (this.enemiesToSpawn > 0) {
                this.spawnTimer -= dt;
                if (this.spawnTimer <= 0) {
                    this.spawnEnemy();
                    this.enemiesToSpawn--;
                    this.spawnTimer = this.spawnInterval;
                }
            }

            // Check wave clear
            const aliveCount = this.enemies.getChildren().filter(e => e.active).length;
            if (aliveCount === 0 && this.enemiesToSpawn === 0) {
                this.waveActive = false;
                this.openShop();
            }
        }
    }

    startNextWave() {
        this.waveNumber++;
        this.waveActive = true;
        const total = 3 + Math.floor(this.waveNumber * 1.8);
        this.enemiesToSpawn = total;
        this.spawnTimer = 0.5;
        this.spawnInterval = Math.max(0.3, 1.2 - this.waveNumber * 0.05);
        this.bannerText = this.waveNumber % 5 === 0 ? `⚔ BOSS WAVE ${this.waveNumber} ⚔` : `Wave ${this.waveNumber}`;
        this.bannerTimer = 2;
        this.hudElements.banner.setText(this.bannerText).setAlpha(1);
    }

    spawnEnemy() {
        const side = Phaser.Math.Between(0, 3);
        const margin = 60;
        let x, y;
        switch (side) {
            case 0: x = Phaser.Math.Between(0, this.arenaWidth); y = -margin; break;
            case 1: x = this.arenaWidth + margin; y = Phaser.Math.Between(0, this.arenaHeight); break;
            case 2: x = Phaser.Math.Between(0, this.arenaWidth); y = this.arenaHeight + margin; break;
            case 3: x = -margin; y = Phaser.Math.Between(0, this.arenaHeight); break;
        }

        const wave = this.waveNumber;
        const rand = Math.random();
        let texture, hp, speed, damage, scoreVal, goldVal, type;

        // Boss wave — big dark mage
        if (wave % 5 === 0 && this.enemiesToSpawn === 1) {
            texture = 'darkmage'; hp = 200 + wave * 10; speed = 60; damage = 25; scoreVal = 200; goldVal = 80; type = 'boss';
        } else if (wave >= 5 && rand < 0.2) {
            texture = 'darkmage'; hp = 80; speed = 45; damage = 15; scoreVal = 50; goldVal = 25; type = 'darkmage';
        } else if (wave >= 2 && rand < 0.45) {
            texture = 'skeleton'; hp = 40; speed = 70; damage = 12; scoreVal = 20; goldVal = 12; type = 'skeleton';
        } else {
            texture = 'goblin'; hp = 20; speed = 130; damage = 8; scoreVal = 10; goldVal = 5; type = 'goblin';
        }

        // Scale
        const scaleFactor = 1 + (wave - 1) * 0.08;
        hp = Math.round(hp * scaleFactor);
        speed *= (1 + (wave - 1) * 0.02);

        const enemy = this.enemies.create(x, y, texture);
        enemy.setCircle(texture === 'goblin' ? 8 : texture === 'darkmage' ? 12 : 10,
            texture === 'goblin' ? 16 : texture === 'darkmage' ? 16 : 14,
            texture === 'goblin' ? 18 : texture === 'darkmage' ? 16 : 14);
        enemy.hp = hp;
        enemy.maxHP = hp;
        enemy.speed = speed;
        enemy.baseSpeed = speed;
        enemy.damage = damage;
        enemy.scoreVal = scoreVal;
        enemy.goldVal = goldVal;
        enemy.type = type;
        enemy.frozen = false;
        enemy.frozenTimer = 0;
        enemy.shootCooldown = type === 'skeleton' ? 2.5 : type === 'darkmage' || type === 'boss' ? 3 : 999;
        enemy.setDepth(5);

        if (type === 'boss') {
            enemy.setScale(1.8);
        }

        // Health bar
        enemy.hpBarBg = this.add.rectangle(x, y - 20, 30, 4, 0x1f2937).setDepth(6);
        enemy.hpBar = this.add.rectangle(x, y - 20, 30, 4, 0xef4444).setDepth(7).setOrigin(0, 0.5);
    }

    updateEnemies(dt) {
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;

            // Frozen
            if (enemy.frozen) {
                enemy.frozenTimer -= dt;
                if (enemy.frozenTimer <= 0) enemy.frozen = false;
                enemy.setVelocity(0, 0);
                enemy.setTint(0x93c5fd);

                // Update HP bar position
                enemy.hpBarBg.setPosition(enemy.x, enemy.y - 24);
                enemy.hpBar.setPosition(enemy.x - 15, enemy.y - 24);
                return;
            }
            enemy.clearTint();

            // Slow aura
            if (this.playerStats.slowAura > 0) {
                const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
                if (d < 180) {
                    enemy.speed = enemy.baseSpeed * (1 - this.playerStats.slowAura);
                } else {
                    enemy.speed = enemy.baseSpeed;
                }
            }

            // AI: move toward player
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Ranged enemies keep distance
            if ((enemy.type === 'skeleton' || enemy.type === 'darkmage' || enemy.type === 'boss') && dist < 180) {
                enemy.setVelocity(-dx / dist * enemy.speed * 0.5, -dy / dist * enemy.speed * 0.5);
            } else if (dist > 0) {
                enemy.setVelocity(dx / dist * enemy.speed, dy / dist * enemy.speed);
            }

            // Flip based on direction
            enemy.setFlipX(dx < 0);

            // Ranged attack
            if (enemy.type === 'skeleton' || enemy.type === 'darkmage' || enemy.type === 'boss') {
                enemy.shootCooldown -= dt;
                if (enemy.shootCooldown <= 0 && dist < 400) {
                    this.enemyShoot(enemy);
                    enemy.shootCooldown = enemy.type === 'skeleton' ? 2.5 : 3;
                }
            }

            // Update HP bar
            enemy.hpBarBg.setPosition(enemy.x, enemy.y - (enemy.type === 'boss' ? 36 : 20));
            const barWidth = 30 * (enemy.hp / enemy.maxHP);
            enemy.hpBar.setPosition(enemy.x - 15, enemy.y - (enemy.type === 'boss' ? 36 : 20));
            enemy.hpBar.width = barWidth;
            enemy.hpBarBg.setVisible(enemy.hp < enemy.maxHP);
            enemy.hpBar.setVisible(enemy.hp < enemy.maxHP);
        });
    }

    enemyShoot(enemy) {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        const tex = enemy.type === 'skeleton' ? 'bone_bolt' : 'dark_orb';
        const speed = enemy.type === 'skeleton' ? 220 : 150;
        const proj = this.enemyProjectiles.create(enemy.x, enemy.y, tex);
        proj.setCircle(tex === 'dark_orb' ? 6 : 4, tex === 'dark_orb' ? 4 : 4, tex === 'dark_orb' ? 4 : 4);
        proj.damage = enemy.type === 'skeleton' ? 10 : 15;
        proj.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        proj.setDepth(8);

        // Auto-destroy after time
        this.time.delayedCall(3000, () => { if (proj.active) proj.destroy(); });
    }

    updateGoldDrops(dt) {
        this.goldDrops.getChildren().forEach(gold => {
            if (!gold.active) return;
            const dx = this.player.x - gold.x;
            const dy = this.player.y - gold.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) {
                // Magnetic attraction
                const strength = 1 - (dist / 120);
                const speed = strength * 400;
                gold.setVelocity(dx / dist * speed, dy / dist * speed);
            }
        });
    }

    playerAttack() {
        if (this.attackCooldownTimer > 0 || this.gameOver) return;

        if (this.characterClass === 'wizard') {
            this.wizardAttack();
        } else {
            this.warriorAttack();
        }
        this.attackCooldownTimer = this.playerStats.attackRate;
    }

    wizardAttack() {
        const pointer = this.input.activePointer;
        const worldPointer = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, worldPointer.x, worldPointer.y);
        const damage = Math.round(18 * this.playerStats.damageMultiplier);

        const bolt = this.playerProjectiles.create(
            this.player.x + Math.cos(angle) * 20,
            this.player.y + Math.sin(angle) * 20,
            'bolt'
        );
        bolt.setVelocity(Math.cos(angle) * 500, Math.sin(angle) * 500);
        bolt.setCircle(4, 4, 4);
        bolt.damage = damage;
        bolt.pierceCount = this.playerStats.pierceCount;
        bolt.pierced = 0;
        bolt.chainCount = this.playerStats.chainCount;
        bolt.hitEnemies = new Set();
        bolt.setDepth(8);

        this.time.delayedCall(2000, () => { if (bolt.active) bolt.destroy(); });
    }

    warriorAttack() {
        const pointer = this.input.activePointer;
        const worldPointer = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, worldPointer.x, worldPointer.y);

        // Berserker rage
        let berserkMult = 1;
        if (this.playerStats.berserkerMult > 0) {
            const missingPct = 1 - (this.player.hp / this.player.maxHP);
            berserkMult = 1 + (missingPct * 100 * this.playerStats.berserkerMult / 100);
        }

        const damage = Math.round(this.playerStats.swordDamage * this.playerStats.damageMultiplier * berserkMult);
        let totalDmg = 0;

        // Sword swing — check enemies in arc
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (d > this.playerStats.swordRange + 16) return;

            const eAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            let diff = eAngle - angle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;

            if (Math.abs(diff) < this.playerStats.swordArc / 2) {
                this.damageEnemy(enemy, damage);
                totalDmg += damage;
                // Knockback
                const kb = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                enemy.x += Math.cos(kb) * 20;
                enemy.y += Math.sin(kb) * 20;
            }
        });

        // Lifesteal
        if (this.playerStats.lifesteal > 0 && totalDmg > 0) {
            this.player.hp = Math.min(this.player.maxHP, this.player.hp + Math.round(totalDmg * this.playerStats.lifesteal));
        }

        // Slash visual
        const slash = this.add.sprite(
            this.player.x + Math.cos(angle) * 30,
            this.player.y + Math.sin(angle) * 30,
            'slash_arc'
        ).setRotation(angle).setAlpha(0.7).setDepth(9);

        this.tweens.add({
            targets: slash,
            alpha: 0,
            scale: 1.3,
            duration: 200,
            onComplete: () => slash.destroy(),
        });

        this.cameras.main.shake(80, 0.003);
    }

    playerSpecial() {
        if (this.playerStats.specialCooldown > 0 || this.gameOver) return;
        if (this.playerStats.mana < (this.characterClass === 'wizard' ? 40 : 35)) return;

        if (this.characterClass === 'wizard') {
            if (this.playerStats.meteorCount > 0) {
                this.meteorStorm();
            } else {
                this.frostNova();
            }
            this.playerStats.mana -= 40;
        } else {
            this.groundSlam();
            this.playerStats.mana -= 35;
        }
        this.playerStats.specialCooldown = this.playerStats.specialMaxCooldown;
    }

    frostNova() {
        const radius = 150 * this.playerStats.frostRadiusMult;
        const freezeDur = 2 + this.playerStats.frostDurationBonus;
        this.cameras.main.shake(150, 0.006);

        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (d < radius) {
                this.damageEnemy(enemy, 25);
                enemy.frozen = true;
                enemy.frozenTimer = freezeDur;
            }
        });

        // Frost nova visual
        const circle = this.add.circle(this.player.x, this.player.y, 10, 0x93c5fd, 0.5).setDepth(15);
        this.tweens.add({
            targets: circle, radius: radius, alpha: 0, duration: 400,
            onComplete: () => circle.destroy(),
        });
    }

    meteorStorm() {
        this.cameras.main.shake(400, 0.008);
        for (let i = 0; i < this.playerStats.meteorCount; i++) {
            this.time.delayedCall(i * 150, () => {
                const tx = this.player.x + Phaser.Math.Between(-125, 125);
                const ty = this.player.y + Phaser.Math.Between(-125, 125);
                this.enemies.getChildren().forEach(enemy => {
                    if (!enemy.active) return;
                    if (Phaser.Math.Distance.Between(tx, ty, enemy.x, enemy.y) < 60) {
                        this.damageEnemy(enemy, Math.round(35 * this.playerStats.damageMultiplier));
                    }
                });
                const impact = this.add.circle(tx, ty, 10, 0xf97316, 0.8).setDepth(15);
                this.tweens.add({
                    targets: impact, radius: 50, alpha: 0, duration: 300,
                    onComplete: () => impact.destroy(),
                });
                this.cameras.main.shake(100, 0.005);
            });
        }
    }

    groundSlam() {
        const radius = 130 * this.playerStats.slamRadiusMult;
        let berserkMult = 1;
        if (this.playerStats.berserkerMult > 0) {
            berserkMult = 1 + ((1 - this.player.hp / this.player.maxHP) * 100 * this.playerStats.berserkerMult / 100);
        }
        const dmg = Math.round(35 * this.playerStats.damageMultiplier * berserkMult);
        let totalDmg = 0;
        this.cameras.main.shake(200, 0.008);

        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (d < radius) {
                this.damageEnemy(enemy, dmg);
                totalDmg += dmg;
                const a = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                enemy.x += Math.cos(a) * 60;
                enemy.y += Math.sin(a) * 60;
            }
        });

        if (this.playerStats.lifesteal > 0 && totalDmg > 0) {
            this.player.hp = Math.min(this.player.maxHP, this.player.hp + Math.round(totalDmg * this.playerStats.lifesteal));
        }

        const slamCircle = this.add.circle(this.player.x, this.player.y, 10, 0xf97316, 0.6).setDepth(15);
        this.tweens.add({
            targets: slamCircle, radius: radius, alpha: 0, duration: 400,
            onComplete: () => slamCircle.destroy(),
        });
    }

    doWarCry() {
        this.cameras.main.shake(80, 0.003);
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y) < 200) {
                enemy.frozen = true;
                enemy.frozenTimer = 1.5;
            }
        });
        const cry = this.add.circle(this.player.x, this.player.y, 10, 0xeab308, 0.4).setDepth(15);
        this.tweens.add({
            targets: cry, radius: 200, alpha: 0, duration: 300,
            onComplete: () => cry.destroy(),
        });
    }

    damageEnemy(enemy, damage) {
        enemy.hp -= damage;
        enemy.setTint(0xffffff);
        this.time.delayedCall(100, () => { if (enemy.active) enemy.clearTint(); });

        if (enemy.hp <= 0) {
            this.killEnemy(enemy);
        }
    }

    killEnemy(enemy) {
        this.score += enemy.scoreVal;

        // Spawn gold
        const goldCount = Phaser.Math.Between(1, 2);
        const perCoin = Math.ceil(enemy.goldVal / goldCount);
        for (let i = 0; i < goldCount; i++) {
            const g = this.goldDrops.create(enemy.x + Phaser.Math.Between(-10, 10), enemy.y + Phaser.Math.Between(-10, 10), 'gold');
            g.amount = perCoin;
            g.setCircle(4, 4, 4);
            g.setDepth(3);
            g.setBounce(0.5);
            g.setVelocity(Phaser.Math.Between(-80, 80), Phaser.Math.Between(-100, -30));
            g.setDrag(120);
            this.time.delayedCall(25000, () => { if (g.active) g.destroy(); });
        }

        // Death particles
        this.hitEmitter.setPosition(enemy.x, enemy.y);
        this.hitEmitter.explode(10);

        // Death tween
        this.tweens.add({
            targets: enemy,
            scaleX: 0, scaleY: 0, alpha: 0, duration: 200,
            onComplete: () => {
                enemy.hpBarBg.destroy();
                enemy.hpBar.destroy();
                enemy.destroy();
            },
        });
    }

    onProjectileHitEnemy(projectile, enemy) {
        if (!enemy.active || !projectile.active) return;
        if (projectile.hitEnemies && projectile.hitEnemies.has(enemy)) return;

        this.damageEnemy(enemy, projectile.damage);
        if (projectile.hitEnemies) projectile.hitEnemies.add(enemy);

        // Chain lightning
        if (projectile.chainCount > 0) {
            let nearest = null;
            let nearestDist = 200;
            this.enemies.getChildren().forEach(e => {
                if (!e.active || (projectile.hitEnemies && projectile.hitEnemies.has(e))) return;
                const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, e.x, e.y);
                if (d < nearestDist) { nearestDist = d; nearest = e; }
            });
            if (nearest) {
                const a = Phaser.Math.Angle.Between(enemy.x, enemy.y, nearest.x, nearest.y);
                const chain = this.playerProjectiles.create(enemy.x, enemy.y, 'bolt');
                chain.setTint(0xfacc15);
                chain.setCircle(4, 4, 4);
                chain.setVelocity(Math.cos(a) * 600, Math.sin(a) * 600);
                chain.damage = Math.round(projectile.damage * 0.7);
                chain.pierceCount = 0;
                chain.chainCount = projectile.chainCount - 1;
                chain.hitEnemies = new Set(projectile.hitEnemies);
                chain.setDepth(8);
                this.time.delayedCall(1000, () => { if (chain.active) chain.destroy(); });
            }
        }

        // Lifesteal for projectiles
        if (this.playerStats.lifesteal > 0) {
            this.player.hp = Math.min(this.player.maxHP, this.player.hp + Math.round(projectile.damage * this.playerStats.lifesteal));
        }

        // Piercing
        if (projectile.pierceCount > 0 && projectile.pierced < projectile.pierceCount) {
            projectile.pierced++;
        } else {
            projectile.destroy();
        }
    }

    onEnemyProjectileHitPlayer(player, projectile) {
        if (player.invincibleTimer > 0) return;
        this.damagePlayer(projectile.damage || 10);
        projectile.destroy();
    }

    onPlayerTouchEnemy(player, enemy) {
        if (!enemy.active || player.invincibleTimer > 0) return;
        this.damagePlayer(enemy.damage);
        // Push enemy away
        const a = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
        enemy.x += Math.cos(a) * 25;
        enemy.y += Math.sin(a) * 25;
    }

    damagePlayer(amount) {
        if (this.player.invincibleTimer > 0) return;

        // Shield absorb
        if (this.playerStats.shield > 0) {
            const absorbed = Math.min(this.playerStats.shield, amount);
            this.playerStats.shield -= absorbed;
            amount -= absorbed;
            this.playerStats.shieldRechargeTimer = 5;
            if (amount <= 0) return;
        }

        // Thorns
        if (this.playerStats.thornsReflect > 0) {
            this.enemies.getChildren().forEach(enemy => {
                if (!enemy.active) return;
                if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y) < 40) {
                    this.damageEnemy(enemy, Math.round(amount * this.playerStats.thornsReflect));
                }
            });
        }

        this.player.hp -= amount;
        this.player.invincibleTimer = 0.5;
        this.cameras.main.shake(120, 0.004);
        this.hitEmitter.setPosition(this.player.x, this.player.y);
        this.hitEmitter.explode(8);
    }

    onPickupGold(player, gold) {
        if (!gold.active) return;
        this.playerStats.gold += gold.amount;
        this.goldEmitter.setPosition(gold.x, gold.y);
        this.goldEmitter.explode(6);
        gold.destroy();
    }

    openShop() {
        // Pause game and launch shop
        this.scene.pause();

        let overlay = document.getElementById('shop-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'shop-overlay';
            document.body.appendChild(overlay);
        }

        const offers = this.upgradeManager.getRandomUpgrades(this.characterClass, 3);
        this.renderShop(overlay, offers);
        overlay.style.display = 'flex';
    }

    renderShop(overlay, offers) {
        const um = this.upgradeManager;
        const gold = this.playerStats.gold;

        const cardsHTML = offers.map((upgrade, i) => {
            const tier = um.getTier(upgrade.id);
            const cost = um.getCost(upgrade);
            const canAfford = gold >= cost;
            const desc = upgrade.desc[tier] || 'MAX';
            const tierDots = Array.from({ length: 3 }, (_, j) =>
                `<span class="tier-dot ${j < tier ? 'filled' : ''} ${j === tier ? 'next' : ''}"></span>`
            ).join('');
            return `
        <div class="shop-card ${canAfford ? '' : 'cant-afford'}" data-index="${i}" id="shop-card-${i}">
          <div class="shop-card-glow" style="--card-color: ${upgrade.color}"></div>
          <div class="shop-card-icon">${upgrade.icon}</div>
          <h3 class="shop-card-name">${upgrade.name}</h3>
          <div class="shop-card-tier">${tierDots}</div>
          <p class="shop-card-desc">${desc}</p>
          <div class="shop-card-cost ${canAfford ? '' : 'too-expensive'}"><span class="gold-icon">🪙</span> ${cost}</div>
          <button class="shop-buy-btn" data-index="${i}" ${canAfford ? '' : 'disabled'}>${canAfford ? 'Purchase' : 'Not enough gold'}</button>
        </div>`;
        }).join('');

        const noUpgrades = offers.length === 0;

        overlay.innerHTML = `
      <div class="shop-container">
        <div class="shop-header">
          <h1 class="shop-title">⚒️ Armory</h1>
          <div class="shop-wave">Wave ${this.waveNumber} Complete!</div>
          <div class="shop-gold"><span class="gold-icon">🪙</span><span class="shop-gold-amount">${this.playerStats.gold}</span></div>
        </div>
        ${noUpgrades ? '<p class="shop-maxed">All upgrades maxed! You are unstoppable!</p>' : `
          <div class="shop-cards">${cardsHTML}</div>
          <button class="shop-reroll-btn" id="shop-reroll">🎲 Reroll (10 🪙)</button>`}
        <button class="shop-continue-btn" id="shop-continue">Continue to Wave ${this.waveNumber + 1} ➜</button>
      </div>`;

        // Bind
        overlay.querySelectorAll('.shop-buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const upgrade = offers[idx];
                if (um.purchase(upgrade)) {
                    this.applyUpgradeSideEffects(upgrade.id);
                    this.renderShop(overlay, offers);
                }
            });
        });

        const reroll = overlay.querySelector('#shop-reroll');
        if (reroll) {
            reroll.addEventListener('click', () => {
                if (this.playerStats.gold >= 10) {
                    this.playerStats.gold -= 10;
                    const newOffers = um.getRandomUpgrades(this.characterClass, 3);
                    this.renderShop(overlay, newOffers);
                }
            });
        }

        overlay.querySelector('#shop-continue').addEventListener('click', () => {
            overlay.style.display = 'none';
            this.scene.resume();
            this.startNextWave();
        });
    }

    applyUpgradeSideEffects(upgradeId) {
        // Some upgrades need to reflect on the Phaser player sprite
        if (upgradeId === 'iron_fortress') {
            this.player.maxHP = this.playerStats.maxHealth || this.player.maxHP;
            this.player.hp = Math.min(this.player.hp + 20, this.player.maxHP);
        }
    }

    updateHUD(dt) {
        const p = this.player;
        const ps = this.playerStats;

        // HP
        const hpPct = Math.max(0, p.hp / p.maxHP);
        this.hudElements.hpBar.width = 218 * hpPct;
        this.hudElements.hpText.setText(`${Math.ceil(p.hp)}/${p.maxHP}`);

        // Mana
        const manaPct = Math.max(0, ps.mana / ps.maxMana);
        this.hudElements.manaBar.width = 178 * manaPct;
        this.hudElements.manaText.setText(`${Math.ceil(ps.mana)}/${ps.maxMana}`);

        // Wave
        this.hudElements.waveText.setText(`Wave ${this.waveNumber}`);
        const alive = this.enemies.getChildren().filter(e => e.active).length + this.enemiesToSpawn;
        this.hudElements.enemyCount.setText(`Enemies: ${alive}`);

        // Gold & score
        this.hudElements.goldText.setText(`🪙 ${ps.gold}`);
        this.hudElements.scoreText.setText(`Score: ${this.score}`);

        // Special cooldown
        if (ps.specialCooldown > 0) {
            this.hudElements.specialText.setText(`Special: ${ps.specialCooldown.toFixed(1)}s`).setColor('#60a5fa');
        } else {
            this.hudElements.specialText.setText('⚡ Special Ready! [Right Click]').setColor('#4ade80');
        }
    }

    doGameOver() {
        this.gameOver = true;
        this.player.setVelocity(0, 0);
        this.cameras.main.shake(300, 0.01);
        this.cameras.main.fade(800, 0, 0, 0);

        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', {
                score: this.score,
                wave: this.waveNumber,
                characterClass: this.characterClass,
            });
        });
    }
}
