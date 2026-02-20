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
              <div class="class-icon"><svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 2L42 42H22L32 2Z" fill="url(#hat-grad)" stroke="#1e3a8a" stroke-width="1.5"/>
                <ellipse cx="32" cy="44" rx="22" ry="6" fill="#1e40af" stroke="#1e3a8a" stroke-width="1"/>
                <ellipse cx="32" cy="43" rx="20" ry="5" fill="#2563eb"/>
                <path d="M24 43C24 43 28 40 32 40C36 40 40 43 40 43" stroke="#93c5fd" stroke-width="0.8" opacity="0.4"/>
                <rect x="22" y="41" width="20" height="3" rx="1.5" fill="#fbbf24" opacity="0.7"/>
                <circle cx="28" cy="20" r="2.5" fill="#fde68a" opacity="0.9"/>
                <polygon points="36,30 37.5,33 40.5,33 38,35 39,38 36,36 33,38 34,35 31.5,33 34.5,33" fill="#fde68a" opacity="0.8"/>
                <circle cx="30" cy="12" r="1.5" fill="#93c5fd" opacity="0.7"/>
                <defs><linearGradient id="hat-grad" x1="32" y1="2" x2="32" y2="44"><stop offset="0%" stop-color="#1e40af"/><stop offset="50%" stop-color="#2563eb"/><stop offset="100%" stop-color="#3b82f6"/></linearGradient></defs>
              </svg></div>
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
