export interface Player {
  x: number;
  y: number;
  radius: number;
  dy: number;
  direction: number;
  score: number;
  color: string;
  castSpeed: number;
  spellColor: string;
  speed: number;
}

export interface Spell {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  color: string;
  owner: string;
}

export interface GameState {
  players: Record<string, Player>;
  spells: Record<string, Spell>;
  lastShootTime: Record<string, number>;
  canvasSize: { width: number; height: number };
  playerRadius: number;
  baseInterval: number;
}

export type Action =
  | { type: 'UPDATE_PLAYER_POSITION'; height: number }
  | { type: 'SHOOT_SPELL'; playerId: string }
  | { type: 'UPDATE_SPELLS' }
  | { type: 'CHANGE_SPELL_COLOR'; playerId: string; color: string }
  | { type: 'CHANGE_SHOOT_INTERVAL'; playerId: string; interval: number }
  | { type: 'CHECK_MOUSE_COLLISION'; mousePosition: { x: number; y: number } }
  | { type: 'CHANGE_PLAYER_SPEED'; playerId: string; speed: number }
  | { type: 'RESTART_GAME'; canvasWidth: number; canvasHeight: number };
