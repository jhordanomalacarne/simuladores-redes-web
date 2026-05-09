from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router

app = FastAPI(
    title="Simuladores de Redes GTEC API",
    description="API para os simuladores educacionais de redes",
    version="1.0.0"
)

# Configuração de CORS (Permite que o frontend acesse o backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, altere para o domínio correto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrando as rotas
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"mensagem": "API dos Simuladores de Redes GTEC funcionando!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
