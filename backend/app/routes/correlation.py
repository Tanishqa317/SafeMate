import os
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List
from app.services.correlation_service import get_risk_assessment, build_context

router = APIRouter(
    prefix="/risk-assessment",
    tags=["Risk Assessment"]
)

@router.get("/{unit_id}", response_model=Dict)
def get_unit_risk(unit_id: str):
    """
    Fetch the live, Gemini-powered risk assessment for a specific plant unit.
    Returns a 404 validation error if the requested unit does not exist in the dataset.
    """
    # HARDENING STEP: Run context validation first
    context = build_context(unit_id)
    
    # If the service flagged an error or found no matching data rows, block the AI call
    if "error" in context:
        raise HTTPException(
            status_code=404, 
            detail=context["error"]
        )
        
    # If validation passes, safe to run full evaluation and contact Gemini
    assessment = get_risk_assessment(unit_id)
    return assessment


@router.post("", response_model=Dict)
def trigger_batch_risk_assessment(payload: Dict):
    """
    Trigger a batch evaluation across your equipment array.
    """
    unit_id = payload.get("unit_id")
    if not unit_id:
        raise HTTPException(status_code=400, detail="Missing required key: 'unit_id'")
        
    context = build_context(unit_id)
    if "error" in context:
        raise HTTPException(status_code=404, detail=context["error"])
        
    return get_risk_assessment(unit_id)