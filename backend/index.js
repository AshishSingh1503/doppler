import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// --------------------
// GitHub OAuth
// --------------------
app.get("/api/auth/github", (req, res) => {
  const githubURL =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&scope=user:email`;

  res.redirect(githubURL);
});

app.get("/api/auth/github/callback", async (req, res) => {
  try {
    const { code } = req.query;

    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const emailRes = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const email = emailRes.data.find(e => e.primary)?.email;

    const token = jwt.sign(
      {
        id: userRes.data.id,
        email,
        provider: "github",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.redirect(
      `http://localhost:3000/auth/success?token=${token}`
    );
  } catch (err) {
    console.error(err);
    res.redirect("http://localhost:3000/login?error=oauth_failed");
  }
});

app.listen(5000, () => {
  console.log("Auth server running on http://localhost:5000");
});
