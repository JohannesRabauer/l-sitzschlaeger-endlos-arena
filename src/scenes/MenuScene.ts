import Phaser from 'phaser';
import { SaveManager } from '../utils/SaveManager';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    const { width: w, height: h } = this.cameras.main;
    const save = SaveManager.load();

    this.add.text(w / 2, h * 0.25, 'SITZSCHLÄGER', {
      fontSize: '28px', color: '#ffcc00', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(w / 2, h * 0.35, 'Endlos Arena', {
      fontSize: '18px', color: '#ffffff'
    }).setOrigin(0.5);

    if (save.player.highscore > 0) {
      this.add.text(w / 2, h * 0.45, `Rekord: Welle ${save.player.highscore}`, {
        fontSize: '14px', color: '#aaaaaa'
      }).setOrigin(0.5);
    }

    const btn = this.add.rectangle(w / 2, h * 0.6, 160, 50, 0x44aa44)
      .setInteractive({ useHandCursor: true });
    this.add.text(w / 2, h * 0.6, 'STARTEN', {
      fontSize: '20px', color: '#ffffff'
    }).setOrigin(0.5);
    btn.on('pointerdown', () => this.scene.start('Game'));

    this.add.text(w / 2, h * 0.85, `Münzen: ${save.player.coins}`, {
      fontSize: '14px', color: '#ffdd00'
    }).setOrigin(0.5);
  }
}
