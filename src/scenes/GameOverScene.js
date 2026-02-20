import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.finalWave = data.wave || 0;
        this.characterClass = data.characterClass || 'wizard';
    }

    create() {
        // Clean up any leftover overlays
        const shop = document.getElementById('shop-overlay');
        if (shop) shop.style.display = 'none';

        // Show game over overlay
        let overlay = document.getElementById('gameover-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'gameover-overlay';
            document.body.appendChild(overlay);
        }

        overlay.style.display = 'flex';
        overlay.innerHTML = `
      <div class="gameover-container">
        <h1 class="gameover-title">💀 Fallen in Battle 💀</h1>
        <div class="gameover-stats">
          <div class="go-stat">
            <span class="go-stat-label">FINAL SCORE</span>
            <span class="go-stat-value">⭐ ${this.finalScore}</span>
          </div>
          <div class="go-stat">
            <span class="go-stat-label">WAVES SURVIVED</span>
            <span class="go-stat-value">⚔ ${this.finalWave}</span>
          </div>
        </div>
        <div class="gameover-buttons">
          <button class="retry-btn" id="retry-btn">⚔ Fight Again</button>
          <button class="menu-btn" id="menu-return-btn">🏠 Main Menu</button>
        </div>
      </div>`;

        overlay.querySelector('#retry-btn').addEventListener('click', () => {
            overlay.style.display = 'none';
            this.scene.start('GameScene', { characterClass: this.characterClass });
        });

        overlay.querySelector('#menu-return-btn').addEventListener('click', () => {
            overlay.style.display = 'none';
            this.scene.start('MenuScene');
        });
    }
}
