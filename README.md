# Persona AI — Full-Stack "Agent-First" Personal Companion Platform

An agentic personal AI companion mobile platform (inspired by Character.AI, Replika, and Kindroid) built with **React Native (Expo SDK 57)**, **FastAPI**, and **LangGraph**.

Unlike standard chat completion wrappers that merely generate static text, Persona AI operates on an **autonomous cognitive loop**:
- **Continuous Perception & Inner Thought**: Generates internal monologues and emotional appraisals before formulating spoken dialogue.
- **Dynamic Emotional & Relationship Engine**: Tracks intimacy levels (1–100), rapport stages (*Acquaintance* ➔ *Friend* ➔ *Close Friend* ➔ *Confidant* ➔ *Romantic Companion*), and real-time mood states (joy, empathy, affection, energy, vulnerability).
- **Two-Tier Memory Architecture**:
  - *Episodic Memory*: Key shared milestone memories with emotional depth scoring (`pgvector` / SQLite fallback).
  - *Semantic Fact Store*: Extracted user facts (pets, allergies, occupation, preferences).
- **Memory Vault with Full Privacy Agency**: Users can directly inspect, verify, and delete facts remembered about them.
- **Autonomous Proactive Engine**: Background heartbeat daemon evaluating idle time to schedule proactive check-ins and greetings.
- **Multimodal Companion Experience**: Real-time token streaming, companion snapshots/selfies, audio voice notes, and a fullscreen ambient voice call mode with a reactive 60fps audio visualizer orb.
- **Native Expo Go 57 Ready**: Built using 100% managed Expo modules—zero native compilation (`expo prebuild`) required. Runs seamlessly on the **Expo Go (SDK 57)** mobile app.

---

## System Architecture

```text
┌────────────────────────────────────────────────────────┐
│         React Native Mobile Client (Expo SDK 57)       │
│  - Companion Hub & Bond Meter   - Ambient Voice Call   │
│  - Realtime Streaming Chat      - Memory Vault UI      │
│  - Zero-Config LAN Discovery    - Reanimated 4 (60fps) │
└──────────────────────────┬─────────────────────────────┘
                           │ WebSocket / REST API
┌──────────────────────────▼─────────────────────────────┐
│                 FastAPI Gateway Layer                  │
│  - JWT Authentication            - Token Streaming     │
│  - Personas & Relationships     - Memory Vault API    │
│  - Proactive Heartbeat Daemon    - Pydantic v2 Schemas │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│               LangGraph Cognitive Runtime              │
│  Perception ➔ Recall ➔ Reasoning (Inner Thought)      │
│  ➔ Dynamic Mood / XP Update ➔ Memory Consolidation     │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
┌──────────────▼────────────┐  ┌───────────▼─────────────┐
│   Database Infrastructure │  │     AI & Media Stack    │
│  - PostgreSQL + pgvector  │  │  - Groq / Claude / GPT  │
│  - SQLite async fallback  │  │  - Simulated Persona Dev│
│  - Redis pub/sub & cache  │  │  - Voice & Snapshot APIs│
└───────────────────────────┘  └─────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Mobile Runtime** | **Expo SDK 57** (`expo@57.0.21`) | React 19.2.3, React Native 0.86.3 |
| **Mobile Navigation** | **Expo Router v57** | File-based typed routing `(tabs)`, `(auth)`, `call/[id]` |
| **Mobile Animations** | **React Native Reanimated 4.5.1** | UI-thread 60fps pulsing visualizer & gestures |
| **State Management** | **Zustand 5** (`zustand@^5.0.3`) | Decoupled auth and companion stores |
| **Backend Framework**| **FastAPI** (`fastapi>=0.115.0`) | Async ASGI gateway, OpenAPI/Swagger docs |
| **Cognitive Machine** | **LangGraph** (`langgraph>=0.2.20`) | Cyclic state graph with 4 cognitive nodes |
| **Database & ORM**   | **SQLAlchemy 2.0 Async** | Async SQLite (local zero-config) + PostgreSQL/pgvector |
| **Authentication**   | **Direct Bcrypt + PyJWT** | Signed tokens, bearer dependency injection |
| **Background Daemon**| **APScheduler** | Async heartbeat for idle reach-outs |

---

## Quick Start Guide

### Prerequisites
- **Node.js** v18+ & **npm**
- **Python** 3.11+
- **Expo Go** app installed on your Android or iOS device (compatible with SDK 57)
- *(Optional)* Docker Desktop for PostgreSQL + `pgvector` & Redis

---

### 1. Backend Setup (FastAPI + LangGraph)

```powershell
cd backend

