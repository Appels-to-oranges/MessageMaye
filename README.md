# MessageMaye

Real-time room-based messaging. Enter a room key and nickname, then chat with everyone in the same room.

## Run locally

1. Install dependencies:
   ```bash
   cd MessageMaye
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open **http://localhost:3000** in your browser.

4. Enter a room key (e.g. `lobby`) and a nickname, then click **Join room**. Open another tab or browser with the same room key and a different nickname to test chatting.

## Tech

- **Node.js** + **Express** (static files + routes)
- **Socket.io** (real-time messages and room membership)
- No chat history; messages are in-memory only.
