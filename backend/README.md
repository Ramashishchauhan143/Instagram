# Instagram-like backend

This directory contains the backend only. It uses Express, MongoDB/Mongoose, JWT, bcryptjs, dotenv, and cors.

## 1. Install and configure

From `D:\webdevlopment\Instagram\backend`:

```powershell
npm install
```

Edit `backend/.env` and replace the example values. For example:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/instagram
JWT_SECRET=replace_with_a_long_random_private_value
```

Keep `.env` private; it is excluded by `.gitignore`. For MongoDB Atlas, use the connection string provided by Atlas for `MONGO_URI`.

Start the API:

```powershell
npm run dev
```

The server connects to MongoDB before listening. Visit `http://localhost:5000/` to confirm it is running.

## 2. Source files and implementation order

The implementation follows the requested backend sequence:

1. `backend/package.json`, `backend/server.js` — Express app and scripts.
2. `backend/config/db.js` — MongoDB/Mongoose connection.
3. `backend/models/User.js` — user data and password hashing.
4. `backend/controllers/authController.js`, `backend/routes/authRoutes.js` — register and login.
5. `backend/middleware/authMiddleware.js` — JWT Bearer authentication.
6. `backend/controllers/userController.js`, `backend/routes/userRoutes.js` — profile, follow, and user lookup.
7. `backend/models/Post.js`, `backend/controllers/postController.js`, `backend/routes/postRoutes.js` — post CRUD and feed.
8. `backend/models/Comment.js`, `backend/controllers/commentController.js`, `backend/routes/commentRoutes.js` — comment CRUD.
9. `backend/controllers/postController.js` — like/unlike handlers.
10. `backend/controllers/userController.js` — follow/unfollow handlers.
11. `backend/middleware/asyncHandler.js`, `backend/middleware/validateJsonBody.js`, `backend/middleware/errorMiddleware.js` — request validation and centralized errors.
12. Test each endpoint using the PowerShell requests below.

## 3. API testing (PowerShell)

The examples below use PowerShell's `Invoke-RestMethod`. Run them in order in one PowerShell window after starting the server. IDs and tokens are taken from earlier responses. Protected routes require the `Authorization: Bearer <token>` header.

```powershell
$base = "http://localhost:5000"
```

### Authentication

**Register — `POST /api/auth/register` (201)**

Request:

```powershell
$registerBody = @{ username = "alice"; email = "alice@example.com"; password = "password123" } | ConvertTo-Json
$registered = Invoke-RestMethod -Method Post -Uri "$base/api/auth/register" -ContentType "application/json" -Body $registerBody
$token = $registered.token
$userId = $registered.user._id
```

Example response:

```json
{
  "token": "<jwt>",
  "user": {
    "_id": "<user-id>",
    "username": "alice",
    "email": "alice@example.com",
    "profilePicture": "",
    "bio": "",
    "followers": [],
    "following": [],
    "createdAt": "<date>"
  }
}
```

The password is hashed before storage and is never returned.

**Login — `POST /api/auth/login` (200)**

Request:

```powershell
$loginBody = @{ email = "alice@example.com"; password = "password123" } | ConvertTo-Json
$loggedIn = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -ContentType "application/json" -Body $loginBody
$token = $loggedIn.token
```

Example response has the same `token` and safe `user` fields as registration.

**Current user — `GET /api/auth/me` (200, protected)**

Request:

```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Method Get -Uri "$base/api/auth/me" -Headers $headers
```

Example response: `{ "user": { "_id": "<user-id>", "username": "alice", "...": "..." } }`

### Users

**Get a user — `GET /api/users/:id` (200)**

```powershell
Invoke-RestMethod -Method Get -Uri "$base/api/users/$userId"
```

Example response: `{ "user": { "_id": "<user-id>", "username": "alice", "email": "alice@example.com", "profilePicture": "", "bio": "", "followers": [], "following": [], "createdAt": "<date>" } }`

**Update profile — `PUT /api/users/profile` (200, protected)**

Request body:

```powershell
$profileBody = @{ bio = "Hello from Alice"; profilePicture = "https://example.com/alice.jpg" } | ConvertTo-Json
Invoke-RestMethod -Method Put -Uri "$base/api/users/profile" -Headers $headers -ContentType "application/json" -Body $profileBody
```

Example response: `{ "user": { "_id": "<user-id>", "username": "alice", "email": "alice@example.com", "profilePicture": "https://example.com/alice.jpg", "bio": "Hello from Alice", "followers": [], "following": [], "createdAt": "<date>" } }`

**Follow and unfollow — `POST /api/users/:id/follow` and `/api/users/:id/unfollow` (200, protected)**

Register a second user first, then use their ID:

```powershell
$secondBody = @{ username = "bob"; email = "bob@example.com"; password = "password123" } | ConvertTo-Json
$bob = Invoke-RestMethod -Method Post -Uri "$base/api/auth/register" -ContentType "application/json" -Body $secondBody
$bobId = $bob.user._id
Invoke-RestMethod -Method Post -Uri "$base/api/users/$bobId/follow" -Headers $headers
Invoke-RestMethod -Method Post -Uri "$base/api/users/$bobId/unfollow" -Headers $headers
```

