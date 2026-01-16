import express from "express";
const router = express.Router();
import { loginUser, registerUser, logoutUser } from "../controller/auth.controller.js";
import { handleGithubLogin, handleGithubCallback } from "../controller/github.oauth.controller.js";

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);

router.get("/github", handleGithubLogin);
router.get("/github/callback", handleGithubCallback);

export default router;