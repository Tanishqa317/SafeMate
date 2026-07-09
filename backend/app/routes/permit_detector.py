from fastapi import APIRouter

from app.services.feature_service import placeholder_response

router = APIRouter()

@router.get("/permit-detector")
def get_permit_detector():
    return placeholder_response("Permit Detector")
