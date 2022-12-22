import React, { useState } from 'react';
import Login from './Login';
import Game from './Game';
import Benchmark from './Benchmark';
import './App.css';

const App = function () {
  // Connet the StarX WebSocket client
  // since it's a local depencency, it's sideloaded to the window
  window.starx.init(
    { host: import.meta.env.VITE_WS_HOST || window.location.host, path: '/ws' },
    (data) => console.log('Connected to ws backend', data),
  );

  const [loginData, setLoginData] = useState();
  const isBenchmarkMode = document.location.href.includes('benchmarks');

  return (
    <div className="App">
      <div className="App-container">
        {!loginData && !isBenchmarkMode && (
          <>
            <header className="App-header centered fonted">
              <h1>Bounce &apos;n Junk</h1>
            </header>
            <Login onLogin={(data) => setLoginData(data)} />
          </>
        )}
        {loginData && <Game world={loginData} />}
        {isBenchmarkMode && <Benchmark />}
      </div>
    </div>
  );
};

export default App;
