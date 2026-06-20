import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { PlayerStats } from '../data/UpgradeData';
import { WeaponInstance, RARITY_MULTIPLIER, WEAPONS, Rarity } from '../data/WeaponData';

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare scene: GameScene;
  stats: PlayerStats = {
    maxHealth: 100, attackSpeed: 1, damage: 0, speed: 160,
    luck: 0, armor: 0, chargeRate: 1, pickupRadius: 60,
  };
  health: number = 100;
  weapon: WeaponInstance = { def: WEAPONS[0], rarity: Rarity.Common };
  inventory: WeaponInstance[] = []; // collected weapons
  xp: number = 0;
  level: number = 1;
  specialCharge: number = 0;
  comboCount: number = 0;

  private isAttacking = false;
  private isDodging = false;
  private isHit = false;
  private attackCooldown = 0; // only cooldown, no "isAttacking" blocking
  private dodgeTimer = 0;
  private dodgeCooldown = 0;
  private hitTimer = 0;
  private invincibleTimer = 0;
  facingX = 0;
  facingY = 1;

  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setScale(0.06);
    (this.body as Phaser.Physics.Arcade.Body).setSize(400, 500);
    (this.body as Phaser.Physics.Arcade.Body).setOffset(250, 300);
  }

  update(_time: number, delta: number) {
    if (this.health <= 0) return;

    // Timers
    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    if (this.dodgeCooldown > 0) this.dodgeCooldown -= delta;
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

    if (this.isHit) return;
    if (this.isDodging) return;

    // Movement
    const input = this.scene.inputSystem;
    const speed = this.stats.speed;
    const vx = input.moveX * speed;
    const vy = input.moveY * speed;
    this.setVelocity(this.isAttacking ? vx * 0.5 : vx, this.isAttacking ? vy * 0.5 : vy);

    if (input.moveX !== 0 || input.moveY !== 0) {
      this.facingX = input.moveX;
      this.facingY = input.moveY;
    }

    // Auto-end attack state
    if (this.isAttacking && this.attackCooldown <= 0) {
      this.isAttacking = false;
    }
  }

  attack(): boolean {
    if (this.isDodging || this.isHit) return false;
    if (this.attackCooldown > 0) return false; // only cooldown blocks

    this.isAttacking = true;
    this.comboCount++;

    // Cooldown based on weapon speed (faster = shorter cooldown)
    const cooldown = 300 / (this.weapon.def.attackSpeed * this.stats.attackSpeed);
    this.attackCooldown = cooldown;

    // Hitbox
    const angle = Math.atan2(this.facingY || 0.001, this.facingX || 0.001);
    const hx = this.x + Math.cos(angle) * this.weapon.def.range;
    const hy = this.y + Math.sin(angle) * this.weapon.def.range;
    this.scene.combatSystem.playerAttack(hx, hy, this.weapon.def.hitWidth, this.getDamage());

    // Reset combo if idle too long
    this.scene.time.delayedCall(600, () => { if (this.attackCooldown <= 0) this.comboCount = 0; });
    return true;
  }

  dodge() {
    if (this.isDodging || this.isHit || this.dodgeCooldown > 0) return;
    this.isDodging = true;
    this.invincibleTimer = 300;
    this.dodgeTimer = 300;
    this.dodgeCooldown = 600;
    const angle = Math.atan2(this.facingY || 0, this.facingX || 1);
    this.setVelocity(Math.cos(angle) * 350, Math.sin(angle) * 350);
  }

  special() {
    if (this.specialCharge < 100 || this.isDodging || this.isHit) return;
    this.specialCharge = 0;
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

  /** Cycle through collected weapons */
  cycleWeapon() {
    if (this.inventory.length === 0) return;
    // Move current weapon to end of inventory, take first from inventory
    this.inventory.push(this.weapon);
    this.weapon = this.inventory.shift()!;
  }

  /** Add weapon to inventory (max 3 stored) */
  addWeapon(weapon: WeaponInstance) {
    if (this.inventory.length < 3) {
      this.inventory.push(weapon);
    } else {
      // Replace worst weapon in inventory
      const worst = this.inventory.reduce((min, w, i) => w.rarity < this.inventory[min].rarity ? i : min, 0);
      if (weapon.rarity >= this.inventory[worst].rarity) {
        this.inventory[worst] = weapon;
      }
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
