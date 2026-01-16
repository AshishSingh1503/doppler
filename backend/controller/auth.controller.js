import { registerUserService, loginUserService } from "../service/auth.service.js";
import { cookieOptions } from "../config/config.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const token = registerUserService({ name, email, password });

    res.cookie("access_token", token, cookieOptions)
    .json({success: true});

  } catch (err) {
    res.status(400).json({ message: "Registration failed", error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const token = await loginUserService({ email, password });

    res.cookie("access_token", token, cookieOptions)
    .json({success: true});

  } catch (err) {
    res.status(400).json({ message: "Login failed", error: err.message });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("access_token", cookieOptions)
  .json({ message: "Logged out successfully" });
}