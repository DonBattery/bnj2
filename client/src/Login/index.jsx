import React, { useEffect, useState } from 'react';
// import characters from '/src/characters';
import Character from '../Character';
import PropTypes from 'prop-types';
import './index.css';

const characters = ['doux', 'mort', 'tard', 'vita'];

const Login = function ({ onLogin }) {
  const [nickname, setNickname] = useState('');
  const [color, setColor] = useState('#ff0000');

  const requestLogin = (event) => {
    event.preventDefault();
    window.starx.request('Game.Join', { nickname, color }, (data) => {
      onLogin(data);
    });
  };

  // useEffect(() => {
  //   console
  //   const chars = document.q
  // }, []);

  // console.log(characters.map(c => c.load(5)));
  // console.log(characters.map(c => c.getCanvas()));
  return (
    <form onSubmit={requestLogin} className="Login centered">
      <label className="Login-block fonted">
        Name
        <input className="Login-input" type="text" value={nickname} onChange={({ target }) => setNickname(target?.value)} placeholder="  min 3 max 12" maxLength="12" size="13" />
      </label>

      <label className="Login-block fonted">
        Color
        <input className="Login-input" type="color" value={color} onChange={({ target }) => setColor(target?.value)} />
      </label>
      <label className="Login-block fonted">
        Character
        {characters.map((c) => <Character key={c} id={c} />)}
      </label>

      <label className="Login-block fonted">
        <input className="Login-button fonted" type="submit" value="Login" />
      </label>
    </form>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func,
};

Login.defaultProps = {
  onLogin: null,
};

export default Login;
