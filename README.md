# Reverse Mate

## Credits

Inspired from https://github.com/Saturnyn/ChessPursuit

## Modern Development

This repo now supports a modern local workflow with Vite for the client and Node/Express for the leaderboard API.

### Prerequisites

- Node 18+

### Setup 

1. Create a `.env` file in the project root and set:
    - `MONGO_URI` (your MongoDB connection string)
    - `DB_NAME` (defaults to `chesspursuit`)
    - `COLLECTION` (defaults to `leaderboard`)
    - `PORT` (defaults to `5000`)
2. Install dependencies:
    - `npm install`

### Development

- Start client (Vite): `npm run dev`
- Start API server: `npm run serve`

Open the client URL shown by Vite (e.g. `http://localhost:5173`). The client calls the API at `http://localhost:5000` by default when served from `file:` or a non-HTTP origin; otherwise it uses the same origin.

### Server

- Start API: `npm run serve`
    - Endpoints:
        - `GET /api/leaderboard?limit=10&skip=0`
        - `POST /api/leaderboard` with JSON `{ name: string, pauses: number }`

### Build & Preview

- Production build: `npm run build`
- Preview build: `npm run preview`

The build outputs to `dist/`. You can serve it with any static file host. The API server runs separately.

### Name Prompt Behavior

- The game prompts for a player name once and saves it to `localStorage` under the key `cp_player_name_v1`.
- To change the name at any time, use the “Change name” link in the UI.
- To clear previous user data manually (e.g., for testing), remove that key in DevTools:
    - `localStorage.removeItem('cp_player_name_v1')`

## Notes

- UI/UX, story, and gameplay remain unchanged.
- Name prompt is persistent via `localStorage` (`cp_player_name_v1`). Use the in-game “Change name” to update.


