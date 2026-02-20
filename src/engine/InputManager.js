export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false, clicked: false, rightClicked: false };

        this._onKeyDown = (e) => {
            this.keys[e.code] = true;
            e.preventDefault();
        };
        this._onKeyUp = (e) => {
            this.keys[e.code] = false;
        };
        this._onMouseMove = (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        };
        this._onMouseDown = (e) => {
            if (e.button === 0) {
                this.mouse.down = true;
                this.mouse.clicked = true;
            }
            if (e.button === 2) {
                this.mouse.rightClicked = true;
            }
        };
        this._onMouseUp = (e) => {
            if (e.button === 0) this.mouse.down = false;
        };
        this._onContextMenu = (e) => e.preventDefault();

        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
        canvas.addEventListener('mousemove', this._onMouseMove);
        canvas.addEventListener('mousedown', this._onMouseDown);
        canvas.addEventListener('mouseup', this._onMouseUp);
        canvas.addEventListener('contextmenu', this._onContextMenu);
    }

    // Get mouse position in world coordinates
    getWorldMouse(camera, screenW, screenH) {
        return {
            x: this.mouse.x + camera.x - screenW / 2,
            y: this.mouse.y + camera.y - screenH / 2,
        };
    }

    // Call at end of frame to clear single-frame flags
    endFrame() {
        this.mouse.clicked = false;
        this.mouse.rightClicked = false;
    }

    isDown(code) {
        return !!this.keys[code];
    }
}
