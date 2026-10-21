from flask import Blueprint, request, jsonify, g, send_file
from app.extensions import db
from app.models.analysis import ResumeAnalysis
from app.utils.security import login_required
from app.services.report_generator import generate_analysis_pdf

analyses_bp = Blueprint("analyses", __name__)


@analyses_bp.route("", methods=["GET"])
@login_required
def get_analyses_history():
    """Returns paginated analysis history for the authenticated user."""
    try:
        page = int(request.args.get("page", 1))
        per_page = min(int(request.args.get("per_page", 10)), 50)
    except ValueError:
        page, per_page = 1, 10

    search = request.args.get("search", "").strip().lower()

    query = ResumeAnalysis.query.filter_by(user_id=g.current_user.id)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (ResumeAnalysis.filename.ilike(search_filter)) |
            (ResumeAnalysis.target_role.ilike(search_filter))
        )

    # Order newest first
    query = query.order_by(ResumeAnalysis.created_at.desc())

    total_count = query.count()
    items = query.paginate(page=page, per_page=per_page, error_out=False).items

    return jsonify({
        "success": True,
        "analyses": [item.to_dict(include_full_details=False) for item in items],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total_count": total_count,
            "total_pages": (total_count + per_page - 1) // per_page if total_count > 0 else 1
        }
    }), 200


@analyses_bp.route("/<int:analysis_id>", methods=["GET"])
@login_required
def get_analysis_detail(analysis_id: int):
    """Returns detailed evaluation for a specific analysis owned by the user."""
    analysis = ResumeAnalysis.query.get(analysis_id)

    if not analysis:
        return jsonify({
            "success": False,
            "error": "Resume analysis not found.",
            "code": "NOT_FOUND"
        }), 404

    # Strict server-side authorization check (prevent IDOR)
    if analysis.user_id != g.current_user.id:
        return jsonify({
            "success": False,
            "error": "You do not have permission to view this analysis.",
            "code": "FORBIDDEN"
        }), 403

    return jsonify({
        "success": True,
        "analysis": analysis.to_dict(include_full_details=True)
    }), 200


@analyses_bp.route("/<int:analysis_id>", methods=["DELETE"])
@login_required
def delete_analysis(analysis_id: int):
    """Deletes an analysis record owned by the authenticated user."""
    analysis = ResumeAnalysis.query.get(analysis_id)

    if not analysis:
        return jsonify({
            "success": False,
            "error": "Resume analysis not found.",
            "code": "NOT_FOUND"
        }), 404

    # Strict server-side authorization check
    if analysis.user_id != g.current_user.id:
        return jsonify({
            "success": False,
            "error": "You do not have permission to delete this analysis.",
            "code": "FORBIDDEN"
        }), 403

    try:
        db.session.delete(analysis)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Resume analysis deleted successfully."
        }), 200
    except Exception:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": "Database error while deleting analysis.",
            "code": "DATABASE_ERROR"
        }), 500


@analyses_bp.route("/<int:analysis_id>/download", methods=["GET"])
@login_required
def download_analysis_report(analysis_id: int):
    """Generates and streams a downloadable PDF report for the user's analysis."""
    analysis = ResumeAnalysis.query.get(analysis_id)

    if not analysis:
        return jsonify({
            "success": False,
            "error": "Resume analysis not found.",
            "code": "NOT_FOUND"
        }), 404

    if analysis.user_id != g.current_user.id:
        return jsonify({
            "success": False,
            "error": "You do not have permission to download this report.",
            "code": "FORBIDDEN"
        }), 403

    try:
        pdf_buffer = generate_analysis_pdf(analysis)
        download_name = f"CareerAI_Report_{analysis.id}.pdf"
        return send_file(
            pdf_buffer,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=download_name
        )
    except Exception:
        return jsonify({
            "success": False,
            "error": "Failed to generate PDF report.",
            "code": "PDF_ERROR"
        }), 500
