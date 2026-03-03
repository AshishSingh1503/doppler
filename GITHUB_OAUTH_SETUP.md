# GitHub OAuth Setup Guide

## 🔧 Setting Up GitHub OAuth App

### Step 1: Create GitHub OAuth App

1. Go to **GitHub Settings** → **Developer settings** → **OAuth Apps**
   - Direct link: https://github.com/settings/developers

2. Click **"New OAuth App"**

3. Fill in the application details:

   **For Development:**
   ```
   Application name: Doppler (Development)
   Homepage URL: http://localhost:3000
   Application description: Automated deployment platform
   Authorization callback URL: http://localhost:3000/auth/github/callback
   ```

   **For Production:**
   ```
   Application name: Doppler
   Homepage URL: https://yourdomain.com
   Application description: Automated deployment platform
   Authorization callback URL: https://yourdomain.com/auth/github/callback
   ```

4. Click **"Register application"**

5. You'll receive:
   - **Client ID** (public)
   - **Client Secret** (click "Generate a new client secret")

⚠️ **Important**: Save the Client Secret immediately - you won't be able to see it again!

---

## 🔐 Configure Environment Variables

### Backend Configuration

Edit `backend/.env`:

```env
# Required
PORT=3000
MONGODB_URI=mongodb://localhost:27017/doppler
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# GitHub OAuth (Required for GitHub login)
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Optional
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id_here
```

⚠️ **Note**: Use the SAME Client ID in both backend and frontend!

---

## 🧪 Testing the Setup

### 1. Start Backend
```bash
cd backend
npm install
npm start
```

Expected output:
```
✅ Server running on port 3000
📊 Environment: development
✅ MongoDB connected
```

If GitHub OAuth is not configured, you'll see:
```
⚠️  GitHub OAuth not configured. GitHub authentication will not work.
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm start
```

### 3. Test GitHub Login

1. Navigate to `http://localhost:3000/login`
2. Click **"Continue with GitHub"**
3. You should be redirected to GitHub authorization page
4. Click **"Authorize"**
5. You should be redirected back and logged in

---

## 🔍 Troubleshooting

### Issue: "GitHub OAuth is not configured" alert

**Cause**: Missing `REACT_APP_GITHUB_CLIENT_ID` in frontend `.env`

**Solution**:
```bash
cd frontend
echo "REACT_APP_GITHUB_CLIENT_ID=your_client_id" >> .env
```

### Issue: "GitHub authentication failed"

**Possible causes**:
1. Client Secret is incorrect
2. Callback URL doesn't match
3. Backend can't reach GitHub API

**Debug steps**:
```bash
# Check backend logs
# Look for: "GitHub authentication error:"

# Test GitHub API access
curl https://api.github.com/user
```

### Issue: "Application callback URL mismatch"

**Cause**: The callback URL in your GitHub OAuth app doesn't match your application

**Solution**:
1. Go to GitHub OAuth app settings
2. Update "Authorization callback URL" to match exactly:
   - Dev: `http://localhost:3000/auth/github/callback`
   - Prod: `https://yourdomain.com/auth/github/callback`

### Issue: Email is null or generic

**Cause**: User's email is private on GitHub

**Solution**: Already handled! The code now:
1. Fetches from `/user/emails` endpoint
2. Uses primary email
3. Falls back to `username@users.noreply.github.com`

### Issue: "Failed to fetch repositories"

**Possible causes**:
1. GitHub token expired
2. User revoked access
3. Insufficient permissions

**Solution**:
- User needs to re-authenticate with GitHub
- Check that `repo` scope is requested

---

## 🔒 Security Best Practices

### 1. Never Commit Secrets
```bash
# Add to .gitignore
.env
.env.local
.env.production
```

### 2. Use Different OAuth Apps for Dev/Prod
- Create separate OAuth apps for development and production
- Use different Client IDs and Secrets

### 3. Rotate Secrets Regularly
- Generate new Client Secret every 6-12 months
- Update in both environments

### 4. Validate Callback URLs
- Only whitelist exact callback URLs
- Don't use wildcards in production

### 5. Implement Rate Limiting
```javascript
// Add to backend
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

app.use('/api/auth/github/callback', authLimiter);
```

---

## 📊 OAuth Flow Diagram

```
┌─────────┐                                    ┌─────────┐
│  User   │                                    │ GitHub  │
└────┬────┘                                    └────┬────┘
     │                                              │
     │ 1. Click "Login with GitHub"                │
     ├──────────────────────────────────────────►  │
     │                                              │
     │ 2. Redirect to GitHub OAuth                 │
     │    with client_id & callback_url            │
     ├──────────────────────────────────────────►  │
     │                                              │
     │ 3. User authorizes app                      │
     │ ◄──────────────────────────────────────────┤
     │                                              │
     │ 4. Redirect to callback with code           │
     │ ◄──────────────────────────────────────────┤
     │                                              │
┌────▼────┐                                    ┌────▼────┐
│Frontend │                                    │ Backend │
└────┬────┘                                    └────┬────┘
     │                                              │
     │ 5. POST /api/auth/github/callback           │
     │    with code                                 │
     ├──────────────────────────────────────────►  │
     │                                              │
     │                                              │ 6. Exchange code
     │                                              │    for access_token
     │                                              ├──────────►
     │                                              │           GitHub API
     │                                              │ ◄─────────┤
     │                                              │
     │                                              │ 7. Fetch user data
     │                                              ├──────────►
     │                                              │           GitHub API
     │                                              │ ◄─────────┤
     │                                              │
     │                                              │ 8. Create/Update user
     │                                              │    in database
     │                                              │
     │ 9. Return JWT token                         │
     │ ◄──────────────────────────────────────────┤
     │                                              │
     │ 10. Store token & redirect to dashboard     │
     │                                              │
```

---

## 📝 Checklist

Before deploying to production:

- [ ] Created separate GitHub OAuth app for production
- [ ] Set production callback URL in GitHub OAuth app
- [ ] Updated `GITHUB_CLIENT_ID` in production backend
- [ ] Updated `GITHUB_CLIENT_SECRET` in production backend
- [ ] Updated `REACT_APP_GITHUB_CLIENT_ID` in production frontend
- [ ] Verified callback URL matches exactly
- [ ] Tested login flow in production
- [ ] Tested repository fetching
- [ ] Implemented rate limiting
- [ ] Set up error monitoring
- [ ] Documented OAuth setup for team

---

## 🆘 Support

If you encounter issues:

1. Check backend logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test GitHub API access: `curl https://api.github.com/user`
4. Check GitHub OAuth app settings match your URLs
5. Review the analysis document: `GITHUB_AUTH_ANALYSIS.md`

---

## 📚 Additional Resources

- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [OAuth 2.0 Specification](https://oauth.net/2/)
