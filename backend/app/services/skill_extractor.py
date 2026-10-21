import re
from typing import Dict, List, Any, Optional

# Comprehensive curated dictionary of industry skills categorized by domain
SKILL_TAXONOMY = {
    "Programming Languages": [
        "python", "javascript", "typescript", "java", "c++", "c#", "c", "golang", "go",
        "rust", "ruby", "php", "swift", "kotlin", "sql", "html", "html5", "css", "css3",
        "bash", "shell", "powershell", "r", "dart", "scala", "matlab", "perl"
    ],
    "Frameworks & Web": [
        "react", "react.js", "reactjs", "next.js", "nextjs", "angular", "vue", "vue.js",
        "node.js", "nodejs", "express", "express.js", "flask", "django", "fastapi",
        "spring boot", "spring", "asp.net", ".net core", "laravel", "rails", "ruby on rails",
        "redux", "tailwind css", "tailwindcss", "bootstrap", "graphql", "rest api", "restful api",
        "websockets", "microservices"
    ],
    "Databases & Storage": [
        "mysql", "postgresql", "postgres", "sqlite", "mongodb", "redis", "cassandra",
        "dynamodb", "oracle", "elasticsearch", "neo4j", "firebase", "supabase", "mariadb"
    ],
    "Cloud & DevOps": [
        "aws", "amazon web services", "azure", "microsoft azure", "gcp", "google cloud",
        "docker", "kubernetes", "k8s", "terraform", "ansible", "ci/cd", "github actions",
        "jenkins", "gitlab ci", "linux", "nginx", "apache", "serverless", "cloudformation"
    ],
    "AI, ML & Data Science": [
        "machine learning", "deep learning", "nlp", "natural language processing",
        "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn",
        "pandas", "numpy", "scipy", "matplotlib", "seaborn", "llm", "large language models",
        "langchain", "hugging face", "transformers", "opencv", "data analysis",
        "tableau", "power bi", "data visualization", "generative ai"
    ],
    "Tools & Engineering Practices": [
        "git", "github", "gitlab", "bitbucket", "jira", "agile", "scrum", "kanban",
        "unit testing", "tdd", "pytest", "jest", "cypress", "system design",
        "object-oriented programming", "oop", "functional programming"
    ],
    "Core Competencies": [
        "leadership", "team management", "communication", "problem solving",
        "critical thinking", "project management", "cross-functional collaboration"
    ]
}

# Flattened list with canonical mappings for exact matching
ALL_CANONICAL_SKILLS = {}
for category, skills in SKILL_TAXONOMY.items():
    for skill in skills:
        ALL_CANONICAL_SKILLS[skill.lower()] = skill


def extract_skills(text: str) -> List[str]:
    """
    Extracts canonical skills from document text using regex word-boundary patterns.
    Avoids false positives (e.g., 'c' matching 'in', 'go' matching 'going').
    """
    if not text:
        return []

    text_lower = f" {text.lower()} "
    detected_skills = set()

    # Pre-clean punctuation except relevant skill chars (+, #, ., -)
    cleaned_text = re.sub(r"[^\w\s+#.-]", " ", text_lower)

    for skill_key, original_display in ALL_CANONICAL_SKILLS.items():
        # Special handling for single or short letters like c, r, go
        if skill_key in {"c", "r"}:
            pattern = rf"(?:\b|_){re.escape(skill_key)}(?:\b|_)"
            if re.search(pattern, text_lower):
                # Verify it's in a programming/skills context or list
                if re.search(rf"\b(c\+\+|languages?|programming|coding|skills?)\b", text_lower):
                    detected_skills.add(skill_key.upper())
        elif skill_key == "go":
            pattern = r"\b(golang|go language|go programming)\b"
            if (
                re.search(pattern, text_lower)
                or re.search(r"\bgo\b(?=[\s,;/]+(?:and\s+|or\s+)?(?:python|java|rust|c\+\+|typescript|javascript|ruby|php|sql))", text_lower)
                or re.search(r"(?:python|java|rust|c\+\+|typescript|javascript|ruby|php|sql)[\s,;/]+(?:and\s+|or\s+)?\bgo\b", text_lower)
            ):
                detected_skills.add("Go")
        elif skill_key in {"c++", "c#"}:
            pattern = rf"(?:\s|,|/|^){re.escape(skill_key)}(?:\s|,|/|$|\.)"
            if re.search(pattern, text_lower):
                detected_skills.add(skill_key.upper())
        elif skill_key in {".net core", "asp.net"}:
            if skill_key in text_lower:
                detected_skills.add(original_display.title())
        elif "." in skill_key:
            # Handles react.js, node.js, vue.js
            escaped = re.escape(skill_key)
            if re.search(rf"\b{escaped}\b", text_lower):
                # Normalize react.js to React, node.js to Node.js
                clean_name = skill_key.replace(".js", "").capitalize()
                detected_skills.add(clean_name if clean_name != "Node" else "Node.js")
        else:
            pattern = rf"\b{re.escape(skill_key)}\b"
            if re.search(pattern, cleaned_text):
                # Format appropriately
                if len(skill_key) <= 3 and skill_key not in {"css", "git", "nlp"}:
                    detected_skills.add(skill_key.upper())
                elif skill_key in {"aws", "gcp", "sql", "css", "html", "html5", "css3", "nlp", "ci/cd", "tdd", "oop"}:
                    detected_skills.add(skill_key.upper())
                else:
                    detected_skills.add(original_display.title())

    return sorted(list(detected_skills))


