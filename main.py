import asyncio
from fastapi.responses import HTMLResponse, FileResponse
from hypercorn.config import Config
from hypercorn.asyncio import serve

from app import app


@app.get("/", response_class=HTMLResponse)
async def get_root():
    with open("wwwroot/index.xhtml") as fd:
        return fd.read()


@app.get("/favicon.ico", response_class=FileResponse)
async def get_favicon():
    return "wwwroot/favicon.ico"


import user
import chat


if __name__ == "__main__":
    conf = Config()
    conf.bind = ["127.0.0.1:80"]
    conf.include_server_header = False
    #conf.accesslog = "-"
    conf.loglevel = "DEBUG"
    asyncio.run(serve(app, conf))
