import io


def test_list_jobs_endpoint(client):
    res = client.get("/api/jobs")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["jobs"]) > 0
    assert data["pagination"]["total_count"] >= 20
    assert "disclaimer" in data


def test_filter_jobs_by_search_keyword(client):
    res = client.get("/api/jobs?search=python")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    for job in data["jobs"]:
        assert (
            "python" in job["title"].lower() or
            "python" in job["description"].lower() or
            any("python" in s.lower() for s in job["required_skills"])
        )


def test_job_recommendations_with_resume(client, auth_headers, sample_pdf_bytes):
    # Upload resume
    client.post(
        "/api/resume/analyze",
        data={"file": (io.BytesIO(sample_pdf_bytes), "sample.pdf")},
        content_type="multipart/form-data",
        headers={"Authorization": auth_headers["Authorization"]}
    )

    # Get recommendations
    res = client.get("/api/jobs/recommendations", headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0

    first_rec = data["recommendations"][0]
    assert "relevance_score" in first_rec
    assert 0 <= first_rec["relevance_score"] <= 100
    assert "matched_required_skills" in first_rec
    assert "missing_required_skills" in first_rec
