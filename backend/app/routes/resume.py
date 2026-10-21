from flask import Blueprint, request, jsonify, g
from app.extensions import db, limiter
from app.models.analysis import ResumeAnalysis
from app.utils.security import login_required, sanitize_filename
from app.utils.validators import validate_file_content
from app.services.parser import parse_resume_document, ResumeParseError
from app.services.skill_extractor import extract_structured_resume_data
from app.services.scorer import calculate_ats_score
from app.services.job_matcher import match_and_rank_jobs

resume_bp = Blueprint("resume", __name__)


@resume_bp.route("/analyze", methods=["POST"])
@login_required
@limiter.limit("15 per minute")
def analyze_resume():
    if "file" not in request.files:
        return jsonify({
            "success": False,
            "error": "No file part in the request. Please upload a PDF or DOCX resume.",
            "code": "MISSING_FILE"
        }), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({
            "success": False,
            "error": "No file selected. Please select a resume file to upload.",
            "code": "NO_FILE_SELECTED"
        }), 400

    raw_filename = file.filename
    clean_filename = sanitize_filename(raw_filename)

    # Read bytes into memory to validate and process without leaving lingering disk files
    try:
        file_bytes = file.read()
    except Exception:
        return jsonify({
            "success": False,
            "error": "Unable to read uploaded file stream.",
            "code": "READ_ERROR"
        }), 400

    # Validate file size, extension, and binary header
    is_valid, detected_type, error_msg = validate_file_content(file_bytes, clean_filename)
    if not is_valid:
        return jsonify({
            "success": False,
            "error": error_msg,
            "code": "INVALID_FILE"
        }), 400

    # Optional inputs
    job_description = request.form.get("job_description", "").strip()
    target_role = request.form.get("target_role", "").strip()

    # Extract text using PyMuPDF or python-docx
    try:
        extracted_text = parse_resume_document(file_bytes, detected_type)
    except ResumeParseError as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "code": "PARSE_ERROR"
        }), 422
    except Exception:
        return jsonify({
            "success": False,
            "error": "Failed to parse document contents. Please check the file formatting.",
            "code": "DOCUMENT_ERROR"
        }), 422

    # Extract structured candidate information
    structured_data = extract_structured_resume_data(extracted_text)

    # Calculate explainable ATS score
    scoring_result = calculate_ats_score(
        extracted_data=structured_data,
        job_description=job_description,
        target_role=target_role
    )

    try:
        # Persist analysis in database
        analysis = ResumeAnalysis(
            user_id=g.current_user.id,
            filename=clean_filename,
            file_type=detected_type,
            target_role=target_role if target_role else None,
            job_description=job_description if job_description else None,
            overall_score=scoring_result["overall_score"],
            score_breakdown=scoring_result["breakdown"],
            extracted_data=structured_data,
            matched_skills=scoring_result["matched_skills"],
            missing_skills=scoring_result["missing_skills"],
            improvement_suggestions=scoring_result["improvement_suggestions"],
        )
        db.session.add(analysis)
        db.session.commit()

        # Compute immediate top 3 recommended jobs based on detected skills
        recommendations = match_and_rank_jobs(
            candidate_skills=structured_data.get("skills", []),
            candidate_experience_years=structured_data.get("experience", {}).get("estimated_years", 0.0),
            limit=3
        )

        return jsonify({
            "success": True,
            "message": "Resume analyzed successfully.",
            "analysis": analysis.to_dict(include_full_details=True),
            "top_recommendations": recommendations,
            "disclaimer": scoring_result["disclaimer"]
        }), 201

    except Exception:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": "Database error saving analysis result.",
            "code": "DATABASE_ERROR"
        }), 500
