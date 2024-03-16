import { useState } from 'react'
import Board from './components/Board'
import { PI2 } from './const';
import { Vec2SubVec2, findBallByPos, spawnBalls } from './utils';

const initialBalls = spawnBalls(10);

function App() {
  const [balls] = useState(initialBalls);

  return (
    <>
      <Board balls={balls}/>
    </>
  )
}

export default App