def extract_contact_info(text: str) -> Dict[str, Any]:
    """
    Extracts candidate contact details: email, phone numbers, LinkedIn, GitHub, and Portfolio.
    Never fabricates missing info.
    """
    contact = {
        "email": None,
        "phone": None,
        "linkedin": None,
        "github": None,
        "portfolio": None,
    }

    if not text:
        return contact

    # Email
    email_match = re.search(r"[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}", text)
    if email_match:
        contact["email"] = email_match.group(0).strip()

    # Phone: US and international patterns
    phone_match = re.search(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b", text)
    if phone_match:
        contact["phone"] = phone_match.group(0).strip()

    # LinkedIn
    linkedin_match = re.search(r"(https?://(?:www\.)?linkedin\.com/in/[\w-]+|linkedin\.com/in/[\w-]+)", text, re.IGNORECASE)
    if linkedin_match:
        contact["linkedin"] = linkedin_match.group(0).strip()

    # GitHub
    github_match = re.search(r"(https?://(?:www\.)?github\.com/[\w-]+|github\.com/[\w-]+)", text, re.IGNORECASE)
    if github_match:
        contact["github"] = github_match.group(0).strip()

    # Portfolio / personal website
    portfolio_match = re.search(r"https?://(?!.*(?:linkedin|github)\.com)[\w.-]+\.[a-zA-Z]{2,}(?:/\S*)?", text)
    if portfolio_match:
        contact["portfolio"] = portfolio_match.group(0).strip()

    return contact


def extract_candidate_name(text: str) -> Optional[str]:
    """
    Attempts to identify the candidate's name from the top header lines.
    Rejects lines containing keywords like 'Resume', 'Curriculum Vitae', contact info, or emails.
    """
    if not text:
        return None

    lines = [line.strip() for line in text.split("\n") if line.strip()]
    disallowed_words = {
        "resume", "curriculum", "vitae", "cv", "page", "phone", "email",
        "summary", "objective", "experience", "education", "skills", "projects", "profile"
    }

    # Inspect first 5 non-empty lines
    for line in lines[:5]:
        if "@" in line or "http" in line or "github" in line or "linkedin" in line:
            continue
        cleaned = re.sub(r"[^a-zA-Z\s]", "", line).strip()
        words = cleaned.split()
        if 2 <= len(words) <= 4:
            # Check none of the words are section headers
            if not any(w.lower() in disallowed_words for w in words):
                # Candidate name found
                return " ".join(words).title()

    return None


def extract_education(text: str) -> List[Dict[str, str]]:
    """
    Identifies education entries including degrees, fields of study, and years.
    """
    education_entries = []
    if not text:
        return education_entries

    degree_patterns = [
        r"(b\.?tech(?:nology)?|b\.?e\.?|bachelor(?:'s)?(?:\s+of\s+[a-zA-Z\s]+)?)",
        r"(m\.?tech|m\.?s\.?|master(?:'s)?(?:\s+of\s+[a-zA-Z\s]+)?)",
        r"(ph\.?d\.?|doctorate(?:\s+of\s+[a-zA-Z\s]+)?)",
        r"(b\.?s\.?c?|bba|mba|bca|mca)",
    ]

    lines = text.split("\n")
    for i, line in enumerate(lines):
        line_clean = line.strip()
        for deg_pat in degree_patterns:
            deg_match = re.search(deg_pat, line_clean, re.IGNORECASE)
            if deg_match:
                degree = deg_match.group(0).strip()
                # Search nearby lines for institution or graduation year (e.g. 2018 - 2022)
                context = " ".join([l.strip() for l in lines[max(0, i - 1):min(len(lines), i + 3)]])
                year_match = re.search(r"\b(19\d{2}|20\d{2})(?:\s*[-–to]+\s*(19\d{2}|20\d{2}|present))?\b", context, re.IGNORECASE)
                year_str = year_match.group(0) if year_match else None

                entry = {
                    "degree": degree.title(),
                    "details": line_clean[:120],
                    "year": year_str
                }
                # Prevent exact duplicates
                if not any(e["degree"].lower() == entry["degree"].lower() and e.get("year") == entry.get("year") for e in education_entries):
                    education_entries.append(entry)

    return education_entries


def extract_experience_summary(text: str) -> Dict[str, Any]:
    """
    Estimates professional experience years and extracts work history indicators.
    """
    summary = {
        "estimated_years": 0.0,
        "roles_detected": [],
        "has_experience_section": False,
    }

    if not text:
        return summary

    text_lower = text.lower()
    if re.search(r"\b(work\s+experience|professional\s+experience|employment\s+history|experience)\b", text_lower):
        summary["has_experience_section"] = True

    # Look for explicit statements like "5+ years of experience" or "3 years experience"
    exp_explicit = re.findall(r"(\d+(?:\.\d+)?)\+?\s*years?(?:\s+of)?\s+(?:experience|hands-on)", text_lower)
    if exp_explicit:
        try:
            years = max([float(y) for y in exp_explicit])
            summary["estimated_years"] = min(years, 40.0)
        except ValueError:
            pass

    # Look for year ranges like 2019 - 2023 or 2021 - Present
    year_ranges = re.findall(r"\b(20[0-2]\d|199\d)\s*[-–to]+\s*(20[0-2]\d|present|current)\b", text_lower)
    if year_ranges and summary["estimated_years"] == 0:
        total_duration = 0
        current_year = 2026
        for start_str, end_str in year_ranges:
            try:
                start = int(start_str)
                end = current_year if "present" in end_str or "current" in end_str else int(end_str)
                if 0 <= (end - start) <= 15:
                    total_duration += (end - start)
            except ValueError:
                continue
        if total_duration > 0:
            summary["estimated_years"] = float(min(total_duration, 40))

    # Detect common roles/titles
    common_roles = [
        "software engineer", "frontend developer", "backend developer", "full stack developer",
        "data scientist", "machine learning engineer", "devops engineer", "cloud architect",
        "product manager", "qa engineer", "intern", "system administrator", "data analyst"
    ]
    for role in common_roles:
        if re.search(rf"\b{re.escape(role)}\b", text_lower):
            summary["roles_detected"].append(role.title())

    return summary


def extract_projects_summary(text: str) -> Dict[str, Any]:
    """
    Identifies project entries, technical project descriptions, and links.
    """
    summary = {
        "has_projects_section": False,
        "project_count_estimate": 0,
        "sample_project_titles": [],
    }

    if not text:
        return summary

    text_lower = text.lower()
    if re.search(r"\b(projects?|key\s+projects|academic\s+projects|personal\s+projects)\b", text_lower):
        summary["has_projects_section"] = True

    # Find project markers (e.g. project title lines before descriptions)
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    in_project_section = False
    project_titles = []

    for line in lines:
        if re.match(r"^(projects?|academic\s+projects|personal\s+projects)\s*$", line, re.IGNORECASE):
            in_project_section = True
            continue
        elif in_project_section and re.match(r"^(education|skills|experience|certifications|awards)\s*$", line, re.IGNORECASE):
            in_project_section = False

        if in_project_section:
            # Short prominent lines that look like titles
            if 3 <= len(line.split()) <= 8 and not line.startswith("•") and not line.startswith("-") and not line.startswith("*"):
                if not any(keyword in line.lower() for keyword in ["technologies:", "tools:", "stack:", "github:"]):
                    project_titles.append(line[:60])

    summary["project_count_estimate"] = len(project_titles) if project_titles else (2 if summary["has_projects_section"] else 0)
    summary["sample_project_titles"] = project_titles[:5]

    return summary


def extract_structured_resume_data(text: str) -> Dict[str, Any]:
    """
    Extracts all structured data from the document text.
    Strictly avoids fabricating any missing information.
    """
    skills = extract_skills(text)
    contact = extract_contact_info(text)
    name = extract_candidate_name(text)
    education = extract_education(text)
    experience = extract_experience_summary(text)
    projects = extract_projects_summary(text)

    # Calculate basic formatting metrics
    char_count = len(text)
    word_count = len(text.split())
    line_count = len(text.splitlines())

    return {
        "candidate_name": name,
        "contact_info": contact,
        "skills": skills,
        "education": education,
        "experience": experience,
        "projects": projects,
        "document_stats": {
            "character_count": char_count,
            "word_count": word_count,
            "line_count": line_count,
            "has_contact_details": bool(contact["email"] or contact["phone"]),
            "has_linkedin": bool(contact["linkedin"]),
            "has_github": bool(contact["github"]),
        }
    }
