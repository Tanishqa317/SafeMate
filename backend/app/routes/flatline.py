from fastapi import APIRouter

from app.services.feature_service import placeholder_response

router = APIRouter()

@router.get("/flatline")
def get_flatline():
    return placeholder_response("Flatline")
