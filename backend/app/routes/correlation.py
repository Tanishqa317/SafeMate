from fastapi import APIRouter

from app.services.feature_service import placeholder_response

router = APIRouter()

@router.get("/correlation")
def get_correlation():
    return placeholder_response("Correlation")
