import type { FC } from 'react';
import { useEffect, useRef, useState, useReducer, useCallback } from 'react';
import './Game.scss';
import PlayersMenu from './PlayersMenu.tsx';
import { createInitialState, gameReducer } from '../reducers/gameReducer.ts';

interface GameProps {
  canvasWidth?: number;
  canvasHeight?: number;
}

const Game: FC<GameProps> = ({ canvasWidth = 800, canvasHeight = 800 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [state, dispatch] = useReducer(
    gameReducer,
    createInitialState(canvasWidth, canvasHeight),
  );

  const drawCircle = (
    context: CanvasRenderingContext2D,
    {
      x,
      y,
      radius,
      color,
    }: { x: number; y: number; radius: number; color: string },
  ) => {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    context.closePath();
  };

  const checkCollisionsWithMouse = useCallback(() => {
    if (mousePosition) {
      dispatch({ type: 'CHECK_MOUSE_COLLISION', mousePosition });
    }
  }, [mousePosition]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    const width = canvas?.width ?? canvasWidth;
    const height = canvas?.height ?? canvasHeight;

    let animationFrameId: number;

    const update = (currentTime: number) => {
      if (context) {
        context.clearRect(0, 0, width, height);

        dispatch({ type: 'UPDATE_PLAYER_POSITION', height });
        dispatch({ type: 'UPDATE_SPELLS' });
        checkCollisionsWithMouse();

        // Рисуем игроков
        Object.values(state.players).forEach((player) => {
          drawCircle(context, {
            x: player.x,
            y: player.y,
            radius: player.radius,
            color: player.color,
          });
        });

        // Рисуем заклинания
        Object.values(state.spells).forEach((spell) => {
          drawCircle(context, {
            x: spell.x,
            y: spell.y,
            radius: spell.radius,
            color: spell.color,
          });
        });

        // Стрельба раз в интервал для каждого игрока
        Object.entries(state.players).forEach(([k, player]) => {
          if (
            currentTime - state.lastShootTime[k] >
            state.baseInterval / player.castSpeed
          ) {
            dispatch({ type: 'SHOOT_SPELL', playerId: k });
          }
        });

        // Запуск следующего обновления
        animationFrameId = requestAnimationFrame(update);
      }
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    canvasWidth,
    canvasHeight,
    state.players,
    state.spells,
    state.baseInterval,
    state.lastShootTime,
    checkCollisionsWithMouse,
  ]);

  // Эффект для отслеживания курсора
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const newMousePosition = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        setMousePosition(newMousePosition);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleSpellColorChange = (color: string, playerId: string) => {
    dispatch({ type: 'CHANGE_SPELL_COLOR', playerId, color });
  };

  const handlePlayerSpeedChange = (speed: number, playerId: string) => {
    dispatch({ type: 'CHANGE_PLAYER_SPEED', playerId, speed });
  };

  const handleCastSpeedChange = (interval: number, playerId: string) => {
    dispatch({ type: 'CHANGE_SHOOT_INTERVAL', playerId, interval });
  };

  const handleRestartGame = () => {
    dispatch({ type: 'RESTART_GAME', canvasWidth, canvasHeight });
  };

  return (
    <div className="game">
      <h1 className="game__title">Duel</h1>
      <button className="game__restart-button" onClick={handleRestartGame}>
        Restart Game
      </button>

      <div className="game__scoreboard">
        <div className="game__scoreboard-players">
          Player 1 <strong>vs</strong> Player 2
        </div>
        <div className="game__scoreboard-score">
          {state.players['1'].score} <strong>:</strong>{' '}
          {state.players['2'].score}
        </div>
      </div>
      <div className="game__container">
        <canvas
          className="game__canvas"
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
        />
        <div className="game__player-controllers">
          {Object.entries(state.players).map(([k, player]) => (
            <div key={k}>
              <h2 className="game__player-controllers-player">Player {k}</h2>
              <PlayersMenu
                player={player}
                onSpellColorChange={(color) => handleSpellColorChange(color, k)}
                onPlayerSpeedChange={(speed) =>
                  handlePlayerSpeedChange(speed, k)
                }
                onCastSpeedChange={(interval) =>
                  handleCastSpeedChange(interval, k)
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Game;
