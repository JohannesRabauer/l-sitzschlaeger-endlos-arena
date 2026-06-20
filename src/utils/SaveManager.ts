export interface SaveData {
  player: {
    coins: number;
    highscore: number;
    totalKills: number;
    totalRuns: number;
  };
  settings: {
    musicVolume: number;
    sfxVolume: number;
  };
}

const DEFAULT_SAVE: SaveData = {
  player: { coins: 0, highscore: 0, totalKills: 0, totalRuns: 0 },
  settings: { musicVolume: 0.7, sfxVolume: 1 },
};

const KEY = 'sitzschlaeger_v1';

export class SaveManager {
  static load(): SaveData {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SAVE, player: { ...DEFAULT_SAVE.player }, settings: { ...DEFAULT_SAVE.settings } };
    return JSON.parse(raw);
  }

  static save(data: SaveData) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  static reset() {
    localStorage.removeItem(KEY);
  }
}
