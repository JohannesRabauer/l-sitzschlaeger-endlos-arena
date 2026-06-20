export interface EnemyDef {
  id: string;
  name: string;
  texture: string;
  health: number;
  speed: number;
  damage: number;
  attackRange: number;
  attackCooldown: number;
  xp: number;
  coinDrop: number;
}

export const ENEMY_DEFS: Record<string, EnemyDef> = {
  street: { id: 'street', name: 'Straßenkämpfer', texture: 'enemy_street', health: 30, speed: 80, damage: 5, attackRange: 35, attackCooldown: 1200, xp: 10, coinDrop: 2 },
  ninja: { id: 'ninja', name: 'Ninja', texture: 'enemy_ninja', health: 20, speed: 150, damage: 8, attackRange: 30, attackCooldown: 1500, xp: 15, coinDrop: 3 },
  knight: { id: 'knight', name: 'Ritter', texture: 'enemy_knight', health: 80, speed: 40, damage: 12, attackRange: 38, attackCooldown: 2000, xp: 20, coinDrop: 4 },
  berserker: { id: 'berserker', name: 'Berserker', texture: 'enemy_berserker', health: 50, speed: 60, damage: 8, attackRange: 34, attackCooldown: 1000, xp: 25, coinDrop: 5 },
  elite: { id: 'elite', name: 'Elite', texture: 'enemy_elite', health: 100, speed: 70, damage: 15, attackRange: 36, attackCooldown: 1200, xp: 35, coinDrop: 7 },
};
