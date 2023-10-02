from typing import Union, Dict, Tuple, List, Type
from datetime import datetime, timedelta
from pydantic import BaseModel
import random
from fastapi import status, Response

from app import app

__all__ = [
    'UserInfo',
    'Session',
    'Id',
    'get_by_id',
    'list_all',
    'is_used_by'
]

### TYPES ###

Session: Type[int] = int
Id: Type[int] = int

class UserCreation(BaseModel):
    name: str

class UserInfo:
    def __init__(self, name) -> None:
        self.id: Id = random.randint(1000, 2147483647)
        self.name: str = f"{name}#{str(self.id)[0:4]}"
        self.alive: bool = True
        self.last_accessed: datetime = datetime.now()

### FIELDS ###

usr: Session = -1
usrs: Dict[Session, UserInfo] = {}

### CONSTS ###

RCVTIMEO = 0.2

### ROUTING ###

@app.get("/usr")
async def get_usr():
    global usr, usrs

    gc_usr()
    datas = [{ "name": dat.name, "id": dat.id } for _, dat in usrs.items() if dat.alive]
    return { "datas": datas }

@app.post("/usr", status_code=status.HTTP_201_CREATED)
async def new_usr(info: UserCreation):
    global usr, usrs

    usr += 1
    usrs[usr] = UserInfo(info.name)
    return { "session": usr, "id": usrs[usr].id }

@app.put("/usr/{session}")
async def update_usr(session: int, response: Response):
    global usr, usrs

    if not usrs.__contains__(session):
        response.status_code = status.HTTP_404_NOT_FOUND
        return

    usrs[session].alive = True
    usrs[session].last_accessed = datetime.now()
    return

### FUNCS ###

def gc_usr() -> None:
    global usr, usrs

    for usr, dat in usrs.items():
        delta: timedelta = datetime.now() - dat.last_accessed
        if (delta.total_seconds() > RCVTIMEO):
            usrs[usr].alive = False
    
    usrs = { session: data for session, data in usrs.items() if data.alive }

def get_by_id(id: int) -> Union[UserInfo, None]:
    gc_usr()
    tmp = [data for _, data in usrs.items() if data.id == id]
    return tmp[0] if len(tmp) else None
    
def list_all() -> List[UserInfo]:
    gc_usr()
    return [data for _, data in usrs.items()]

def is_used_by(session: Session, user: Id) -> bool:
    return usrs.__contains__(session) and usrs[session].id == user
