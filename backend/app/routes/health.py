import datetime
from flask import Blueprint, jsonify
from app.extensions import db

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """
    Production health check endpoint.
    Safely verifies database connectivity without leaking credentials, paths, or secrets.
    """
    db_status = "operational"
    try:
        # Simple scalar ping
        db.session.execute(db.text("SELECT 1"))
    except Exception:
        db_status = "degraded"

    status_code = 200 if db_status == "operational" else 503

    return jsonify({
        "status": "healthy" if db_status == "operational" else "unhealthy",
        "service": "CareerAI API",
        "version": "1.0.0",
        "database": db_status,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }), status_code
