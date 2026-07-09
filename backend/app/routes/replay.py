from fastapi import APIRouter

from app.services.feature_service import placeholder_response

router = APIRouter()

@router.get("/replay")
def get_replay():
    return placeholder_response("Replay")
