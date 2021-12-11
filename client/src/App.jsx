import React, { useState } from 'react';
import Login from './Login';
import Game from './Game';
import './App.css';

const App = function () {
  const [loginData, setLoginData] = useState();

  return (
    <div className="App">
      <header className="App-header centered fonted"><h1>Bounce &apos;n Junk</h1></header>
      {loginData && <Game world={loginData} />}
      {!loginData && <Login onLogin={(data) => setLoginData(data)} />}
    </div>
  );
};

export default App;
