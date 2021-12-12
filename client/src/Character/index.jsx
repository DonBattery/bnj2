import React, { useState, useEffect } from 'react';
import {
  Stage,
  Container,
  AnimatedSprite,
  useApp,
} from '@inlet/react-pixi'
import * as PIXI from 'pixi.js';
import './index.css';

const [WIDTH, HEIGHT] = [20, 20];

const Character = function ({ id, selected }) {
  const app = useApp();
  const [frames, setFrames] = useState([]);

  const spriteSheet = `/assets/${id}.json`

  useEffect(() => {
    app.loader.add(spriteSheet).load((loader, resource) => {
      setFrames(
        resource[spriteSheet].data.animations
      );
    });
  }, []);

  if (frames.length === 0) {
    return null;
  }

  const selectedFrames = frames[selected ? 'run' : 'walk'];
  const textures = selectedFrames.map(f => PIXI.Texture.from(f));
  // console.log();
  // return null;
  return (
    <AnimatedSprite
      animationSpeed={0.2}
      isPlaying={selected}
      textures={textures}
    />
  );
};

const Wrapper = ({ id, selected }) => (
  <Stage className={`Wrapper ${selected && 'selected'}`} width={WIDTH} height={HEIGHT}>
    <Container>
      <Character id={id} selected={selected} />
    </Container>
    </Stage>
);


export default Wrapper;
