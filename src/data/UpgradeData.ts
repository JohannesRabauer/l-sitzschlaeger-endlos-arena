export interface Upgrade {
  id: string;
  name: string;
  icon: string;
  description: string;
  apply: (stats: PlayerStats) => void;
}

export interface PlayerStats {
  maxHealth: number;
  attackSpeed: number;
  damage: number;
  speed: number;
  luck: number;
  armor: number;
  chargeRate: number;
  pickupRadius: number;
}

export const UPGRADES: Upgrade[] = [
  { id: 'health', name: 'Mehr Leben', icon: '❤️', description: '+20 Max-HP', apply: s => { s.maxHealth += 20; } },
  { id: 'atkspd', name: 'Schnelle Angriffe', icon: '⚡', description: '+8% Angriffsgeschwindigkeit', apply: s => { s.attackSpeed *= 1.08; } },
  { id: 'damage', name: 'Mehr Schaden', icon: '💪', description: '+3 Basisschaden', apply: s => { s.damage += 3; } },
  { id: 'speed', name: 'Schneller', icon: '🏃', description: '+10% Bewegung', apply: s => { s.speed *= 1.1; } },
  { id: 'luck', name: 'Bessere Beute', icon: '🍀', description: '+5% Seltenheit', apply: s => { s.luck += 5; } },
  { id: 'armor', name: 'Schadensreduktion', icon: '🛡️', description: '-5% Schaden', apply: s => { s.armor += 5; } },
  { id: 'charge', name: 'Spezial-Ladung', icon: '💫', description: '+10% Charge-Rate', apply: s => { s.chargeRate *= 1.1; } },
  { id: 'magnet', name: 'Magnet', icon: '🧲', description: '+20px Pickup-Radius', apply: s => { s.pickupRadius += 20; } },
];
