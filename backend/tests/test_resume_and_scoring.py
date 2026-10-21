import io
from app.services.skill_extractor import extract_skills, extract_contact_info, extract_structured_resume_data
from app.services.scorer import calculate_ats_score


def test_skill_extraction_taxonomy():
    sample_text = """
    Experienced Software Engineer proficient in Python, React.js, Docker, AWS, and PostgreSQL.
    Familiar with CI/CD, Git, Linux, and REST APIs. Also knows Go and TypeScript.
    """
    skills = extract_skills(sample_text)
    assert "Python" in skills
    assert "React" in skills
    assert "Docker" in skills
    assert "AWS" in skills
    assert "Postgresql" in skills or "PostgreSQL" in [s.title() for s in skills]
    assert "Git" in skills
    assert "Go" in skills


def test_contact_info_extraction():
    text = "Candidate: Jane Doe\nEmail: jane.doe@example.org\nPhone: (555) 987-6543\nLinkedIn: linkedin.com/in/janedoe"
    contact = extract_contact_info(text)
    assert contact["email"] == "jane.doe@example.org"
    assert "555" in contact["phone"]
    assert "linkedin.com/in/janedoe" in contact["linkedin"]


def test_ats_score_calculation_general_mode():
    dummy_data = {
        "candidate_name": "Test User",
        "contact_info": {
            "email": "test@example.com",
            "phone": "555-1234",
            "linkedin": "linkedin.com/in/test",
            "github": "github.com/test",
            "portfolio": None
        },
        "skills": ["Python", "React", "Docker", "SQL", "Git", "Linux", "AWS", "FastAPI", "TypeScript", "HTML", "CSS"],
        "education": [{"degree": "Bachelor of Technology", "year": "2022"}],
        "experience": {"estimated_years": 3.0, "has_experience_section": True, "roles_detected": ["Software Engineer"]},
        "projects": {"has_projects_section": True, "project_count_estimate": 3},
        "document_stats": {"word_count": 450}
    }
    result = calculate_ats_score(dummy_data)
    assert 0 <= result["overall_score"] <= 100
    assert result["score_mode"] == "general_completeness"
    assert result["breakdown"]["skills"]["max"] == 40
    assert result["breakdown"]["experience"]["max"] == 20
    assert result["breakdown"]["education"]["max"] == 15
    assert result["breakdown"]["projects"]["max"] == 15
    assert result["breakdown"]["formatting_and_completeness"]["max"] == 10
    assert "disclaimer" in result


def test_ats_score_calculation_job_specific_mode():
    dummy_data = {
        "candidate_name": "Test User",
        "contact_info": {"email": "test@example.com", "phone": "555-1234", "linkedin": None, "github": None, "portfolio": None},
        "skills": ["Python", "React", "Docker", "Git"],
        "education": [{"degree": "Bachelor of Science", "year": "2023"}],
        "experience": {"estimated_years": 2.0, "has_experience_section": True, "roles_detected": []},
        "projects": {"has_projects_section": True, "project_count_estimate": 2},
        "document_stats": {"word_count": 350}
    }
    jd = "Looking for a Python and React developer with experience in Docker, AWS, and Kubernetes."
    result = calculate_ats_score(dummy_data, job_description=jd)

    assert result["score_mode"] == "job_specific"
    assert "Python" in result["matched_skills"]
    assert "React" in result["matched_skills"]
    assert "Docker" in result["matched_skills"]
    assert any("AWS" in s or "Kubernetes" in s for s in result["missing_skills"])


def test_upload_and_analyze_pdf_success(client, auth_headers, sample_pdf_bytes):
    data = {
        "file": (io.BytesIO(sample_pdf_bytes), "alex_resume.pdf"),
        "target_role": "Full Stack Engineer"
    }
    res = client.post(
        "/api/resume/analyze",
        data=data,
        content_type="multipart/form-data",
        headers={"Authorization": auth_headers["Authorization"]}
    )
    assert res.status_code == 201
    resp_data = res.get_json()
    assert resp_data["success"] is True
    assert "analysis" in resp_data
    assert resp_data["analysis"]["overall_score"] > 0
    assert "top_recommendations" in resp_data
    assert len(resp_data["top_recommendations"]) > 0


def test_upload_and_analyze_docx_success(client, auth_headers, sample_docx_bytes):
    data = {
        "file": (io.BytesIO(sample_docx_bytes), "alex_resume.docx"),
        "job_description": "We need a Python developer who knows React, Docker and SQL."
    }
    res = client.post(
        "/api/resume/analyze",
        data=data,
        content_type="multipart/form-data",
        headers={"Authorization": auth_headers["Authorization"]}
    )
    assert res.status_code == 201
    resp_data = res.get_json()
    assert resp_data["success"] is True
    assert resp_data["analysis"]["file_type"] == "docx"


def test_upload_reject_empty_file(client, auth_headers):
    data = {"file": (io.BytesIO(b""), "empty.pdf")}
    res = client.post(
        "/api/resume/analyze",
        data=data,
        content_type="multipart/form-data",
        headers={"Authorization": auth_headers["Authorization"]}
    )
    assert res.status_code == 400
    assert "empty" in res.get_json()["error"].lower()


def test_upload_reject_spoofed_pdf_signature(client, auth_headers):
    # Plain text file disguised as .pdf
    fake_pdf = b"This is not a real PDF document at all."
    data = {"file": (io.BytesIO(fake_pdf), "fake.pdf")}
    res = client.post(
        "/api/resume/analyze",
        data=data,
        content_type="multipart/form-data",
        headers={"Authorization": auth_headers["Authorization"]}
    )
    assert res.status_code == 400
    assert "signature" in res.get_json()["error"].lower() or "invalid" in res.get_json()["error"].lower()


def test_upload_reject_unsupported_extension(client, auth_headers):
    data = {"file": (io.BytesIO(b"dummy data"), "script.exe")}
    res = client.post(
        "/api/resume/analyze",
        data=data,
        content_type="multipart/form-data",
        headers={"Authorization": auth_headers["Authorization"]}
    )
    assert res.status_code == 400
    assert "unsupported" in res.get_json()["error"].lower()
