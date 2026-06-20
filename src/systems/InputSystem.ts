import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';

export class InputSystem {
  private scene: GameScene;
  moveX = 0;
  moveY = 0;

  // Joystick
  private joystickBase!: Phaser.GameObjects.Image;
  private joystickThumb!: Phaser.GameObjects.Image;
  private joystickPointerId: number = -1;
  private joystickOrigin = { x: 80, y: 580 };

  // Buttons
  private attackBtn!: Phaser.GameObjects.Image;
  private dodgeBtn!: Phaser.GameObjects.Image;
  private specialBtn!: Phaser.GameObjects.Image;
  private weaponLabel!: Phaser.GameObjects.Text;

  // Auto-attack on hold
  private attackHeld = false;
  private attackRepeatTimer = 0;

  // Keyboard
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;

  constructor(scene: GameScene) {
    this.scene = scene;
    this.createJoystick();
    this.createButtons();
    this.setupKeyboard();
  }

  private createJoystick() {
    const { x, y } = this.joystickOrigin;
    this.joystickBase = this.scene.add.image(x, y, 'joystick_base')
      .setAlpha(0.3).setDepth(100).setScrollFactor(0);
    this.joystickThumb = this.scene.add.image(x, y, 'joystick_thumb')
      .setAlpha(0.5).setDepth(101).setScrollFactor(0);

    // Use pointer events with ID tracking
    this.scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      // Left half of screen = joystick zone
      if (p.x < 200 && this.joystickPointerId === -1) {
        this.joystickPointerId = p.id;
        this.joystickOrigin = { x: p.x, y: p.y };
        this.joystickBase.setPosition(p.x, p.y).setAlpha(0.5);
        this.joystickThumb.setPosition(p.x, p.y).setAlpha(0.8);
      }
    });

    this.scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.id === this.joystickPointerId && p.isDown) {
        const dx = p.x - this.joystickOrigin.x;
        const dy = p.y - this.joystickOrigin.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 45;
        const clamped = Math.min(dist, maxDist);
        const angle = Math.atan2(dy, dx);

        this.joystickThumb.setPosition(
          this.joystickOrigin.x + Math.cos(angle) * clamped,
          this.joystickOrigin.y + Math.sin(angle) * clamped
        );

        // Dead zone: ignore tiny movements
        if (dist > 8) {
          this.moveX = (clamped / maxDist) * Math.cos(angle);
          this.moveY = (clamped / maxDist) * Math.sin(angle);
        } else {
          this.moveX = 0;
          this.moveY = 0;
        }
      }
    });

    this.scene.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (p.id === this.joystickPointerId) {
        this.joystickPointerId = -1;
        this.moveX = 0;
        this.moveY = 0;
        this.joystickBase.setPosition(80, 580).setAlpha(0.3);
        this.joystickThumb.setPosition(80, 580).setAlpha(0.5);
      }
    });
  }

  private createButtons() {
    const bx = 310; // right side

    // Attack button (largest, easy to hit)
    this.attackBtn = this.scene.add.image(bx, 530, 'btn_attack')
      .setDepth(100).setScrollFactor(0).setInteractive()
      .setScale(1.1);

    // Dodge button
    this.dodgeBtn = this.scene.add.image(bx - 55, 585, 'btn_dodge')
      .setDepth(100).setScrollFactor(0).setInteractive()
      .setScale(0.8);

    // Special button
    this.specialBtn = this.scene.add.image(bx, 600, 'btn_special')
      .setDepth(100).setScrollFactor(0).setInteractive()
      .setScale(0.7);

    // Weapon switch button (top right)
    const weaponBtnBg = this.scene.add.rectangle(320, 55, 70, 24, 0x444466)
      .setDepth(100).setScrollFactor(0).setInteractive({ useHandCursor: true });
    this.weaponLabel = this.scene.add.text(320, 55, '⚔️ Wechseln', {
      fontSize: '9px', color: '#ffffff'
    }).setOrigin(0.5).setDepth(101).setScrollFactor(0);

    // Attack: hold for auto-attack
    this.attackBtn.on('pointerdown', () => {
      this.scene.player.attack();
      this.attackHeld = true;
    });
    this.attackBtn.on('pointerup', () => { this.attackHeld = false; });
    this.attackBtn.on('pointerout', () => { this.attackHeld = false; });

    this.dodgeBtn.on('pointerdown', () => this.scene.player.dodge());
    this.specialBtn.on('pointerdown', () => this.scene.player.special());
    weaponBtnBg.on('pointerdown', () => this.scene.player.cycleWeapon());

    // Button labels
    this.scene.add.text(bx, 530, '⚔️', { fontSize: '20px' }).setOrigin(0.5).setDepth(101).setScrollFactor(0);
    this.scene.add.text(bx - 55, 585, '💨', { fontSize: '14px' }).setOrigin(0.5).setDepth(101).setScrollFactor(0);
    this.scene.add.text(bx, 600, '⭐', { fontSize: '12px' }).setOrigin(0.5).setDepth(101).setScrollFactor(0);
  }

  private setupKeyboard() {
    if (!this.scene.input.keyboard) return;
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.keys = {
      w: this.scene.input.keyboard.addKey('W'),
      a: this.scene.input.keyboard.addKey('A'),
      s: this.scene.input.keyboard.addKey('S'),
      d: this.scene.input.keyboard.addKey('D'),
      space: this.scene.input.keyboard.addKey('SPACE'),
      shift: this.scene.input.keyboard.addKey('SHIFT'),
      e: this.scene.input.keyboard.addKey('E'),
      q: this.scene.input.keyboard.addKey('Q'),
    };
  }

  update(_time: number, delta: number) {
    // Keyboard movement (only if no touch joystick active)
    if (this.joystickPointerId === -1 && this.scene.input.keyboard) {
      let mx = 0, my = 0;
      if (this.cursors.left.isDown || this.keys.a.isDown) mx = -1;
      if (this.cursors.right.isDown || this.keys.d.isDown) mx = 1;
      if (this.cursors.up.isDown || this.keys.w.isDown) my = -1;
      if (this.cursors.down.isDown || this.keys.s.isDown) my = 1;
      // Normalize diagonal
      if (mx !== 0 && my !== 0) { mx *= 0.707; my *= 0.707; }
      this.moveX = mx;
      this.moveY = my;

      // Keyboard: hold space = auto-attack
      if (this.keys.space.isDown) {
        this.attackHeld = true;
      } else {
        if (!this.scene.input.activePointer.isDown) this.attackHeld = false;
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.shift)) this.scene.player.dodge();
      if (Phaser.Input.Keyboard.JustDown(this.keys.e)) this.scene.player.special();
      if (Phaser.Input.Keyboard.JustDown(this.keys.q)) this.scene.player.cycleWeapon();
    }

    // Auto-attack repeat while held
    if (this.attackHeld) {
      this.attackRepeatTimer -= delta;
      if (this.attackRepeatTimer <= 0) {
        this.scene.player.attack();
        this.attackRepeatTimer = 180; // repeat every 180ms while held
      }
    } else {
      this.attackRepeatTimer = 0;
    }
  }
}
