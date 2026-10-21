import os
from flask import Flask, jsonify
from app.config import config_by_name, ProductionConfig
from app.extensions import db, migrate, limiter, cors
from app.models.job import Job
from app.utils.seed_data import seed_jobs_if_empty


def create_app(config_name=None):
    """Application factory for CareerAI."""
    if not config_name:
        config_name = os.getenv("FLASK_ENV", "development").lower()

    app = Flask(__name__)
    config_class = config_by_name.get(config_name, config_by_name["development"])
    app.config.from_object(config_class)

    # In production, enforce secret validation
    if config_name == "production":
        ProductionConfig.validate()

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)

    # Configure CORS with exact allowed origins
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"]
    )

    # Register Blueprints
    from app.routes.auth import auth_bp
    from app.routes.resume import resume_bp
    from app.routes.analyses import analyses_bp
    from app.routes.jobs import jobs_bp
    from app.routes.health import health_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(resume_bp, url_prefix="/api/resume")
    app.register_blueprint(analyses_bp, url_prefix="/api/analyses")
    app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
    app.register_blueprint(health_bp, url_prefix="/api")

    # Security Headers
    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
        if os.getenv("FLASK_ENV") == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

    # Global Error Handlers (Prevents stack traces or SQL errors from leaking)
    @app.errorhandler(400)
    def handle_bad_request(e):
        return jsonify({
            "success": False,
            "error": "Bad request. Please check your request parameters.",
            "code": "BAD_REQUEST"
        }), 400

    @app.errorhandler(401)
    def handle_unauthorized(e):
        return jsonify({
            "success": False,
            "error": "Authentication required.",
            "code": "UNAUTHORIZED"
        }), 401

    @app.errorhandler(403)
    def handle_forbidden(e):
        return jsonify({
            "success": False,
            "error": "Access forbidden.",
            "code": "FORBIDDEN"
        }), 403

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({
            "success": False,
            "error": "The requested resource was not found.",
            "code": "NOT_FOUND"
        }), 404

    @app.errorhandler(413)
    def handle_large_file(e):
        return jsonify({
            "success": False,
            "error": "Uploaded file is too large. Maximum size is 5 MB.",
            "code": "FILE_TOO_LARGE"
        }), 413

    @app.errorhandler(429)
    def handle_rate_limit_exceeded(e):
        return jsonify({
            "success": False,
            "error": "Rate limit exceeded. Please wait a moment before trying again.",
            "code": "RATE_LIMITED"
        }), 429

    @app.errorhandler(500)
    def handle_internal_server_error(e):
        # Do not expose internal traceback to client
        return jsonify({
            "success": False,
            "error": "An internal server error occurred. Please try again later.",
            "code": "INTERNAL_SERVER_ERROR"
        }), 500

    # Auto-initialize database tables and seed sample jobs and demo users
    with app.app_context():
        db.create_all()
        from app.models.user import User
        from app.utils.seed_data import seed_demo_user_if_empty
        seed_jobs_if_empty(db, Job)
        seed_demo_user_if_empty(db, User)

    return app
