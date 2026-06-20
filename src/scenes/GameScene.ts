import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { InputSystem } from '../systems/InputSystem';
import { WaveSystem } from '../systems/WaveSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { LootSystem } from '../systems/LootSystem';
import { HUD } from '../ui/HUD';

export class GameScene extends Phaser.Scene {
  player!: Player;
  inputSystem!: InputSystem;
  waveSystem!: WaveSystem;
  combatSystem!: CombatSystem;
  lootSystem!: LootSystem;
  hud!: HUD;
  enemies!: Phaser.Physics.Arcade.Group;
  lootGroup!: Phaser.Physics.Arcade.Group;

  constructor() { super('Game'); }

  create() {
    this.physics.world.setBounds(0, 60, 360, 500);
    this.enemies = this.physics.add.group();
    this.lootGroup = this.physics.add.group();

    this.player = new Player(this, 180, 350);
    this.inputSystem = new InputSystem(this);
    this.combatSystem = new CombatSystem(this);
    this.waveSystem = new WaveSystem(this);
    this.lootSystem = new LootSystem(this);
    this.hud = new HUD(this);

    this.physics.add.collider(this.player, this.enemies);
    this.physics.add.overlap(this.player, this.lootGroup, (_p, loot) => {
      this.lootSystem.collect(loot as Phaser.Physics.Arcade.Sprite);
    });

    this.waveSystem.startWave(1);
  }

  update(time: number, delta: number) {
    this.inputSystem.update();
    this.player.update(time, delta);
    this.waveSystem.update(time, delta);
    this.combatSystem.update(time, delta);
    this.hud.update();
    this.enemies.getChildren().forEach(e => {
      if ((e as any).active) (e as any).update(time, delta);
    });
  }

  gameOver() {
    this.scene.start('GameOver', {
      wave: this.waveSystem.currentWave,
      kills: this.combatSystem.totalKills,
      coins: this.lootSystem.coinsCollected
    });
  }
}
