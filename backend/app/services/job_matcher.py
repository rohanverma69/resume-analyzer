from typing import List, Dict, Any
from app.models.job import Job


def match_and_rank_jobs(
    candidate_skills: List[str],
    candidate_experience_years: float = 0.0,
    search_query: str = "",
    experience_filter: str = "",
    job_type_filter: str = "",
    min_score: int = 0,
    limit: int = 20
) -> List[Dict[str, Any]]:
    """
    Ranks benchmark sample jobs against the candidate's extracted profile.
    Calculates a transparent relevance score (0 - 100%) based on:
    - Required skills overlap (65% weight)
    - Preferred skills overlap (20% weight)
    - Experience year alignment (15% weight)
    """
    candidate_skills_lower = {s.lower() for s in candidate_skills}

    query = Job.query

    # Apply optional search filters
    if search_query:
        search = f"%{search_query.strip().lower()}%"
        query = query.filter(
            (Job.title.ilike(search)) |
            (Job.company.ilike(search)) |
            (Job.location.ilike(search)) |
            (Job.description.ilike(search))
        )

    if experience_filter:
        query = query.filter(Job.experience_level.ilike(f"%{experience_filter.strip()}%"))

    if job_type_filter:
        query = query.filter(Job.job_type.ilike(f"%{job_type_filter.strip()}%"))

    jobs = query.all()
    ranked_results = []

    for job in jobs:
        req_skills = job.required_skills or []
        pref_skills = job.preferred_skills or []

        # Required skills match
        req_matched = [s for s in req_skills if s.lower() in candidate_skills_lower]
        req_missing = [s for s in req_skills if s.lower() not in candidate_skills_lower]
        req_ratio = len(req_matched) / max(len(req_skills), 1)

        # Preferred skills match
        pref_matched = [s for s in pref_skills if s.lower() in candidate_skills_lower]
        pref_missing = [s for s in pref_skills if s.lower() not in candidate_skills_lower]
        pref_ratio = (len(pref_matched) / max(len(pref_skills), 1)) if pref_skills else 0.5

        # Experience alignment
        if job.min_experience_years <= 0 or candidate_experience_years >= job.min_experience_years:
            exp_ratio = 1.0
        else:
            exp_ratio = max(0.2, candidate_experience_years / job.min_experience_years)

        # Weighted calculation
        total_score = round((req_ratio * 65) + (pref_ratio * 20) + (exp_ratio * 15))
        total_score = max(0, min(100, total_score))

        if total_score >= min_score:
            ranked_results.append({
                "job": job.to_dict(),
                "relevance_score": total_score,
                "matched_required_skills": req_matched,
                "missing_required_skills": req_missing,
                "matched_preferred_skills": pref_matched,
                "missing_preferred_skills": pref_missing,
                "experience_aligned": candidate_experience_years >= job.min_experience_years,
            })

    # Sort descending by relevance score, then by matched required skills count
    ranked_results.sort(key=lambda x: (x["relevance_score"], len(x["matched_required_skills"])), reverse=True)

    return ranked_results[:limit]
