from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import init_db, create_game, get_game

app = FastAPI(title="ECO — Juego Masivo")

app.add_middleware(
CORSMiddleware,
allow_origins=[""],
allow_credentials=True,
allow_methods=[""],
allow_headers=["*"],
)

@app.on_event("startup")
def startup():
init_db()

@app.get("/")
def home():
return {
"game": "ECO",
"status": "online"
}

@app.get("/health")
def health():
return {
"status": "ok"
}

@app.post("/games")
def new_game():
game_id = create_game()

return {
    "game_id": game_id,
    "status": "active"
}

@app.get("/games/{game_id}")
def game(game_id: int):
result = get_game(game_id)

if result is None:
    return {
        "error": "game_not_found"
    }

return dict(result)
