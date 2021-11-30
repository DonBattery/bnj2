import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './index.css';

const Login = function ({ onLogin }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#ff0000');

  return (
    <form onSubmit={onLogin} className="Login centered">
      <label className="Login-block fonted">
        Name
        <input className="Login-input" type="text" value={name} onChange={({ target }) => setName(target?.value)} placeholder="  min 3 max 12" maxLength="12" size="13" />
      </label>

      <label className="Login-block fonted">
        Color
        <input className="Login-input" type="color" value={color} onChange={({ target }) => setColor(target?.value)} />
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
