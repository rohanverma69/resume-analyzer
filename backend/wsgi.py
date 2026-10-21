import os
from app import create_app

# Default to production if not specified
env = os.getenv("FLASK_ENV", "production")
app = create_app(env)

if __name__ == "__main__":
    from waitress import serve
    port = int(os.getenv("PORT", 5000))
    print(f"Starting CareerAI backend production server on http://0.0.0.0:{port} via Waitress...")
    serve(app, host="0.0.0.0", port=port, threads=6)
