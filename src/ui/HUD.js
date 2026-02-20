export class HUD {
    constructor(game) {
        this.game = game;
    }

    render(ctx) {
        const player = this.game.player;
        const wm = this.game.waveManager;
        if (!player) return;

        const w = this.game.width;

        // Health bar
        this.drawBar(ctx, 20, 20, 220, 22, player.health, player.maxHealth, '#ef4444', '#7f1d1d', '❤ HP');

        // Mana / energy bar
        if (player.mana !== undefined) {
            const manaColor = player.className === 'wizard' ? '#8b5cf6' : '#f97316';
            this.drawBar(ctx, 20, 50, 180, 16, player.mana, player.maxMana, manaColor, '#1e1b4b', '✦ MP');
        }

        // Special cooldown
        if (player.specialCooldown > 0) {
            const cdPct = player.specialCooldown / player.specialMaxCooldown;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(20, 74, 120, 14);
            ctx.fillStyle = '#60a5fa';
            ctx.fillRect(20, 74, 120 * (1 - cdPct), 14);
            ctx.fillStyle = '#fff';
            ctx.font = '10px "Inter", sans-serif';
            ctx.fillText(`Special: ${player.specialCooldown.toFixed(1)}s`, 24, 84);
        } else {
            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 11px "Inter", sans-serif';
            ctx.fillText('⚡ Special Ready! [Right Click]', 22, 86);
        }

        // Wave info — top center
        ctx.textAlign = 'center';
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 18px "MedievalSharp", serif';
        ctx.fillText(`Wave ${wm.currentWave}`, w / 2, 30);

        const aliveEnemies = this.game.enemies.filter(e => !e.dead).length + wm.enemiesToSpawn;
        ctx.font = '13px "Inter", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Enemies: ${aliveEnemies}`, w / 2, 50);

        // Score — top right
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 20px "MedievalSharp", serif';
        ctx.fillText(`⭐ ${this.game.score}`, w - 20, 30);
        ctx.textAlign = 'left';

        // Wave banner
        if (wm.bannerTimer > 0) {
            const alpha = Math.min(1, wm.bannerTimer);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 48px "MedievalSharp", serif';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 10;
            ctx.fillText(wm.bannerText, w / 2, this.game.height / 2 - 50);
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
            ctx.restore();
        }

        // Controls hint — bottom center
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '11px "Inter", sans-serif';
        ctx.fillText('WASD to move • Left Click to attack • Right Click for special', w / 2, this.game.height - 15);
        ctx.textAlign = 'left';
    }

    drawBar(ctx, x, y, w, h, value, max, color, bgColor, label) {
        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.roundRect(x - 1, y - 1, w + 2, h + 2, 4);
        ctx.fill();

        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 3);
        ctx.fill();

        // Fill
        const pct = Math.max(0, value / max);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, w * pct, h, 3);
        ctx.fill();

        // Shine
        const gradient = ctx.createLinearGradient(x, y, x, y + h);
        gradient.addColorStop(0, 'rgba(255,255,255,0.2)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, w * pct, h, 3);
        ctx.fill();

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${h - 6}px "Inter", sans-serif`;
        ctx.fillText(`${label} ${Math.ceil(value)}/${max}`, x + 6, y + h - 5);
    }
}
