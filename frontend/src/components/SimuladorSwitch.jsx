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

export default function SimuladorSwitch({ onBack }) {
  const [origem, setOrigem] = useState('PC1');
  const [destino, setDestino] = useState('PC5');
  const [isAnimating, setIsAnimating] = useState(false);
  const [logs, setLogs] = useState([]);
  const [faseAtual, setFaseAtual] = useState('idle'); // idle, tx_switch, mac_table, unicast, rx_success
  
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
    addLog(`[SISTEMA] Iniciando simulação L2: ${origem} → ${destino}`, 'info');

    try {
      const response = await fetch('http://localhost:8000/api/simular/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pc_origem: origem, pc_destino: destino })
      });

      if (!response.ok) throw new Error('Falha ao conectar com a API');
      const data = await response.json();
      const evts = data.eventos;
      
      // FASE 1: Origem para Switch
      setTimeout(() => {
        setFaseAtual('tx_switch');
        addLog(evts[0].mensagem, 'warning');
      }, 500);

      // FASE 2: Processamento MAC
      setTimeout(() => {
        setFaseAtual('mac_table');
        addLog(evts[1].mensagem, 'success');
      }, 2000);

      // FASE 3: Unicast exclusivo
      setTimeout(() => {
        setFaseAtual('unicast');
        addLog(evts[2].mensagem, 'warning');
      }, 3500);

      // FASE 4: Sucesso limpo
      setTimeout(() => {
        setFaseAtual('rx_success');
        addLog(evts[3].mensagem, 'success');
        
        setTimeout(() => {
          setIsAnimating(false);
          addLog('[SISTEMA] Simulação concluída.', 'success');
        }, 2000); 

      }, 5000);

    } catch (error) {
      addLog(`Erro crítico: ${error.message}`, 'error');
      setIsAnimating(false);
    }
  };

  const pcOrigemObj = pcs.find(p => p.id === origem);
  const pcDestinoObj = pcs.find(p => p.id === destino);

  return (
    <div className="simulador-container">
      {onBack && (
        <button onClick={onBack} className="btn-voltar">
          <span>←</span> Voltar para Menu
        </button>
      )}

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
        
        <button className="btn-simular" style={{background: '#a855f7'}} onClick={iniciarSimulacao} disabled={isAnimating}>
          {isAnimating ? 'Processando Unicast...' : 'Disparar Pacote L2'}
        </button>
      </div>

      {/* Topologia Lógica e Física */}
      <div className="topology-stage">
        
        {/* Cabos */}
        <svg className="cable-layer">
          {pcs.map(pc => {
             // O cabo final de sucesso fica verde/roxo apenas para o destinatário
             const isSuccessWire = (faseAtual === 'rx_success' && pc.id === destino);
             return (
              <line 
                key={`cable-${pc.id}`}
                x1="50%" y1="50%" 
                x2={`${pc.x}%`} y2={`${pc.y}%`} 
                className={`cable ${isSuccessWire ? 'cable-l2-success' : ''}`} 
              />
             )
          })}
        </svg>

        {/* FASE 1: Origem para o Switch */}
        {faseAtual === 'tx_switch' && (
          <div className="signal-dot signal-dot-l2" style={{
            '--start-x': `${pcOrigemObj.x}%`, '--start-y': `${pcOrigemObj.y}%`,
            '--end-x': '50%', '--end-y': '50%',
            animationDuration: '1.5s'
          }}></div>
        )}

        {/* FASE 3: A MÁGICA L2 (Unicast: Do Switch APENAS para o Destino) */}
        {faseAtual === 'unicast' && (
          <div className="signal-dot signal-dot-l2" style={{
            '--start-x': '50%', '--start-y': '50%',
            '--end-x': `${pcDestinoObj.x}%`, '--end-y': `${pcDestinoObj.y}%`,
            animationDuration: '1.5s'
          }}></div>
        )}

        {/* SWITCH Central */}
        <div className={`node center-hub switch-l2 ${faseAtual === 'mac_table' ? 'switch-pulsing' : ''}`}>
          <div className="icon">🎛️</div>
          <div className="name">SWITCH L2</div>
        </div>

        {/* Computadores */}
        {pcs.map(pc => {
          let extraClass = '';
          if (pc.id === origem && faseAtual !== 'idle') extraClass = 'is-source-l2';
          if (faseAtual === 'rx_success') {
            if (pc.id === destino) extraClass = 'is-accepted-l2';
            // Repare que NÃO colocamos classe 'is-discarded' nos outros, pois a energia nem chegou neles!
          }

          return (
            <div key={pc.id} className={`node ring-pc ${extraClass}`} style={{ left: `${pc.x}%`, top: `${pc.y}%` }}>
              <div className="icon">💻</div>
              <div className="name">{pc.id}</div>
              {faseAtual === 'rx_success' && pc.id === destino && <div className="status-badge badge-success">✓</div>}
            </div>
          );
        })}
      </div>

      {/* Terminal de Logs */}
      <div className="logs-panel">
        {logs.length === 0 && <div className="log-info">Aguardando disparo...</div>}
        {logs.map((log, index) => (
          <div key={index} className={`log-entry log-${log.type}`}>
            <span className="log-time">[{log.time}]</span>
            {log.msg}
          </div>
        ))}
      </div>

      <div className="lab-credits">
        <p>Última atualização: 09/05/2026</p>
        <p>Autoria: Jhordano Malacarne Bravim</p>
      </div>
    </div>
  );
}
