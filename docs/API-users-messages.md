# Users & Messages API (local)

Base URL: `http://localhost:4000` (or your `PORT` from `.env`)

Headers for JSON bodies:

```http
Content-Type: application/json
```

---

## Users

### Create user

| | |
|---|---|
| **Method / URL** | `POST http://localhost:4000/users` |
| **Body** | JSON below |

```json
{
  "email": "alex@example.com",
  "username": "alex",
  "displayName": "Alex"
}
```

- `email` — **required**, valid email  
- `username` — optional  
- `displayName` — optional  

Minimal body:

```json
{
  "email": "alex@example.com"
}
```

### Get user by id

| | |
|---|---|
| **Method / URL** | `GET http://localhost:4000/users/:id` |
| **Body** | none |

Example:

```http
GET http://localhost:4000/users/550e8400-e29b-41d4-a716-446655440000
```

`:id` must be a UUID.

---

## Messages

### Send message

| | |
|---|---|
| **Method / URL** | `POST http://localhost:4000/messages` |
| **Body** | JSON below |

```json
{
  "conversationId": "c3f74200-aeb7-406e-a611-777182e7a8fe",
  "senderId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Hello from the API"
}
```

- `conversationId` — UUID of an existing conversation  
- `senderId` — UUID of an existing user  
- `content` — non-empty string (max 10000 chars)

### List messages in a conversation

| | |
|---|---|
| **Method / URL** | `GET http://localhost:4000/messages/:conversationId` |
| **Body** | none |

Example:

```http
GET http://localhost:4000/messages/c3f74200-aeb7-406e-a611-777182e7a8fe
```

---

## cURL examples

```bash
# Create user
curl -s -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","username":"alex","displayName":"Alex"}'

# Get user (replace UUID)
curl -s http://localhost:4000/users/USER_UUID_HERE

# Send message
curl -s -X POST http://localhost:4000/messages \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"CONV_UUID","senderId":"USER_UUID","content":"Hi!"}'

# List messages
curl -s http://localhost:4000/messages/CONV_UUID
```
