import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() { super('Preload'); }

  preload() {
    const { width: w, height: h } = this.cameras.main;
    const fill = this.add.rectangle(w / 2, h / 2, 4, 16, 0x00ff88);
    this.add.rectangle(w / 2, h / 2, 200, 20, 0x333333).setDepth(-1);
    this.load.on('progress', (v: number) => {
      fill.width = 196 * v;
    });
    this.load.image('player', 'assets/charakter.png');
    this.generateTextures();
  }

  create() { this.scene.start('Menu'); }

  private generateTextures() {
    this.makeRect('enemy_street', 28, 28, 0xff4444);
    this.makeRect('enemy_ninja', 26, 26, 0x8844ff);
    this.makeRect('enemy_knight', 32, 32, 0x888888);
    this.makeRect('enemy_berserker', 30, 30, 0xff8800);
    this.makeRect('enemy_elite', 30, 30, 0xff00ff);
    this.makeRect('boss_steelking', 56, 56, 0xffdd00);
    this.makeCircle('coin', 12, 0xffff00);
    this.makeCircle('xp_orb', 10, 0x00ffcc);
    this.makeRect('crate', 16, 16, 0xaa8833);
    this.makeCircle('particle', 8, 0xffffff);
    this.makeCircle('btn_attack', 50, 0xff3333);
    this.makeCircle('btn_dodge', 50, 0x3399ff);
    this.makeCircle('btn_special', 50, 0xffaa00);
    this.makeCircle('joystick_base', 100, 0x333333);
    this.makeCircle('joystick_thumb', 50, 0x666666);
  }

  private makeRect(key: string, w: number, h: number, color: number) {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(color); g.fillRect(0, 0, w, h);
    g.generateTexture(key, w, h); g.destroy();
  }

  private makeCircle(key: string, size: number, color: number) {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(color); g.fillCircle(size / 2, size / 2, size / 2);
    g.generateTexture(key, size, size); g.destroy();
  }
}
