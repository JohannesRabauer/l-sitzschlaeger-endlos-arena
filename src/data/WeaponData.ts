import Phaser from 'phaser';

export enum Rarity { Common, Uncommon, Rare, Epic, Legendary }

export const RARITY_COLORS: Record<Rarity, number> = {
  [Rarity.Common]: 0xffffff,
  [Rarity.Uncommon]: 0x44ff44,
  [Rarity.Rare]: 0x4488ff,
  [Rarity.Epic]: 0xaa44ff,
  [Rarity.Legendary]: 0xffdd00,
};

export const RARITY_MULTIPLIER: Record<Rarity, number> = {
  [Rarity.Common]: 1, [Rarity.Uncommon]: 1.3, [Rarity.Rare]: 1.6, [Rarity.Epic]: 2, [Rarity.Legendary]: 2.8,
};

export interface WeaponDef {
  id: string;
  name: string;
  baseDamage: number;
  attackSpeed: number; // attacks per second
  range: number;
  knockback: number;
  hitWidth: number;
  critBonus: number;
}

export const WEAPONS: WeaponDef[] = [
  { id: 'sword', name: 'Schwert', baseDamage: 10, attackSpeed: 2, range: 40, knockback: 100, hitWidth: 36, critBonus: 0 },
  { id: 'nunchakus', name: 'Nunchakus', baseDamage: 6, attackSpeed: 3.5, range: 30, knockback: 50, hitWidth: 28, critBonus: 0 },
  { id: 'axe', name: 'Axt', baseDamage: 18, attackSpeed: 1.2, range: 38, knockback: 120, hitWidth: 40, critBonus: 0 },
  { id: 'hammer', name: 'Hammer', baseDamage: 15, attackSpeed: 1.4, range: 35, knockback: 200, hitWidth: 44, critBonus: 0 },
  { id: 'daggers', name: 'Doppeldolche', baseDamage: 7, attackSpeed: 3, range: 25, knockback: 30, hitWidth: 24, critBonus: 15 },
  { id: 'chain', name: 'Kettenwaffe', baseDamage: 9, attackSpeed: 1.8, range: 55, knockback: 80, hitWidth: 50, critBonus: 0 },
];

export interface WeaponInstance {
  def: WeaponDef;
  rarity: Rarity;
}

export function createWeapon(rarity?: Rarity): WeaponInstance {
  const def = WEAPONS[Phaser.Math.Between(0, WEAPONS.length - 1)];
  return { def, rarity: rarity ?? Rarity.Common };
}

export function rollRarity(luck: number): Rarity {
  const r = Math.random() * 100;
  const leg = 1 + luck * 0.1;
  const epic = 6 + luck * 0.3;
  const rare = 15 + luck * 0.5;
  const uncommon = 28 + luck;
  if (r < leg) return Rarity.Legendary;
  if (r < leg + epic) return Rarity.Epic;
  if (r < leg + epic + rare) return Rarity.Rare;
  if (r < leg + epic + rare + uncommon) return Rarity.Uncommon;
  return Rarity.Common;
}
