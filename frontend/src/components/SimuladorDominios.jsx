import React, { useState } from 'react';
import '../assets/simulador.css';

const RADIUS = 42; 
const getPcsCoordinates = () => {
  return Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 - 90) * (Math.PI / 180); 
    return {
      id: `PC${i + 1}`,
      x: 50 + RADIUS * Math.cos(angle),
      y: 50 + RADIUS * Math.sin(angle),
    };
  });
};

const pcs = getPcsCoordinates();

export default function SimuladorDominios({ onBack }) {
  const [showColisao, setShowColisao] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);

  return (
    <div className="simulador-container">
      {onBack && (
        <button onClick={onBack} className="btn-voltar">
          <span>←</span> Voltar para Menu
        </button>
      )}

      {/* Painel de Controle (Toggles) */}
      <div className="controls-panel" style={{display: 'flex', gap: '2rem', justifyContent: 'center'}}>
        
        <div className="toggle-group" style={{display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem 2rem', borderRadius: '0.5rem', border: '1px solid #ef4444'}}>
          <label className="switch">
            <input type="checkbox" checked={showColisao} onChange={(e) => setShowColisao(e.target.checked)} />
            <span className="slider round"></span>
          </label>
          <span style={{fontWeight: 'bold', color: '#f8fafc'}}>Domínio de Colisão</span>
        </div>

        <div className="toggle-group" style={{display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(56, 189, 248, 0.1)', padding: '1rem 2rem', borderRadius: '0.5rem', border: '1px solid #38bdf8'}}>
          <label className="switch switch-blue">
            <input type="checkbox" checked={showBroadcast} onChange={(e) => setShowBroadcast(e.target.checked)} />
            <span className="slider round"></span>
          </label>
          <span style={{fontWeight: 'bold', color: '#f8fafc'}}>Domínio de Broadcast</span>
        </div>

      </div>

      {/* Topologia Lógica e Física */}
      <div className="topology-stage">
        
        {/* Cabos */}
        <svg className="cable-layer">
          {pcs.map(pc => (
            <line 
              key={`cable-${pc.id}`}
              x1="50%" y1="50%" 
              x2={`${pc.x}%`} y2={`${pc.y}%`} 
              className="cable" 
            />
          ))}

          {/* Círculo do Domínio de Colisão (Raio 45%) */}
          {showColisao && (
             <circle 
               cx="50%" cy="50%" r="45%"
               className="domain-circle collision-domain"
             />
          )}

          {/* Círculo do Domínio de Broadcast (Raio 48%) */}
          {showBroadcast && (
             <circle 
               cx="50%" cy="50%" r="48%"
               className="domain-circle broadcast-domain"
             />
          )}
        </svg>

        {/* HUB Central */}
        <div className="node center-hub">
          <div className="icon">🖧</div>
          <div className="name">HUB L1</div>
        </div>

        {/* PCs */}
        {pcs.map(pc => (
          <div key={pc.id} className="node ring-pc" style={{ left: `${pc.x}%`, top: `${pc.y}%` }}>
            <div className="icon">💻</div>
            <div className="name">{pc.id}</div>
          </div>
        ))}
      </div>

      {/* Explicação Didática */}
      <div className="logs-panel" style={{minHeight: '150px'}}>
        {(!showColisao && !showBroadcast) && (
           <div className="log-info" style={{fontSize: '1.1rem', textAlign: 'center', marginTop: '2rem'}}>
             Ative os interruptores acima para visualizar as fronteiras dos domínios lógicos desta rede.
           </div>
        )}

        {showColisao && (
          <div className="log-entry log-error" style={{fontSize: '1rem'}}>
             <span className="log-time" style={{fontSize: '1.2rem'}}>⚠️ DOMÍNIO DE COLISÃO (ÚNICO):</span> 
             Como o Hub é apenas um repetidor elétrico burro, todos os 8 PCs e o próprio Hub estão presos dentro de um único domínio. Se qualquer um dos 8 PCs falar ao mesmo tempo que outro, a energia vai bater e todo mundo vai sofrer.
          </div>
        )}

        {showBroadcast && (
          <div className="log-entry" style={{fontSize: '1rem', color: '#38bdf8', marginTop: showColisao ? '1rem' : '0'}}>
             <span className="log-time" style={{fontSize: '1.2rem'}}>🌐 DOMÍNIO DE BROADCAST (ÚNICO):</span> 
             Da mesma forma, não há separação lógica no Hub. Um pacote endereçado para FF:FF:FF:FF:FF:FF (Broadcast MAC) vai engolfa a rede inteira. Todos os 8 PCs receberão e terão que processar a mensagem no nível da CPU.
          </div>
        )}
      </div>

      {/* Créditos do Laboratório */}
      <div className="lab-credits">
        <p>Última atualização: 09/05/2026</p>
        <p>Autoria: Jhordano Malacarne Bravim</p>
      </div>
    </div>
  );
}
