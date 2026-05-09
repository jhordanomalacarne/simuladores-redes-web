import React, { useState, useEffect, useRef } from 'react';
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

export default function SimuladorColisao({ onBack }) {
  const [remetente1, setRemetente1] = useState('PC1');
  const [destinatario1, setDestinatario1] = useState('PC4');
  const [remetente2, setRemetente2] = useState('PC6');
  const [destinatario2, setDestinatario2] = useState('PC2');
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [logs, setLogs] = useState([]);
  
  // Fases: idle, tx_pc1, hub_broadcasting, tx_pc2, collision_on_wire, jam_signal, backoff
  const [faseAtual, setFaseAtual] = useState('idle'); 
  const [backoffDados, setBackoffDados] = useState(null);
  
  const logsEndRef = useRef(null);

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    setLogs(prev => [...prev, { time, msg, type }]);
  };


  const iniciarSimulacao = async () => {
    if (remetente1 === remetente2) {
      alert("Para simular colisão no fio, selecione remetentes diferentes!");
      return;
    }

    setIsAnimating(true);
    setLogs([]);
    setFaseAtual('idle');
    setBackoffDados(null);
    addLog(`[SISTEMA] Iniciando Simulação (Atraso de Propagação)...`, 'info');

    try {
      const response = await fetch('http://localhost:8000/api/simular/colisao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          remetente_1: remetente1, destinatario_1: destinatario1,
          remetente_2: remetente2, destinatario_2: destinatario2
        })
      });

      if (!response.ok) throw new Error('Falha ao conectar com a API');
      const data = await response.json();
      
      const evt = data.eventos;

      // FASE 1: PC1 transmite
      setTimeout(() => {
        setFaseAtual('tx_pc1');
        addLog(evt[0].mensagem, 'success');
      }, 500);

      // FASE 2: Chega no Hub e ele replica
      setTimeout(() => {
        setFaseAtual('hub_broadcasting');
        addLog(evt[1].mensagem, 'warning');
      }, 2000); // Demora 1.5s pra chegar no Hub

      // FASE 3: Atraso de Propagação -> PC2 transmite enquanto o sinal está descendo
      setTimeout(() => {
        setFaseAtual('tx_pc2');
        addLog(evt[2].mensagem, 'warning');
      }, 2500); // 0.5s depois do Hub replicar

      // FASE 4: COLISÃO FÍSICA NO FIO
      setTimeout(() => {
        setFaseAtual('collision_on_wire');
        addLog(evt[3].mensagem, 'error');
      }, 3000); 

      // FASE 5: Jam Signal saindo do Hub para todos
      setTimeout(() => {
        setFaseAtual('jam_signal');
        addLog(evt[4].mensagem, 'error');
      }, 4500);

      // FASE 6: Algoritmo Backoff
      setTimeout(() => {
        setFaseAtual('backoff');
        setBackoffDados(evt[5]);
        addLog(evt[5].mensagem, 'info');
        
        setTimeout(() => {
          setIsAnimating(false);
          addLog('[SISTEMA] Simulação concluída.', 'success');
        }, 3000); 

      }, 6000);

    } catch (error) {
      addLog(`Erro crítico: ${error.message}`, 'error');
      setIsAnimating(false);
    }
  };

  const pcRemetente1Obj = pcs.find(p => p.id === remetente1);
  const pcRemetente2Obj = pcs.find(p => p.id === remetente2);
  
  // Calcula o ponto do impacto no meio do cabo do Remetente 2
  const impactoX = (50 + pcRemetente2Obj.x) / 2;
  const impactoY = (50 + pcRemetente2Obj.y) / 2;

  return (
    <div className="simulador-container" style={{maxWidth: '1000px'}}>
      {onBack && (
        <button onClick={onBack} className="btn-voltar">
          <span>←</span> Voltar para Menu
        </button>
      )}

      {/* Painel de Controle Avançado */}
      <div className="controls-panel" style={{display: 'flex', gap: '2rem'}}>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #38bdf8'}}>
          <div className="control-group">
            <label>Remetente 1</label>
            <select value={remetente1} onChange={e => setRemetente1(e.target.value)} disabled={isAnimating}>
              {pcs.map(pc => <option key={`r1-${pc.id}`} value={pc.id}>{pc.id}</option>)}
            </select>
          </div>
          <div className="control-group">
            <label>Destinatário 1</label>
            <select value={destinatario1} onChange={e => setDestinatario1(e.target.value)} disabled={isAnimating}>
              {pcs.map(pc => <option key={`d1-${pc.id}`} value={pc.id}>{pc.id}</option>)}
            </select>
          </div>
        </div>

        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #f59e0b'}}>
          <div className="control-group">
            <label>Remetente 2 (Colisor)</label>
            <select value={remetente2} onChange={e => setRemetente2(e.target.value)} disabled={isAnimating}>
              {pcs.map(pc => <option key={`r2-${pc.id}`} value={pc.id}>{pc.id}</option>)}
            </select>
          </div>
          <div className="control-group">
            <label>Destinatário 2</label>
            <select value={destinatario2} onChange={e => setDestinatario2(e.target.value)} disabled={isAnimating}>
              {pcs.map(pc => <option key={`d2-${pc.id}`} value={pc.id}>{pc.id}</option>)}
            </select>
          </div>
        </div>
        
        <div style={{display: 'flex', alignItems: 'center'}}>
           <button className="btn-simular" style={{background: '#ef4444', height: '100%'}} onClick={iniciarSimulacao} disabled={isAnimating}>
             {isAnimating ? 'Simulando Atraso...' : 'Forçar Colisão'}
           </button>
        </div>
      </div>

      {/* Topologia Lógica e Física */}
      <div className="topology-stage">
        
        {/* Cabos */}
        <svg className="cable-layer">
          {pcs.map(pc => {
             // O cabo do Remetente 2 treme durante a colisão no fio
             const isCollisionWire = (pc.id === remetente2 && (faseAtual === 'collision_on_wire' || faseAtual === 'jam_signal'));
             const isJam = faseAtual === 'jam_signal';
             
             return (
              <line 
                key={`cable-${pc.id}`}
                x1="50%" y1="50%" 
                x2={`${pc.x}%`} y2={`${pc.y}%`} 
                className={`cable ${isCollisionWire || isJam ? 'cable-error' : ''}`} 
              />
            )
          })}
        </svg>

        {/* FASE 1: Remetente 1 envia para o Hub */}
        {(faseAtual === 'tx_pc1' || faseAtual === 'hub_broadcasting' || faseAtual === 'tx_pc2') && (
          <div className="signal-dot" style={{
            '--start-x': `${pcRemetente1Obj.x}%`, '--start-y': `${pcRemetente1Obj.y}%`, '--end-x': '50%', '--end-y': '50%', animationDuration: '1.5s'
          }}></div>
        )}

        {/* FASE 2: Hub copia sinal do PC1 para TODOS */}
        {(faseAtual === 'hub_broadcasting' || faseAtual === 'tx_pc2') && pcs.filter(p => p.id !== remetente1).map(pc => (
          <div key={`broad1-${pc.id}`} className="signal-dot" style={{
            '--start-x': '50%', '--start-y': '50%', '--end-x': `${pc.x}%`, '--end-y': `${pc.y}%`, animationDuration: '2s'
          }}></div>
        ))}

        {/* FASE 3: Remetente 2 atrasado envia seu sinal CONTRA o sinal que está descendo do Hub */}
        {(faseAtual === 'tx_pc2' || faseAtual === 'collision_on_wire') && (
          <div className="signal-dot signal-dot-error" style={{
            '--start-x': `${pcRemetente2Obj.x}%`, '--start-y': `${pcRemetente2Obj.y}%`, '--end-x': '50%', '--end-y': '50%', animationDuration: '1s'
          }}></div>
        )}

        {/* FASE 4: A Explosão Exata no meio do Fio do Remetente 2 */}
        {faseAtual === 'collision_on_wire' && (
           <div className="hub-collision" style={{
              position: 'absolute',
              left: `${impactoX}%`, top: `${impactoY}%`,
              width: '60px', height: '60px',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', zIndex: 100
           }}>💥</div>
        )}

        {/* FASE 5: Bolinhas vermelhas (Jam Signal) saindo do Hub para todos */}
        {faseAtual === 'jam_signal' && pcs.map(pc => (
          <div key={`jam-${pc.id}`} className="signal-dot signal-dot-error" style={{
            '--start-x': '50%', '--start-y': '50%', '--end-x': `${pc.x}%`, '--end-y': `${pc.y}%`, animationDuration: '1.5s'
          }}></div>
        ))}

        {/* HUB Central */}
        <div className={`node center-hub ${faseAtual === 'jam_signal' ? 'hub-collision' : ''}`}>
          <div className="icon">🖧</div>
          <div className="name">HUB L1</div>
        </div>

        {/* PCs */}
        {pcs.map(pc => {
          let extraClass = '';
          if (pc.id === remetente1 && (faseAtual === 'tx_pc1' || faseAtual === 'hub_broadcasting' || faseAtual === 'tx_pc2')) extraClass = 'is-source';
          
          if (faseAtual === 'jam_signal' || faseAtual === 'backoff') {
            if (pc.id === remetente1 || pc.id === remetente2) {
               extraClass = 'node-waiting'; 
            } else {
               extraClass = 'is-discarded'; 
            }
          }

          let badge = null;
          if (faseAtual === 'backoff' && backoffDados) {
            if (pc.id === remetente1) badge = <div className="status-badge badge-warning">{backoffDados.backoff_1}ms</div>;
            if (pc.id === remetente2) badge = <div className="status-badge badge-warning">{backoffDados.backoff_2}ms</div>;
          } else if (faseAtual === 'jam_signal' || faseAtual === 'backoff') {
             if (pc.id !== remetente1 && pc.id !== remetente2) badge = <div className="status-badge badge-error">✕</div>;
          }

          return (
            <div key={pc.id} className={`node ring-pc ${extraClass}`} style={{ left: `${pc.x}%`, top: `${pc.y}%` }}>
              <div className="icon">💻</div>
              <div className="name">{pc.id}</div>
              {badge}
            </div>
          );
        })}
      </div>

      {/* Terminal de Logs */}
      <div className="logs-panel">
        {logs.map((log, index) => (
          <div key={index} className={`log-entry log-${log.type}`}>
            <span className="log-time">[{log.time}]</span>
            {log.msg}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      {/* Créditos do Laboratório */}
      <div className="lab-credits">
        <p>Última atualização: 09/05/2026</p>
        <p>Autoria: Jhordano Malacarne Bravim</p>
      </div>
    </div>
  );
}
