export class ShopScreen {
    constructor(game) {
        this.game = game;
        this.overlay = null;
        this.currentOffers = [];
    }

    show() {
        const player = this.game.player;
        const um = this.game.upgradeManager;
        this.currentOffers = um.getRandomUpgrades(player.className, 3);

        let overlay = document.getElementById('shop-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'shop-overlay';
            document.body.appendChild(overlay);
        }

        this.overlay = overlay;
        this.render();
        overlay.style.display = 'flex';
    }

    render() {
        const player = this.game.player;
        const um = this.game.upgradeManager;
        const wave = this.game.waveManager.currentWave;

        const cardsHTML = this.currentOffers.map((upgrade, i) => {
            const tier = um.getTier(upgrade.id);
            const cost = um.getCost(upgrade);
            const canAfford = player.gold >= cost;
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
          <div class="shop-card-cost ${canAfford ? '' : 'too-expensive'}">
            <span class="gold-icon">🪙</span> ${cost}
          </div>
          <button class="shop-buy-btn" data-index="${i}" ${canAfford ? '' : 'disabled'}>
            ${canAfford ? 'Purchase' : 'Not enough gold'}
          </button>
        </div>
      `;
        }).join('');

        const noUpgrades = this.currentOffers.length === 0;

        this.overlay.innerHTML = `
      <div class="shop-container">
        <div class="shop-header">
          <h1 class="shop-title">⚒️ Armory</h1>
          <div class="shop-wave">Wave ${wave} Complete!</div>
          <div class="shop-gold">
            <span class="gold-icon">🪙</span>
            <span class="shop-gold-amount">${player.gold}</span>
          </div>
        </div>

        ${noUpgrades ? '<p class="shop-maxed">All upgrades maxed! You are unstoppable!</p>' : `
          <div class="shop-cards">${cardsHTML}</div>
          <button class="shop-reroll-btn" id="shop-reroll">🎲 Reroll (10 🪙)</button>
        `}

        <button class="shop-continue-btn" id="shop-continue">
          Continue to Wave ${wave + 1} ➜
        </button>
      </div>
    `;

        // Bind events
        this.overlay.querySelectorAll('.shop-buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const upgrade = this.currentOffers[idx];
                if (um.purchase(upgrade)) {
                    // Purchase effect
                    this.game.particles.emit(
                        this.game.player.x, this.game.player.y, 20,
                        { colors: [upgrade.color, '#ffffff', '#fbbf24'], speed: 150, lifetime: 0.6, size: 4, sizeEnd: 0 }
                    );
                    this.game.addScreenShake(3, 0.15);
                    this.render(); // Re-render to update gold & availability
                }
            });
        });

        const rerollBtn = this.overlay.querySelector('#shop-reroll');
        if (rerollBtn) {
            rerollBtn.addEventListener('click', () => {
                if (player.gold >= 10) {
                    player.gold -= 10;
                    this.currentOffers = um.getRandomUpgrades(player.className, 3);
                    this.render();
                }
            });
        }

        this.overlay.querySelector('#shop-continue').addEventListener('click', () => {
            this.hide();
            this.game.state = 'playing';
            this.game.waveManager.startNextWave();
        });
    }

    hide() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
    }
}
