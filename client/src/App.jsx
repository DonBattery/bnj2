import React, { useState } from 'react';
import Login from './Login';
import Game from './Game';
import './App.css';

const App = function () {
  const [loginData, setLoginData] = useState();

  return (
    <div className="App">
      <div className="App-container">
        {!loginData && <>
          <header className="App-header centered fonted"><h1>Bounce &apos;n Junk</h1></header>
          <Login onLogin={(data) => setLoginData(data)} />
        </>}
        {loginData && <Game world={loginData} />}
      </div>
    </div>
  );
};

export default App;
