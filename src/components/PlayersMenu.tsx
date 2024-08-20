import React from 'react';
import { Player } from '../types/types..ts';
import './PlayersMenu.scss';

type MenuProps = {
  player: Player;
  onSpellColorChange: (color: string) => void;
  onPlayerSpeedChange: (speed: number) => void;
  onCastSpeedChange: (frequency: number) => void;
};

const PlayersMenu: React.FC<MenuProps> = ({
  player,
  onSpellColorChange,
  onPlayerSpeedChange,
  onCastSpeedChange,
}) => {
  return (
    <div className="menu">
      <div>
        <label>Color:</label>
        <input
          type="color"
          value={player.spellColor}
          onChange={(e) => onSpellColorChange(e.target.value)}
        />
      </div>
      <div>
        <label>Speed:</label>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={player.speed}
          onChange={(e) => onPlayerSpeedChange(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Spell Frequency:</label>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={player.castSpeed}
          onChange={(e) => onCastSpeedChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
};

export default PlayersMenu;
