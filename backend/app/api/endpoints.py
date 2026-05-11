from fastapi import APIRouter
from pydantic import BaseModel
import random
from app.simuladores.equipamentos.hub import Hub
from app.core.pacote import Pacote

router = APIRouter()

# Instância global do Hub de 8 portas para a simulação
hub_simulador = Hub(num_portas=8)

class SimularHubRequest(BaseModel):
    pc_origem: str
    pc_destino: str
    mensagem_dados: str = "PING"

@router.get("/status")
def get_status():
    """
    Endpoint simples para o frontend verificar se a API está online.
    """
    return {"status": "online", "message": "Backend FastAPI está pronto para receber requisições!"}

@router.post("/simular/hub")
def simular_hub(requisicao: SimularHubRequest):
    """
    Simula o envio de um pacote através de um Hub.
    """
    pacote = Pacote(
        id_origem=requisicao.pc_origem,
        id_destino=requisicao.pc_destino,
        dados=requisicao.mensagem_dados
    )
    
    resultado = hub_simulador.processar_pacote(pacote)
    return resultado

class SimularColisaoRequest(BaseModel):
    remetente_1: str
    destinatario_1: str
    remetente_2: str
    destinatario_2: str

@router.post("/simular/colisao")
def simular_colisao(requisicao: SimularColisaoRequest):
    """
    Simula uma colisão no fio baseada em atraso de propagação.
    """
    backoff_1 = random.randint(100, 1500)
    backoff_2 = random.randint(100, 1500)

    eventos = []
    
    eventos.append({
        "tipo": "tx_pc1",
        "mensagem": f"🔵 {requisicao.remetente_1} verificou o cabo, encontrou-o livre e enviou o pacote para {requisicao.destinatario_1}."
    })

    eventos.append({
        "tipo": "hub_broadcast",
        "mensagem": f"🖧 O sinal de {requisicao.remetente_1} chegou ao Hub, que começou a copiá-pelo para os outros fios."
    })
    
    eventos.append({
        "tipo": "tx_pc2",
        "mensagem": f"⚠️ Atraso de Propagação: O sinal ainda não chegou no {requisicao.remetente_2}. Ele acha que a rede está livre e transmite pacote para {requisicao.destinatario_2}!"
    })
    
    eventos.append({
        "tipo": "colisao_cabo",
        "mensagem": f"💥 COLISÃO NO FIO! O sinal descendo do Hub e o sinal subindo de {requisicao.remetente_2} colidiram no meio do cabo físico."
    })
    
    eventos.append({
        "tipo": "jam_signal",
        "mensagem": f"🔊 Lixo elétrico (Jam Signal) gerado pela colisão viajou para o Hub, que o amplificou para todas as portas."
    })
    
    eventos.append({
        "tipo": "csma_cd",
        "remetente_1": requisicao.remetente_1,
        "backoff_1": backoff_1,
        "remetente_2": requisicao.remetente_2,
        "backoff_2": backoff_2,
        "mensagem": f"⏱️ CSMA/CD ativado: {requisicao.remetente_1} aguardará {backoff_1}ms e {requisicao.remetente_2} aguardará {backoff_2}ms antes de tentar novamente."
    })
    
    return {
        "eventos": eventos
    }

class SimularSwitchRequest(BaseModel):
    pc_origem: str
    pc_destino: str

@router.post("/simular/switch")
def simular_switch(requisicao: SimularSwitchRequest):
    """
    Simula o comportamento de um Switch L2 usando Unicast.
    """
    eventos = []
    
    eventos.append({
        "tipo": "tx_switch",
        "mensagem": f"🔵 Quadro Ethernet gerado. Viajando pelo cabo de {requisicao.pc_origem} até o Switch..."
    })

    eventos.append({
        "tipo": "mac_table",
        "mensagem": f"🧠 Inteligência L2: Switch leu o MAC Destino, consultou a Tabela MAC na memória (CAM) e encontrou a porta correta para {requisicao.pc_destino}."
    })
    
    eventos.append({
        "tipo": "unicast",
        "mensagem": f"🎯 UNICAST: O circuito foi fechado internamente. O quadro foi encaminhado única e exclusivamente pelo cabo do {requisicao.pc_destino}."
    })
    
    eventos.append({
        "tipo": "rx_success",
        "mensagem": f"✅ {requisicao.pc_destino} recebeu o quadro com segurança. Nenhum outro PC na rede foi incomodado (sem ruído)."
    })
    
    return {
        "eventos": eventos
    }
