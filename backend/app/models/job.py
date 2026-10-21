import datetime
from app.extensions import db


class Job(db.Model):
    __tablename__ = "jobs"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False, index=True)
    company = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    job_type = db.Column(db.String(100), default="Full-time", nullable=False)  # Full-time, Remote, Hybrid
    experience_level = db.Column(db.String(100), default="Entry-Level", nullable=False)  # Entry-Level, Mid-Level, Senior
    min_experience_years = db.Column(db.Integer, default=0, nullable=False)
    description = db.Column(db.Text, nullable=False)
    required_skills = db.Column(db.JSON, nullable=False)  # List of required skills
    preferred_skills = db.Column(db.JSON, nullable=True, default=list)  # List of preferred skills
    salary_range = db.Column(db.String(100), nullable=True)
    is_sample = db.Column(db.Boolean, default=True, nullable=False)  # Clearly labels benchmark sample listings
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "company": self.company,
            "location": self.location,
            "job_type": self.job_type,
            "experience_level": self.experience_level,
            "min_experience_years": self.min_experience_years,
            "description": self.description,
            "required_skills": self.required_skills or [],
            "preferred_skills": self.preferred_skills or [],
            "salary_range": self.salary_range,
            "is_sample": self.is_sample,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
