import Phaser from 'phaser';

export class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    // This scene is intentionally minimal — the shop is handled as an HTML overlay
    // within GameScene.openShop(). This scene exists for the scene registry only.
    create() {
        // Not used — shop is handled via DOM overlay in GameScene
    }
}
