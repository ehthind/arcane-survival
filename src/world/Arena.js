export class Arena {
    constructor(game) {
        this.game = game;
        this.arenaWidth = 1200;
        this.arenaHeight = 900;
        this.centerX = this.arenaWidth / 2;
        this.centerY = this.arenaHeight / 2;

        this.left = 0;
        this.top = 0;
        this.right = this.arenaWidth;
        this.bottom = this.arenaHeight;

        this.tileSize = 48;
        this.ambientTimer = 0;
    }

    render(ctx) {
        this.ambientTimer += 0.016;

        // Dark void outside arena
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(-500, -500, this.arenaWidth + 1000, this.arenaHeight + 1000);

        // Arena floor
        this.renderFloor(ctx);

        // Arena border walls
        this.renderWalls(ctx);

        // Ambient magical particles
        this.renderAmbient(ctx);
    }

    renderFloor(ctx) {
        // Base floor
        const gradient = ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.arenaWidth * 0.6
        );
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.7, '#16132b');
        gradient.addColorStop(1, '#0f0c24');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.left, this.top, this.arenaWidth, this.arenaHeight);

        // Tile grid
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for (let x = this.left; x <= this.right; x += this.tileSize) {
            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }
        for (let y = this.top; y <= this.bottom; y += this.tileSize) {
            ctx.beginPath();
            ctx.moveTo(this.left, y);
            ctx.lineTo(this.right, y);
            ctx.stroke();
        }

        // Center magic circle
        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(this.ambientTimer * 0.2);

        // Outer ring
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 120, 0, Math.PI * 2);
        ctx.stroke();

        // Inner ring
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.12)';
        ctx.beginPath();
        ctx.arc(0, 0, 80, 0, Math.PI * 2);
        ctx.stroke();

        // Runes
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.1)';
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 80, Math.sin(a) * 80);
            ctx.lineTo(Math.cos(a) * 120, Math.sin(a) * 120);
            ctx.stroke();

            // Rune circles
            ctx.beginPath();
            ctx.arc(Math.cos(a) * 100, Math.sin(a) * 100, 6, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();

        // Corner glyphs
        const cornerOffs = 60;
        this.renderCornerGlyph(ctx, this.left + cornerOffs, this.top + cornerOffs);
        this.renderCornerGlyph(ctx, this.right - cornerOffs, this.top + cornerOffs);
        this.renderCornerGlyph(ctx, this.left + cornerOffs, this.bottom - cornerOffs);
        this.renderCornerGlyph(ctx, this.right - cornerOffs, this.bottom - cornerOffs);
    }

    renderCornerGlyph(ctx, x, y) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(251, 191, 36, 0.08)';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    renderWalls(ctx) {
        const wallThickness = 8;

        // Glow behind walls
        const glowGradient = ctx.createLinearGradient(this.left, this.top, this.left, this.top + 30);
        glowGradient.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
        glowGradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(this.left, this.top, this.arenaWidth, 30);

        // Wall segments
        ctx.fillStyle = '#2a2440';
        ctx.strokeStyle = '#4c3d7a';
        ctx.lineWidth = 2;

        // Top wall
        ctx.fillRect(this.left - wallThickness, this.top - wallThickness, this.arenaWidth + wallThickness * 2, wallThickness);
        ctx.strokeRect(this.left - wallThickness, this.top - wallThickness, this.arenaWidth + wallThickness * 2, wallThickness);

        // Bottom wall
        ctx.fillRect(this.left - wallThickness, this.bottom, this.arenaWidth + wallThickness * 2, wallThickness);
        ctx.strokeRect(this.left - wallThickness, this.bottom, this.arenaWidth + wallThickness * 2, wallThickness);

        // Left wall
        ctx.fillRect(this.left - wallThickness, this.top - wallThickness, wallThickness, this.arenaHeight + wallThickness * 2);
        ctx.strokeRect(this.left - wallThickness, this.top - wallThickness, wallThickness, this.arenaHeight + wallThickness * 2);

        // Right wall
        ctx.fillRect(this.right, this.top - wallThickness, wallThickness, this.arenaHeight + wallThickness * 2);
        ctx.strokeRect(this.right, this.top - wallThickness, wallThickness, this.arenaHeight + wallThickness * 2);

        // Corner gems
        const gemSize = 6;
        const corners = [
            [this.left, this.top],
            [this.right, this.top],
            [this.left, this.bottom],
            [this.right, this.bottom],
        ];
        for (const [cx, cy] of corners) {
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(cx, cy, gemSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#c084fc';
            ctx.beginPath();
            ctx.arc(cx, cy, gemSize * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderAmbient(ctx) {
        // Floating embers
        const time = this.ambientTimer;
        for (let i = 0; i < 12; i++) {
            const seed = i * 137.5;
            const x = this.left + ((seed * 7.3 + time * 15) % this.arenaWidth);
            const y = this.top + ((seed * 11.1 + Math.sin(time + seed) * 40) % this.arenaHeight);
            const alpha = 0.1 + Math.sin(time * 2 + seed) * 0.08;
            const size = 1.5 + Math.sin(time * 3 + seed) * 0.5;

            ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
