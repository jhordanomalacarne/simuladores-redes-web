import React, { useState } from 'react';
import Home from './components/Home';
import SimuladorHub from './components/SimuladorHub';
import SimuladorColisao from './components/SimuladorColisao';
import SimuladorDominios from './components/SimuladorDominios';
import Footer from './components/Footer';
import './App.css';

function App() {
  // 'home' ou 'lab1_hub'
  const [telaAtual, setTelaAtual] = useState('home');

  const navegarPara = (tela) => {
    setTelaAtual(tela);
    window.scrollTo(0, 0); // Rola a página para o topo ao trocar de tela
  };

  return (
    <div className="app-container">
      {/* O Header só aparece na tela do laboratório, a Home tem seu próprio Banner */}
      {telaAtual !== 'home' && (
        <header className="app-header">
          <h1>Entendendo o comportamento de um Hub</h1>
        </header>
      )}
      
      <main className="main-content">
        {telaAtual === 'home' && <Home onSelectLab={navegarPara} />}
        {telaAtual === 'lab1_hub' && <SimuladorHub onBack={() => navegarPara('home')} />}
        {telaAtual === 'lab2_colisao' && <SimuladorColisao onBack={() => navegarPara('home')} />}
        {telaAtual === 'lab3_dominios' && <SimuladorDominios onBack={() => navegarPara('home')} />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
