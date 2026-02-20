export class GameOverScreen {
    constructor(game) {
        this.game = game;
    }

    show(score, wave) {
        let overlay = document.getElementById('gameover-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'gameover-overlay';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
      <div class="gameover-container">
        <h1 class="gameover-title">💀 Fallen in Battle 💀</h1>
        <div class="gameover-stats">
          <div class="go-stat">
            <span class="go-stat-label">Final Score</span>
            <span class="go-stat-value">⭐ ${score}</span>
          </div>
          <div class="go-stat">
            <span class="go-stat-label">Waves Survived</span>
            <span class="go-stat-value">⚔ ${wave}</span>
          </div>
        </div>
        <div class="gameover-buttons">
          <button class="retry-btn" id="retry-btn">⚔ Fight Again</button>
          <button class="menu-btn" id="menu-btn">🏠 Main Menu</button>
        </div>
      </div>
    `;

        overlay.style.display = 'flex';

        overlay.querySelector('#retry-btn').addEventListener('click', () => {
            const lastClass = this.game.player ? this.game.player.className : 'wizard';
            overlay.style.display = 'none';
            this.game.startGame(lastClass);
        });

        overlay.querySelector('#menu-btn').addEventListener('click', () => {
            overlay.style.display = 'none';
            this.game.state = 'menu';
            this.game.menuScreen.show();
        });
    }
}
