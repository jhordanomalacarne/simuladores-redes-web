from fastapi import APIRouter
from pydantic import BaseModel
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
