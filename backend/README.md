Minimal FastAPI backend scaffold for autotradeplug.

Purpose:
- Provide execution-only backend services: auth, risk, execution adapters.
- This is a scaffold: implement business logic, migrations, and CI next.

Quick start (dev):
1. Create a venv and install `pip install -r requirements.txt`
2. Start with `uvicorn app.main:app --reload --port 8000`

Notes:
- Default mode should be PAPER by configuration.
- All trade execution must pass through `services.risk_engine.RiskEngine`.
