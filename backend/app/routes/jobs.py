from flask import Blueprint, request, jsonify, g
from app.models.job import Job
from app.models.analysis import ResumeAnalysis
from app.utils.security import login_required
from app.services.job_matcher import match_and_rank_jobs

jobs_bp = Blueprint("jobs", __name__)


@jobs_bp.route("", methods=["GET"])
def list_jobs():
    """Returns paginated benchmark sample jobs with optional keyword & filter search."""
    try:
        page = int(request.args.get("page", 1))
        per_page = min(int(request.args.get("per_page", 12)), 50)
    except ValueError:
        page, per_page = 1, 12

    search = request.args.get("search", "").strip()
    exp_filter = request.args.get("experience_level", "").strip()
    job_type_filter = request.args.get("job_type", "").strip()

    query = Job.query

    if search:
        search_filter = f"%{search.lower()}%"
        query = query.filter(
            (Job.title.ilike(search_filter)) |
            (Job.company.ilike(search_filter)) |
            (Job.location.ilike(search_filter)) |
            (Job.description.ilike(search_filter))
        )

    if exp_filter:
        query = query.filter(Job.experience_level.ilike(f"%{exp_filter}%"))

    if job_type_filter:
        query = query.filter(Job.job_type.ilike(f"%{job_type_filter}%"))

    total_count = query.count()
    items = query.order_by(Job.id.asc()).paginate(page=page, per_page=per_page, error_out=False).items

    return jsonify({
        "success": True,
        "jobs": [job.to_dict() for job in items],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total_count": total_count,
            "total_pages": (total_count + per_page - 1) // per_page if total_count > 0 else 1
        },
        "disclaimer": (
            "NOTICE: These listings are curated benchmark sample profiles used for ATS scoring and skill gap analysis. "
            "They do not represent live hiring vacancies."
        )
    }), 200


@jobs_bp.route("/recommendations", methods=["GET"])
@login_required
def get_recommendations():
    """
    Returns ranked job recommendations tailored to the candidate's extracted profile.
    Uses either the specified analysis_id or the candidate's latest analysis.
    """
    analysis_id = request.args.get("analysis_id")
    search_query = request.args.get("search", "").strip()
    exp_filter = request.args.get("experience_level", "").strip()
    job_type_filter = request.args.get("job_type", "").strip()
    min_score = int(request.args.get("min_score", 0))

    if analysis_id:
        try:
            analysis = ResumeAnalysis.query.filter_by(id=int(analysis_id), user_id=g.current_user.id).first()
        except ValueError:
            analysis = None
    else:
        # Default to latest analysis
        analysis = ResumeAnalysis.query.filter_by(user_id=g.current_user.id).order_by(ResumeAnalysis.created_at.desc()).first()

    if not analysis:
        return jsonify({
            "success": False,
            "error": "No resume analysis found. Please upload a resume first to receive personalized recommendations.",
            "code": "NO_ANALYSIS"
        }), 404

    extracted = analysis.extracted_data or {}
    skills = extracted.get("skills", [])
    exp_years = extracted.get("experience", {}).get("estimated_years", 0.0)

    recommendations = match_and_rank_jobs(
        candidate_skills=skills,
        candidate_experience_years=exp_years,
        search_query=search_query,
        experience_filter=exp_filter,
        job_type_filter=job_type_filter,
        min_score=min_score,
        limit=25
    )

    return jsonify({
        "success": True,
        "analysis_id": analysis.id,
        "filename": analysis.filename,
        "candidate_skills": skills,
        "estimated_experience_years": exp_years,
        "recommendations": recommendations,
        "disclaimer": (
            "NOTICE: Benchmark job matches are ranked algorithmically using skill and experience overlap. "
            "They serve as comparative targets for career readiness."
        )
    }), 200
