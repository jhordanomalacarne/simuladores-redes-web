import React from 'react';
import SimuladorHub from './components/SimuladorHub';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>GTEC Simulações</h1>
        <p>Laboratório 1: Entendendo o comportamento de um Hub</p>
      </header>
      <main>
        <SimuladorHub />
      </main>
    </div>
  );
}

export default App;
