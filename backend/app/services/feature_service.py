from app.models.schemas import GenericResponse


def placeholder_response(feature_name: str) -> GenericResponse:
    return GenericResponse(message=f"{feature_name} endpoint placeholder")
