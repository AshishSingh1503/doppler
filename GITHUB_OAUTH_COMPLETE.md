# GitHub OAuth Integration - Complete Setup

## Step 1: Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: Doppler
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:3000/auth/github/callback
4. Click **"Register application"**
5. Copy **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

### Backend (.env)
```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

### Frontend (.env)
```env
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id_here
```

## Step 3: OAuth Scopes

The app requests these GitHub scopes:
- `user:email` - Read user email
- `repo` - Access repositories (public and private)

## Step 4: Test Authentication Flow

1. Start backend:
```bash
cd backend
npm start
```

2. Start frontend:
```bash
cd frontend
npm start
```

3. Click "Continue with GitHub" on login page
4. Authorize the app
5. You'll be redirected back and logged in

## Step 5: Verify Repository Access

After login, go to "Create Project" page:
- You should see your actual GitHub repositories
- Both public and private repos will be listed
- Repositories are sorted by last updated

## How It Works

### 1. User Clicks "Continue with GitHub"
```javascript
// Redirects to GitHub OAuth
https://github.com/login/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=http://localhost:3000/auth/github/callback&
  scope=user:email,repo
```

### 2. GitHub Redirects Back with Code
```
http://localhost:3000/auth/github/callback?code=AUTHORIZATION_CODE
```

### 3. Backend Exchanges Code for Access Token
```javascript
POST https://github.com/login/oauth/access_token
{
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  code: AUTHORIZATION_CODE
}
```

### 4. Backend Fetches User Info
```javascript
GET https://api.github.com/user
Headers: { Authorization: 'Bearer ACCESS_TOKEN' }
```

### 5. Backend Stores User with Access Token
```javascript
{
  githubId: '12345',
  githubAccessToken: 'gho_xxxxx',
  name: 'John Doe',
  email: 'john@example.com'
}
```

### 6. Frontend Fetches Repositories
```javascript
GET /api/github/repos
// Returns actual user repositories from GitHub API
```

## API Endpoints

### POST /api/auth/github/callback
Exchange GitHub code for JWT token

**Request:**
```json
{
  "code": "github_authorization_code"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://avatars.githubusercontent.com/..."
  }
}
```

### GET /api/github/repos
Get user's GitHub repositories (requires authentication)

**Headers:**
```
Authorization: Bearer jwt_token
```

**Response:**
```json
[
  {
    "id": 123456,
    "name": "my-project",
    "full_name": "username/my-project",
    "description": "Project description",
    "language": "JavaScript",
    "private": false,
    "clone_url": "https://github.com/username/my-project.git",
    "html_url": "https://github.com/username/my-project",
    "updated_at": "2024-01-01T00:00:00Z",
    "default_branch": "main"
  }
]
```

## Troubleshooting

### "GitHub account not linked"
- User must login via GitHub OAuth
- Regular email/password login won't have GitHub access
- Solution: Use "Continue with GitHub" button

### "Failed to fetch repositories"
- Check GitHub access token is stored
- Verify token hasn't expired
- Check GitHub API rate limits

### "Bad credentials"
- Verify GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET
- Ensure they match your GitHub OAuth app
- Check environment variables are loaded

### Rate Limiting
GitHub API limits:
- Authenticated: 5,000 requests/hour
- Unauthenticated: 60 requests/hour

## Security Best Practices

1. **Never expose Client Secret** - Keep in backend only
2. **Store access tokens securely** - Encrypted in database
3. **Use HTTPS in production** - Protect token transmission
4. **Implement token refresh** - Handle expired tokens
5. **Validate callback URLs** - Prevent redirect attacks

## Production Deployment

Update GitHub OAuth app settings:
- **Homepage URL**: https://yourdomain.com
- **Callback URL**: https://yourdomain.com/auth/github/callback

Update environment variables:
```env
REACT_APP_GITHUB_CLIENT_ID=production_client_id
GITHUB_CLIENT_ID=production_client_id
GITHUB_CLIENT_SECRET=production_client_secret
```

## Testing

Test with different scenarios:
1. New user registration via GitHub
2. Existing user login via GitHub
3. Repository list with 0 repos
4. Repository list with 100+ repos
5. Private repository access
6. Organization repositories