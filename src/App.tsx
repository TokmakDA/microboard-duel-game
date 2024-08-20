import { FC } from 'react';
import Game from './components/Game';
import s from './App.module.scss';

const App: FC = () => {
  const canvasWidth = 800;
  const canvasHeight = 600;
  return (
    <div className={s.App}>
      <Game canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
    </div>
  );
};

export default App;
