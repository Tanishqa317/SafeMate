from fastapi import APIRouter

from app.services.feature_service import placeholder_response

router = APIRouter()

@router.get("/cost-translator")
def get_cost_translator():
    return placeholder_response("Cost Translator")
