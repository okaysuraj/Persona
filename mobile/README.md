# Persona AI — Mobile App (Expo SDK 57)

React Native mobile client for Persona AI built with **Expo SDK 57**, **React 19**, and **React Native Reanimated 4**.

## Tech Stack
- **Framework**: Expo SDK 57 (`expo@57.0.21`)
- **React**: 19.2.3
- **React Native**: 0.86.3
- **Router**: Expo Router v57 (file-based navigation)
- **Animations**: React Native Reanimated 4.5.1
- **State Management**: Zustand 5 (`^5.0.3`)
- **Language**: TypeScript 6 (`~6.0.3`)

## Quick Start

### 1. Install Dependencies

```powershell
npm install --legacy-peer-deps
```

### 2. Verify Configuration

```powershell
npx expo-doctor
```

### 3. Start Expo Development Server

```powershell
npx expo start
```

### 4. Running on Devices
- **Physical Phone (Expo Go 57)**: Scan the QR code in your terminal using the **Expo Go** app. The API client in `src/services/api.ts` automatically detects your developer computer's Wi-Fi IP address via `expo-constants`.
- **Web**: Press `w` in terminal.
- **Android Emulator**: Press `a` in terminal.
- **iOS Simulator**: Press `i` in terminal.

## Key Features
- **Companion Hub**: Live companion status, relationship stage badges, and dynamic intimacy XP progression bar.
- **Realtime Chat**: Message history, streaming dialogue, photo attachments, and expandable `<inner_thought>` reflections.
- **Ambient Voice Call**: Fullscreen call screen with call duration counter, mute toggle, and a reactive 60fps pulsing `AudioOrb`.
- **Memory Vault**: Directly view semantic facts learned by companions, with one-tap forget/delete actions.
- **Companion Studio**: Modal to create new companions with customizable archetypes, backstory, speech style, and avatars.
