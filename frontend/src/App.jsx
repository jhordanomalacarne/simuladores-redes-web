import React from 'react';
import SimuladorHub from './components/SimuladorHub';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Entendendo o comportamento de um Hub</h1>
      </header>
      
      <main className="main-content">
        <SimuladorHub />
      </main>

      <Footer />
    </div>
  );
}

export default App;
