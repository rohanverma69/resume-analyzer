import json
from app.models.user import User


def test_user_registration_success(client, db):
    payload = {
        "email": "newuser@example.com",
        "password": "Password123!",
        "full_name": "Jordan Smith"
    }
    res = client.post("/api/auth/register", data=json.dumps(payload), content_type="application/json")
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert "token" in data
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["full_name"] == "Jordan Smith"

    # Verify user in database
    user = User.query.filter_by(email="newuser@example.com").first()
    assert user is not None
    assert user.password_hash != "Password123!"
    assert user.check_password("Password123!") is True


def test_user_registration_duplicate_email(client, test_user):
    payload = {
        "email": test_user.email,
        "password": "NewPassword123!",
        "full_name": "Duplicate User"
    }
    res = client.post("/api/auth/register", data=json.dumps(payload), content_type="application/json")
    assert res.status_code == 409
    data = res.get_json()
    assert data["success"] is False
    assert data["code"] == "EMAIL_TAKEN"


def test_user_registration_invalid_inputs(client):
    # Short password
    res = client.post("/api/auth/register", data=json.dumps({
        "email": "valid@example.com",
        "password": "short",
        "full_name": "Test Name"
    }), content_type="application/json")
    assert res.status_code == 400

    # Bad email
    res2 = client.post("/api/auth/register", data=json.dumps({
        "email": "not-an-email",
        "password": "ValidPassword123!",
        "full_name": "Test Name"
    }), content_type="application/json")
    assert res2.status_code == 400


def test_user_login_success(client, test_user):
    res = client.post("/api/auth/login", data=json.dumps({
        "email": test_user.email,
        "password": "SecurePassword123!"
    }), content_type="application/json")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "token" in data
    assert data["user"]["email"] == test_user.email


def test_user_login_invalid_password(client, test_user):
    res = client.post("/api/auth/login", data=json.dumps({
        "email": test_user.email,
        "password": "WrongPassword!"
    }), content_type="application/json")
    assert res.status_code == 401
    data = res.get_json()
    assert data["success"] is False
    assert data["code"] == "INVALID_CREDENTIALS"


def test_get_current_user_profile(client, auth_headers, test_user):
    res = client.get("/api/auth/me", headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["user"]["email"] == test_user.email
    assert data["stats"]["total_analyses"] == 0


def test_protected_endpoint_without_token(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401
    data = res.get_json()
    assert data["success"] is False
    assert data["code"] == "AUTH_REQUIRED"


def test_account_deletion(client, auth_headers, test_user):
    res = client.delete("/api/auth/account", headers=auth_headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True

    # Confirm user no longer exists
    assert User.query.get(test_user.id) is None
