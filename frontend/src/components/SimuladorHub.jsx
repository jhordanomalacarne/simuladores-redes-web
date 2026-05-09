import React, { useState, useEffect, useRef } from 'react';
import '../assets/simulador.css';

// Calcula a posição dos 8 computadores em um círculo.
// Raio do círculo é 42% (para sobrar espaço nas bordas de um palco de 100%).
const RADIUS = 42; 
const getPcsCoordinates = () => {
  return Array.from({ length: 8 }, (_, i) => {
    // -90 graus para começar exatamente do topo (12 horas)
    const angle = (i * 45 - 90) * (Math.PI / 180); 
    return {
      id: `PC${i + 1}`,
      x: 50 + RADIUS * Math.cos(angle),
      y: 50 + RADIUS * Math.sin(angle),
    };
  });
};

const pcs = getPcsCoordinates();

export default function SimuladorHub() {
  const [origem, setOrigem] = useState('PC1');
  const [destino, setDestino] = useState('PC5');
  const [isAnimating, setIsAnimating] = useState(false);
  const [logs, setLogs] = useState([]);
  const [faseAtual, setFaseAtual] = useState('idle'); // idle, sending_to_hub, broadcasting, done
  
  const logsEndRef = useRef(null);

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    setLogs(prev => [...prev, { time, msg, type }]);
  };


  const iniciarSimulacao = async () => {
    if (origem === destino) {
      alert("A origem e o destino não podem ser o mesmo PC!");
      return;
    }

    setIsAnimating(true);
    setLogs([]);
    setFaseAtual('idle');
    addLog(`[SISTEMA] Iniciando simulação: ${origem} → ${destino}`, 'info');

    try {
      const response = await fetch('http://localhost:8000/api/simular/hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pc_origem: origem, pc_destino: destino, mensagem_dados: 'PING' })
      });

      if (!response.ok) throw new Error('Falha ao conectar com a API');
      const data = await response.json();
      
      // FASE 1: O pacote viaja pelo cabo da Origem até o Hub
      setTimeout(() => {
        setFaseAtual('sending_to_hub');
        addLog(`[TX] Sinal elétrico gerado. Viajando pelo cabo de ${origem} até o Hub...`, 'warning');
      }, 500);

      // FASE 2: O Hub copia o sinal para os outros cabos
      setTimeout(() => {
        setFaseAtual('broadcasting');
        addLog(`[HUB] Sinal recebido na porta. Realizando Flooding (Broadcast L1) para todas as outras portas ativas!`, 'warning');
      }, 2000);

      // FASE 3: Os sinais chegam aos PCs, que aceitam ou descartam
      setTimeout(() => {
        setFaseAtual('done');
        let aceitoMsg = "";
        let descartadosCont = 0;
        
        data.eventos[2].reacoes.forEach(reacao => {
          if (reacao.status === 'aceito') {
            aceitoMsg = `[RX] ${reacao.mensagem}`;
          } else {
            descartadosCont++;
          }
        });
        
        addLog(aceitoMsg, 'success');
        addLog(`[DROP] ${descartadosCont} PCs analisaram o MAC/IP e descartaram o pacote silenciosamente.`, 'error');
        
        setTimeout(() => {
          setIsAnimating(false);
          addLog('[SISTEMA] Simulação concluída.', 'success');
        }, 3000); 

      }, 3500);

    } catch (error) {
      addLog(`Erro crítico de comunicação: ${error.message} (Verifique se o backend Python está rodando)`, 'error');
      setIsAnimating(false);
    }
  };

  const pcOrigemObj = pcs.find(p => p.id === origem);

  return (
    <div className="simulador-container">
      {/* Painel de Controle Superior */}
      <div className="controls-panel">
        <div className="control-group">
          <label>PC Remetente</label>
          <select value={origem} onChange={e => setOrigem(e.target.value)} disabled={isAnimating}>
            {pcs.map(pc => <option key={`orig-${pc.id}`} value={pc.id}>{pc.id}</option>)}
          </select>
        </div>
        
        <div className="control-group">
          <label>PC Destinatário</label>
          <select value={destino} onChange={e => setDestino(e.target.value)} disabled={isAnimating}>
            {pcs.map(pc => <option key={`dest-${pc.id}`} value={pc.id}>{pc.id}</option>)}
          </select>
        </div>
        
        <button className="btn-simular" onClick={iniciarSimulacao} disabled={isAnimating}>
          {isAnimating ? 'Simulando a Física...' : 'Disparar Pacote'}
        </button>
      </div>

      {/* O Palco da Topologia Lógica e Física */}
      <div className="topology-stage">
        
        {/* Camada 1: Os cabos físicos desenhados em SVG */}
        <svg className="cable-layer">
          {pcs.map(pc => (
            <line 
              key={`cable-${pc.id}`}
              x1="50%" y1="50%" 
              x2={`${pc.x}%`} y2={`${pc.y}%`} 
              className={`cable ${(faseAtual === 'done' && pc.id === destino) ? 'cable-success' : ''}`} 
            />
          ))}
        </svg>

        {/* Camada 2: A bolinha que representa o sinal da Origem -> Hub */}
        {faseAtual === 'sending_to_hub' && (
          <div className="signal-dot" style={{
            '--start-x': `${pcOrigemObj.x}%`, '--start-y': `${pcOrigemObj.y}%`,
            '--end-x': '50%', '--end-y': '50%',
            animationDuration: '1.5s'
          }}></div>
        )}

        {/* Camada 3: As bolinhas que representam o Flooding do Hub -> Outros PCs */}
        {faseAtual === 'broadcasting' && pcs.filter(p => p.id !== origem).map(pc => (
          <div key={`signal-${pc.id}`} className="signal-dot" style={{
            '--start-x': '50%', '--start-y': '50%',
            '--end-x': `${pc.x}%`, '--end-y': `${pc.y}%`,
            animationDuration: '1.5s'
          }}></div>
        ))}

        {/* Camada 4: O Equipamento Central (Hub) */}
        <div className={`node center-hub ${faseAtual === 'broadcasting' ? 'hub-pulsing' : ''}`}>
          <div className="icon">🖧</div>
          <div className="name">HUB (8 Pts)</div>
        </div>

        {/* Camada 5: Os Computadores nas bordas */}
        {pcs.map(pc => {
          let extraClass = '';
          if (pc.id === origem && faseAtual !== 'idle') extraClass = 'is-source';
          if (faseAtual === 'done') {
            if (pc.id === destino) extraClass = 'is-accepted';
            else if (pc.id !== origem) extraClass = 'is-discarded';
          }

          return (
            <div key={pc.id} className={`node ring-pc ${extraClass}`} style={{ left: `${pc.x}%`, top: `${pc.y}%` }}>
              <div className="icon">💻</div>
              <div className="name">{pc.id}</div>
              {faseAtual === 'done' && pc.id === destino && <div className="status-badge badge-success">✓</div>}
              {faseAtual === 'done' && pc.id !== origem && pc.id !== destino && <div className="status-badge badge-error">✕</div>}
            </div>
          );
        })}
      </div>

      {/* Terminal de Logs */}
      <div className="logs-panel">
        {logs.length === 0 && <div className="log-info">Aguardando disparo do pacote...</div>}
        {logs.map((log, index) => (
          <div key={index} className={`log-entry log-${log.type}`}>
            <span className="log-time">[{log.time}]</span>
            {log.msg}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