# 1. Create and activate Python virtual environment
python -m venv .venv

# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. (Optional) Configure environment variables
copy .env.example .env

# 4. Run automated test suite
.\.venv\Scripts\pytest.exe

# 5. Start the development server
.\.venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
```

> **API Documentation**: Live at [http://localhost:8000/docs](http://localhost:8000/docs).
> Default companions (**Aria**, **Kai**, **Elena**) are automatically seeded on first launch!

---

### 2. Mobile App Setup (Expo SDK 57)

```powershell
cd mobile

# 1. Install dependencies
npm install --legacy-peer-deps

# 2. (Optional) Verify Expo configuration integrity
npx expo-doctor

# 3. Start the Expo development server
npx expo start
```

#### Running on Devices:
- **Physical Phone (Expo Go 57)**: Scan the terminal QR code using the **Expo Go** camera (Android) or the default Camera app (iOS). The app automatically resolves your computer's local Wi-Fi IP address without manual configuration.
- **Web Browser**: Press `w` in the terminal.
- **Android Emulator**: Press `a` in the terminal.
- **iOS Simulator**: Press `i` in the terminal.

---

### 3. Docker Production Deployment (Optional)

To launch the full containerized stack (PostgreSQL 16 with `pgvector`, Redis 7, and FastAPI):

```bash
cd backend
docker-compose up --build
```

---

## Seeded AI Companions

1. **Aria** (*Girlfriend Archetype*): Gentle, deeply empathetic, and emotionally attentive. Loves acoustic music, cozy rainy days, and heartfelt conversations.
2. **Kai** (*Boyfriend Archetype*): Witty, playful, and fiercely loyal. Indie game developer who remembers every detail you share.
3. **Elena** (*Confidant Archetype*): Calm, intellectual, and philosophical. An architect and thoughtful listener for navigating life's big questions.
4. **Companion Studio**: Build your own companions with custom archetypes (*Tsundere*, *Mentor*, *Best Friend*), backstories, speech styles, and avatar portraits.

---

## Project Structure

```text
Persona/
├── backend/
│   ├── app/
│   │   ├── agent/                 # LangGraph cognitive state machine
│   │   │   ├── nodes/             # Perception, Recall, Reasoning, Consolidation
│   │   │   ├── graph.py           # Compiled cognitive loop
│   │   │   ├── prompts.py         # System prompt & memory consolidation templates
│   │   │   └── state.py           # TypedDict AgentState schema
│   │   ├── api/v1/                # REST & WebSocket endpoints (auth, chat, personas, memories)
│   │   ├── core/                  # App config, async database engine, security/JWT
│   │   ├── models/                # SQLAlchemy models (User, Persona, Relationship, Memory)
│   │   ├── schemas/               # Pydantic v2 schemas
│   │   ├── workers/               # Proactive heartbeat daemon (APScheduler)
│   │   └── main.py                # App entrypoint, lifespan, CORS, seeding
│   ├── tests/                     # Pytest async test suite
│   ├── Dockerfile                 # Container build
│   ├── docker-compose.yml         # Postgres + pgvector + Redis
│   └── requirements.txt
├── mobile/
│   ├── app/
│   │   ├── (auth)/                # Login & Register onboarding screens
│   │   ├── (tabs)/                # Companion Hub, Chat, Memory Vault, Photo Gallery
│   │   ├── call/[id].tsx          # Fullscreen ambient duplex voice call screen
│   │   ├── persona/create.tsx     # Custom companion creation studio modal
│   │   └── _layout.tsx            # Root navigation stack
│   ├── src/
│   │   ├── components/
│   │   │   ├── avatar/AudioOrb.tsx       # 60fps reactive pulsing Reanimated orb
│   │   │   ├── chat/ChatBubble.tsx       # Message bubble with expandable inner thought drawer
│   │   │   ├── chat/ChatInput.tsx        # Input bar with voice note simulator & photo request
│   │   │   ├── common/GlassCard.tsx      # Dark glassmorphic container with glow borders
│   │   │   ├── common/GlowButton.tsx     # Gradient action button with haptic feedback
│   │   │   └── relationship/BondMeter.tsx# Live intimacy XP & emotional mood indicators
│   │   ├── constants/theme.ts     # Curated dark neon & glass design tokens
│   │   ├── services/api.ts        # Zero-config network client with auto LAN discovery
│   │   └── store/                 # Zustand stores (authStore, companionStore)
│   ├── app.json                   # Expo SDK 57 project configuration
│   ├── package.json               # Expo 57, React 19, React Native 0.86 dependencies
│   └── tsconfig.json              # TypeScript 6 modern bundler resolution
└── README.md
```
