from fastapi import APIRouter

from app.services.feature_service import placeholder_response

router = APIRouter()

@router.get("/evidence-chain")
def get_evidence_chain():
    return placeholder_response("Evidence Chain")
