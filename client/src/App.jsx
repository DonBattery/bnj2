import React, { useState } from 'react';
import Login from './Login';
import './App.css';

const App = function () {
  const [isLoggedIn, setLoggedIn] = useState(false);

  return (
    <div className="App">
      <header className="App-header centered fonted"><h1>Bounce &apos;n Junk</h1></header>
      {isLoggedIn && <>Game</>}
      {!isLoggedIn && <Login onLogin={() => setLoggedIn(true)} />}
    </div>
  );
};

export default App;
