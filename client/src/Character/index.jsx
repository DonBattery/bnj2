import React, { useState } from 'react';
import characters from '/src/characters';
import './index.css';

const Character = function ({ id }) {
//   const [loginData, setLoginData] = useState();
  const style = { background: `url(/gifs/${id}.gif) 0 0` };
  return (
    <div className="Character" style={style}></div>
  );
};

export default Character;
