import Phaser from 'phaser';
import { SaveManager } from '../utils/SaveManager';

export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  create(data: { wave: number; kills: number; coins: number }) {
    const { width: w, height: h } = this.cameras.main;
    const save = SaveManager.load();

    save.player.coins += data.coins;
    save.player.totalKills += data.kills;
    save.player.totalRuns += 1;
    if (data.wave > save.player.highscore) save.player.highscore = data.wave;
    SaveManager.save(save);

    this.add.text(w / 2, h * 0.2, 'GAME OVER', { fontSize: '32px', color: '#ff4444' }).setOrigin(0.5);
    this.add.text(w / 2, h * 0.35, `Welle: ${data.wave}`, { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
    this.add.text(w / 2, h * 0.42, `Besiegt: ${data.kills}`, { fontSize: '14px', color: '#aaa' }).setOrigin(0.5);
    this.add.text(w / 2, h * 0.49, `Münzen: +${data.coins}`, { fontSize: '14px', color: '#ffdd00' }).setOrigin(0.5);
    this.add.text(w / 2, h * 0.56, `Rekord: Welle ${save.player.highscore}`, { fontSize: '14px', color: '#88ff88' }).setOrigin(0.5);

    const retry = this.add.rectangle(w / 2, h * 0.72, 160, 50, 0x44aa44).setInteractive({ useHandCursor: true });
    this.add.text(w / 2, h * 0.72, 'NOCHMAL', { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
    retry.on('pointerdown', () => this.scene.start('Game'));

    const menu = this.add.rectangle(w / 2, h * 0.84, 160, 40, 0x444444).setInteractive({ useHandCursor: true });
    this.add.text(w / 2, h * 0.84, 'MENÜ', { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
    menu.on('pointerdown', () => this.scene.start('Menu'));
  }
}
