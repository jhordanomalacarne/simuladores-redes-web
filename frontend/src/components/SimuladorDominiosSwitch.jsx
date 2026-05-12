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

export default function SimuladorDominiosSwitch({ onBack }) {
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
        
        <svg className="cable-layer">
          {/* Cabos Reais */}
          {pcs.map(pc => (
            <line 
              key={`cable-${pc.id}`}
              x1="50%" y1="50%" 
              x2={`${pc.x}%`} y2={`${pc.y}%`} 
              className="cable" 
            />
          ))}

          {/* Cápsulas de Colisão por Porta (8 Domínios independentes) */}
          {showColisao && pcs.map(pc => (
             <line 
               key={`capsule-${pc.id}`}
               x1="50%" y1="50%" 
               x2={`${pc.x}%`} y2={`${pc.y}%`} 
               className="collision-capsule"
             />
          ))}

          {/* Círculo do Domínio de Broadcast (1 Único Domínio) */}
          {showBroadcast && (
             <circle 
               cx="50%" cy="50%" r="48%"
               className="domain-circle broadcast-domain"
             />
          )}
        </svg>

        {/* SWITCH Central */}
        <div className="node center-hub switch-l2">
          <div className="icon">🎛️</div>
          <div className="name">SWITCH L2</div>
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
             Ative os interruptores acima para visualizar as fronteiras dos domínios em um Switch.
           </div>
        )}

        {showColisao && (
          <div className="log-entry log-error" style={{fontSize: '1rem'}}>
             <span className="log-time" style={{fontSize: '1.2rem'}}>⚠️ DOMÍNIOS DE COLISÃO (MÚLTIPLOS):</span> 
             O Switch isola eletricamente cada uma de suas portas (Microsegmentação). Se você tem 8 computadores conectados, você tem **8 domínios de colisão independentes**. Uma colisão no PC1 jamais atingirá o PC5. 
          </div>
        )}

        {showBroadcast && (
          <div className="log-entry" style={{fontSize: '1rem', color: '#38bdf8', marginTop: showColisao ? '1rem' : '0'}}>
             <span className="log-time" style={{fontSize: '1.2rem'}}>🌐 DOMÍNIO DE BROADCAST (ÚNICO):</span> 
             O Switch **NÃO** quebra domínios de broadcast (a menos que você configure VLANs). Se um PC enviar um ARP Request (FF:FF:FF:FF:FF:FF), o Switch será obrigado a encaminhar o quadro para todas as outras portas.
          </div>
        )}
      </div>

      {/* Créditos do Laboratório */}
      <div className="lab-credits">
        <p>Última atualização: 11/05/2026</p>
        <p>Autoria: Jhordano Malacarne Bravim</p>
      </div>
    </div>
  );
}
