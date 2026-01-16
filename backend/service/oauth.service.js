export const githubTokenResponse = (code) => axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { 
        headers: { Accept: "application/json" } 
      }
);

export const getUserData = (accessToken) => axios.get(
    "https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
);

export const getUserEmail = (accessToken) => axios.get(
    "https://api.github.com/user/emails",{
        headers: { Authorization: `Bearer ${accessToken}` },
  }
);