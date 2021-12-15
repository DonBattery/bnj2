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

export const Character = function ({ id, selected, selectedFrame, ...props }) {
  const app = useApp();
  const [frames, setFrames] = useState([]);

  const spriteSheet = `/assets/${id}.json`

  useEffect(() => {
    const loadedSprite = app.loader.resources?.[spriteSheet];
    if (!loadedSprite) {
      app.loader.add(spriteSheet).load((loader, resource) => {
        setFrames(
          resource[spriteSheet].data.animations
        );
      });
    } 
  }, [app]);

  if (frames.length === 0) {
    return null;
  }

  const selectedFrames = selectedFrame ? [selectedFrame] : frames[selected ? 'run' : 'walk'];
  const textures = selectedFrames.map(f => PIXI.Texture.from(f));

  return (
    <AnimatedSprite
      animationSpeed={0.2}
      isPlaying={selected}
      textures={textures}
      position={props.position}
      {...props}
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
