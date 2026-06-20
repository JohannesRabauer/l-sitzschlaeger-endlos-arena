import Phaser from 'phaser';
import { UPGRADES, Upgrade } from '../data/UpgradeData';

export class LevelUpScene extends Phaser.Scene {
  constructor() { super('LevelUp'); }

  create(data: { level: number; onSelect: (u: Upgrade) => void }) {
    const { width: w, height: h } = this.cameras.main;

    this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7);
    this.add.text(w / 2, 80, `LEVEL ${data.level}!`, {
      fontSize: '24px', color: '#ffcc00'
    }).setOrigin(0.5);

    const choices = Phaser.Utils.Array.Shuffle([...UPGRADES]).slice(0, 3);

    choices.forEach((upgrade, i) => {
      const y = 160 + i * 80;
      const card = this.add.rectangle(w / 2, y, 300, 65, 0x2a2a4a)
        .setInteractive({ useHandCursor: true });
      this.add.text(w / 2, y - 10, `${upgrade.icon} ${upgrade.name}`, {
        fontSize: '15px', color: '#ffffff'
      }).setOrigin(0.5);
      this.add.text(w / 2, y + 14, upgrade.description, {
        fontSize: '11px', color: '#aaaaaa'
      }).setOrigin(0.5);

      card.on('pointerdown', () => {
        data.onSelect(upgrade);
        this.scene.stop();
        this.scene.resume('Game');
      });
    });
  }
}
