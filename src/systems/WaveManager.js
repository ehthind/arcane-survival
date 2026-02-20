import { Goblin } from '../entities/enemies/Goblin.js';
import { Skeleton } from '../entities/enemies/Skeleton.js';
import { DarkMage } from '../entities/enemies/DarkMage.js';

export class WaveManager {
    constructor(game) {
        this.game = game;
        this.currentWave = 0;
        this.enemiesRemaining = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 1.2;
        this.enemiesToSpawn = 0;
        this.waveActive = false;
        this.intermissionTimer = 0;
        this.intermissionDuration = 3;
        this.bannerTimer = 0;
        this.bannerText = '';
        this.started = false;
    }

    reset() {
        this.currentWave = 0;
        this.enemiesRemaining = 0;
        this.spawnTimer = 0;
        this.enemiesToSpawn = 0;
        this.waveActive = false;
        this.intermissionTimer = 2;
        this.started = false;
    }

    update(dt) {
        if (this.bannerTimer > 0) this.bannerTimer -= dt;

        if (!this.started) {
            this.intermissionTimer -= dt;
            if (this.intermissionTimer <= 0) {
                this.started = true;
                this.startNextWave();
            }
            return;
        }

        if (this.waveActive) {
            // Spawn enemies gradually
            if (this.enemiesToSpawn > 0) {
                this.spawnTimer -= dt;
                if (this.spawnTimer <= 0) {
                    this.spawnEnemy();
                    this.enemiesToSpawn--;
                    this.spawnTimer = this.spawnInterval;
                }
            }

            // Check if wave is cleared
            const aliveEnemies = this.game.enemies.filter(e => !e.dead).length;
            if (aliveEnemies === 0 && this.enemiesToSpawn === 0) {
                this.waveActive = false;
                // Open shop instead of auto-starting next wave
                this.game.openShop();
            }
        }
    }

    startNextWave() {
        this.currentWave++;
        this.waveActive = true;

        // Scale enemies per wave
        const baseCount = 3;
        const totalEnemies = baseCount + Math.floor(this.currentWave * 1.8);
        this.enemiesToSpawn = totalEnemies;
        this.enemiesRemaining = totalEnemies;
        this.spawnTimer = 0.5;
        this.spawnInterval = Math.max(0.3, 1.2 - this.currentWave * 0.05);

        this.bannerText = `Wave ${this.currentWave}`;
        this.bannerTimer = 2;

        // Boss wave every 5
        if (this.currentWave % 5 === 0) {
            this.bannerText = `⚔ BOSS WAVE ${this.currentWave} ⚔`;
            this.bannerTimer = 2.5;
        }
    }

    spawnEnemy() {
        const arena = this.game.arena;
        const pos = this.getSpawnPosition(arena);

        let enemy;
        const wave = this.currentWave;
        const rand = Math.random();

        // Boss wave — spawn a buffed enemy
        if (wave % 5 === 0 && this.enemiesToSpawn === 1) {
            enemy = new DarkMage(this.game, pos.x, pos.y);
            enemy.health = 200 + wave * 10;
            enemy.maxHealth = enemy.health;
            enemy.radius = 24;
            enemy.damage = 25;
            enemy.scoreValue = 200;
            enemy.speed = 60;
        } else if (wave >= 5 && rand < 0.2) {
            enemy = new DarkMage(this.game, pos.x, pos.y);
        } else if (wave >= 2 && rand < 0.45) {
            enemy = new Skeleton(this.game, pos.x, pos.y);
        } else {
            enemy = new Goblin(this.game, pos.x, pos.y);
        }

        // Scale stats with waves
        const scaleFactor = 1 + (wave - 1) * 0.08;
        enemy.health = Math.round(enemy.health * scaleFactor);
        enemy.maxHealth = enemy.health;
        enemy.speed *= (1 + (wave - 1) * 0.02);

        this.game.enemies.push(enemy);
    }

    getSpawnPosition(arena) {
        // Spawn from edges
        const side = Math.floor(Math.random() * 4);
        const margin = 40;
        let x, y;

        switch (side) {
            case 0: // top
                x = arena.left + Math.random() * (arena.right - arena.left);
                y = arena.top - margin;
                break;
            case 1: // right
                x = arena.right + margin;
                y = arena.top + Math.random() * (arena.bottom - arena.top);
                break;
            case 2: // bottom
                x = arena.left + Math.random() * (arena.right - arena.left);
                y = arena.bottom + margin;
                break;
            case 3: // left
                x = arena.left - margin;
                y = arena.top + Math.random() * (arena.bottom - arena.top);
                break;
        }

        return { x, y };
    }
}
