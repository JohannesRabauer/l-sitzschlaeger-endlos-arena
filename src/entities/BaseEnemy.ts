import { GameScene } from '../scenes/GameScene';
import { EnemyDef } from '../data/EnemyData';

export class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
  declare scene: GameScene;
  def: EnemyDef;
  hp: number;
  maxHp: number;
  waveMultiplier: number;
  private attackCooldown = 0;
  private aiState: 'chase' | 'attack' | 'hit' | 'dead' = 'chase';
  private hitTimer = 0;

  constructor(scene: GameScene, x: number, y: number, def: EnemyDef, waveMultiplier: number) {
    super(scene, x, y, def.texture);
    this.def = def;
    this.waveMultiplier = waveMultiplier;
    this.maxHp = Math.floor(def.health * waveMultiplier);
    this.hp = this.maxHp;

    scene.add.existing(this as unknown as Phaser.GameObjects.GameObject);
    scene.physics.add.existing(this as unknown as Phaser.GameObjects.GameObject);
    this.setCollideWorldBounds(true);
    (this.body as Phaser.Physics.Arcade.Body).setSize(22, 22);
    scene.enemies.add(this as unknown as Phaser.GameObjects.GameObject);
  }

  update(_time: number, delta: number) {
    if (this.aiState === 'dead') return;

    if (this.hitTimer > 0) {
      this.hitTimer -= delta;
      if (this.hitTimer <= 0) this.aiState = 'chase';
      return;
    }

    if (this.attackCooldown > 0) this.attackCooldown -= delta;

    const player = this.scene.player;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    if (dist < this.def.attackRange && this.attackCooldown <= 0) {
      this.doAttack();
    } else {
      this.chase();
    }
  }

  private chase() {
    const speed = this.def.speed * Math.min(this.waveMultiplier, 3);
    this.scene.physics.moveToObject(this as unknown as Phaser.GameObjects.GameObject, this.scene.player, speed);
  }

  private doAttack() {
    this.aiState = 'attack';
    this.setVelocity(0, 0);
    this.attackCooldown = this.def.attackCooldown;
    this.scene.player.takeDamage(Math.floor(this.def.damage * this.waveMultiplier));
    this.aiState = 'chase';
  }

  takeDamage(amount: number, knockbackX: number, knockbackY: number) {
    this.hp -= amount;
    this.aiState = 'hit';
    this.hitTimer = 150;
    this.setVelocity(knockbackX, knockbackY);
    this.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => { if (this.active) this.clearTint(); });

    if (this.hp <= 0) {
      this.die();
    }
  }

  private die() {
    this.aiState = 'dead';
    this.scene.combatSystem.totalKills++;
    this.scene.lootSystem.spawnLoot(this.x, this.y, this.def);
    this.scene.player.addXP(Math.floor(this.def.xp * this.waveMultiplier));
    this.scene.player.specialCharge = Math.min(100, this.scene.player.specialCharge + 8 * this.scene.player.stats.chargeRate);
    this.scene.waveSystem.enemyKilled();
    this.destroy();
  }
}
