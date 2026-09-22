from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ECO-Roto")

app.add_middleware(
CORSMiddleware,
allow_origins=[""],
allow_credentials=True,
allow_methods=[""],
allow_headers=["*"],
)

@app.get("/")
def home():
return {
"game": "ECO-Roto",
"status": "online"
}

@app.get("/health")
def health():
return {
"status": "ok"
}