Example responses: `{ "message": "User followed.", "userId": "<bob-id>" }` and `{ "message": "User unfollowed.", "userId": "<bob-id>" }`.

### Posts

**Create — `POST /api/posts` (201, protected)**

Request body:

```powershell
$postBody = @{ image = "https://example.com/photo.jpg"; caption = "First post" } | ConvertTo-Json
$createdPost = Invoke-RestMethod -Method Post -Uri "$base/api/posts" -Headers $headers -ContentType "application/json" -Body $postBody
$postId = $createdPost.post._id
```

Example response: `{ "post": { "_id": "<post-id>", "user": { "_id": "<user-id>", "username": "alice", "profilePicture": "" }, "image": "https://example.com/photo.jpg", "caption": "First post", "likes": [], "comments": [], "createdAt": "<date>", "__v": 0 } }`

**Get feed — `GET /api/posts` (200)**

```powershell
Invoke-RestMethod -Method Get -Uri "$base/api/posts"
```

Example response: `{ "posts": [{ "_id": "<post-id>", "user": { "_id": "<user-id>", "username": "alice", "profilePicture": "" }, "image": "https://example.com/photo.jpg", "caption": "First post", "likes": [], "comments": [], "createdAt": "<date>", "__v": 0 }] }`

**Get one post — `GET /api/posts/:id` (200)**

```powershell
Invoke-RestMethod -Method Get -Uri "$base/api/posts/$postId"
```

Response shape: `{ "post": { "_id": "<post-id>", "user": { "_id": "<user-id>", "username": "alice", "profilePicture": "" }, "image": "https://example.com/photo.jpg", "caption": "First post", "likes": [], "comments": [], "createdAt": "<date>", "__v": 0 } }`.

**Update — `PUT /api/posts/:id` (200, protected owner only)**

Request body:

```powershell
$updatePostBody = @{ caption = "Updated caption" } | ConvertTo-Json
Invoke-RestMethod -Method Put -Uri "$base/api/posts/$postId" -Headers $headers -ContentType "application/json" -Body $updatePostBody
```

Response shape: `{ "post": { "_id": "<post-id>", "user": { "_id": "<user-id>", "username": "alice", "profilePicture": "" }, "image": "https://example.com/photo.jpg", "caption": "Updated caption", "likes": [], "comments": [], "createdAt": "<date>", "__v": 0 } }`.

**Like and unlike — `POST /api/posts/:id/like` and `/api/posts/:id/unlike` (200, protected)**

```powershell
Invoke-RestMethod -Method Post -Uri "$base/api/posts/$postId/like" -Headers $headers
Invoke-RestMethod -Method Post -Uri "$base/api/posts/$postId/unlike" -Headers $headers
```

Example responses: `{ "message": "Post liked.", "likesCount": 1 }` and `{ "message": "Post unliked.", "likesCount": 0 }`.

**Delete — `DELETE /api/posts/:id` (200, protected owner only)**

Response: `{ "message": "Post deleted." }`.

### Comments

**Create — `POST /api/posts/:postId/comments` (201, protected)**

Request body:

```powershell
$commentBody = @{ text = "Great photo!" } | ConvertTo-Json
$createdComment = Invoke-RestMethod -Method Post -Uri "$base/api/posts/$postId/comments" -Headers $headers -ContentType "application/json" -Body $commentBody
$commentId = $createdComment.comment._id
```

Example response: `{ "comment": { "_id": "<comment-id>", "post": "<post-id>", "user": { "_id": "<user-id>", "username": "alice", "profilePicture": "" }, "text": "Great photo!", "createdAt": "<date>", "__v": 0 } }`

**List comments — `GET /api/posts/:postId/comments` (200)**

```powershell
Invoke-RestMethod -Method Get -Uri "$base/api/posts/$postId/comments"
```

Response shape: `{ "comments": [{ "_id": "<comment-id>", "post": "<post-id>", "user": { "_id": "<user-id>", "username": "alice", "profilePicture": "" }, "text": "Great photo!", "createdAt": "<date>", "__v": 0 }] }`.

**Delete comment — `DELETE /api/comments/:id` (200, protected owner only)**

```powershell
Invoke-RestMethod -Method Delete -Uri "$base/api/comments/$commentId" -Headers $headers
```

Response: `{ "message": "Comment deleted." }`.

**Delete post — `DELETE /api/posts/:id` (200, protected owner only)**

```powershell
Invoke-RestMethod -Method Delete -Uri "$base/api/posts/$postId" -Headers $headers
```

Response: `{ "message": "Post deleted." }`.

## HTTP errors

Errors use a JSON body such as `{ "message": "Post not found." }`. The API uses `400` for invalid input, `401` for missing/invalid authentication, `403` for ownership violations, `404` for missing resources/routes, and `409` for duplicate usernames or emails.
