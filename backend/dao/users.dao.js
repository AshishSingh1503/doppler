import User from '../models/user.model.js';
import { hashPassword, comparePasswords } from '../helper/helper.js';

export const findUserByEmail = async (email) => {
    return User.findOne({ email });
};

export const createUser = async ({ name, email, password }) => {
    const hashedPassword = await hashPassword(password);
    const user = new User({ name, email, password: hashedPassword });
    return user.save();
}

export const checkPassword = async ({ email, password }) => {
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const hashedPassword = user.password;

    return comparePasswords({password, hashedPassword}) ? user : false;
}