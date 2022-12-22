import React, { useEffect, useState, useRef } from 'react';
import { Stage, Sprite } from '@inlet/react-pixi';
import Control from './Control';
import './index.css';

const resize = (canvasRef, cWidth, cHeight) => {
  const { width, height } = document.body.getBoundingClientRect();
  const zoomLevel = Math.min(width / cWidth, height / cHeight);
  canvasRef.current._canvas.style.zoom = zoomLevel;
};

const Game = function ({ id }) {
  const [players, setPlayers] = useState([]);
  const canvasRef = useRef(null);
  const [WIDTH, HEIGHT] = [320, 200];

  useEffect(() => {
    window.starx.on('GameUpdate', (data) => {
      setPlayers(data.objects);
      console.log(data)
    });
  }, []);

  // resizing
  useEffect(() => {
    const doResize = () => resize(canvasRef, WIDTH, HEIGHT);
    window.onresize = doResize;
    window.onorientationchange = doResize;
    doResize();
  }, [canvasRef]);

  const image = 'image6.png';

  return (
    <Control>
      <Stage ref={canvasRef} width={WIDTH} height={HEIGHT}>
        {players.map((p, i) => (
          <Sprite image={image} key={`player_${i}`} x={p.x} y={p.y} />
        ))}
      </Stage>
    </Control>
  );
};

export default Game;
