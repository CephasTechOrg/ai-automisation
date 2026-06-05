from pydantic import BaseModel
from typing import Generic, TypeVar
T=TypeVar('T')
class APIResponse(BaseModel, Generic[T]): ok:bool=True; data:T|None=None
