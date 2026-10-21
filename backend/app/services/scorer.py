import re
from typing import Dict, Any, List, Tuple
from app.services.skill_extractor import extract_skills


def calculate_ats_score(
    extracted_data: Dict[str, Any],
    job_description: str = "",
    target_role: str = ""
) -> Dict[str, Any]:
    """
    Computes an explainable ATS score (0 - 100) based on 5 core pillars:
    - Skills match: 40 points
    - Relevant experience: 20 points
    - Education match: 15 points
    - Projects relevance: 15 points
    - Formatting & completeness: 10 points

    Supports two modes:
    1. Job-specific compatibility mode (when job_description is provided)
    2. General resume completeness mode (when job_description is omitted)
    """
    has_jd = bool(job_description and job_description.strip())
    resume_skills = [s.lower() for s in extracted_data.get("skills", [])]
    resume_skills_set = set(resume_skills)

    matched_skills = []
    missing_skills = []
    suggestions = []

    # ----------------------------------------------------
    # 1. SKILLS MATCH (Max 40 points)
    # ----------------------------------------------------
    skills_score = 0
    skills_explanation = ""

    if has_jd:
        # Extract skills mentioned in the job description
        jd_skills = extract_skills(job_description)
        jd_skills_lower = [s.lower() for s in jd_skills]
        jd_skills_set = set(jd_skills_lower)

        if jd_skills_set:
            matched_set = resume_skills_set.intersection(jd_skills_set)
            missing_set = jd_skills_set.difference(resume_skills_set)

            # Re-map to proper display casing
            matched_skills = [s for s in extracted_data.get("skills", []) if s.lower() in matched_set]
            # Match missing skills from the JD skills list
            missing_skills = [s for s in jd_skills if s.lower() in missing_set]

            match_ratio = len(matched_set) / len(jd_skills_set)
            skills_score = round(match_ratio * 40)
            skills_explanation = (
                f"Matched {len(matched_set)} of {len(jd_skills_set)} skills ({round(match_ratio * 100)}%) "
                f"identified in the target job description."
            )
            if missing_skills:
                suggestions.append(
                    f"Consider adding or highlighting experience with key missing skills: {', '.join(missing_skills[:5])}."
                )
        else:
            # Fallback if no specific skills in JD text: evaluate keyword overlap
            jd_words = set(re.findall(r"\b[a-zA-Z]{3,}\b", job_description.lower()))
            overlap = resume_skills_set.intersection(jd_words)
            skills_score = min(40, round((len(overlap) / max(len(resume_skills_set), 1)) * 40))
            skills_explanation = f"Matched {len(overlap)} relevant keywords from the job description."
            matched_skills = [s for s in extracted_data.get("skills", []) if s.lower() in overlap]
    else:
        # General completeness mode: evaluate breadth and depth of skills
        num_skills = len(resume_skills)
        if num_skills >= 15:
            skills_score = 40
            skills_explanation = f"Strong technical breadth with {num_skills} recognized skills across domains."
        elif num_skills >= 10:
            skills_score = 34
            skills_explanation = f"Good technical skill coverage with {num_skills} detected skills."
        elif num_skills >= 5:
            skills_score = 25
            skills_explanation = f"Moderate skill coverage ({num_skills} skills). Adding relevant tools and frameworks will strengthen your profile."
            suggestions.append("Broaden your skills section with specific frameworks, databases, and development tools you've used.")
        elif num_skills >= 1:
            skills_score = 15
            skills_explanation = f"Only {num_skills} skills detected. Resume would benefit from a dedicated, structured technical skills section."
            suggestions.append("Add a clearly organized Technical Skills section categorized by Languages, Frameworks, and Tools.")
        else:
            skills_score = 0
            skills_explanation = "No standard technical skills detected in the document."
            suggestions.append("Add an explicit Skills section listing your technical competencies.")

        matched_skills = extracted_data.get("skills", [])

    # ----------------------------------------------------
    # 2. RELEVANT EXPERIENCE (Max 20 points)
    # ----------------------------------------------------
    exp_score = 0
    exp_data = extracted_data.get("experience", {})
    has_exp_section = exp_data.get("has_experience_section", False)
    estimated_years = exp_data.get("estimated_years", 0.0)
    roles = exp_data.get("roles_detected", [])

    if has_jd:
        # Check target years from JD if specified
        jd_years_match = re.search(r"(\d+)\+?\s*years?(?:\s+of)?\s+experience", job_description.lower())
        required_years = float(jd_years_match.group(1)) if jd_years_match else 2.0

        if estimated_years >= required_years:
            exp_score = 20
            exp_explanation = f"Demonstrates ~{estimated_years:.1f} years of experience, meeting or exceeding the {required_years:.0f}+ year benchmark."
        elif estimated_years > 0:
            exp_score = round((estimated_years / required_years) * 16) + 4
            exp_score = min(exp_score, 18)
            exp_explanation = f"Shows ~{estimated_years:.1f} years of experience compared to ~{required_years:.0f} years suggested."
            suggestions.append("Quantify your professional achievements with metrics (e.g. 'improved latency by 30%') to highlight impact.")
        elif has_exp_section:
            exp_score = 12
            exp_explanation = "Experience section is present, though explicit years could not be definitively calculated."
        else:
            exp_score = 5
            exp_explanation = "No distinct work experience section identified."
            suggestions.append("Include internships, freelance work, or open-source contributions if you lack traditional full-time experience.")
    else:
        # General mode
        if estimated_years >= 3.0:
            exp_score = 20
            exp_explanation = f"Strong professional history detected (~{estimated_years:.1f} years of relevant experience)."
        elif estimated_years >= 1.0:
            exp_score = 16
            exp_explanation = f"Solid foundation with ~{estimated_years:.1f} years of experience."
        elif has_exp_section or roles:
            exp_score = 13
            exp_explanation = f"Work experience section detected with roles identified ({', '.join(roles[:2]) if roles else 'listed roles'})."
        else:
            exp_score = 6
            exp_explanation = "Limited or no work experience section found."
            suggestions.append("Add work history, internships, student leadership, or freelance work to provide context on your practical capabilities.")

    # ----------------------------------------------------
    # 3. EDUCATION MATCH (Max 15 points)
    # ----------------------------------------------------
    edu_score = 0
    education_entries = extracted_data.get("education", [])

    if education_entries:
        highest_deg = " ".join([e.get("degree", "") for e in education_entries]).lower()
        if any(d in highest_deg for d in ["master", "m.tech", "m.s", "ph.d", "doctorate", "mba", "mca"]):
            edu_score = 15
            edu_explanation = f"Advanced degree detected ({education_entries[0].get('degree')})."
        elif any(d in highest_deg for d in ["bachelor", "b.tech", "b.e", "b.s", "bca"]):
            edu_score = 14
            edu_explanation = f"Bachelor's degree detected ({education_entries[0].get('degree')})."
        else:
            edu_score = 11
            edu_explanation = "Relevant educational background identified."
    else:
        edu_score = 4
        edu_explanation = "No structured education section or recognized degree detected."
        suggestions.append("Include your university degree, major/branch, graduation year, and academic achievements.")

    # ----------------------------------------------------
    # 4. PROJECTS RELEVANCE (Max 15 points)
    # ----------------------------------------------------
    proj_score = 0
    proj_data = extracted_data.get("projects", {})
    has_proj = proj_data.get("has_projects_section", False)
    proj_count = proj_data.get("project_count_estimate", 0)

    if proj_count >= 3:
        proj_score = 15
        proj_explanation = f"Excellent portfolio depth with ~{proj_count} project entries showcased."
    elif proj_count >= 2:
        proj_score = 13
        proj_explanation = f"Good project portfolio with {proj_count} distinct projects outlined."
    elif has_proj or proj_count >= 1:
        proj_score = 9
        proj_explanation = "Project section detected, but adding 1-2 more end-to-end projects would strengthen application impact."
        suggestions.append("Add detailed technical projects detailing the problem solved, tech stack used, and live demo or GitHub links.")
    else:
        proj_score = 3
        proj_explanation = "No distinct projects section identified."
        suggestions.append("Create a Projects section featuring 2-3 substantial projects to showcase applied engineering skills.")

    # ----------------------------------------------------
    # 5. RESUME COMPLETENESS & FORMATTING (Max 10 points)
    # ----------------------------------------------------
    format_score = 0
    stats = extracted_data.get("document_stats", {})
    contact = extracted_data.get("contact_info", {})
    word_count = stats.get("word_count", 0)

    # Email & Phone (3 pts)
    if contact.get("email") and contact.get("phone"):
        format_score += 3
    elif contact.get("email") or contact.get("phone"):
        format_score += 2
        suggestions.append("Ensure both your email and professional phone number are clearly displayed at the top.")
    else:
        suggestions.append("Missing contact details: Provide a professional email address and phone number.")

    # Candidate Name (2 pts)
    if extracted_data.get("candidate_name"):
        format_score += 2
    else:
        suggestions.append("Ensure your full name is clearly stated as the topmost header on the page.")

    # Professional Links (2 pts)
    if contact.get("linkedin") or contact.get("github"):
        format_score += 2
    else:
        suggestions.append("Include links to your LinkedIn profile and GitHub / portfolio to showcase public work.")

    # Document length / density (3 pts)
    if 250 <= word_count <= 1000:
        format_score += 3
        format_explanation = "Document length and section density are ideal for standard ATS parsers."
    elif word_count < 250:
        format_score += 1
        format_explanation = "Document appears unusually brief (<250 words). Expand on bullet points and key achievements."
        suggestions.append("Flesh out project descriptions and work bullet points to provide more keyword depth.")
    else:
        format_score += 2
        format_explanation = "Comprehensive document length; ensure key technical highlights remain concise and scannable."

    # ----------------------------------------------------
    # TOTAL & NORMALIZATION
    # ----------------------------------------------------
    overall = skills_score + exp_score + edu_score + proj_score + format_score
    overall = max(0, min(100, overall))

    breakdown = {
        "skills": {
            "score": skills_score,
            "max": 40,
            "percentage": round((skills_score / 40) * 100),
            "explanation": skills_explanation
        },
        "experience": {
            "score": exp_score,
            "max": 20,
            "percentage": round((exp_score / 20) * 100),
            "explanation": exp_explanation
        },
        "education": {
            "score": edu_score,
            "max": 15,
            "percentage": round((edu_score / 15) * 100),
            "explanation": edu_explanation
        },
        "projects": {
            "score": proj_score,
            "max": 15,
            "percentage": round((proj_score / 15) * 100),
            "explanation": proj_explanation
        },
        "formatting_and_completeness": {
            "score": format_score,
            "max": 10,
            "percentage": round((format_score / 10) * 100),
            "explanation": format_explanation
        }
    }

    return {
        "overall_score": overall,
        "score_mode": "job_specific" if has_jd else "general_completeness",
        "breakdown": breakdown,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "improvement_suggestions": suggestions,
        "disclaimer": (
            "NOTICE: CareerAI scores are rule-based estimates designed to assist your job search preparation. "
            "They do not represent proprietary employer ATS algorithms or guarantee interview selection."
        )
    }
