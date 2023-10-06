from typing import Union, Dict, Tuple, List, Type
from datetime import datetime, timedelta
from pydantic import BaseModel
import user
from app import app
from fastapi import status, Response

### TYPES ###

class Chat(BaseModel):
    session: user.Session
    user: user.Id
    msg: str


class Log:
    def __init__(self, user: user.Id, msg: str) -> None:
        self.user: user.Id = user
        self.msg: str = msg

    def as_json(self):
        return { 
            "user": self.user, 
            "msg": self.msg 
        }
    

class Room:
    def __init__(self) -> None:
        self.__data: List[Log] = []

    def append(self, log: Log):
        self.__data.append(log)

    def as_json(self, idx: int):
        return {
            "logs": [log.as_json() for log in self.__data[idx:]]
        }
    
### FIELDS ###

room: Room = Room()

### ROUTING ###

@app.get("/chat/{idx}")
async def get_chat(idx: int):
    return room.as_json(idx)

@app.post("/chat", status_code=status.HTTP_201_CREATED)
async def post_chat(chat: Chat, response: Response):
    if not user.is_used_by(chat.session, chat.user):
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return
    room.append(Log(chat.user, chat.msg))

### FUNCS ###

def announce(msg: str) -> None:
    room.append(Log(-1, msg))

### ENTRY ###

user.announce = announce
