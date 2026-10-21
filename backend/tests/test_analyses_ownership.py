import io


def test_user_analyses_isolation_and_idor_protection(
    client, auth_headers, second_auth_headers, sample_pdf_bytes
):
    # User 1 uploads a resume
    res = client.post(
        "/api/resume/analyze",
        data={"file": (io.BytesIO(sample_pdf_bytes), "user1_resume.pdf")},
        content_type="multipart/form-data",
        headers={"Authorization": auth_headers["Authorization"]}
    )
    assert res.status_code == 201
    analysis_id = res.get_json()["analysis"]["id"]

    # User 1 can view their analysis
    res_user1_view = client.get(f"/api/analyses/{analysis_id}", headers=auth_headers)
    assert res_user1_view.status_code == 200

    # User 1 can download report
    res_user1_dl = client.get(f"/api/analyses/{analysis_id}/download", headers=auth_headers)
    assert res_user1_dl.status_code == 200
    assert res_user1_dl.content_type == "application/pdf"

    # User 2 attempts to view User 1's analysis (IDOR test -> must return 403 Forbidden)
    res_user2_view = client.get(f"/api/analyses/{analysis_id}", headers=second_auth_headers)
    assert res_user2_view.status_code == 403
    assert res_user2_view.get_json()["code"] == "FORBIDDEN"

    # User 2 attempts to download User 1's report (IDOR test -> must return 403 Forbidden)
    res_user2_dl = client.get(f"/api/analyses/{analysis_id}/download", headers=second_auth_headers)
    assert res_user2_dl.status_code == 403

    # User 2 attempts to delete User 1's analysis (must return 403 Forbidden)
    res_user2_del = client.delete(f"/api/analyses/{analysis_id}", headers=second_auth_headers)
    assert res_user2_del.status_code == 403

    # User 1 successfully deletes own analysis
    res_user1_del = client.delete(f"/api/analyses/{analysis_id}", headers=auth_headers)
    assert res_user1_del.status_code == 200

    # Ensure it is now 404
    res_check = client.get(f"/api/analyses/{analysis_id}", headers=auth_headers)
    assert res_check.status_code == 404
