import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CharacterAnimation from '../Character';
import './index.css';

const characters = ['dino-doux', 'dino-valami'];

const Login = function ({ onLogin }) {
  const [nickname, setNickname] = useState('');
  const [character, setCharacter] = useState(0);

  const requestLogin = (event) => {
    event.preventDefault();
    window.starx.request('Game.Join', { nickname, color: 'red' }, (data) => {
      onLogin(data);
    });
  };

  const handleSelect = (id) => () => setCharacter(id);

  return (
    <form onSubmit={requestLogin} className="Login centered">
      <label className="Login-block fonted">
        Name
        <input className="Login-input fonted" required type="text" value={nickname} onChange={({ target }) => setNickname(target?.value)} placeholder="  min 3 max 12" maxLength="12" size="13" />
      </label>

      <label className="Login-block fonted">
        Character

        <div className="Login-characters">
          {characters.map((c, i) => (
            <div
              role="button"
              tabIndex={i}
              onClick={handleSelect(i)}
              onKeyDown={handleSelect(i)}
              key={`char_${c}`}
            >
              <CharacterAnimation selected={i === character} selectedFrame="image13.png" key={c} id={c} />
            </div>
          ))}
        </div>
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
