import type { Action, GameState, Spell } from '../types/types..ts';

export const createInitialState = (
  canvasWidth: number,
  canvasHeight: number,
): GameState => {
  const playerRadius = canvasHeight * 0.05;
  return {
    players: {
      '1': {
        x: canvasWidth * 0.1,
        y: canvasHeight / 2,
        radius: playerRadius,
        dy: 2,
        direction: 1,
        score: 0,
        color: 'blue',
        castSpeed: 2,
        spellColor: '#111111',
        speed: 2,
      },
      '2': {
        x: canvasWidth * 0.9,
        y: canvasHeight / 2,
        radius: playerRadius,
        dy: 2,
        direction: -1,
        score: 0,
        color: 'green',
        castSpeed: 2,
        spellColor: '#111111',
        speed: 2,
      },
    },
    spells: {},
    lastShootTime: { '1': 0, '2': 0 },
    canvasSize: { width: canvasWidth, height: canvasHeight },
    playerRadius,
    baseInterval: 2500,
  };
};

export const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'UPDATE_PLAYER_POSITION': {
      const updatedPlayers = { ...state.players };
      Object.values(updatedPlayers).forEach((player) => {
        player.y += player.dy * player.direction;
        if (
          player.y + player.radius > action.height ||
          player.y - player.radius < 0
        ) {
          player.direction *= -1;
        }
      });
      return { ...state, players: updatedPlayers };
    }

    case 'CHANGE_PLAYER_SPEED': {
      return {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: {
            ...state.players[action.playerId],
            speed: action.speed,
            dy: action.speed, // Обновляем dy вместе со скоростью
          },
        },
      };
    }

    case 'SHOOT_SPELL': {
      const { playerId } = action;
      const player = state.players[playerId];
      const spellId = `${playerId}-${Date.now()}`;
      const spell = {
        x: player.x,
        y: player.y,
        dx: playerId === '1' ? 5 : -5,
        dy: 0,
        radius: state.playerRadius * 0.35,
        color: player.spellColor,
        owner: playerId,
      };
      return {
        ...state,
        spells: {
          ...state.spells,
          [spellId]: spell,
        },
        lastShootTime: {
          ...state.lastShootTime,
          [playerId]: performance.now(),
        },
      };
    }
    case 'UPDATE_SPELLS': {
      const updatedSpells: Record<string, Spell> = {};
      // Сохраняем ID выстрелов, которые попали, для исключения повторного зачисления
      const hitSpells = new Set();
      const newState = { ...state };

      Object.entries(state.spells).forEach(([spellId, spell]) => {
        spell.x += spell.dx;
        spell.y += spell.dy;

        let isHit = false;
        Object.entries(newState.players).forEach(([k, player]) => {
          if (
            spell.owner !== k &&
            Math.hypot(spell.x - player.x, spell.y - player.y) <
              player.radius + spell.radius
          ) {
            if (!hitSpells.has(spellId)) {
              newState.players[spell.owner].score += 1;
              hitSpells.add(spellId);
              isHit = true;
            }
          }
        });

        if (!isHit && spell.x >= 0 && spell.x <= newState.canvasSize.width) {
          updatedSpells[spellId] = spell;
        }
      });

      return { ...newState, spells: updatedSpells };
    }

    case 'CHANGE_SPELL_COLOR': {
      return {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: {
            ...state.players[action.playerId],
            spellColor: action.color,
          },
        },
      };
    }

    case 'CHANGE_SHOOT_INTERVAL': {
      return {
        ...state,
        players: {
          ...state.players,
          [action.playerId]: {
            ...state.players[action.playerId],
            castSpeed: action.interval,
          },
        },
      };
    }
    case 'CHECK_MOUSE_COLLISION': {
      const newPlayers = { ...state.players };
      const { mousePosition } = action;

      if (mousePosition) {
        Object.entries(newPlayers).forEach(([k, player]) => {
          const distance = Math.hypot(
            mousePosition.x - player.x,
            mousePosition.y - player.y,
          );
          if (distance < player.radius) {
            newPlayers[k] = { ...player, direction: player.direction * -1 };
          }
        });
      }
      return { ...state, players: newPlayers };
    }

    case 'RESTART_GAME': {
      return createInitialState(action.canvasWidth, action.canvasHeight);
    }

    default:
      return state;
  }
};
