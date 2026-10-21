import datetime
from app.extensions import db


class ResumeAnalysis(db.Model):
    __tablename__ = "resume_analyses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50), nullable=False, default="pdf")
    target_role = db.Column(db.String(255), nullable=True)
    job_description = db.Column(db.Text, nullable=True)
    
    # Explainable 0-100 ATS Score
    overall_score = db.Column(db.Integer, nullable=False)
    score_breakdown = db.Column(db.JSON, nullable=False)  # Breakdown of skills, experience, education, projects, formatting

    # Extracted data from document
    extracted_data = db.Column(db.JSON, nullable=False)  # Contact, education, experience, projects, all detected skills
    matched_skills = db.Column(db.JSON, nullable=False, default=list)
    missing_skills = db.Column(db.JSON, nullable=False, default=list)
    improvement_suggestions = db.Column(db.JSON, nullable=False, default=list)

    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
        index=True
    )

    def to_dict(self, include_full_details=True):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "filename": self.filename,
            "file_type": self.file_type,
            "target_role": self.target_role,
            "overall_score": self.overall_score,
            "score_breakdown": self.score_breakdown,
            "matched_skills": self.matched_skills or [],
            "missing_skills": self.missing_skills or [],
            "improvement_suggestions": self.improvement_suggestions or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_full_details:
            data["extracted_data"] = self.extracted_data or {}
            data["has_job_description"] = bool(self.job_description and self.job_description.strip())
        return data
