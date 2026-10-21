# Persona

Persona is a mobile-only personal AI companion (iOS & Android via Expo React Native) powered by a FastAPI backend and pgvector database, with a React web landing page. The application experience lives entirely on mobile, while the web frontend serves as the public landing page, interactive device preview, and beta waitlist. The mobile app keeps its rich demo content when the backend is unavailable.

## Run locally

Use Docker for the database, Python 3.11+ for the backend, and Node.js 22.12+ with npm for the clients. Run each app in a separate terminal. Commands below use PowerShell.

### Database

From the repository root:

```powershell
docker compose up -d
```

The only container is PostgreSQL with pgvector, available at `localhost:5432`. Its local credentials are `persona_user` / `persona_pass`, and its database is `persona_db`. The named `pgdata` volume preserves database data between container restarts. These settings match `backend/.env.example`.

Use `docker compose stop` to stop the database and `docker compose start` to start it again.

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# On first setup only; keep an existing .env if it has your configuration.
Copy-Item .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

On macOS/Linux, activate the environment with `source .venv/bin/activate` and use `cp` to copy the example configuration.

The backend connects to the Docker database through `DATABASE_URL` in `backend/.env`. Startup creates tables, three public companions, and the existing demo account (`alex@companion.ai` / `password123`). API documentation is at `http://localhost:8000/docs`; the health endpoint is `/health`. Without a configured database URL, the backend falls back to a local SQLite file.

Provider keys are optional for local development. Without them, the backend generates simulated replies and media placeholders. Available provider, billing, and tracing settings are defined in `backend/app/core/config.py` and loaded from `backend/.env`.

### Web

```powershell
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. Vite forwards `/api` requests to the backend on port 8000. For a production build, run `npm run build`; output goes into `frontend/dist`.

### Mobile

```powershell
cd mobile
npm ci --legacy-peer-deps
npm start
```

Use the Expo Go version compatible with the SDK in `mobile/package.json`. Scan the QR code on a phone connected to the same Wi-Fi network. The mobile client detects the development computer's address from Expo. Use `npm run android`, `npm run ios`, or `npm run web` for the other targets.

For a hosted backend or an Expo tunnel, create `mobile/.env` and set `EXPO_PUBLIC_API_URL` to an address your device can reach. It accepts either the server origin or a full `/api/v1` URL. The WebSocket address is derived from it; override `EXPO_PUBLIC_WS_URL` only when the socket uses a different host or path. Restart Expo after changing these variables. The `localhost` value in the example is suitable for a browser or iOS simulator, not a physical phone.

`mobile/eas.json` contains build profiles. Set the actual backend URL in the build environment before creating a device build.

## Where code belongs

```text
backend/app/
  main.py              App startup, middleware, and router registration
  api/dependencies.py  Authentication and demo-session lookup
  api/v1/              HTTP and WebSocket handlers, grouped by feature
  services/            Shared chat, media, and memory operations
  agent/               Companion graph, prompts, and reasoning nodes
  core/                Settings, database, bootstrap, telemetry
  models/              Database tables
  schemas/             Request and response validation
  workers/             Scheduled companion check-ins

frontend/src/
  App.tsx              Landing page composition and theme state
  components/landing/  Editorial landing page sections & interactive phone demo
  components/ui/       Design system primitives (Button, DoubleBezelCard)
  services/waitlist.ts Mobile beta waitlist and invite code generation
  data/demo.ts         Curated companion profile starter content
  types/               Shared data types

mobile/
  app/                 Expo Router screens and navigation
  src/components/      Reusable native UI
  src/styles/          Large screen stylesheets, matching route names
  src/store/           Authentication and companion state
  src/services/        Feature API, transport, storage, WebSocket, host settings
  src/data/demo.ts     Offline companion starter content
  src/types/           Shared mobile models
  src/constants/       Theme values
  src/utils/           Avatar lookup
```

Keep routes concerned with requests and responses; share backend work through services. Keep client requests in service modules, state in stores, and static styles outside long mobile screens. Comments should explain behavior, constraints, and decisions that the code alone does not make clear.

Images and icons referenced by the clients stay in `frontend/public` and `mobile/assets`. Dependency lockfiles and build configuration are required for reproducible installation. Python package `__init__.py` files retain their import and model-registration purpose.

## Check changes

```powershell
cd frontend
npm run build
npm run lint

cd ../mobile
npm run typecheck
```

Backend API behavior can be exercised through `/docs`. Automated test files and test-only Python dependencies have been removed as requested. Generated builds, bytecode, caches, local databases, and logs are ignored by Git.
