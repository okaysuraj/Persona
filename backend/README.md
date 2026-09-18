# Persona AI — Backend

FastAPI and LangGraph agentic companion engine.

## Quick Start

### 1. Setup Virtual Environment

```powershell
# In Windows PowerShell:
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# In Bash / macOS / Linux:
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 3. Run Automated Tests

```powershell
.\.venv\Scripts\pytest.exe
```

### 4. Start Development Server

```powershell
.\.venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

## Architecture Highlights
- **LangGraph State Machine**: Cyclic cognitive loop (`Perception` ➔ `Recall` ➔ `Reasoning` ➔ `Consolidation`) in `app/agent/graph.py`.
- **Async Database Sessions**: Async SQLAlchemy engine with SQLite zero-config development database and PostgreSQL/pgvector support.
- **WebSocket Duplex Streaming**: Real-time `<inner_thought>`, token streaming, and mood updates via `/api/v1/chat/stream/{persona_id}`.
- **Proactive Heartbeat Worker**: Autonomous daemon in `app/workers/proactive_daemon.py` evaluating idle relationships and scheduled reach-outs.
