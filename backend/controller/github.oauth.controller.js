import { createToken } from "../helper/helper.js";
import { githubTokenResponse, getUserData, getUserEmail } from "../service/oauth.service.js";

export const handleGithubLogin = (req, res) => {
  const githubURL =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&scope=user:email`;

  res.redirect(githubURL);
};

export const handleGithubCallback = async (req, res) => {
  try {
    const { code } = req.query; // Temporary OAuth code
    // {client_id : "", scope: ""}

    const tokenRes = await githubTokenResponse(code);
    const accessToken = tokenRes.data.access_token;

    const userRes = await getUserData(accessToken);

    // The https://api.github.com/user endpoint can return an email field, but:
    // - It only shows the primary email if the user has chosen to make it 'public'.
    // - For most users, this field is 'null' because GitHub keeps emails private by default.

    const emailRes = await getUserEmail(accessToken);
    const email = emailRes.data.find(e => e.primary)?.email; // optional chaining : if no primary email is found, 'email' will be undefined

    const token = createToken({
      id: userRes.data.id,
      email: email,
      provider: "github",
    });

    res.redirect(
      `http://localhost:3000/auth/success?token=${token}`
    );

  } catch (err) {
    console.error(err);
    res.redirect("http://localhost:3000/login?error=oauth_failed");
  }
};