# Sitzschläger – Endlos Arena

## Technische Spezifikation

**Version:** 1.0  
**Datum:** 20. Juni 2026  
**Plattform:** GitHub Pages (statisches Hosting)  
**Zielgeräte:** Mobile Browser (primär), Desktop Browser (sekundär)  
**Ausrichtung:** Portrait (Hochformat)

---

## Inhaltsverzeichnis

1. [Projektübersicht](#1-projektübersicht)
2. [Technologie-Stack](#2-technologie-stack)
3. [Architektur](#3-architektur)
4. [Spielmodule](#4-spielmodule)
5. [Steuerung & Input-System](#5-steuerung--input-system)
6. [Kampfsystem](#6-kampfsystem)
7. [Gegner-KI](#7-gegner-ki)
8. [Wellen-System](#8-wellen-system)
9. [Loot- & Waffen-System](#9-loot--waffen-system)
10. [Levelsystem & Progression](#10-levelsystem--progression)
11. [Visuelles Design & Effekte](#11-visuelles-design--effekte)
12. [Audio-System](#12-audio-system)
13. [Persistenz & Speicherung](#13-persistenz--speicherung)
14. [Performance-Optimierung](#14-performance-optimierung)
15. [Deployment & CI/CD](#15-deployment--cicd)
16. [Asset-Pipeline](#16-asset-pipeline)
17. [Projektstruktur](#17-projektstruktur)
18. [Meilensteine](#18-meilensteine)

---

## 1. Projektübersicht

**Sitzschläger – Endlos Arena** ist ein endloses 2D-Beat'em-Up-Browserspiel im Comic-Stil, optimiert für mobile Geräte im Hochformat. Der Spieler kämpft in einer Arena gegen endlose Wellen von Gegnern, sammelt Waffen unterschiedlicher Seltenheit und versucht, einen möglichst hohen Rekord aufzustellen.

### Kernfeatures

- Endloser Wellen-Modus mit steigender Schwierigkeit
- Touch-optimierte Steuerung mit virtuellem Joystick
- 6 verschiedene Waffentypen mit 5 Seltenheitsstufen
- 5 Gegnertypen + 3 Bossgegner
- Levelsystem mit wählbaren Upgrades
- Persistenter Highscore und Münzsystem
- Comicartige Chibi-Grafik mit Juice-Effekten

### Spielperspektive

Top-Down leicht schräg (¾-Perspektive) – die Arena wird von oben-schräg gezeigt, Charaktere haben leicht isometrische Proportionen mit übergroßen Köpfen (Chibi-Stil).



---

## 2. Technologie-Stack

### Kern-Framework

| Technologie | Version | Zweck |
|---|---|---|
| **Phaser** | 4.1.x | Game-Framework (Rendering, Physik, Audio, Input) |
| **TypeScript** | 5.x | Typsichere Entwicklung |
| **Vite** | 6.x | Build-Tool, Dev-Server, HMR |

**Begründung Phaser 4.1:**

- Vollständiges 2D-Game-Framework mit WebGL-Rendering + Canvas-Fallback
- Eingebautes Arcade-Physics-System (ideal für Beat'em-Up)
- Unified Pointer-System (Maus + Touch transparent)
- Integriertes Spritesheet-Animationssystem
- Eingebauter Sound-Manager (Web Audio API + HTML5-Audio-Fallback)
- Partikel-Emitter-System für Kampfeffekte
- Tween-Manager für flüssige Animationen
- Kamera-Effekte (Shake, Flash, Zoom)
- Scene-Manager für Spielzustände
- Aktive Community, >40.000 GitHub-Stars
- ~1.2 MB unkomprimiert, ~350 KB gzipped

### Plugins & Bibliotheken

| Bibliothek | Paket | Zweck |
|---|---|---|
| **Rex VirtualJoystick** | `phaser4-rex-plugins/plugins/virtualjoystick-plugin` | Virtueller Joystick für Touch |
| **Rex StateManager** | `phaser4-rex-plugins/plugins/statemanager-plugin` | FSM für KI & Spielerzustände |
| **Rex UI** | `phaser4-rex-plugins/templates/ui/ui-plugin` | UI-Komponenten (Buttons, HUD) |

**Begründung rexrainbow-Plugins:**

- Speziell für Phaser entwickelt, native Integration
- VirtualJoystick simuliert Cursor-Keys, dynamisch positionierbar
- StateManager bietet saubere FSM mit Event-System
- Über npm installierbar, Tree-Shaking-kompatibel
- Einzelne Plugins importierbar (kein Overhead)

### Evaluierte Alternativen (nicht gewählt)

| Technologie | Grund für Ablehnung |
|---|---|
| PixiJS v8 | Nur Renderer – keine Physik, kein Audio, kein Input-System |
| melonJS | Kleinere Community, weniger Plugins, weniger Dokumentation |
| nipplejs | Standalone-Joystick – Rex-Plugin besser in Phaser integriert |
| Howler.js | Unnötig – Phaser hat vollständiges Audio-System |
| Matter.js | Overkill für Beat'em-Up – Arcade Physics performanter |
| Spine 2D | Lizenzkosten – Spritesheet-Animation reicht für Chibi-Stil |

### Build & Tooling

| Tool | Zweck |
|---|---|
| **Vite 6.x** | Bundling, Tree-Shaking, Dev-Server mit HMR |
| **GitHub Actions** | CI/CD-Pipeline für automatisches Deployment |
| **GitHub Pages** | Statisches Hosting (kostenlos, HTTPS) |
| **ESLint** | Code-Qualität |
| **Prettier** | Einheitliche Formatierung |
| **TexturePacker** (Free) | Spritesheet-Atlas-Erstellung |



---

## 3. Architektur

### Architektur-Übersicht

```
┌─────────────────────────────────────────────────┐
│                   Phaser Game                     │
├─────────────────────────────────────────────────┤
│  Scenes (Spielzustände)                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌───────┐ ┌─────┐ │
│  │ Boot │→│Preload│→│ Menu │→│ Game  │→│Over │ │
│  └──────┘ └──────┘ └──────┘ └───────┘ └─────┘ │
│                               ↕                  │
│                          ┌────────┐              │
│                          │LevelUp │              │
│                          └────────┘              │
├─────────────────────────────────────────────────┤
│  Systeme                                         │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐ │
│  │ WaveSystem│ │CombatSys │ │ LootSystem     │ │
│  └───────────┘ └──────────┘ └────────────────┘ │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐ │
│  │InputSystem│ │  AI-Sys  │ │ ProgressionSys │ │
│  └───────────┘ └──────────┘ └────────────────┘ │
├─────────────────────────────────────────────────┤
│  Phaser Built-ins                                │
│  ┌────────┐ ┌───────┐ ┌──────┐ ┌────────────┐ │
│  │Arcade  │ │Tweens │ │Audio │ │ Particles  │ │
│  │Physics │ │       │ │      │ │            │ │
│  └────────┘ └───────┘ └──────┘ └────────────┘ │
├─────────────────────────────────────────────────┤
│  Persistenz: localStorage                        │
└─────────────────────────────────────────────────┘
```

### Design-Prinzipien

1. **Composition over Inheritance** – Spielobjekte werden aus kombinierbaren Komponenten zusammengesetzt
2. **State-Machine-Pattern** – Jede Entität (Spieler, Gegner) nutzt eine FSM für Zustandsübergänge
3. **Event-Driven** – Lose Kopplung zwischen Systemen über Phasers Event-Emitter
4. **Data-Driven Design** – Gegner, Waffen und Wellen werden über JSON-Konfigurationen definiert
5. **Object Pooling** – Wiederverwendung von Sprites für Gegner, Projektile und Partikel

### Scene-Flow

```
BootScene → PreloadScene → MenuScene → GameScene ↔ LevelUpScene
                                            ↓
                                       GameOverScene → MenuScene
```

| Scene | Verantwortung |
|---|---|
| **BootScene** | Minimales Setup, Laden des Ladebildschirm-Assets |
| **PreloadScene** | Alle Assets laden, Fortschrittsbalken anzeigen |
| **MenuScene** | Hauptmenü, Heldenauswahl, Shop, Highscores |
| **GameScene** | Hauptspielschleife, Arena, Kampf, HUD |
| **LevelUpScene** | Overlay: Upgrade-Auswahl bei Level-Up (pausiert GameScene) |
| **GameOverScene** | Ergebnis, Statistiken, Münzen, Retry-Button |



---

## 4. Spielmodule

### 4.1 Entity-System

Alle Spielfiguren (Spieler + Gegner) erben von einer `BaseEntity`-Klasse:

```typescript
interface EntityConfig {
  maxHealth: number;
  speed: number;
  animations: AnimationSet;
  hitbox: { width: number; height: number; offsetY: number };
}

abstract class BaseEntity extends Phaser.Physics.Arcade.Sprite {
  protected stateMachine: StateManager;
  protected health: number;
  protected maxHealth: number;
  protected speed: number;
  protected isInvincible: boolean;
  protected hitbox: Phaser.GameObjects.Zone;
}
```

### 4.2 Zustände (FSM)

Jede Entität durchläuft folgende Zustände:

**Spieler-States:**
- `idle` – Stillstehen, Idle-Animation
- `walk` – Bewegen per Joystick
- `attack` – Angriff (Normal oder Combo)
- `special` – Spezialangriff
- `dodge` – Ausweichrolle (i-Frames)
- `hit` – Getroffen (kurze Stun-Phase)
- `dead` – Tod-Animation → GameOver

**Gegner-States:**
- `spawn` – Erscheinen in Arena
- `idle` – Warten / Patrol
- `chase` – Spieler verfolgen
- `attack` – Angriff ausführen
- `hit` – Getroffen / Knockback
- `dead` – Tod → Loot-Drop

### 4.3 Spielfeld (Arena)

- Feste Arenagröße: 360×640 logische Pixel (Portrait)
- Kamera folgt dem Spieler nicht (feste Arena)
- Arena-Grenzen durch Arcade-Physics-Wände
- Hintergrund: Tilemap oder statischer Boden mit dezenter Animation
- Spawn-Zonen an den Rändern (Gegner kommen von außen)



---

## 5. Steuerung & Input-System

### 5.1 Layout (Hochformat)

```
┌─────────────────────────┐
│                         │
│      Spielfeld          │
│      (Arena)            │
│                         │
│                         │
│                         │
├─────────────────────────┤
│                         │
│  [Joystick]   [Buttons] │
│   (links)     (rechts)  │
│                         │
│              ⚔️ Angriff  │
│  ◯           🛡️ Ausweich│
│              ⭐ Spezial  │
│                         │
└─────────────────────────┘
```

### 5.2 Virtueller Joystick (links)

**Implementierung:** Rex VirtualJoystick Plugin

```typescript
const joystick = this.plugins.get('rexVirtualJoystick').add(this, {
  x: screenWidth * 0.2,
  y: screenHeight * 0.85,
  radius: 50,
  base: baseCircleSprite,
  thumb: thumbCircleSprite,
  dir: '8dir',        // 8 Richtungen
  enable: true
});
```

**Eigenschaften:**
- Dynamisch positioniert: Erscheint dort, wo der Daumen aufsetzt (linke Bildschirmhälfte)
- 8-Richtungen-Steuerung
- Analoger Wert (0–1) für variable Geschwindigkeit
- Verschwindet wenn losgelassen (Clean UI)
- Aktive Zone: Linke 45% des Bildschirms

### 5.3 Action-Buttons (rechts)

Drei Buttons auf der rechten Seite, übereinander gestapelt:

| Button | Aktion | Geste |
|---|---|---|
| ⚔️ **Angriff** | Normaler Schlag / Combo | Tap = Einzelschlag, Hold = Combo |
| 🛡️ **Ausweichen** | Ausweichrolle | Tap = Rolle in Bewegungsrichtung |
| ⭐ **Spezial** | Spezialattacke | Tap (nur wenn aufgeladen) |

**Implementierung:** Phaser-native Buttons mit Touch-Zonen

```typescript
const attackBtn = this.add.circle(screenWidth * 0.82, screenHeight * 0.78, 35)
  .setInteractive()
  .on('pointerdown', () => this.player.startAttack())
  .on('pointerup', () => this.player.endAttack());
```

### 5.4 Multitouch-Unterstützung

- Phaser Pointer-System unterstützt bis zu 10 gleichzeitige Pointer
- Joystick und Buttons können gleichzeitig bedient werden
- Konfiguration: `input: { activePointers: 3 }` (Joystick + 2 Buttons)

### 5.5 Desktop-Fallback

| Touch | Tastatur | Maus |
|---|---|---|
| Joystick | WASD / Pfeiltasten | – |
| Angriff | Leertaste / J | Linksklick |
| Ausweichen | Shift / K | Rechtsklick |
| Spezial | E / L | Mitteltaste |



---

## 6. Kampfsystem

### 6.1 Angriffsmechanik

**Normal-Angriff (Tap):**
- Aktiviert Hitbox vor dem Spieler für wenige Frames
- Hitbox-Größe und -Dauer abhängig von Waffe
- Trifft alle Gegner im Hitbox-Bereich
- Kurze Abklingzeit zwischen Schlägen

**Combo-Angriff (Hold):**
- 3-Hit-Combo bei gehaltenem Angriffsknopf
- Jeder Hit hat leicht andere Animation und Hitbox
- Letzter Hit der Combo hat Bonus-Schaden und Knockback
- Timing-Fenster zwischen Combo-Schlägen: 400ms

**Spezialangriff:**
- Aufladung durch Treffer (Charge-Meter, 100%)
- Jeder Treffer auf Gegner gibt 5–10% Ladung
- Effekt abhängig von aktueller Waffe:

| Waffe | Spezialangriff |
|---|---|
| Schwert | Rundumschlag (360°, großer Radius) |
| Nunchakus | Wirbelattacke (schnelle Mehrfachtreffer) |
| Axt | Erdschlag (Schockwelle am Boden) |
| Hammer | Meteorstoß (AoE + Knockback) |
| Doppeldolche | Schattenrausch (Teleport + Multi-Hit) |
| Kettenwaffe | Wirbelsturm (großer Radius, zieht Gegner an) |

### 6.2 Schadensberechnung

```typescript
interface DamageCalc {
  baseDamage: number;        // Grundschaden der Waffe
  rarityMultiplier: number;  // 1.0 / 1.3 / 1.6 / 2.0 / 2.8
  comboMultiplier: number;   // 1.0 / 1.0 / 1.5 (3. Hit)
  critChance: number;        // 5% base + Waffen-Bonus
  critMultiplier: number;    // 2.0x
  playerDamageBonus: number; // Level-Upgrades
}

finalDamage = baseDamage × rarityMultiplier × comboMultiplier × (isCrit ? critMultiplier : 1) + playerDamageBonus;
```

### 6.3 Ausweichen (Dodge)

- Dauer: 300ms
- Unverwundbarkeit (i-Frames) während der Rolle
- Bewegung: 150px in aktuelle Bewegungsrichtung
- Abklingzeit: 800ms
- Visuell: Spieler-Sprite wird halbtransparent + Nachzieh-Effekt

### 6.4 Treffer-Feedback (Juice)

Bei jedem Treffer:
- **Hitstop:** 50ms Frame-Freeze (Angreifer + Getroffener)
- **Kamera-Shake:** Intensität proportional zum Schaden
- **Knockback:** Getroffener wird weggestoßen
- **Partikel:** Treffer-Funken in Waffenfarbe
- **Screen-Flash:** Kurzes weißes Blitzen bei kritischen Treffern
- **Schadenszahl:** Floating-Damage-Number über dem Getroffenen



---

## 7. Gegner-KI

### 7.1 Gegnertypen

| Typ | HP | Speed | Schaden | Verhalten |
|---|---|---|---|---|
| **Straßenkämpfer** | 30 | 80 | 5 | Nähert sich direkt, schlägt zu |
| **Ninja** | 20 | 150 | 8 | Springt herum, schnelle Hiebe |
| **Ritter** | 80 | 40 | 12 | Langsam, blockt manchmal |
| **Berserker** | 50 | 60→120 | 8→16 | Wird schneller und stärker bei <50% HP |
| **Elite** (ab Welle 16) | 100 | 70 | 15 | Kombination aus Ninja + Ritter |

*Werte skalieren mit Wellennummer: `stat × (1 + welle × 0.05)`*

### 7.2 KI-Verhalten (FSM)

```
[spawn] → [idle/patrol] → [chase] → [attack] → [cooldown] → [chase]
                                         ↓
                                       [hit] → [chase]
                                         ↓
                                       [dead]
```

**Verhaltensmuster pro Typ:**

**Straßenkämpfer:**
- Bewegt sich direkt zum Spieler
- Greift an wenn Distanz < 40px
- Kein Ausweichen

**Ninja:**
- Nähert sich sprunghaft (zufällige Seitwärtsbewegung)
- Greift an und springt sofort zurück
- Angriffs-Cooldown: 1.5s

**Ritter:**
- Langsames Nähern mit Schild
- 30% Chance, Spieler-Angriffe zu blocken
- Schwerer Schlag mit langem Windup (500ms)

**Berserker:**
- Normal bei >50% HP
- Unter 50% HP: Sprite wird rot, Speed×2, Damage×2
- Greift aggressiver an (kürzerer Cooldown)

### 7.3 Bossgegner

Erscheinen alle 10 Wellen. Arena wird abgesperrt, Boss-Healthbar erscheint.

| Boss | HP | Attacken | Spezial |
|---|---|---|---|
| **Der Stahlkönig** (Welle 10) | 500 | Schwerthieb, Stampfer | Schockwelle (ganzer Boden) |
| **Schattenmeister** (Welle 20) | 400 | Teleport-Strike | Schattenkopien beschwören |
| **Der Zerstörer** (Welle 30) | 700 | Wirbelschlag | Wirbelsturm (3s, verfolgt Spieler) |

*Ab Welle 40+ wiederholen sich Bosse mit +100% Stats*

### 7.4 Schwarmverhalten

- Max. 8 Gegner gleichzeitig aktiv auf dem Bildschirm
- Neue Gegner spawnen erst nach Tod vorheriger (bei gleicher Welle)
- Gegner umkreisen den Spieler leicht versetzt (nicht alle stacken)
- Angriffs-Token-System: Max. 2 Gegner greifen gleichzeitig an, Rest wartet



---

## 8. Wellen-System

### 8.1 Wellen-Konfiguration

```typescript
interface WaveConfig {
  waveNumber: number;
  enemies: EnemySpawn[];
  spawnDelay: number;       // ms zwischen Spawns
  timeBetweenWaves: number; // Pause zwischen Wellen
  isBossWave: boolean;
}

interface EnemySpawn {
  type: EnemyType;
  count: number;
  healthMultiplier: number;
  damageMultiplier: number;
  speedMultiplier: number;
}
```

### 8.2 Schwierigkeitskurve

| Wellen | Gegnertypen | Anzahl | Geschwindigkeit | Besonderheit |
|---|---|---|---|---|
| 1–5 | Straßenkämpfer | 3–5 | ×1.0 | Tutorial-Phase |
| 6–10 | + Ninja | 4–6 | ×1.1 | Mehr Gegner |
| 10 | **Boss: Stahlkönig** | 1 | – | Boss-Fight |
| 11–15 | + Ritter | 5–7 | ×1.2 | Tank-Gegner eingeführt |
| 16–20 | + Berserker + Elite | 5–8 | ×1.3 | Alle Typen gemischt |
| 20 | **Boss: Schattenmeister** | 1 | – | Boss-Fight |
| 21–30 | Alle Typen | 6–8 | ×1.5 | Seltene Waffen droppen |
| 30 | **Boss: Zerstörer** | 1 | – | Boss-Fight |
| 31+ | Alle Typen | 6–8 | ×(1.5 + 0.02×welle) | Endlose Skalierung |

### 8.3 Skalierungsformel (ab Welle 31)

```typescript
function getWaveMultiplier(wave: number): number {
  const baseMultiplier = 1.5;
  const scalePerWave = 0.02;
  const exponentialFactor = Math.pow(1.01, wave - 30);
  return baseMultiplier + (wave - 30) * scalePerWave * exponentialFactor;
}
```

### 8.4 Zwischen-Wellen-Phase

- 3 Sekunden Pause zwischen Wellen
- "Welle X" Einblendung (Tween: Scale + Fade)
- Spieler regeneriert 10% HP
- Evtl. Loot-Kisten erscheinen auf dem Feld
- Ab Welle 10+: Warnzeichen vor Boss-Wellen



---

## 9. Loot- & Waffen-System

### 9.1 Waffentypen

| Waffe | Basisschaden | Geschw. | Reichweite | Spezial-Eigenschaft |
|---|---|---|---|---|
| ⚔️ Schwert | 10 | Mittel | Mittel | Ausgewogen |
| 🥷 Nunchakus | 6 | Sehr schnell | Kurz | Höhere Combo-Rate |
| 🪓 Axt | 18 | Langsam | Mittel | Rüstungsdurchdringung |
| 🔨 Hammer | 15 | Langsam | Kurz | Starker Knockback |
| 🗡️ Doppeldolche | 7 | Schnell | Sehr kurz | +15% Crit-Chance |
| 🪃 Kettenwaffe | 9 | Mittel | Lang | Trifft bis zu 3 Gegner |

### 9.2 Seltenheitsstufen

| Stufe | Farbe | Schaden-Multi | Zusatzeffekt | Drop-Chance |
|---|---|---|---|---|
| Gewöhnlich | ⬜ Weiß | ×1.0 | Keine | 50% |
| Ungewöhnlich | 🟩 Grün | ×1.3 | +1 Stat-Bonus | 28% |
| Selten | 🟦 Blau | ×1.6 | Besondere Fähigkeit | 15% |
| Episch | 🟪 Lila | ×2.0 | Starker Effekt | 6% |
| Legendär | 🟨 Gold | ×2.8 | Einzigartiger Effekt | 1% |

### 9.3 Legendäre Effekte (Beispiele)

| Waffe + Legendär | Effekt |
|---|---|
| Schwert (Gold) | Jeder 5. Schlag löst Blitzschlag aus (AoE) |
| Nunchakus (Gold) | Combo-Finisher erzeugt Feuerwelle |
| Axt (Gold) | Getötete Gegner explodieren (Splash-Damage) |
| Hammer (Gold) | Stampfer friert Gegner 2s ein |
| Doppeldolche (Gold) | Kritische Treffer heilen 5% HP |
| Kettenwaffe (Gold) | Kette springt auf 6 Gegner über |

### 9.4 Drop-Mechanik

```typescript
interface LootDrop {
  position: { x: number; y: number };
  weapon?: WeaponInstance;
  coins: number;
  healthOrb?: number; // Heilung in %
  xpOrb: number;
}

// Drop-Chance-Modifikator
function getDropChance(wave: number, playerLuck: number): LootTable {
  const baseLegendaryChance = 0.01;
  const waveBonus = Math.min(wave * 0.001, 0.03); // max +3%
  const luckBonus = playerLuck * 0.005;
  return {
    legendary: baseLegendaryChance + waveBonus + luckBonus,
    // ...
  };
}
```

### 9.5 Loot-Darstellung

- Besiegte Gegner lassen glühende Kisten fallen
- Kisten-Farbe = Seltenheit der enthaltenen Waffe
- Kisten verschwinden nach 10 Sekunden (blinken ab 7s)
- Münzen und XP-Orbs werden automatisch angezogen (Magnet-Radius: 60px)
- Waffen-Kisten müssen manuell aufgesammelt werden (Überlaufen)
- Bei Aufheben: Vergleichs-Popup (aktuelle vs. neue Waffe)



---

## 10. Levelsystem & Progression

### 10.1 Erfahrungspunkte (XP)

- XP wird durch Gegner-Kills und XP-Orbs gesammelt
- XP pro Kill: `gegner.baseXP × wellenMultiplier`
- Level-Up-Schwelle: `100 × level^1.3` (exponentiell steigend)

| Gegner | Basis-XP |
|---|---|
| Straßenkämpfer | 10 |
| Ninja | 15 |
| Ritter | 20 |
| Berserker | 25 |
| Elite | 35 |
| Boss | 100 |

### 10.2 Level-Up-Auswahl

Bei Level-Up wird das Spiel pausiert und der Spieler wählt 1 aus 3 zufälligen Upgrades:

| Upgrade | Effekt | Max. Stufe |
|---|---|---|
| ❤️ Mehr Leben | +20 Max-HP + volle Heilung | 10 |
| ⚡ Schnellere Angriffe | +8% Angriffsgeschwindigkeit | 8 |
| 💪 Mehr Schaden | +3 Basis-Angriffsschaden | 10 |
| 🏃 Schnellere Bewegung | +10% Bewegungsgeschwindigkeit | 6 |
| 🍀 Bessere Beute | +5% Chance auf höhere Seltenheit | 5 |
| 🛡️ Schadensreduktion | -5% erlittener Schaden | 6 |
| 💫 Schnellere Spezial-Ladung | +10% Charge-Rate | 5 |
| 🧲 Größerer Magnet | +20px Pickup-Radius | 5 |

### 10.3 Münz-System (persistent)

Münzen werden nach dem Tod in den permanenten Speicher übertragen.

**Münz-Quellen (pro Run):**
- Gegner-Drops: 1–5 Münzen
- Boss-Drops: 20–50 Münzen
- Wellen-Bonus: `welle × 2` Münzen bei Tod

**Shop-Ausgaben (permanent):**

| Item | Kosten | Effekt |
|---|---|---|
| Neuer Held (Skin) | 500 | Kosmetisch |
| Startwaffe Grün | 200 | Run startet mit grüner Waffe |
| Startwaffe Blau | 800 | Run startet mit blauer Waffe |
| +10% Start-HP | 300 | Permanent für alle Runs |
| +1 Upgrade-Auswahl | 1000 | 4 statt 3 Optionen bei Level-Up |
| Münz-Magnet | 400 | +50% Münz-Drop |

### 10.4 Helden-Auswahl

Freischaltbare Helden (rein kosmetisch + minimale Starter-Boni):

| Held | Freischaltung | Starter-Bonus |
|---|---|---|
| **Kai** (Standard) | – | Ausgewogen |
| **Yuki** | 500 Münzen | +5% Speed |
| **Brutus** | 500 Münzen | +10 Start-HP |
| **Shade** | 1000 Münzen | +5% Crit |
| **Rex** | Welle 30 erreichen | +5% Schaden |



---

## 11. Visuelles Design & Effekte

### 11.1 Art-Style

- **Chibi/SD-Stil:** Große Köpfe, kleine Körper (Kopf:Körper = 1:1.5)
- **Farbpalette:** Leuchtend, gesättigt, hoher Kontrast
- **Outline:** 2px schwarze Outline um alle Charaktere
- **Proportionen:** Spieler-Sprite ca. 48×64px, Gegner 32×48px bis 96×128px (Bosse)
- **Arena:** Einfacher, nicht-ablenkender Boden (Steinplatten-Textur)

### 11.2 Animationen (Spritesheet-basiert)

Jeder Charakter benötigt folgende Animationen:

| Animation | Frames | Framerate |
|---|---|---|
| Idle | 4–6 | 8 fps |
| Walk | 6–8 | 12 fps |
| Attack 1 | 4–6 | 16 fps |
| Attack 2 | 4–6 | 16 fps |
| Attack 3 (Combo-Finisher) | 6–8 | 16 fps |
| Special | 8–12 | 14 fps |
| Dodge | 4 | 20 fps |
| Hit | 3 | 12 fps |
| Death | 6–8 | 10 fps |
| Spawn (nur Gegner) | 4 | 10 fps |

### 11.3 Partikel-Effekte (Phaser ParticleEmitter)

| Effekt | Auslöser | Konfiguration |
|---|---|---|
| Treffer-Funken | Spieler trifft Gegner | 5–10 Partikel, kurze Lebensdauer, Waffenfarbe |
| Kritischer Treffer | Crit-Hit | 15 Partikel + Stern-Sprite, golden |
| Tod-Explosion | Gegner stirbt | 20 Partikel + Sprite-Fragmente |
| Loot-Glitzer | Item auf Boden | Daueremission, langsam aufsteigend |
| Spezial-Aura | Spezial voll geladen | Ring-Emitter um Spieler |
| Boss-Shockwave | Boss-Stampfer | Kreis-Expansion, weiß |
| Levelup-Effekt | Level-Up | Goldene Säule + aufsteigende Sterne |
| Heal-Effekt | HP-Regeneration | Grüne Kreuze, aufsteigend |

### 11.4 Kamera-Effekte

```typescript
// Treffer-Feedback
this.cameras.main.shake(80, 0.003 * damage);

// Kritischer Treffer
this.cameras.main.flash(100, 255, 255, 255, false, null, null, 0.3);

// Boss-Erscheinen
this.cameras.main.zoomTo(0.9, 500);
this.time.delayedCall(1000, () => this.cameras.main.zoomTo(1, 300));
```

### 11.5 Tween-Effekte

- **Damage-Numbers:** Aufsteigend + Fade-Out (800ms)
- **Knockback:** Schnelle Translation + Ease-Out
- **Waffen-Glow:** Pulsierendes Leuchten bei seltenen Waffen
- **Boss-Intro:** Scale von 0→1 + Landefläche + Staubwolke
- **Wellen-Ankündigung:** Text fliegt von links rein, wartet 1s, fliegt nach rechts raus

### 11.6 UI/HUD (Hochformat-optimiert)

```
┌─────────────────────────────┐
│ ❤️❤️❤️❤️░░░  Welle 12  🪙 342 │  ← Obere Leiste
│ [XP ████████░░░░]  Lv.7    │  ← XP-Balken
├─────────────────────────────┤
│                             │
│        SPIELFELD            │
│                             │
│                             │
├─────────────────────────────┤
│ [⭐ ██████░░] Spezial: 68% │  ← Spezial-Leiste
├─────────────────────────────┤
│                             │
│   ◯ Joystick    Buttons ⚔️🛡️⭐│  ← Steuerung
│                             │
└─────────────────────────────┘
```



---

## 12. Audio-System

### 12.1 Technologie

Phaser integrierter Sound-Manager:
- **Primär:** Web Audio API (niedrge Latenz, Effekte, Panning)
- **Fallback:** HTML5 Audio Tag (ältere Browser)
- **Autoplay-Policy:** Unlock bei erstem User-Touch (automatisch von Phaser gehandhabt)

### 12.2 Sound-Kategorien

| Kategorie | Format | Beispiele |
|---|---|---|
| **SFX** | OGG + MP3 | Schläge, Treffer, Ausweichen, Pickup |
| **Musik** | OGG + MP3 | Arena-Loop, Boss-Theme, Menü |
| **UI** | OGG + MP3 | Button-Klick, Level-Up-Jingle |

### 12.3 Sound-Effekte

| Event | Sound | Priorität |
|---|---|---|
| Spieler schlägt | `hit_swing_01..03` (zufällig) | Hoch |
| Gegner getroffen | `hit_impact_01..03` | Hoch |
| Kritischer Treffer | `hit_crit_01` | Hoch |
| Gegner stirbt | `enemy_death_01..02` | Mittel |
| Ausweichrolle | `dodge_whoosh` | Mittel |
| Spezialangriff | `special_charge` + `special_release` | Hoch |
| Waffe aufheben | `loot_pickup` + Seltenheits-Jingle | Mittel |
| Münze einsammeln | `coin_pickup` | Niedrig |
| Level-Up | `levelup_fanfare` | Hoch |
| Wellen-Start | `wave_horn` | Mittel |
| Boss erscheint | `boss_roar` | Hoch |
| Spieler stirbt | `player_death` | Hoch |

### 12.4 Musik

- **Menü:** Ruhige, einladende Loop-Melodie
- **Arena (Normal):** Uptempo-Action-Loop, 120–140 BPM
- **Arena (Boss):** Intensiverer Track, härtere Drums
- **Game Over:** Kurze traurige Melodie (kein Loop)
- **Crossfade:** 500ms zwischen Tracks

### 12.5 Audio-Sprites

Kurze SFX werden in Audio-Sprites gebündelt (1 Datei, mehrere Marker):

```typescript
this.load.audioSprite('sfx', 'assets/audio/sfx.json', [
  'assets/audio/sfx.ogg',
  'assets/audio/sfx.mp3'
]);

// Abspielen
this.sound.playAudioSprite('sfx', 'hit_impact_02');
```

### 12.6 Lautstärke-Einstellungen

- Master-Volume (0–100%)
- Musik-Volume (0–100%)
- SFX-Volume (0–100%)
- Gespeichert in localStorage



---

## 13. Persistenz & Speicherung

### 13.1 Technologie: localStorage

**Begründung:**
- 5–10 MB Speicher (mehr als ausreichend)
- Synchrone API (einfach zu nutzen)
- Persistiert über Sitzungen hinweg
- Kein Server nötig (100% clientseitig)
- Universelle Browser-Unterstützung

### 13.2 Gespeicherte Daten

```typescript
interface SaveData {
  version: string;           // Schema-Version für Migrations
  player: {
    coins: number;
    highscore: number;       // Höchste erreichte Welle
    totalKills: number;
    totalRuns: number;
    unlockedHeroes: string[];
    selectedHero: string;
    permanentUpgrades: PermanentUpgrade[];
  };
  shop: {
    purchasedItems: string[];
    startWeaponRarity: Rarity;
  };
  settings: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    vibration: boolean;
  };
  statistics: {
    bestWave: number;
    bestKillStreak: number;
    totalPlayTime: number;   // Sekunden
    legendaryWeaponsFound: number;
    bossesDefeated: number;
  };
}
```

### 13.3 Speicher-Zeitpunkte

| Event | Was wird gespeichert |
|---|---|
| Spieler stirbt (Run-Ende) | Münzen, Statistiken, Highscore |
| Shop-Kauf | Gekaufte Items, Münzstand |
| Einstellungen ändern | Volume-Settings |
| Held freischalten | Freischaltungen |

### 13.4 Datenintegrität

```typescript
class SaveManager {
  private static SAVE_KEY = 'sitzschlaeger_save_v1';

  static save(data: SaveData): void {
    const json = JSON.stringify(data);
    localStorage.setItem(this.SAVE_KEY, json);
  }

  static load(): SaveData | null {
    const raw = localStorage.getItem(this.SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    return this.migrate(data); // Schema-Migration
  }

  static reset(): void {
    localStorage.removeItem(this.SAVE_KEY);
  }
}
```

### 13.5 Kein Server nötig

Da das Spiel auf GitHub Pages läuft:
- Kein Backend, keine Datenbank
- Alle Daten lokal im Browser
- Highscore ist pro Gerät/Browser
- Optional: Export/Import als JSON-Datei (für Backup)



---

## 14. Performance-Optimierung

### 14.1 Ziel-Performance

- **60 FPS** auf modernen Smartphones (2022+)
- **30 FPS minimum** auf älteren Geräten
- **Ladezeit:** <3s bei erster Nutzung, <1s gecacht

### 14.2 Rendering-Optimierungen

| Technik | Beschreibung |
|---|---|
| **Texture Atlas** | Alle Sprites in 1–2 Atlase gepackt (weniger Draw-Calls) |
| **Object Pooling** | Gegner, Projektile, Partikel werden recycled statt zerstört |
| **Culling** | Nur sichtbare Objekte rendern (bei fester Arena automatisch) |
| **WebGL Batching** | Phaser batcht automatisch gleiche Texturen |
| **Partikel-Limits** | Max. 200 aktive Partikel gleichzeitig |

### 14.3 Speicher-Optimierungen

| Technik | Beschreibung |
|---|---|
| **Sprite-Größe** | Max. 128×128px pro Frame, 2048×2048 Atlas |
| **Audio-Kompression** | OGG Vorbis (klein), MP3 als Fallback |
| **Lazy Loading** | Boss-Assets erst bei Welle 8+ laden |
| **Asset-Unloading** | Menü-Assets im Spiel entladen |

### 14.4 Object Pool Beispiel

```typescript
class EnemyPool {
  private pool: Map<EnemyType, BaseEnemy[]> = new Map();

  get(type: EnemyType): BaseEnemy {
    const available = this.pool.get(type)?.find(e => !e.active);
    if (available) {
      available.activate();
      return available;
    }
    return this.createNew(type);
  }

  release(enemy: BaseEnemy): void {
    enemy.deactivate(); // setActive(false), setVisible(false)
  }
}
```

### 14.5 Mobile-spezifische Optimierungen

- **Reduzierte Partikel** auf Low-End-Geräten (automatische Erkennung)
- **Viewport-Meta:** `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">`
- **Touch-Action CSS:** `touch-action: none` auf Canvas (verhindert Browser-Gesten)
- **Prevent Scrolling:** Kein versehentliches Scrollen während des Spielens
- **Wake Lock API:** Bildschirm bleibt an während des Spielens



---

## 15. Deployment & CI/CD

### 15.1 GitHub Pages Konfiguration

- **Branch:** `gh-pages` (automatisch generiert)
- **Build-Output:** `dist/` Verzeichnis
- **Base-URL:** `/<repository-name>/` (konfiguriert in `vite.config.ts`)
- **HTTPS:** Automatisch durch GitHub Pages

### 15.2 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - run: npm ci

      - run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - uses: actions/deploy-pages@v4
```

### 15.3 Vite-Konfiguration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/l-sitzschlaeger-endlos-arena/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,  // Keine Inline-Assets (besser für Caching)
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
```

### 15.4 Caching-Strategie

- Phaser-Bundle: Separater Chunk mit Content-Hash (langlebiger Cache)
- Game-Assets: Versionierte Dateinamen durch Vite
- `index.html`: Kein Cache (immer frisch)



---

## 16. Asset-Pipeline

### 16.1 Grafik-Assets

| Asset-Typ | Tool | Format | Größe |
|---|---|---|---|
| Charakter-Sprites | Aseprite / Pixilart | PNG (Spritesheet) | 48–128px pro Frame |
| Hintergründe | Tiled / manuell | PNG | 360×480px |
| UI-Elemente | Figma / Aseprite | PNG (Atlas) | Variabel |
| Partikel-Texturen | Aseprite | PNG (8×8 bis 16×16) | Sehr klein |
| Waffen-Icons | Aseprite | PNG (32×32) | 32×32px |

### 16.2 Spritesheet-Organisation

```
assets/
├── sprites/
│   ├── player/
│   │   ├── kai-atlas.png        (2048×2048, alle Animationen)
│   │   └── kai-atlas.json       (Phaser Atlas JSON)
│   ├── enemies/
│   │   ├── streetfighter-atlas.png
│   │   ├── ninja-atlas.png
│   │   ├── knight-atlas.png
│   │   ├── berserker-atlas.png
│   │   └── bosses-atlas.png
│   └── effects/
│       ├── particles-atlas.png
│       └── vfx-atlas.png
├── audio/
│   ├── sfx.ogg / sfx.mp3       (Audio-Sprite)
│   ├── sfx.json                 (Marker-Definitionen)
│   ├── music-arena.ogg
│   ├── music-boss.ogg
│   └── music-menu.ogg
├── ui/
│   ├── hud-atlas.png
│   ├── buttons-atlas.png
│   └── fonts/
│       └── pixel-font.png      (Bitmap-Font)
└── data/
    ├── waves.json              (Wellen-Konfiguration)
    ├── weapons.json            (Waffen-Stats)
    ├── enemies.json            (Gegner-Stats)
    └── upgrades.json           (Level-Up-Optionen)
```

### 16.3 Asset-Quellen (Free/Open)

| Ressource | URL | Lizenz |
|---|---|---|
| itch.io Beat'em-Up Assets | itch.io/game-assets/tag-beat-em-up | Variiert (CC/MIT) |
| OpenGameArt | opengameart.org | CC0/CC-BY |
| Kenney.nl | kenney.nl | CC0 |
| Freesound.org (Audio) | freesound.org | CC0/CC-BY |
| Eigene Pixel-Art | – | Eigentum |

### 16.4 TexturePacker Workflow

1. Einzelne Frames als PNG exportieren (aus Aseprite)
2. TexturePacker (Free): Frames → Atlas + JSON
3. JSON-Format: "Phaser 3" (kompatibel mit Phaser 4)
4. Max. Atlas-Größe: 2048×2048 (mobile-kompatibel)
5. Padding: 2px (verhindert Bleeding)



---

## 17. Projektstruktur

```
l-sitzschlaeger-endlos-arena/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   └── assets/              (wie in Abschnitt 16.2)
├── src/
│   ├── main.ts              (Phaser-Game-Instanz + Konfiguration)
│   ├── config.ts            (Game-Konstanten)
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── PreloadScene.ts
│   │   ├── MenuScene.ts
│   │   ├── GameScene.ts
│   │   ├── LevelUpScene.ts
│   │   └── GameOverScene.ts
│   ├── entities/
│   │   ├── Player.ts
│   │   ├── BaseEnemy.ts
│   │   ├── enemies/
│   │   │   ├── StreetFighter.ts
│   │   │   ├── Ninja.ts
│   │   │   ├── Knight.ts
│   │   │   ├── Berserker.ts
│   │   │   └── Elite.ts
│   │   └── bosses/
│   │       ├── SteelKing.ts
│   │       ├── ShadowMaster.ts
│   │       └── Destroyer.ts
│   ├── systems/
│   │   ├── WaveSystem.ts
│   │   ├── CombatSystem.ts
│   │   ├── LootSystem.ts
│   │   ├── ProgressionSystem.ts
│   │   ├── InputSystem.ts
│   │   └── AISystem.ts
│   ├── weapons/
│   │   ├── BaseWeapon.ts
│   │   ├── Sword.ts
│   │   ├── Nunchakus.ts
│   │   ├── Axe.ts
│   │   ├── Hammer.ts
│   │   ├── DualDaggers.ts
│   │   └── ChainWeapon.ts
│   ├── ui/
│   │   ├── HUD.ts
│   │   ├── HealthBar.ts
│   │   ├── DamageNumber.ts
│   │   ├── VirtualControls.ts
│   │   └── WaveAnnouncement.ts
│   ├── effects/
│   │   ├── ParticleFactory.ts
│   │   ├── ScreenEffects.ts
│   │   └── HitstopManager.ts
│   ├── data/
│   │   ├── WaveData.ts
│   │   ├── WeaponData.ts
│   │   ├── EnemyData.ts
│   │   └── UpgradeData.ts
│   └── utils/
│       ├── SaveManager.ts
│       ├── ObjectPool.ts
│       ├── MathUtils.ts
│       └── Constants.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .eslintrc.json
├── .prettierrc
└── README.md
```

### 17.1 package.json (Kern-Dependencies)

```json
{
  "name": "sitzschlaeger-endlos-arena",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "phaser": "^4.1.0"
  },
  "devDependencies": {
    "phaser4-rex-plugins": "^4.1.0",
    "typescript": "^5.5.0",
    "vite": "^6.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.3.0"
  }
}
```

### 17.2 Phaser Game-Konfiguration

```typescript
// src/main.ts
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { LevelUpScene } from './scenes/LevelUpScene';
import { GameOverScene } from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,          // WebGL mit Canvas-Fallback
  width: 360,
  height: 640,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,   // Passt in verfügbaren Platz
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // Top-Down, keine Schwerkraft
      debug: false,
    }
  },
  input: {
    activePointers: 3,        // Multitouch: Joystick + 2 Buttons
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, LevelUpScene, GameOverScene],
};

new Phaser.Game(config);
```



---

## 18. Meilensteine

### Phase 1: Grundgerüst (Woche 1–2)

- [ ] Projekt-Setup (Vite + TypeScript + Phaser 4)
- [ ] Szenen-Grundstruktur (Boot → Preload → Menu → Game → GameOver)
- [ ] Spieler-Sprite mit Bewegung (Joystick)
- [ ] Arcade-Physics Arena mit Grenzen
- [ ] Basis-Angriff (Hitbox + einfacher Gegner)
- [ ] GitHub Pages Deployment einrichten

### Phase 2: Kernsysteme (Woche 3–4)

- [ ] Vollständige Spieler-FSM (alle States)
- [ ] 5 Gegnertypen mit KI
- [ ] Wellen-System (Spawning + Skalierung)
- [ ] Kampfsystem (Combo, Knockback, Hitstop)
- [ ] Ausweich-Mechanik (Dodge + i-Frames)
- [ ] HUD (HP, Welle, XP, Spezial-Meter)

### Phase 3: Loot & Progression (Woche 5–6)

- [ ] 6 Waffentypen implementieren
- [ ] Seltenheitssystem mit Drop-Tabellen
- [ ] Loot-Drops (Kisten, Münzen, XP-Orbs)
- [ ] Levelsystem mit Upgrade-Auswahl
- [ ] Spezialangriffe pro Waffe
- [ ] SaveManager (localStorage)

### Phase 4: Bosse & Polish (Woche 7–8)

- [ ] 3 Bossgegner implementieren
- [ ] Boss-Intros und -Phasen
- [ ] Partikel-Effekte (Treffer, Tod, Loot)
- [ ] Kamera-Effekte (Shake, Flash)
- [ ] Damage-Numbers
- [ ] Alle Sound-Effekte einbinden
- [ ] Musik-Tracks + Crossfade

### Phase 5: Meta-Game & Feinschliff (Woche 9–10)

- [ ] Münz-Shop (permanente Upgrades)
- [ ] Helden-Auswahl (Freischaltung)
- [ ] Statistiken & Highscore-Anzeige
- [ ] Tutorial (erste 2 Wellen mit Hinweisen)
- [ ] Performance-Optimierung (Object Pooling, Atlas-Konsolidierung)
- [ ] Mobile Testing (verschiedene Geräte)
- [ ] Legendäre Waffen-Effekte
- [ ] Balancing-Pass

### Phase 6: Release (Woche 11)

- [ ] Bug-Fixing
- [ ] Finale Asset-Optimierung (Kompression)
- [ ] README mit Spielanleitung
- [ ] Social-Media-Preview (og:image)
- [ ] Launch auf GitHub Pages

---

## Zusammenfassung der Technologie-Entscheidungen

| Bereich | Entscheidung | Begründung |
|---|---|---|
| Game-Framework | Phaser 4.1 | All-in-one: Rendering, Physik, Audio, Input, Particles |
| Sprache | TypeScript | Typsicherheit, bessere IDE-Unterstützung |
| Build-Tool | Vite | Schneller Dev-Server, optimiertes Bundling |
| Physik | Arcade Physics | Performant, ausreichend für Beat'em-Up |
| Joystick | Rex VirtualJoystick | Native Phaser-Integration, dynamisch positionierbar |
| State Machine | Rex StateManager | Event-basiert, saubere Zustandsübergänge |
| Audio | Phaser SoundManager | Web Audio API + Fallback, Audio-Sprites |
| Partikel | Phaser ParticleEmitter | Konfigurierbar, performant, eingebaut |
| Persistenz | localStorage | Einfach, synchron, ausreichend für Spielstände |
| Hosting | GitHub Pages | Kostenlos, HTTPS, automatisch via Actions |
| CI/CD | GitHub Actions | Build + Deploy bei Push auf main |

---

*Ende der Spezifikation*
