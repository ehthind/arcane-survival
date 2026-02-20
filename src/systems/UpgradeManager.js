export class UpgradeManager {
    constructor(game) {
        this.game = game;
        this.purchased = {}; // upgradeId -> tier (0 = not bought, 1-3 = tier)

        this.upgrades = {
            wizard: [
                {
                    id: 'arcane_power', name: 'Arcane Power', icon: '🔮',
                    desc: ['Projectile damage +25%', 'Projectile damage +50%', 'Projectile damage +75%'],
                    cost: [30, 60, 100],
                    color: '#a855f7',
                },
                {
                    id: 'rapid_fire', name: 'Rapid Fire', icon: '⚡',
                    desc: ['Attack speed +20%', 'Attack speed +40%', 'Attack speed +60%'],
                    cost: [25, 55, 90],
                    color: '#3b82f6',
                },
                {
                    id: 'piercing_bolts', name: 'Piercing Bolts', icon: '🏹',
                    desc: ['Bolts pierce 1 enemy', 'Bolts pierce 2 enemies', 'Bolts pierce 3 enemies'],
                    cost: [40, 80, 130],
                    color: '#06b6d4',
                },
                {
                    id: 'mana_surge', name: 'Mana Surge', icon: '💧',
                    desc: ['Mana regen +30%', 'Mana regen +60%', 'Mana regen +90%'],
                    cost: [20, 45, 75],
                    color: '#6366f1',
                },
                {
                    id: 'frost_mastery', name: 'Frost Mastery', icon: '❄️',
                    desc: ['Nova +30% radius, +1s freeze', 'Nova +60% radius, +2s freeze', 'Nova +90% radius, +3s freeze'],
                    cost: [35, 70, 110],
                    color: '#93c5fd',
                },
                {
                    id: 'chain_lightning', name: 'Chain Lightning', icon: '⛓️',
                    desc: ['Bolts chain to 1 enemy', 'Bolts chain to 2 enemies', 'Bolts chain to 3 enemies'],
                    cost: [50, 100, 160],
                    color: '#facc15',
                },
                {
                    id: 'arcane_shield', name: 'Arcane Shield', icon: '🛡️',
                    desc: ['Shield absorbs 15 dmg', 'Shield absorbs 25 dmg', 'Shield absorbs 40 dmg'],
                    cost: [45, 85, 140],
                    color: '#c084fc',
                },
                {
                    id: 'meteor_storm', name: 'Meteor Storm', icon: '☄️',
                    desc: ['Special fires 3 meteors', 'Special fires 5 meteors', 'Special fires 8 meteors'],
                    cost: [60, 120, 180],
                    color: '#f97316',
                },
                {
                    id: 'time_warp', name: 'Time Warp', icon: '⏳',
                    desc: ['15% slow aura', '25% slow aura', '40% slow aura'],
                    cost: [40, 90, 150],
                    color: '#8b5cf6',
                },
            ],
            warrior: [
                {
                    id: 'sharpened_blade', name: 'Sharpened Blade', icon: '⚔️',
                    desc: ['Melee damage +25%', 'Melee damage +50%', 'Melee damage +75%'],
                    cost: [30, 60, 100],
                    color: '#ef4444',
                },
                {
                    id: 'battle_fury', name: 'Battle Fury', icon: '🔥',
                    desc: ['Attack speed +20%', 'Attack speed +40%', 'Attack speed +60%'],
                    cost: [25, 55, 90],
                    color: '#f97316',
                },
                {
                    id: 'vampiric_strike', name: 'Vampiric Strike', icon: '🩸',
                    desc: ['Heal 5% of damage dealt', 'Heal 10% of damage dealt', 'Heal 15% of damage dealt'],
                    cost: [40, 80, 130],
                    color: '#dc2626',
                },
                {
                    id: 'iron_fortress', name: 'Iron Fortress', icon: '🏰',
                    desc: ['+20 max HP & heal', '+35 max HP & heal', '+50 max HP & heal'],
                    cost: [20, 45, 75],
                    color: '#6b7280',
                },
                {
                    id: 'earthquake', name: 'Earthquake', icon: '🌋',
                    desc: ['Slam radius +30%', 'Slam radius +60%', 'Slam radius +90%'],
                    cost: [35, 70, 110],
                    color: '#92400e',
                },
                {
                    id: 'whirlwind', name: 'Whirlwind', icon: '🌀',
                    desc: ['Sweep arc 180°', 'Sweep arc 270°', 'Sweep arc 360°'],
                    cost: [50, 100, 160],
                    color: '#0ea5e9',
                },
                {
                    id: 'thorns_armor', name: 'Thorns Armor', icon: '🌵',
                    desc: ['Reflect 10% contact damage', 'Reflect 20% contact damage', 'Reflect 35% contact damage'],
                    cost: [45, 85, 140],
                    color: '#22c55e',
                },
                {
                    id: 'berserker_rage', name: 'Berserker Rage', icon: '😤',
                    desc: ['+1% dmg per 1% missing HP', '+1.5% dmg per 1% HP', '+2% dmg per 1% HP'],
                    cost: [60, 120, 180],
                    color: '#b91c1c',
                },
                {
                    id: 'war_cry', name: 'War Cry', icon: '📯',
                    desc: ['Stun enemies every 8s', 'Stun enemies every 6s', 'Stun enemies every 4s'],
                    cost: [40, 90, 150],
                    color: '#eab308',
                },
            ],
        };
    }

    getTier(upgradeId) {
        return this.purchased[upgradeId] || 0;
    }

    getAvailableUpgrades(className) {
        const classUpgrades = this.upgrades[className] || [];
        return classUpgrades.filter(u => this.getTier(u.id) < 3);
    }

    getRandomUpgrades(className, count = 3) {
        const available = this.getAvailableUpgrades(className);
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    getCost(upgrade) {
        const tier = this.getTier(upgrade.id);
        if (tier >= 3) return Infinity;
        return upgrade.cost[tier];
    }

    canAfford(upgrade) {
        return this.game.player.gold >= this.getCost(upgrade);
    }

    purchase(upgrade) {
        const cost = this.getCost(upgrade);
        if (!this.canAfford(upgrade)) return false;

        const player = this.game.player;
        player.gold -= cost;
        const newTier = this.getTier(upgrade.id) + 1;
        this.purchased[upgrade.id] = newTier;

        this.applyUpgrade(upgrade.id, newTier);
        return true;
    }

    applyUpgrade(upgradeId, tier) {
        const player = this.game.player;

        switch (upgradeId) {
            // === WIZARD ===
            case 'arcane_power':
                player.damageMultiplier = 1 + tier * 0.25;
                break;
            case 'rapid_fire':
                player.attackRate = player.baseAttackRate * (1 - tier * 0.2);
                break;
            case 'piercing_bolts':
                player.pierceCount = tier;
                break;
            case 'mana_surge':
                player.manaRegen = player.baseManaRegen * (1 + tier * 0.3);
                break;
            case 'frost_mastery':
                player.frostRadiusMult = 1 + tier * 0.3;
                player.frostDurationBonus = tier * 1;
                break;
            case 'chain_lightning':
                player.chainCount = tier;
                break;
            case 'arcane_shield':
                player.shieldMax = [0, 15, 25, 40][tier];
                player.shield = player.shieldMax;
                break;
            case 'meteor_storm':
                player.meteorCount = [0, 3, 5, 8][tier];
                break;
            case 'time_warp':
                player.slowAura = [0, 0.15, 0.25, 0.40][tier];
                break;

            // === WARRIOR ===
            case 'sharpened_blade':
                player.damageMultiplier = 1 + tier * 0.25;
                break;
            case 'battle_fury':
                player.attackRate = player.baseAttackRate * (1 - tier * 0.2);
                break;
            case 'vampiric_strike':
                player.lifesteal = tier * 0.05;
                break;
            case 'iron_fortress': {
                const hpBonus = [0, 20, 35, 50][tier];
                const baseMax = player.baseMaxHealth || player.baseMaxHP || 120;
                player.maxHealth = baseMax + hpBonus;
                // GameScene will read maxHealth and apply it to the sprite
                break;
            }
            case 'earthquake':
                player.slamRadiusMult = 1 + tier * 0.3;
                break;
            case 'whirlwind':
                player.swordArc = [Math.PI * 0.8, Math.PI, Math.PI * 1.5, Math.PI * 2][tier];
                break;
            case 'thorns_armor':
                player.thornsReflect = [0, 0.10, 0.20, 0.35][tier];
                break;
            case 'berserker_rage':
                player.berserkerMult = [0, 1, 1.5, 2][tier];
                break;
            case 'war_cry':
                player.warCryInterval = [0, 8, 6, 4][tier];
                if (!player.warCryTimer) player.warCryTimer = 0;
                break;
        }
    }

    reset() {
        this.purchased = {};
    }
}
