from app.core.pacote import Pacote
import time

class Hub:
    def __init__(self, num_portas: int = 8):
        self.num_portas = num_portas
        # Para simular os PCs conectados, vamos assumir que as portas 1 a 8 estão ligadas a PC1 a PC8
        self.portas_ativas = [f"PC{i}" for i in range(1, num_portas + 1)]

    def processar_pacote(self, pacote: Pacote):
        """
        Um Hub recebe o pacote em uma porta (origem) e transmite para TODAS as outras portas (flooding).
        Não há inteligência de tabela MAC.
        """
        eventos = []
        
        # Evento 1: Recebimento do pacote no Hub
        eventos.append({
            "tipo": "recebimento",
            "origem": pacote.id_origem,
            "destino_pretendido": pacote.id_destino,
            "mensagem": f"Hub recebeu o pacote do {pacote.id_origem}."
        })
        
        # Evento 2: O Hub faz o broadcast para todas as outras portas
        portas_destino = [pc for pc in self.portas_ativas if pc != pacote.id_origem]
        
        eventos.append({
            "tipo": "broadcast",
            "portas_afetadas": portas_destino,
            "mensagem": f"Hub fez broadcast (flooding) para {len(portas_destino)} portas."
        })
        
        # Evento 3: Como cada PC reage ao pacote
        reacoes = []
        for pc in portas_destino:
            if pc == pacote.id_destino:
                reacoes.append({"pc": pc, "status": "aceito", "mensagem": f"{pc} aceitou o pacote (é o destinatário correto)."})
            else:
                reacoes.append({"pc": pc, "status": "descartado", "mensagem": f"{pc} descartou o pacote (não era o destinatário)."})
                
        eventos.append({
            "tipo": "recepcao_pcs",
            "reacoes": reacoes
        })
        
        return {
            "pacote_original": pacote.dict(),
            "eventos": eventos
        }
