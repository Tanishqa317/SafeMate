from fastapi import APIRouter

from app.services.feature_service import placeholder_response

router = APIRouter()

@router.get("/evac-routing")
def get_evac_routing():
    return placeholder_response("Evac Routing")
