export class Camera {
    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.smoothing = 5;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    follow(targetX, targetY, dt) {
        const lerp = 1 - Math.exp(-this.smoothing * dt);
        this.x += (targetX - this.x) * lerp;
        this.y += (targetY - this.y) * lerp;
    }
}
