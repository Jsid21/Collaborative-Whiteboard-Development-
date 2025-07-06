# CollabBoard - Collaborative Whiteboard

CollabBoard is a real-time collaborative whiteboard application that allows multiple users to draw, erase, and interact together in shared rooms. Built with React, Vite, Node.js, Express, Socket.IO, and MongoDB.

## Features

- 🎨 Real-time collaborative drawing
- 🖌️ Multiple brush colors and sizes
- 🧽 Eraser tool
- 👥 Live user cursors
- 💾 Auto-save and persistent drawing data per room
- 🏷️ Unique room codes for collaboration
- ⚡ Fast and responsive UI

## Tech Stack

- **Frontend:** React, Vite, Socket.IO Client, Axios
- **Backend:** Node.js, Express, Socket.IO, MongoDB (Mongoose)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or use MongoDB Atlas)

### Installation

#### 1. Clone the repository

```sh
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

#### 2. Install dependencies

**Client:**
```sh
cd client
npm install
```

**Server:**
```sh
cd ../server
npm install
```

#### 3. Configure environment variables

Create a `.env` file in both `client/` and `server/` directories as needed.

For the server (`server/.env`):

```
MONGODB_URI=mongodb://localhost:27017/collaborative_whiteboard
PORT=5000
```

For the client (`client/.env`):

```
VITE_SOCKET_URL=http://localhost:5000
```

#### 4. Start MongoDB

Make sure MongoDB is running locally.

#### 5. Run the application

**Start the server:**
```sh
cd server
npm run dev
```

**Start the client:**
```sh
cd ../client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

1. Enter a room code to join or create a new collaboration space.
2. Draw, erase, and interact with others in real-time.
3. Your work is auto-saved and persists as long as the room is active.

## License

This project is licensed under the MIT License.

---

**Enjoy
