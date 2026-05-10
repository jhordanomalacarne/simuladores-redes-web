import React from 'react';
import '../assets/home.css';

export default function Home({ onSelectLab }) {
  const laboratorios = [
    {
      id: 'lab1_hub',
      titulo: 'Lab 1: O Hub Básico e o Flooding',
      descricao: 'Descubra como o hardware da Camada 1 funciona na prática. Entenda por que o broadcasting desnecessário satura redes antigas.',
      disponivel: true,
      icone: '🖧'
    },
    {
      id: 'lab2_colisao',
      titulo: 'Lab 2: Domínios de Colisão (CSMA/CD)',
      descricao: 'O que acontece quando dois PCs falam ao mesmo tempo? Veja os sinais elétricos colidindo e o algoritmo de recuo em ação.',
      disponivel: true,
      icone: '💥'
    },
    {
      id: 'lab3_dominios',
      titulo: 'Lab 3: Domínios de Colisão e Broadcast',
      descricao: 'Entenda a topologia lógica de um Hub. Veja por que toda a rede sofre junta quando o assunto é colisão e difusão de pacotes.',
      disponivel: true,
      icone: '⭕'
    },
    {
      id: 'lab4_sniffing',
      titulo: 'Lab 4: Sniffing e Segurança L1',
      descricao: 'Ative o Modo Promíscuo e intercepte dados que não eram para você. Uma introdução visual a vulnerabilidades de redes legadas.',
      disponivel: false,
      icone: '🕵️'
    }
  ];

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1 className="hero-title">GTEC Simulações</h1>
        <p className="hero-subtitle">
          Explore o funcionamento interno das redes de computadores através de laboratórios visuais interativos.
        </p>
      </div>

      <div className="labs-grid">
        {laboratorios.map(lab => (
          <div key={lab.id} className={`lab-card ${!lab.disponivel ? 'lab-locked' : ''}`}>
            <div className="lab-icon">{lab.icone}</div>
            
            <div className="lab-content">
              <h2 className="lab-title">{lab.titulo}</h2>
              <p className="lab-desc">{lab.descricao}</p>
            </div>
            
            <div className="lab-footer">
              {lab.disponivel ? (
                <button 
                  className="btn-start-lab" 
                  onClick={() => onSelectLab(lab.id)}
                >
                  Iniciar Laboratório
                </button>
              ) : (
                <div className="badge-locked">
                  <span>🔒</span> Em breve
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
