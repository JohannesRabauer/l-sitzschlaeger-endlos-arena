import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { RARITY_COLORS } from '../data/WeaponData';

export class HUD {
  private scene: GameScene;
  private hpBar!: Phaser.GameObjects.Rectangle;
  private hpBg!: Phaser.GameObjects.Rectangle;
  private xpBar!: Phaser.GameObjects.Rectangle;
  private waveText!: Phaser.GameObjects.Text;
  private coinText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private specialBar!: Phaser.GameObjects.Rectangle;
  private weaponText!: Phaser.GameObjects.Text;

  constructor(scene: GameScene) {
    this.scene = scene;
    const d = 100;

    // HP bar
    this.hpBg = scene.add.rectangle(10, 10, 140, 14, 0x333333).setOrigin(0).setDepth(d).setScrollFactor(0);
    this.hpBar = scene.add.rectangle(11, 11, 138, 12, 0x44ff44).setOrigin(0).setDepth(d + 1).setScrollFactor(0);

    // XP bar
    scene.add.rectangle(10, 28, 140, 8, 0x222222).setOrigin(0).setDepth(d).setScrollFactor(0);
    this.xpBar = scene.add.rectangle(10, 28, 0, 8, 0x8888ff).setOrigin(0).setDepth(d + 1).setScrollFactor(0);

    // Texts
    this.waveText = scene.add.text(180, 5, '', { fontSize: '12px', color: '#fff' }).setOrigin(0.5, 0).setDepth(d).setScrollFactor(0);
    this.coinText = scene.add.text(350, 5, '', { fontSize: '11px', color: '#ffdd00' }).setOrigin(1, 0).setDepth(d).setScrollFactor(0);
    this.levelText = scene.add.text(155, 10, '', { fontSize: '10px', color: '#aaa' }).setOrigin(0).setDepth(d).setScrollFactor(0);
    this.weaponText = scene.add.text(180, 42, '', { fontSize: '10px', color: '#fff' }).setOrigin(0.5, 0).setDepth(d).setScrollFactor(0);

    // Special bar
    scene.add.rectangle(10, 40, 100, 8, 0x222222).setOrigin(0).setDepth(d).setScrollFactor(0);
    this.specialBar = scene.add.rectangle(10, 40, 0, 8, 0xffaa00).setOrigin(0).setDepth(d + 1).setScrollFactor(0);
  }

  update() {
    const p = this.scene.player;
    // HP
    const hpRatio = p.health / p.stats.maxHealth;
    this.hpBar.width = 138 * hpRatio;
    this.hpBar.fillColor = hpRatio > 0.5 ? 0x44ff44 : hpRatio > 0.25 ? 0xffaa00 : 0xff3333;

    // XP
    this.xpBar.width = 140 * (p.xp / p.xpToNext());

    // Special
    this.specialBar.width = p.specialCharge;

    // Texts
    this.waveText.setText(`Welle ${this.scene.waveSystem.currentWave}`);
    this.coinText.setText(`🪙 ${this.scene.lootSystem.coinsCollected}`);
    this.levelText.setText(`Lv.${p.level}`);

    const wColor = RARITY_COLORS[p.weapon.rarity];
    const invCount = p.inventory.length > 0 ? ` (+${p.inventory.length})` : '';
    this.weaponText.setText(`${p.weapon.def.name}${invCount}`).setColor(`#${wColor.toString(16).padStart(6, '0')}`);
  }
}
