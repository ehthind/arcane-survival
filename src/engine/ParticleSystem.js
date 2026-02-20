export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, count, options = {}) {
        const {
            color = '#ffaa00',
            colors = null,
            speed = 100,
            speedVariance = 50,
            lifetime = 0.5,
            size = 4,
            sizeEnd = 0,
            gravity = 0,
            spread = Math.PI * 2,
            angle = 0,
            fadeOut = true,
        } = options;

        for (let i = 0; i < count; i++) {
            const a = angle + (Math.random() - 0.5) * spread;
            const s = speed + (Math.random() - 0.5) * speedVariance;
            const c = colors ? colors[Math.floor(Math.random() * colors.length)] : color;
            this.particles.push({
                x,
                y,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                life: lifetime * (0.7 + Math.random() * 0.3),
                maxLife: lifetime,
                size,
                sizeEnd,
                color: c,
                gravity,
                fadeOut,
            });
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += p.gravity * dt;
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        for (const p of this.particles) {
            const t = 1 - p.life / p.maxLife;
            const size = p.size + (p.sizeEnd - p.size) * t;
            const alpha = p.fadeOut ? p.life / p.maxLife : 1;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(size, 0.5), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    clear() {
        this.particles = [];
    }
}
