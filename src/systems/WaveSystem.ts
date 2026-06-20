import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { BaseEnemy } from '../entities/BaseEnemy';
import { ENEMY_DEFS } from '../data/EnemyData';

export class WaveSystem {
  private scene: GameScene;
  currentWave = 0;
  private enemiesRemaining = 0;
  private spawnTimer = 0;
  private spawnsLeft = 0;
  private waveActive = false;
  private betweenWaves = false;
  private betweenTimer = 0;

  constructor(scene: GameScene) { this.scene = scene; }

  startWave(wave: number) {
    this.currentWave = wave;
    this.waveActive = true;
    const count = this.getEnemyCount(wave);
    this.enemiesRemaining = count;
    this.spawnsLeft = count;
    this.spawnTimer = 0;
    this.showWaveText();
  }

  update(_time: number, delta: number) {
    if (this.betweenWaves) {
      this.betweenTimer -= delta;
      if (this.betweenTimer <= 0) {
        this.betweenWaves = false;
        this.startWave(this.currentWave + 1);
      }
      return;
    }

    if (!this.waveActive) return;

    // Spawn enemies
    if (this.spawnsLeft > 0) {
      this.spawnTimer -= delta;
      if (this.spawnTimer <= 0) {
        this.spawnEnemy();
        this.spawnsLeft--;
        this.spawnTimer = 800;
      }
    }
  }

  enemyKilled() {
    this.enemiesRemaining--;
    if (this.enemiesRemaining <= 0 && this.spawnsLeft <= 0) {
      this.waveComplete();
    }
  }

  private waveComplete() {
    this.waveActive = false;
    this.betweenWaves = true;
    this.betweenTimer = 3000;
    // Heal player 10%
    const p = this.scene.player;
    p.health = Math.min(p.health + p.stats.maxHealth * 0.1, p.stats.maxHealth);
  }

  private spawnEnemy() {
    const types = this.getTypesForWave(this.currentWave);
    const typeId = types[Phaser.Math.Between(0, types.length - 1)];
    const def = ENEMY_DEFS[typeId];
    const mult = this.getMultiplier(this.currentWave);

    // Spawn at random edge
    const side = Phaser.Math.Between(0, 3);
    let x = 0, y = 0;
    switch (side) {
      case 0: x = Phaser.Math.Between(10, 350); y = 65; break;
      case 1: x = Phaser.Math.Between(10, 350); y = 555; break;
      case 2: x = 5; y = Phaser.Math.Between(65, 555); break;
      case 3: x = 355; y = Phaser.Math.Between(65, 555); break;
    }

    new BaseEnemy(this.scene, x, y, def, mult);
  }

  private getTypesForWave(w: number): string[] {
    if (w <= 5) return ['street'];
    if (w <= 10) return ['street', 'ninja'];
    if (w <= 15) return ['street', 'ninja', 'knight'];
    if (w <= 20) return ['street', 'ninja', 'knight', 'berserker'];
    return ['street', 'ninja', 'knight', 'berserker', 'elite'];
  }

  private getEnemyCount(w: number): number {
    return Math.min(3 + Math.floor(w * 0.7), 8);
  }

  private getMultiplier(w: number): number {
    if (w <= 30) return 1 + w * 0.05;
    return 1.5 + (w - 30) * 0.02 * Math.pow(1.01, w - 30);
  }

  private showWaveText() {
    const { width: w, height: h } = this.scene.cameras.main;
    const txt = this.scene.add.text(w / 2, h / 2 - 50, `Welle ${this.currentWave}`, {
      fontSize: '28px', color: '#ffcc00', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(50);
    this.scene.tweens.add({
      targets: txt, alpha: 0, y: h / 2 - 80, duration: 1500, onComplete: () => txt.destroy()
    });
  }
}
