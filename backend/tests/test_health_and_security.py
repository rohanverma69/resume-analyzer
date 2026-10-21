def test_health_check_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"
    assert data["service"] == "CareerAI API"
    assert "database" in data
    assert "timestamp" in data
    # Ensure sensitive credentials and config paths are NEVER exposed
    raw_response = res.get_data(as_text=True)
    assert "password" not in raw_response.lower()
    assert "secret" not in raw_response.lower()


def test_security_headers_present(client):
    res = client.get("/api/health")
    headers = res.headers
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert "Content-Security-Policy" in headers
