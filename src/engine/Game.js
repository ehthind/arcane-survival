import { InputManager } from './InputManager.js';
import { Camera } from './Camera.js';
import { ParticleSystem } from './ParticleSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { WaveManager } from '../systems/WaveManager.js';
import { Arena } from '../world/Arena.js';
import { HUD } from '../ui/HUD.js';
import { MenuScreen } from '../ui/MenuScreen.js';
import { GameOverScreen } from '../ui/GameOverScreen.js';
import { Wizard } from '../entities/Wizard.js';
import { Warrior } from '../entities/Warrior.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.input = new InputManager(canvas);
    this.camera = new Camera(this.width, this.height);
    this.particles = new ParticleSystem();
    this.combat = new CombatSystem(this);
    this.waveManager = new WaveManager(this);
    this.arena = new Arena(this);
    this.hud = new HUD(this);
    this.menuScreen = new MenuScreen(this);
    this.gameOverScreen = new GameOverScreen(this);

    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.score = 0;
    this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };

    this.state = 'menu'; // menu | playing | gameover
    this.lastTime = 0;
    this.animationId = null;

    this._resizeHandler = this.resize.bind(this);
    window.addEventListener('resize', this._resizeHandler);
    this.resize();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.camera.resize(this.width, this.height);
  }

  startGame(characterClass) {
    if (characterClass === 'wizard') {
      this.player = new Wizard(this);
    } else {
      this.player = new Warrior(this);
    }
    this.player.x = this.arena.centerX;
    this.player.y = this.arena.centerY;
    this.enemies = [];
    this.projectiles = [];
    this.score = 0;
    this.particles.clear();
    this.waveManager.reset();
    this.state = 'playing';

    // Hide the menu overlay
    const overlay = document.getElementById('menu-overlay');
    if (overlay) overlay.style.display = 'none';
    const goOverlay = document.getElementById('gameover-overlay');
    if (goOverlay) goOverlay.style.display = 'none';
  }

  gameOver() {
    this.state = 'gameover';
    this.gameOverScreen.show(this.score, this.waveManager.currentWave);
  }

  addScreenShake(intensity, duration) {
    this.screenShake.intensity = Math.max(this.screenShake.intensity, intensity);
    this.screenShake.duration = Math.max(this.screenShake.duration, duration);
  }

  updateScreenShake(dt) {
    if (this.screenShake.duration > 0) {
      this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity * 2;
      this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity * 2;
      this.screenShake.duration -= dt;
      this.screenShake.intensity *= 0.95;
    } else {
      this.screenShake.x = 0;
      this.screenShake.y = 0;
      this.screenShake.intensity = 0;
    }
  }

  update(dt) {
    if (this.state !== 'playing') return;

    this.player.update(dt, this.input);
    this.waveManager.update(dt);

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      this.enemies[i].update(dt, this.player);
      if (this.enemies[i].dead && this.enemies[i].deathTimer <= 0) {
        this.enemies.splice(i, 1);
      }
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      this.projectiles[i].update(dt);
      if (this.projectiles[i].expired) {
        this.projectiles.splice(i, 1);
      }
    }

    this.combat.update(dt);
    this.particles.update(dt);
    this.camera.follow(this.player.x, this.player.y, dt);
    this.updateScreenShake(dt);

    if (this.player.health <= 0) {
      this.gameOver();
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(
      -this.camera.x + this.width / 2 + this.screenShake.x,
      -this.camera.y + this.height / 2 + this.screenShake.y
    );

    if (this.state === 'playing' || this.state === 'gameover') {
      this.arena.render(ctx);

      // Sort entities by y for depth effect
      const entities = [...this.enemies, this.player].filter(Boolean);
      entities.sort((a, b) => a.y - b.y);
      for (const e of entities) {
        e.render(ctx);
      }

      for (const p of this.projectiles) {
        p.render(ctx);
      }

      this.particles.render(ctx);
    }

    ctx.restore();

    if (this.state === 'playing') {
      this.hud.render(ctx);
    }
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    this.animationId = requestAnimationFrame(this.loop.bind(this));
  }

  start() {
    this.menuScreen.show();
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(this.loop.bind(this));
  }
}
