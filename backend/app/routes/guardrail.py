from fastapi import APIRouter

from app.services.feature_service import placeholder_response

router = APIRouter()

@router.get("/guardrail")
def get_guardrail():
    return placeholder_response("Guardrail")
