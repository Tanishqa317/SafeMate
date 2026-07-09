from pydantic import BaseModel

class GenericResponse(BaseModel):
    status: str = "success"
    message: str = "Placeholder response"
