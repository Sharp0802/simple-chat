from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

__all__ = [
    "app"
]

app = FastAPI()
app.mount("/wwwroot", StaticFiles(directory="wwwroot"), name="wwwroot")
