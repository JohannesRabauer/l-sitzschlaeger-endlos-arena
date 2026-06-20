import { GameScene } from '../scenes/GameScene';

export class InputSystem {
  private scene: GameScene;
  moveX = 0;
  moveY = 0;

  // Joystick
  private joystickBase!: Phaser.GameObjects.Image;
  private joystickThumb!: Phaser.GameObjects.Image;
  private joystickPointer: Phaser.Input.Pointer | null = null;
  private joystickActive = false;

  // Buttons
  private attackBtn!: Phaser.GameObjects.Image;
  private dodgeBtn!: Phaser.GameObjects.Image;
  private specialBtn!: Phaser.GameObjects.Image;

  // Keyboard
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.createJoystick();
    this.createButtons();
    this.setupKeyboard();
  }

  private createJoystick() {
    const y = 580;
    this.joystickBase = this.scene.add.image(80, y, 'joystick_base').setAlpha(0.4).setDepth(100).setScrollFactor(0);
    this.joystickThumb = this.scene.add.image(80, y, 'joystick_thumb').setAlpha(0.6).setDepth(101).setScrollFactor(0);

    this.scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.x < 180 && p.y > 500 && !this.joystickActive) {
        this.joystickActive = true;
        this.joystickPointer = p;
        this.joystickBase.setPosition(p.x, p.y).setAlpha(0.5);
        this.joystickThumb.setPosition(p.x, p.y).setAlpha(0.8);
      }
    });

    this.scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.joystickActive && p === this.joystickPointer) {
        const dx = p.x - this.joystickBase.x;
        const dy = p.y - this.joystickBase.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 40;
        const clampedDist = Math.min(dist, maxDist);
        const angle = Math.atan2(dy, dx);
        this.joystickThumb.setPosition(
          this.joystickBase.x + Math.cos(angle) * clampedDist,
          this.joystickBase.y + Math.sin(angle) * clampedDist
        );
        this.moveX = (clampedDist / maxDist) * Math.cos(angle);
        this.moveY = (clampedDist / maxDist) * Math.sin(angle);
      }
    });

    this.scene.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (p === this.joystickPointer) {
        this.joystickActive = false;
        this.joystickPointer = null;
        this.joystickThumb.setPosition(this.joystickBase.x, this.joystickBase.y);
        this.moveX = 0;
        this.moveY = 0;
      }
    });
  }

  private createButtons() {
    const x = 310;
    this.attackBtn = this.scene.add.image(x, 540, 'btn_attack').setDepth(100).setScrollFactor(0).setInteractive();
    this.dodgeBtn = this.scene.add.image(x, 590, 'btn_dodge').setDepth(100).setScrollFactor(0).setInteractive().setScale(0.7);
    this.specialBtn = this.scene.add.image(x - 55, 565, 'btn_special').setDepth(100).setScrollFactor(0).setInteractive().setScale(0.65);

    this.attackBtn.on('pointerdown', () => this.scene.player.attack());
    this.dodgeBtn.on('pointerdown', () => this.scene.player.dodge());
    this.specialBtn.on('pointerdown', () => this.scene.player.special());
  }

  private setupKeyboard() {
    if (!this.scene.input.keyboard) return;
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.wasd = {
      w: this.scene.input.keyboard.addKey('W'),
      a: this.scene.input.keyboard.addKey('A'),
      s: this.scene.input.keyboard.addKey('S'),
      d: this.scene.input.keyboard.addKey('D'),
      space: this.scene.input.keyboard.addKey('SPACE'),
      shift: this.scene.input.keyboard.addKey('SHIFT'),
      e: this.scene.input.keyboard.addKey('E'),
    };
  }

  update() {
    if (!this.joystickActive && this.scene.input.keyboard) {
      let mx = 0, my = 0;
      if (this.cursors.left.isDown || this.wasd.a.isDown) mx = -1;
      if (this.cursors.right.isDown || this.wasd.d.isDown) mx = 1;
      if (this.cursors.up.isDown || this.wasd.w.isDown) my = -1;
      if (this.cursors.down.isDown || this.wasd.s.isDown) my = 1;
      this.moveX = mx;
      this.moveY = my;

      if (Phaser.Input.Keyboard.JustDown(this.wasd.space)) this.scene.player.attack();
      if (Phaser.Input.Keyboard.JustDown(this.wasd.shift)) this.scene.player.dodge();
      if (Phaser.Input.Keyboard.JustDown(this.wasd.e)) this.scene.player.special();
    }
  }
}
