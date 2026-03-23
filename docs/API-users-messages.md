# Chat Backend API (REST + WebSocket) - test guide

Base URL: `http://localhost:4000` (or your `PORT` from `.env`)

Global REST headers:

```http
Content-Type: application/json
```

## Authorization (JWT)
Most endpoints below are protected with `JwtAuthGuard`.

Use this header on REST calls:

```http
Authorization: Bearer <accessToken>
```

JWT format:
- Login/register return `{ "accessToken": "<jwt>" }`
- The JWT payload uses `sub` to store `userId`

For Socket.IO (WebSocket), the gateway reads the token from:
- `handshake.auth.token` or
- `handshake.headers.authorization` (expects `Authorization: Bearer <token>`)

## App (no auth)
### Test route
`GET /test`

Example:

```http
GET http://localhost:4000/test
```

## Auth (no auth)
### Register
`POST /auth/register`

Body:
```json
{
  "email": "alex@example.com",
  "password": "your_password"
}
```

Response:
```json
{
  "accessToken": "<jwt>"
}
```

### Login
`POST /auth/login`

Body:
```json
{
  "email": "alex@example.com",
  "password": "your_password"
}
```

Response:
```json
{
  "accessToken": "<jwt>"
}
```

## Users (no auth)
### Create user
`POST /users`

Body (DTO validation enforced):
```json
{
  "email": "alex@example.com",
  "password": "your_password",
  "username": "alex",
  "displayName": "Alex"
}
```

Rules:
- `email`: required, valid email
- `password`: required, min length 6
- `username`: optional, max length 64
- `displayName`: optional, max length 128

Note: the controller saves `password` as a bcrypt hash. Depending on your DB schema/`returning()` behavior, the API may return a `password` field containing the hash.

### Get user by id
`GET /users/:id`

`:id` must be a UUID.

```http
GET http://localhost:4000/users/550e8400-e29b-41d4-a716-446655440000
```

## Conversations (JWT required)
All routes here require `Authorization: Bearer <accessToken>`.

### Create direct conversation
`POST /conversations/direct`

Body:
```json
{
  "targetUserId": "550e8400-e29b-41d4-a716-446655440000"
}
```

Rules:
- You cannot create a direct conversation with yourself (returns `400`).
- The server uses the JWT user as the creator (no `currentUserId` needed in the body).

Response:
- Either a conversation row (new chat) or `{ "id": "<conversationId>" }` (existing direct chat).

### Create group conversation
`POST /conversations/group`

Body:
```json
{
  "title": "My group",
  "members": [
    "550e8400-e29b-41d4-a716-446655440000",
    "c3f74200-aeb7-406e-a611-777182e7a8fe"
  ]
}
```

Rules:
- `members`: required, must be an array of UUIDs (not empty)
- `title`: optional string
- The server automatically includes the creator from the JWT in `members`
- If the unique member count is less than 2, returns `400`

## Messages (JWT required)
All routes here require `Authorization: Bearer <accessToken>`.

### Send message
`POST /messages`

Body (DTO validation enforced; note the backend overwrites `senderId` from the JWT):
```json
{
  "conversationId": "c3f74200-aeb7-406e-a611-777182e7a8fe",
  "senderId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Hello from the API"
}
```

Rules:
- `conversationId`: UUID
- `senderId`: UUID (required by DTO; backend ignores it and uses JWT userId)
- `content`: non-empty string, max 10000 chars

### List messages (paginated via cursor)
`GET /messages`

Query params (DTO validation enforced; only these are expected):
- `conversationId`: UUID (required)
- `cursor`: optional ISO timestamp string (loads older messages where `createdAt < cursor`)
- `limit`: optional integer >= 1 (default `20`)

Example:
```http
GET http://localhost:4000/messages?conversationId=c3f74200-aeb7-406e-a611-777182e7a8fe&limit=20
```

## cURL examples (end-to-end)
```bash
export BASE_URL="http://localhost:4000"

# 0) Test route
curl -s "$BASE_URL/test"

# 1) Register (get token)
TOKEN=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","password":"your_password"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['accessToken'])")

# (Alternative) 1b) Login (get token)
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","password":"your_password"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['accessToken'])")

# 2) Create another user (so you can create direct/group chats)
curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"your_password","username":"bob","displayName":"Bob"}'

# Replace with real UUIDs from your responses:
USER_ID="PUT_USER_ID_HERE"
TARGET_USER_ID="PUT_TARGET_USER_ID_HERE"

# 2b) Get user by id (replace UUID)
curl -s "$BASE_URL/users/$USER_ID"

# 3) Create a direct conversation (JWT required)
CONV_ID=$(curl -s -X POST "$BASE_URL/conversations/direct" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"targetUserId":"'$TARGET_USER_ID'"}' \
  | python3 -c "import sys, json; v=json.load(sys.stdin); print(v.get('id',''))")

# 3b) Create a group conversation (JWT required)
GROUP_ID=$(curl -s -X POST "$BASE_URL/conversations/group" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test group","members":["'$TARGET_USER_ID'"]}' \
  | python3 -c "import sys, json; v=json.load(sys.stdin); print(v.get('id',''))")

# 4) Send a message (JWT required)
curl -s -X POST "$BASE_URL/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"conversationId":"'$CONV_ID'","senderId":"'$USER_ID'","content":"Hi!"}'

# (Optional) Send a message to the group chat
curl -s -X POST "$BASE_URL/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"conversationId":"'$GROUP_ID'","senderId":"'$USER_ID'","content":"Hi group!"}'

# 5) Fetch messages (JWT required)
curl -s -G "$BASE_URL/messages" \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "conversationId=$CONV_ID" \
  --data-urlencode "limit=20"

# (Optional) Fetch messages from group chat
curl -s -G "$BASE_URL/messages" \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "conversationId=$GROUP_ID" \
  --data-urlencode "limit=20"
```

## WebSocket / Socket.IO testing
The Nest gateway is a Socket.IO server that uses these events:
- `joinConversation` (input: `conversationId` string)
- `sendMessage` (input: `{ conversationId: string, content: string }`)

It emits:
- `newMessage` (payload: the persisted message row)

Client connection:
- Use `socket.io-client`
- Pass the JWT token on connect as `auth: { token: accessToken }`

Example Node script:
```javascript
import { io } from "socket.io-client";

const token = process.env.TOKEN;
const conversationId = process.env.CONV_ID;

const socket = io("http://localhost:4000", {
  auth: { token },
});

socket.on("connect_error", (err) => {
  console.error("connect_error", err.message);
});

socket.on("newMessage", (msg) => {
  console.log("newMessage", msg);
});

socket.on("connect", () => {
  socket.emit("joinConversation", conversationId);
  socket.emit("sendMessage", {
    conversationId,
    content: "Hello over WS",
  });
});
```
