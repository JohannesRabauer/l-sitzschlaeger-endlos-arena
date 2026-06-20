import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { BaseEnemy } from '../entities/BaseEnemy';

export class CombatSystem {
  private scene: GameScene;
  totalKills = 0;

  constructor(scene: GameScene) { this.scene = scene; }

  update(_time: number, _delta: number) {
    // Combat logic runs via direct calls
  }

  playerAttack(hx: number, hy: number, hitWidth: number, damage: number) {
    const enemies = this.scene.enemies.getChildren() as unknown as BaseEnemy[];
    let hitCount = 0;

    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(hx, hy, enemy.x, enemy.y);
      if (dist < hitWidth) {
        // Knockback direction
        const angle = Math.atan2(enemy.y - this.scene.player.y, enemy.x - this.scene.player.x);
        const kb = this.scene.player.weapon.def.knockback;
        enemy.takeDamage(damage, Math.cos(angle) * kb, Math.sin(angle) * kb);

        // Damage number
        this.showDamageNumber(enemy.x, enemy.y - 20, damage);

        // Hit particles
        this.spawnHitParticles(enemy.x, enemy.y);
        hitCount++;
      }
    }

    // Hitstop effect
    if (hitCount > 0) {
      this.scene.time.timeScale = 0.1;
      this.scene.time.delayedCall(50, () => { this.scene.time.timeScale = 1; });
    }
  }

  private showDamageNumber(x: number, y: number, damage: number) {
    const color = damage > 20 ? '#ffdd00' : '#ffffff';
    const txt = this.scene.add.text(x, y, `${damage}`, {
      fontSize: damage > 20 ? '16px' : '12px', color, fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(40);

    this.scene.tweens.add({
      targets: txt, y: y - 30, alpha: 0, duration: 800,
      ease: 'Power2', onComplete: () => txt.destroy()
    });
  }

  private spawnHitParticles(x: number, y: number) {
    const emitter = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.8, end: 0 },
      lifespan: 300,
      quantity: 5,
      emitting: false,
    });
    emitter.explode(5);
    this.scene.time.delayedCall(400, () => emitter.destroy());
  }
}
