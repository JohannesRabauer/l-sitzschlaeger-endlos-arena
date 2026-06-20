import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { EnemyDef } from '../data/EnemyData';
import { createWeapon, rollRarity, RARITY_COLORS, WeaponInstance } from '../data/WeaponData';

export class LootSystem {
  private scene: GameScene;
  coinsCollected = 0;

  constructor(scene: GameScene) { this.scene = scene; }

  spawnLoot(x: number, y: number, enemyDef: EnemyDef) {
    // Coins
    const coinCount = Phaser.Math.Between(1, enemyDef.coinDrop);
    for (let i = 0; i < coinCount; i++) {
      const coin = this.scene.physics.add.sprite(
        x + Phaser.Math.Between(-15, 15),
        y + Phaser.Math.Between(-15, 15),
        'coin'
      ).setDepth(5);
      (coin as any).lootType = 'coin';
      this.scene.lootGroup.add(coin);
      this.scene.tweens.add({ targets: coin, y: coin.y - 10, yoyo: true, duration: 300 });
    }

    // XP orb
    const xpOrb = this.scene.physics.add.sprite(x, y + 5, 'xp_orb').setDepth(5);
    (xpOrb as any).lootType = 'xp';
    (xpOrb as any).xpValue = enemyDef.xp;
    this.scene.lootGroup.add(xpOrb);

    // Weapon drop (20% chance)
    if (Math.random() < 0.2) {
      const rarity = rollRarity(this.scene.player.stats.luck);
      const weapon = createWeapon(rarity);
      const crate = this.scene.physics.add.sprite(x, y - 10, 'crate').setDepth(5);
      crate.setTint(RARITY_COLORS[rarity]);
      (crate as any).lootType = 'weapon';
      (crate as any).weapon = weapon;
      this.scene.lootGroup.add(crate);

      // Blink before despawn
      this.scene.time.delayedCall(7000, () => {
        if (crate.active) {
          this.scene.tweens.add({ targets: crate, alpha: 0.3, yoyo: true, repeat: 5, duration: 200, onComplete: () => { if (crate.active) crate.destroy(); } });
        }
      });
    }
  }

  collect(loot: Phaser.Physics.Arcade.Sprite) {
    const type = (loot as any).lootType;
    switch (type) {
      case 'coin':
        this.coinsCollected++;
        break;
      case 'xp':
        this.scene.player.addXP((loot as any).xpValue);
        break;
      case 'weapon':
        this.equipWeapon((loot as any).weapon);
        break;
    }
    loot.destroy();
  }

  private equipWeapon(weapon: WeaponInstance) {
    // Auto-equip if better rarity
    if (weapon.rarity >= this.scene.player.weapon.rarity) {
      this.scene.player.weapon = weapon;
    }
  }
}
