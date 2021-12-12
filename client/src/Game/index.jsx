import React, { useEffect, useState, useRef } from 'react';
import { Stage, Sprite } from '@inlet/react-pixi'
import './index.css';

const resize = (canvasRef, cWidth, cHeight)  => {
  const { width, height } = document.body.getBoundingClientRect();
  const zoomLevel = Math.min(width/cWidth, height/cHeight);
  canvasRef.current._canvas.style.zoom = zoomLevel
};

const Game = function ({ id }) {
  const [players, setPlayers] = useState([]);
  const canvasRef = useRef(null);
  const [WIDTH, HEIGHT] = [320, 200];

  useEffect(() => {
    window.starx.on('GameUpdate', (data) => {
      setPlayers(data.objects);
    });
  }, []);

  // resizing
  useEffect(() => {
    const doResize = () => resize(canvasRef, WIDTH, HEIGHT);
    window.onresize = doResize;
    window.onorientationchange = doResize;
    doResize();
  }, [canvasRef]);

  return (
    <Stage ref={canvasRef} width={WIDTH} height={HEIGHT} >  
      {players.map(p => (
        <Sprite image="../sprites/vita/sprite_00.png" x={p.x} y={p.y} />
      ))}
    </Stage>

  );
};

export default Game;
