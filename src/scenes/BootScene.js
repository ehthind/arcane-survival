import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create a loading bar
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        const barBg = this.add.rectangle(w / 2, h / 2, 320, 20, 0x1e1b4b);
        const bar = this.add.rectangle(w / 2 - 155, h / 2, 0, 14, 0xa855f7).setOrigin(0, 0.5);

        const loadingText = this.add.text(w / 2, h / 2 - 30, 'Loading...', {
            fontFamily: 'MedievalSharp, serif',
            fontSize: '24px',
            color: '#e2e8f0',
        }).setOrigin(0.5);

        this.load.on('progress', (v) => {
            bar.width = 310 * v;
        });

        // We will generate textures programmatically in create() instead of loading files
        // This lets us keep the zero-asset approach while still using Phaser sprites
    }

    create() {
        // Generate all sprite textures programmatically
        this.generateTextures();
        this.scene.start('MenuScene');
    }

    generateTextures() {
        // --- WIZARD ---
        this.generateWizardTexture();
        // --- WARRIOR ---
        this.generateWarriorTexture();
        // --- GOBLIN ---
        this.generateGoblinTexture();
        // --- SKELETON ---
        this.generateSkeletonTexture();
        // --- DARK MAGE ---
        this.generateDarkMageTexture();
        // --- PROJECTILES ---
        this.generateProjectileTextures();
        // --- GOLD COIN ---
        this.generateGoldTexture();
        // --- ARENA ---
        this.generateArenaTextures();
    }

    generateWizardTexture() {
        const g = this.make.graphics({ add: false });
        const s = 64; // sprite size

        // Idle frame
        g.clear();
        // Cape
        g.fillStyle(0x4c1d95);
        g.fillTriangle(24, 38, 32, 52, 40, 38);
        // Robe body
        g.fillStyle(0x6d28d9);
        g.fillCircle(32, 36, 14);
        g.fillStyle(0x7c3aed);
        g.fillCircle(32, 34, 12);
        // Belt
        g.fillStyle(0x92400e);
        g.fillRect(24, 36, 16, 3);
        g.fillStyle(0xfbbf24);
        g.fillCircle(32, 37, 2);
        // Hat
        g.fillStyle(0x4c1d95);
        g.fillTriangle(20, 26, 44, 26, 33, 4);
        g.fillStyle(0x5b21b6);
        g.fillEllipse(32, 26, 28, 8);
        // Hat band
        g.lineStyle(2, 0xfbbf24);
        g.strokeEllipse(32, 26, 24, 6);
        // Eyes
        g.fillStyle(0xe0e7ff);
        g.fillCircle(28, 28, 2.5);
        g.fillCircle(36, 28, 2.5);
        g.fillStyle(0x4c1d95);
        g.fillCircle(28, 28, 1.2);
        g.fillCircle(36, 28, 1.2);
        // Staff
        g.lineStyle(3, 0x78350f);
        g.strokeLineShape(new Phaser.Geom.Line(42, 22, 52, 46));
        // Crystal
        g.fillStyle(0xc084fc);
        g.fillTriangle(42, 18, 46, 22, 38, 22);
        // Stars on hat
        g.fillStyle(0xfde68a);
        g.fillCircle(30, 14, 2);
        g.fillCircle(35, 8, 1.5);

        g.generateTexture('wizard', s, s);
        g.destroy();
    }

    generateWarriorTexture() {
        const g = this.make.graphics({ add: false });
        const s = 64;

        // Cape
        g.fillStyle(0x7f1d1d);
        g.fillTriangle(24, 38, 32, 54, 40, 38);
        // Armor body
        g.fillStyle(0xb91c1c);
        g.fillCircle(32, 36, 14);
        g.fillStyle(0xdc2626);
        g.fillCircle(32, 34, 12);
        // Gold trim
        g.lineStyle(1.5, 0xfbbf24, 0.5);
        g.strokeCircle(32, 34, 12);
        // Belt
        g.fillStyle(0x78350f);
        g.fillRect(24, 37, 16, 3);
        g.fillStyle(0xfbbf24);
        g.fillCircle(32, 38, 2);
        // Pauldrons
        g.fillStyle(0x374151);
        g.fillCircle(20, 30, 6);
        g.fillCircle(44, 30, 6);
        g.fillStyle(0x4b5563);
        g.fillCircle(20, 29, 4);
        g.fillCircle(44, 29, 4);
        // Helmet
        g.fillStyle(0x374151);
        g.fillRect(22, 18, 20, 14);
        g.fillStyle(0x4b5563);
        g.fillEllipse(32, 18, 22, 10);
        // Helmet crest
        g.fillStyle(0xdc2626);
        g.fillTriangle(30, 14, 34, 14, 32, 6);
        // Visor
        g.fillStyle(0x111827);
        g.fillRect(25, 23, 14, 5);
        // Visor eyes
        g.fillStyle(0xfbbf24);
        g.fillCircle(29, 25, 2);
        g.fillCircle(35, 25, 2);
        // Sword
        g.fillStyle(0xd4d4d8);
        g.fillTriangle(46, 22, 58, 18, 46, 26);
        // Sword guard
        g.fillStyle(0xfbbf24);
        g.fillRect(44, 20, 4, 10);
        // Shield
        g.fillStyle(0x6b7280);
        g.fillTriangle(14, 28, 22, 22, 22, 40);
        g.fillStyle(0xdc2626);
        g.fillCircle(18, 30, 3);

        g.generateTexture('warrior', s, s);
        g.destroy();
    }

    generateGoblinTexture() {
        const g = this.make.graphics({ add: false });
        const s = 48;

        // Body
        g.fillStyle(0x22c55e);
        g.fillCircle(24, 26, 10);
        g.fillStyle(0x4ade80);
        g.fillCircle(24, 24, 8);
        // Ears
        g.fillStyle(0x22c55e);
        g.fillTriangle(12, 20, 6, 8, 18, 18);
        g.fillTriangle(36, 20, 42, 8, 30, 18);
        // Earrings
        g.fillStyle(0xfbbf24);
        g.fillCircle(8, 12, 1.5);
        g.fillCircle(40, 12, 1.5);
        // Eyes
        g.fillStyle(0xfbbf24);
        g.fillCircle(20, 22, 3);
        g.fillCircle(28, 22, 3);
        g.fillStyle(0x000000);
        g.fillCircle(20, 22, 1.5);
        g.fillCircle(28, 22, 1.5);
        // Mouth with teeth
        g.fillStyle(0x111111);
        g.fillRect(18, 28, 12, 4);
        g.fillStyle(0xfde68a);
        g.fillTriangle(20, 28, 21, 31, 22, 28);
        g.fillTriangle(24, 28, 25, 31, 26, 28);
        g.fillTriangle(28, 28, 29, 31, 30, 28);
        // Leather armor
        g.fillStyle(0x78350f);
        g.fillRect(18, 30, 12, 8);
        // Dagger
        g.fillStyle(0x9ca3af);
        g.fillTriangle(36, 26, 44, 24, 36, 28);
        g.fillStyle(0x78350f);
        g.fillRect(34, 24, 4, 6);

        g.generateTexture('goblin', s, s);
        g.destroy();
    }

    generateSkeletonTexture() {
        const g = this.make.graphics({ add: false });
        const s = 48;

        // Cloak
        g.fillStyle(0x292524);
        g.fillTriangle(10, 18, 24, 44, 38, 18);
        g.fillStyle(0x1c1917);
        g.fillTriangle(14, 36, 16, 44, 18, 36);
        g.fillTriangle(26, 36, 28, 44, 30, 36);
        // Skull
        g.fillStyle(0xe7e5e4);
        g.fillCircle(24, 16, 10);
        // Eye sockets
        g.fillStyle(0x1c1917);
        g.fillCircle(20, 14, 4);
        g.fillCircle(28, 14, 4);
        // Soul fire eyes
        g.fillStyle(0x22d3ee);
        g.fillCircle(20, 14, 2.5);
        g.fillCircle(28, 14, 2.5);
        g.fillStyle(0x67e8f9);
        g.fillCircle(20, 14, 1);
        g.fillCircle(28, 14, 1);
        // Nose
        g.fillStyle(0x292524);
        g.fillTriangle(22, 18, 26, 18, 24, 20);
        // Jaw
        g.fillStyle(0xd6d3d1);
        g.fillRect(16, 22, 16, 4);
        // Teeth
        g.fillStyle(0xe7e5e4);
        for (let i = 0; i < 5; i++) {
            g.fillRect(17 + i * 3, 22, 2, 3);
        }
        // Ribcage
        g.lineStyle(1.5, 0xd4d4d8);
        for (let i = 0; i < 3; i++) {
            g.strokeEllipse(24, 28 + i * 4, 12 - i, 3);
        }
        // Bone staff
        g.lineStyle(2, 0xe7e5e4);
        g.strokeLineShape(new Phaser.Geom.Line(38, 8, 38, 40));
        g.fillStyle(0xe7e5e4);
        g.fillCircle(38, 8, 3);
        g.fillStyle(0x06b6d4);
        g.fillCircle(37, 7, 1);
        g.fillCircle(39, 7, 1);

        g.generateTexture('skeleton', s, s);
        g.destroy();
    }

    generateDarkMageTexture() {
        const g = this.make.graphics({ add: false });
        const s = 56;

        // Robe
        g.fillStyle(0x1e1b4b);
        g.fillTriangle(10, 20, 28, 52, 46, 20);
        g.fillStyle(0x312e81);
        g.fillTriangle(14, 22, 28, 48, 42, 22);
        // Tattered edges
        g.fillStyle(0x312e81);
        g.fillTriangle(18, 46, 20, 52, 22, 46);
        g.fillTriangle(28, 46, 30, 52, 32, 46);
        g.fillTriangle(34, 46, 36, 52, 38, 46);
        // Hood
        g.fillStyle(0x1e1b4b);
        g.fillCircle(28, 18, 14);
        g.fillStyle(0x0f0b2e);
        g.fillCircle(28, 19, 11);
        // Hood peak
        g.fillStyle(0x1e1b4b);
        g.fillTriangle(25, 6, 31, 6, 28, 0);
        // Glowing eyes
        g.fillStyle(0xa855f7);
        g.fillCircle(24, 18, 3);
        g.fillCircle(32, 18, 3);
        g.fillStyle(0xc084fc);
        g.fillCircle(24, 18, 1.5);
        g.fillCircle(32, 18, 1.5);
        // Rune marks on robe
        g.lineStyle(1, 0x7c3aed, 0.4);
        g.strokeCircle(22, 32, 2);
        g.strokeCircle(34, 32, 2);
        g.strokeCircle(28, 38, 2);
        // Energy orb
        g.fillStyle(0x7c3aed);
        g.fillCircle(44, 16, 5);
        g.fillStyle(0xc084fc);
        g.fillCircle(44, 16, 2.5);
        g.fillStyle(0xffffff, 0.5);
        g.fillCircle(44, 15, 1);
        // Grimoire
        g.fillStyle(0x312e81);
        g.fillRect(6, 22, 8, 12);
        g.fillStyle(0xe5e7eb);
        g.fillRect(8, 24, 5, 8);
        g.fillStyle(0x7c3aed);
        g.fillCircle(13, 28, 1.5);

        g.generateTexture('darkmage', s, s);
        g.destroy();
    }

    generateProjectileTextures() {
        // Magic bolt
        let g = this.make.graphics({ add: false });
        g.fillStyle(0xa855f7);
        g.fillCircle(8, 8, 6);
        g.fillStyle(0xc084fc);
        g.fillCircle(8, 8, 3);
        g.fillStyle(0xffffff);
        g.fillCircle(8, 8, 1.5);
        g.generateTexture('bolt', 16, 16);
        g.destroy();

        // Enemy projectile
        g = this.make.graphics({ add: false });
        g.fillStyle(0xd4d4d8);
        g.fillCircle(8, 8, 5);
        g.fillStyle(0xe7e5e4);
        g.fillCircle(8, 8, 2.5);
        g.generateTexture('bone_bolt', 16, 16);
        g.destroy();

        // Dark orb
        g = this.make.graphics({ add: false });
        g.fillStyle(0x7c3aed);
        g.fillCircle(10, 10, 8);
        g.fillStyle(0xc084fc);
        g.fillCircle(10, 10, 4);
        g.fillStyle(0xffffff, 0.3);
        g.fillCircle(10, 10, 2);
        g.generateTexture('dark_orb', 20, 20);
        g.destroy();

        // Sword slash arc
        g = this.make.graphics({ add: false });
        g.lineStyle(3, 0xfbbf24, 0.8);
        g.beginPath();
        g.arc(32, 32, 28, -0.6, 0.6);
        g.strokePath();
        g.generateTexture('slash_arc', 64, 64);
        g.destroy();
    }

    generateGoldTexture() {
        const g = this.make.graphics({ add: false });
        // Coin
        g.fillStyle(0xd97706);
        g.fillCircle(8, 8, 7);
        g.fillStyle(0xfbbf24);
        g.fillCircle(8, 8, 6);
        g.fillStyle(0xfde68a);
        g.fillCircle(7, 7, 3);
        g.fillStyle(0x92400e);
        g.fillCircle(8, 8, 1.5);
        g.generateTexture('gold', 16, 16);
        g.destroy();
    }

    generateArenaTextures() {
        // Floor tile
        let g = this.make.graphics({ add: false });
        g.fillStyle(0x1a1a2e);
        g.fillRect(0, 0, 64, 64);
        g.lineStyle(1, 0x252547, 0.3);
        g.strokeRect(0, 0, 64, 64);
        g.strokeLineShape(new Phaser.Geom.Line(32, 0, 32, 64));
        g.strokeLineShape(new Phaser.Geom.Line(0, 32, 64, 32));
        g.generateTexture('floor_tile', 64, 64);
        g.destroy();

        // Wall
        g = this.make.graphics({ add: false });
        g.fillStyle(0x2d2d4e);
        g.fillRect(0, 0, 64, 64);
        g.lineStyle(2, 0x3d3d6e, 0.5);
        g.strokeRect(1, 1, 62, 62);
        g.fillStyle(0x1e1e3a);
        g.fillRect(4, 4, 56, 56);
        g.generateTexture('wall_tile', 64, 64);
        g.destroy();

        // Magic circle
        g = this.make.graphics({ add: false });
        g.lineStyle(2, 0x7c3aed, 0.15);
        g.strokeCircle(128, 128, 100);
        g.strokeCircle(128, 128, 70);
        g.strokeCircle(128, 128, 40);
        // Rune marks
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const x = 128 + Math.cos(a) * 85;
            const y = 128 + Math.sin(a) * 85;
            g.lineStyle(1, 0xa855f7, 0.1);
            g.strokeCircle(x, y, 6);
        }
        g.generateTexture('magic_circle', 256, 256);
        g.destroy();

        // Particle
        g = this.make.graphics({ add: false });
        g.fillStyle(0xffffff);
        g.fillCircle(4, 4, 4);
        g.generateTexture('particle', 8, 8);
        g.destroy();
    }
}
