import { Enemy } from '../Enemy.js';

export class Goblin extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.type = 'goblin';
        this.speed = 130;
        this.baseSpeed = 130;
        this.health = 20;
        this.maxHealth = 20;
        this.radius = 12;
        this.damage = 8;
        this.scoreValue = 10;
        this.goldValue = 5;
        this.deathColors = ['#4ade80', '#22c55e', '#fbbf24'];
        this.animOffset = Math.random() * Math.PI * 2;
        this.legAnim = 0;
    }

    update(dt, player) {
        super.update(dt, player);
        if (!this.dead && !this.frozen) {
            this.legAnim += dt * 12;
        }
    }

    renderBody(ctx) {
        const bounce = Math.sin(this.legAnim) * 2;
        const time = Date.now() * 0.001;

        // Legs (scurrying animation)
        const legSpread = Math.sin(this.legAnim) * 4;
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(-4 + legSpread, this.radius - 2 + bounce, 3, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(4 - legSpread, this.radius - 2 + bounce, 3, 5, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Body
        const bodyGrad = ctx.createRadialGradient(0, bounce - 2, 0, 0, bounce + 2, this.radius);
        bodyGrad.addColorStop(0, '#4ade80');
        bodyGrad.addColorStop(0.5, '#22c55e');
        bodyGrad.addColorStop(1, '#15803d');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(0, bounce, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Leather armor scraps
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(-6, bounce - 2);
        ctx.lineTo(6, bounce - 2);
        ctx.lineTo(5, bounce + 5);
        ctx.lineTo(-5, bounce + 5);
        ctx.closePath();
        ctx.fill();
        // Armor stitching
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-3, bounce - 1);
        ctx.lineTo(-3, bounce + 4);
        ctx.moveTo(3, bounce - 1);
        ctx.lineTo(3, bounce + 4);
        ctx.stroke();

        // Ears (pointed with rings)
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(-this.radius + 1, bounce - 2);
        ctx.lineTo(-this.radius - 10, bounce - 14);
        ctx.lineTo(-this.radius + 5, bounce - 6);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.radius - 1, bounce - 2);
        ctx.lineTo(this.radius + 10, bounce - 14);
        ctx.lineTo(this.radius - 5, bounce - 6);
        ctx.closePath();
        ctx.fill();
        // Ear inner
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.moveTo(-this.radius, bounce - 3);
        ctx.lineTo(-this.radius - 6, bounce - 11);
        ctx.lineTo(-this.radius + 3, bounce - 6);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.radius, bounce - 3);
        ctx.lineTo(this.radius + 6, bounce - 11);
        ctx.lineTo(this.radius - 3, bounce - 6);
        ctx.closePath();
        ctx.fill();
        // Earrings
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(-this.radius - 5, bounce - 8, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.radius + 5, bounce - 8, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(0, bounce + 1, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(-1, bounce + 1, 1, 0, Math.PI * 2);
        ctx.arc(1, bounce + 1, 1, 0, Math.PI * 2);
        ctx.fill();

        // Eyes — angry yellow
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(-4, bounce - 4, 4, 3.5, 0, 0, Math.PI * 2);
        ctx.ellipse(4, bounce - 4, 4, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(-4, bounce - 4, 2.5, 0, Math.PI * 2);
        ctx.arc(4, bounce - 4, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-4, bounce - 4, 1.2, 0, Math.PI * 2);
        ctx.arc(4, bounce - 4, 1.2, 0, Math.PI * 2);
        ctx.fill();
        // Angry eyebrows
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-7, bounce - 7);
        ctx.lineTo(-2, bounce - 6);
        ctx.moveTo(7, bounce - 7);
        ctx.lineTo(2, bounce - 6);
        ctx.stroke();

        // Mouth — jagged teeth
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(0, bounce + 4, 5, 0, Math.PI);
        ctx.fill();
        // Teeth
        ctx.fillStyle = '#fde68a';
        for (let i = -3; i <= 3; i += 2) {
            ctx.beginPath();
            ctx.moveTo(i - 1, bounce + 4);
            ctx.lineTo(i, bounce + 6);
            ctx.lineTo(i + 1, bounce + 4);
            ctx.closePath();
            ctx.fill();
        }

        // Rusty dagger in hand
        ctx.save();
        ctx.translate(this.radius - 2, bounce + 2);
        ctx.rotate(0.4);
        // Dagger blade
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.moveTo(0, -1);
        ctx.lineTo(12, 0);
        ctx.lineTo(0, 1);
        ctx.closePath();
        ctx.fill();
        // Rust spots
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.arc(5, 0, 1, 0, Math.PI * 2);
        ctx.arc(8, 0.5, 0.8, 0, Math.PI * 2);
        ctx.fill();
        // Handle
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-4, -1.5, 5, 3);
        ctx.restore();
    }
}
