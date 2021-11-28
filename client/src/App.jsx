import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header centered"><h1>Bounce 'n Junk</h1></header>
    </div>
  )
}

export default App
