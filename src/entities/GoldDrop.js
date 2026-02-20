export class GoldDrop {
    constructor(x, y, amount, game) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.amount = amount;
        this.radius = 8;
        this.collected = false;
        this.magnetRange = 120;
        this.collectRange = 22;
        this.speed = 0;
        this.maxSpeed = 600;
        this.animTimer = Math.random() * Math.PI * 2;
        this.sparkleTimer = 0;
        this.lifetime = 30; // despawn after 30s
        this.fadeTimer = 0;

        // Scatter on spawn
        const angle = Math.random() * Math.PI * 2;
        const dist = 15 + Math.random() * 25;
        this.vx = Math.cos(angle) * dist * 4;
        this.vy = Math.sin(angle) * dist * 4 - 80;
        this.gravity = 400;
        this.grounded = false;
        this.groundY = y + Math.random() * 10;
    }

    update(dt) {
        if (this.collected) return;

        this.animTimer += dt * 5;
        this.sparkleTimer += dt;
        this.lifetime -= dt;

        if (this.lifetime <= 0) {
            this.collected = true;
            return;
        }

        // Scatter physics
        if (!this.grounded) {
            this.vx *= 0.97;
            this.vy += this.gravity * dt;
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.grounded = true;
                this.vx = 0;
                this.vy = 0;
            }
        }

        // Magnetic attraction to player
        const player = this.game.player;
        if (!player || player.dead) return;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.collectRange) {
            this.collect();
            return;
        }

        if (dist < this.magnetRange) {
            // Accelerate toward player — stronger when closer
            const strength = 1 - (dist / this.magnetRange);
            this.speed = Math.min(this.maxSpeed, this.speed + strength * 2000 * dt);
            const nx = dx / dist;
            const ny = dy / dist;
            this.x += nx * this.speed * dt;
            this.y += ny * this.speed * dt;
            this.grounded = true; // stop bouncing when attracted
        } else {
            this.speed = 0;
        }
    }

    collect() {
        this.collected = true;
        this.game.player.gold += this.amount;

        // Collection particles
        this.game.particles.emit(this.x, this.y, 8, {
            colors: ['#fbbf24', '#f59e0b', '#fde68a', '#ffffff'],
            speed: 100,
            speedVariance: 50,
            lifetime: 0.4,
            size: 3,
            sizeEnd: 0,
        });
    }

    render(ctx) {
        if (this.collected) return;

        const bobY = Math.sin(this.animTimer) * 3;
        const alpha = this.lifetime < 3 ? (0.3 + Math.abs(Math.sin(this.lifetime * 4)) * 0.7) : 1;
        ctx.globalAlpha = alpha;

        ctx.save();
        ctx.translate(this.x, this.y + bobY);

        // Glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
        gradient.addColorStop(0, 'rgba(251, 191, 36, 0.3)');
        gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();

        // Coin body — squash based on rotation
        const squash = Math.cos(this.animTimer * 0.8);
        const coinW = this.radius * Math.abs(squash);
        const coinH = this.radius;

        // Coin shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(0, coinH + 4, coinW + 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Coin edge (darker side when rotating)
        if (Math.abs(squash) > 0.1) {
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.ellipse(0, 0, coinW + 1, coinH + 1, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Coin face
        const faceGrad = ctx.createLinearGradient(-coinW, -coinH, coinW, coinH);
        faceGrad.addColorStop(0, '#fde68a');
        faceGrad.addColorStop(0.4, '#fbbf24');
        faceGrad.addColorStop(0.6, '#f59e0b');
        faceGrad.addColorStop(1, '#d97706');
        ctx.fillStyle = faceGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, coinW, coinH, 0, 0, Math.PI * 2);
        ctx.fill();

        // Coin highlight
        if (squash > 0.3) {
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath();
            ctx.ellipse(-coinW * 0.2, -coinH * 0.3, coinW * 0.4, coinH * 0.3, -0.3, 0, Math.PI * 2);
            ctx.fill();

            // Gold $ symbol
            ctx.fillStyle = '#92400e';
            ctx.font = `bold ${Math.max(6, coinH * 0.9)}px "Inter", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 1);
        }

        // Sparkles
        if (this.sparkleTimer > 0.15) {
            this.sparkleTimer = 0;
            if (Math.random() < 0.5) {
                this.game.particles.emit(
                    this.x + (Math.random() - 0.5) * 12,
                    this.y + bobY + (Math.random() - 0.5) * 12,
                    1,
                    {
                        colors: ['#fde68a', '#fbbf24', '#ffffff'],
                        speed: 15,
                        lifetime: 0.4,
                        size: 2,
                        sizeEnd: 0,
                    }
                );
            }
        }

        ctx.restore();
        ctx.globalAlpha = 1;
    }
}
