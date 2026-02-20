import { Enemy } from '../Enemy.js';

export class Goblin extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.type = 'goblin';
        this.speed = 130;
        this.health = 20;
        this.maxHealth = 20;
        this.radius = 12;
        this.damage = 8;
        this.scoreValue = 10;
        this.deathColors = ['#4ade80', '#22c55e', '#fbbf24'];
        this.animOffset = Math.random() * Math.PI * 2;
    }

    renderBody(ctx) {
        // Goblin body — green, small, quick
        const bounce = Math.sin(this.game ? Date.now() * 0.008 + this.animOffset : 0) * 2;

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(0, bounce, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Darker belly
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(0, bounce + 2, this.radius * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(-this.radius, bounce - 2);
        ctx.lineTo(-this.radius - 8, bounce - 12);
        ctx.lineTo(-this.radius + 4, bounce - 6);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.radius, bounce - 2);
        ctx.lineTo(this.radius + 8, bounce - 12);
        ctx.lineTo(this.radius - 4, bounce - 6);
        ctx.closePath();
        ctx.fill();

        // Eyes — angry red
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(-4, bounce - 3, 3, 0, Math.PI * 2);
        ctx.arc(4, bounce - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(-4, bounce - 3, 1.5, 0, Math.PI * 2);
        ctx.arc(4, bounce - 3, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, bounce + 1, 4, 0.1, Math.PI - 0.1);
        ctx.stroke();
    }
}
