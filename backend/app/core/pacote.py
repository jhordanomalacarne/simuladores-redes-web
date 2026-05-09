from pydantic import BaseModel
from typing import Any, Optional

class Pacote(BaseModel):
    id_origem: str
    id_destino: str
    dados: str
    timestamp: Optional[float] = None
