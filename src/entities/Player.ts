import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { PlayerStats } from '../data/UpgradeData';
import { WeaponInstance, RARITY_MULTIPLIER, WEAPONS, Rarity } from '../data/WeaponData';

export class Player extends Phaser.Physics.Arcade.Sprite {
  scene!: GameScene;
  stats: PlayerStats = {
    maxHealth: 100, attackSpeed: 1, damage: 0, speed: 160,
    luck: 0, armor: 0, chargeRate: 1, pickupRadius: 60,
  };
  health: number = 100;
  weapon: WeaponInstance = { def: WEAPONS[0], rarity: Rarity.Common };
  xp: number = 0;
  level: number = 1;
  specialCharge: number = 0;
  comboCount: number = 0;

  private isAttacking = false;
  private isDodging = false;
  private isHit = false;
  private attackTimer = 0;
  private dodgeTimer = 0;
  private hitTimer = 0;
  private invincibleTimer = 0;
  private facingX = 0;
  private facingY = 1;

  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setScale(0.06); // charakter.png is large, scale to ~54px height
    (this.body as Phaser.Physics.Arcade.Body).setSize(400, 500);
    (this.body as Phaser.Physics.Arcade.Body).setOffset(250, 300);
  }

  update(_time: number, delta: number) {
    if (this.health <= 0) return;

    // Timers
    if (this.attackTimer > 0) this.attackTimer -= delta;
    if (this.dodgeTimer > 0) {
      this.dodgeTimer -= delta;
      if (this.dodgeTimer <= 0) this.isDodging = false;
    }
    if (this.hitTimer > 0) {
      this.hitTimer -= delta;
      if (this.hitTimer <= 0) this.isHit = false;
    }
    if (this.invincibleTimer > 0) this.invincibleTimer -= delta;

    // Visual feedback
    this.setAlpha(this.invincibleTimer > 0 ? 0.5 : 1);

    if (this.isHit || this.isDodging) return;

    // Movement from InputSystem
    const input = this.scene.inputSystem;
    const vx = input.moveX * this.stats.speed;
    const vy = input.moveY * this.stats.speed;
    this.setVelocity(this.isAttacking ? vx * 0.3 : vx, this.isAttacking ? vy * 0.3 : vy);

    if (input.moveX !== 0 || input.moveY !== 0) {
      this.facingX = input.moveX;
      this.facingY = input.moveY;
    }
  }

  attack(): boolean {
    if (this.isAttacking || this.isDodging || this.isHit || this.attackTimer > 0) return false;
    this.isAttacking = true;
    const atkDuration = 200 / (this.weapon.def.attackSpeed * this.stats.attackSpeed);
    const cooldown = (1000 / (this.weapon.def.attackSpeed * this.stats.attackSpeed));
    this.comboCount++;

    // Create hitbox
    const angle = Math.atan2(this.facingY, this.facingX || 0.001);
    const hx = this.x + Math.cos(angle) * this.weapon.def.range;
    const hy = this.y + Math.sin(angle) * this.weapon.def.range;
    this.scene.combatSystem.playerAttack(hx, hy, this.weapon.def.hitWidth, this.getDamage());

    this.scene.time.delayedCall(atkDuration, () => { this.isAttacking = false; });
    this.attackTimer = cooldown;

    // Reset combo after delay
    this.scene.time.delayedCall(400, () => { if (!this.isAttacking) this.comboCount = 0; });
    return true;
  }

  dodge() {
    if (this.isDodging || this.isHit) return;
    this.isDodging = true;
    this.invincibleTimer = 300;
    this.dodgeTimer = 300;
    const angle = Math.atan2(this.facingY || 0, this.facingX || 1);
    this.setVelocity(Math.cos(angle) * 350, Math.sin(angle) * 350);
  }

  special() {
    if (this.specialCharge < 100 || this.isDodging || this.isHit) return;
    this.specialCharge = 0;
    // AoE attack around player
    this.scene.combatSystem.playerAttack(this.x, this.y, 80, this.getDamage() * 2);
    this.scene.cameras.main.shake(150, 0.01);
  }

  takeDamage(amount: number) {
    if (this.invincibleTimer > 0 || this.isDodging) return;
    const reduced = amount * (1 - this.stats.armor / 100);
    this.health -= reduced;
    this.isHit = true;
    this.hitTimer = 200;
    this.invincibleTimer = 500;
    this.scene.cameras.main.shake(60, 0.005);
    if (this.health <= 0) {
      this.health = 0;
      this.setVelocity(0, 0);
      this.scene.time.delayedCall(500, () => this.scene.gameOver());
    }
  }

  addXP(amount: number) {
    this.xp += amount;
    const needed = this.xpToNext();
    if (this.xp >= needed) {
      this.xp -= needed;
      this.level++;
      this.scene.scene.pause('Game');
      this.scene.scene.launch('LevelUp', {
        level: this.level,
        onSelect: (u: any) => { u.apply(this.stats); this.health = Math.min(this.health + 20, this.stats.maxHealth); }
      });
    }
  }

  xpToNext(): number {
    return Math.floor(100 * Math.pow(this.level, 1.3));
  }

  private getDamage(): number {
    const base = this.weapon.def.baseDamage;
    const rarityMult = RARITY_MULTIPLIER[this.weapon.rarity];
    const comboMult = this.comboCount >= 3 ? 1.5 : 1;
    const crit = Math.random() * 100 < (5 + this.weapon.def.critBonus) ? 2 : 1;
    return Math.floor((base * rarityMult * comboMult * crit) + this.stats.damage);
  }
}
