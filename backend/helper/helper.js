import jwt from "jsonwebtoken";
import { jwtOptions } from "../config/config.js";
import bcrypt from "bcrypt";

export const createToken = ({id, email, provider}) => {
  return jwt.sign(
      {
        id,
        email,
        provider,
      },
      process.env.JWT_SECRET,
      jwtOptions
    );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET); 
  } catch (err) {
    return err;
  }
};

export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export const comparePasswords = async ({password, hashedPassword}) => {
  return await bcrypt.compare(password, hashedPassword);
}