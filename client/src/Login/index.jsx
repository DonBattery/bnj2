import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './index.css';

// const DEFAULT_COLORS = [];

const Login = function ({ onLogin }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#ff0000');

  return (
    <form onSubmit={onLogin} className="Login">
      <input value={name} onChange={({ target }) => setName(target?.value)} placeholder="  min 3 max 12" maxLength="12" size="13" />
      <input type="color" value={color} onChange={({ target }) => setColor(target?.value)} />
      <input type="submit" value="Login" />
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
