export class MenuScreen {
    constructor(game) {
        this.game = game;
        this.selectedClass = 'wizard';
        this.overlay = null;
    }

    show() {
        // Create or show overlay
        let overlay = document.getElementById('menu-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'menu-overlay';
            overlay.innerHTML = `
        <div class="menu-container">
          <div class="menu-title-glow"></div>
          <h1 class="menu-title">⚔ Arcane Survival ⚔</h1>
          <p class="menu-subtitle">Choose your champion and survive the onslaught</p>

          <div class="class-selection">
            <div class="class-card selected" data-class="wizard" id="card-wizard">
              <div class="class-icon">🧙</div>
              <h2>Wizard</h2>
              <div class="class-stats">
                <div class="stat"><span class="stat-label">HP</span><div class="stat-bar"><div class="stat-fill" style="width:60%"></div></div></div>
                <div class="stat"><span class="stat-label">DMG</span><div class="stat-bar"><div class="stat-fill" style="width:70%"></div></div></div>
                <div class="stat"><span class="stat-label">SPD</span><div class="stat-bar"><div class="stat-fill" style="width:85%"></div></div></div>
              </div>
              <p class="class-desc">Ranged magic bolts • Frost Nova AoE</p>
            </div>

            <div class="class-card" data-class="warrior" id="card-warrior">
              <div class="class-icon">⚔️</div>
              <h2>Warrior</h2>
              <div class="class-stats">
                <div class="stat"><span class="stat-label">HP</span><div class="stat-bar"><div class="stat-fill warrior-fill" style="width:90%"></div></div></div>
                <div class="stat"><span class="stat-label">DMG</span><div class="stat-bar"><div class="stat-fill warrior-fill" style="width:85%"></div></div></div>
                <div class="stat"><span class="stat-label">SPD</span><div class="stat-bar"><div class="stat-fill warrior-fill" style="width:65%"></div></div></div>
              </div>
              <p class="class-desc">Melee sword sweep • Ground Slam AoE</p>
            </div>
          </div>

          <button class="start-btn" id="start-btn">
            <span class="start-btn-text">Enter the Arena</span>
            <div class="start-btn-glow"></div>
          </button>

          <div class="controls-info">
            <span>🎮 WASD to move</span>
            <span>🖱️ Left Click to attack</span>
            <span>✨ Right Click for special</span>
          </div>
        </div>
      `;
            document.body.appendChild(overlay);

            // Event listeners
            const cards = overlay.querySelectorAll('.class-card');
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    cards.forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    this.selectedClass = card.dataset.class;
                });
            });

            const startBtn = overlay.querySelector('#start-btn');
            startBtn.addEventListener('click', () => {
                this.game.startGame(this.selectedClass);
            });
        }

        overlay.style.display = 'flex';
        this.overlay = overlay;
    }
}
